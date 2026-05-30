-- ==========================================
-- AI Cost Tracker (acost) — Relational Schema
-- ==========================================

-- Enable extensions
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
-- Stores user account info linked directly to Supabase Auth.
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

-- RLS Policies for Profiles
create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);


-- 2. WORKSPACES TABLE
-- Workspaces isolate keys, events, and billing domains.
create table public.workspaces (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS on Workspaces
alter table public.workspaces enable row level security;

-- RLS Policies for Workspaces
create policy "Owners can view own workspaces" 
  on public.workspaces for select 
  using (auth.uid() = owner_id);

create policy "Owners can update own workspaces" 
  on public.workspaces for update 
  using (auth.uid() = owner_id);

create policy "Owners can delete own workspaces" 
  on public.workspaces for delete 
  using (auth.uid() = owner_id);


-- 3. API KEYS TABLE
-- Tracks keys utilized by the SDK.
-- Stored as SHA-256 hashes to prevent theft in case of database leaks.
create table public.api_keys (
  id uuid default gen_random_uuid() primary key,
  key_hash text unique not null,
  name text not null,
  display_prefix text not null, -- e.g. "acost_abc123"
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  last_used_at timestamp with time zone
);

-- Enable RLS on API Keys
alter table public.api_keys enable row level security;

-- RLS Policies for API Keys
create policy "Users can view own workspace API keys"
  on public.api_keys for select
  using (
    workspace_id in (
      select w.id from public.workspaces w where w.owner_id = auth.uid()
    )
  );

create policy "Users can insert own workspace API keys"
  on public.api_keys for insert
  with check (
    workspace_id in (
      select w.id from public.workspaces w where w.owner_id = auth.uid()
    )
  );

create policy "Users can delete own workspace API keys"
  on public.api_keys for delete
  using (
    workspace_id in (
      select w.id from public.workspaces w where w.owner_id = auth.uid()
    )
  );


-- 4. TELEMETRY EVENTS TABLE
-- Holds raw logs of all tracked completions.
create table public.events (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  feature text not null,
  model text not null,
  provider text not null default 'openai',
  input_tokens integer not null,
  output_tokens integer not null,
  estimated_cost numeric(12, 6) not null,
  latency integer not null, -- Milliseconds
  user_id text, -- ID of customer's application user
  created_at timestamp with time zone default now() not null
);

-- Create indexes for fast analytical reads
create index events_workspace_created_at_idx on public.events(workspace_id, created_at desc);
create index events_workspace_feature_idx on public.events(workspace_id, feature);
create index events_workspace_model_idx on public.events(workspace_id, model);

-- Enable RLS on Events
alter table public.events enable row level security;

-- RLS Policies for Events
create policy "Users can view own workspace events"
  on public.events for select
  using (
    workspace_id in (
      select w.id from public.workspaces w where w.owner_id = auth.uid()
    )
  );

-- No public insert policy is needed because events are bulk inserted 
-- by the server-side API handler using service_role credentials, bypassing RLS.


-- 5. DAILY METRICS TABLE
-- Pre-aggregated rollup metrics for dashboard visualizers.
create table public.daily_metrics (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  date date not null,
  feature text not null,
  model text not null,
  total_requests integer not null default 0,
  total_input_tokens integer not null default 0,
  total_output_tokens integer not null default 0,
  total_cost numeric(12, 6) not null default 0.0,
  unique(workspace_id, date, feature, model)
);

-- Enable RLS on Daily Metrics
alter table public.daily_metrics enable row level security;

-- RLS Policies for Daily Metrics
create policy "Users can view own workspace daily metrics"
  on public.daily_metrics for select
  using (
    workspace_id in (
      select w.id from public.workspaces w where w.owner_id = auth.uid()
    )
  );


-- ==========================================
-- TRIGGERS & PROCEDURES
-- ==========================================

-- Trigger to automatically create profile and default workspace on user signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_workspace_id uuid;
begin
  -- Insert profile
  insert into public.profiles (id, email)
  values (new.id, new.email);

  -- Insert default workspace
  insert into public.workspaces (name, owner_id)
  values ('Personal Workspace', new.id)
  returning id into default_workspace_id;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- RPC to atomically increment daily metrics in the background (concurrency-safe)
create or replace function public.increment_daily_metrics(
  p_workspace_id uuid,
  p_date date,
  p_feature text,
  p_model text,
  p_requests integer,
  p_input_tokens integer,
  p_output_tokens integer,
  p_cost numeric
) returns void as $$
begin
  insert into public.daily_metrics (
    workspace_id, date, feature, model, total_requests, total_input_tokens, total_output_tokens, total_cost
  )
  values (
    p_workspace_id, p_date, p_feature, p_model, p_requests, p_input_tokens, p_output_tokens, p_cost
  )
  on conflict (workspace_id, date, feature, model)
  do update set
    total_requests = daily_metrics.total_requests + excluded.total_requests,
    total_input_tokens = daily_metrics.total_input_tokens + excluded.total_input_tokens,
    total_output_tokens = daily_metrics.total_output_tokens + excluded.total_output_tokens,
    total_cost = daily_metrics.total_cost + excluded.total_cost;
end;
$$ language plpgsql security definer;

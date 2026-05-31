-- ==========================================
-- AI Cost Tracker — Model Pricing Table
-- ==========================================

create table public.model_pricing (
  id uuid default gen_random_uuid() primary key,
  model_id text unique not null, -- e.g. 'gpt-4o', 'claude-3-5-sonnet'
  provider text not null,        -- e.g. 'openai', 'anthropic'
  input_price numeric(12, 10) not null default 0.0, -- USD per token
  output_price numeric(12, 10) not null default 0.0, -- USD per token
  source text not null default 'official',          -- 'official', 'openrouter', 'manual'
  is_active boolean default true,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.model_pricing enable row level security;

-- Allow public read access (for tracker and dashboard)
create policy "Allow public read access for model pricing"
  on public.model_pricing for select
  using (true);

-- Allow service_role to manage pricing
create policy "Allow service_role to manage model pricing"
  on public.model_pricing for all
  using (true)
  with check (true);

-- Index for fast lookups
create index model_pricing_model_id_idx on public.model_pricing(model_id);
create index model_pricing_provider_idx on public.model_pricing(provider);

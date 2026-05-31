-- Add extra metadata columns to model_pricing table
alter table public.model_pricing 
add column if not exists context_window text,
add column if not exists launch_date text;

-- Update unique constraint to allow multiple sources for the same model
alter table public.model_pricing drop constraint if exists model_pricing_model_id_key;
alter table public.model_pricing add constraint model_pricing_model_source_unique unique (model_id, source);

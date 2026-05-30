-- Migration: Add run detail columns to the events table
-- These columns are nullable with no default value so existing SDK inserts are unaffected.

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS prompt text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS response_content text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS raw_response jsonb;

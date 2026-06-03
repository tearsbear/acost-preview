-- Migration: Setup Supabase Cron for Pricing Sync
-- This uses pg_cron and pg_net to call the tracker's internal sync endpoint daily.

-- 1. Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Schedule the daily sync
-- NOTE: Replace 'https://tracker-acost.vercel.app' with your actual production tracker URL.
-- The secret must match INTERNAL_SYNC_SECRET in your tracker's env variables.

SELECT cron.schedule(
  'daily-pricing-sync', -- name of the cron job
  '0 0 * * *',          -- every day at midnight (UTC)
  $$
  SELECT net.http_post(
    url := 'https://tracker-acost.vercel.app/v1/internal/sync-pricing?secret=acost_sync_secret_6d2f8e1a',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

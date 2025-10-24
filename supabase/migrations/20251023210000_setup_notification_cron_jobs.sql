-- =====================================================
-- Setup pg_cron Jobs for Push Notifications
-- =====================================================
-- This migration sets up scheduled cron jobs for:
-- - Daily check-in reminders at 9 AM
-- - Streak at risk checks every 6 hours
-- =====================================================

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage on cron schema to postgres
GRANT USAGE ON SCHEMA cron TO postgres;

-- =====================================================
-- Daily Check-in Reminder at 9 AM
-- =====================================================
-- This job runs every day at 9:00 AM and triggers the send-notification
-- Edge Function to send reminders to users who haven't checked in today

SELECT cron.schedule(
  'daily-checkin-reminder',
  '0 9 * * *', -- Every day at 9:00 AM
  $$
  SELECT
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/send-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'type', 'daily_reminder'
      )
    ) AS request_id;
  $$
);

-- =====================================================
-- Streak at Risk Check Every 6 Hours
-- =====================================================
-- This job runs every 6 hours and triggers the send-notification
-- Edge Function to notify users whose streak is at risk (48h without check-in)

SELECT cron.schedule(
  'streak-at-risk-check',
  '0 */6 * * *', -- Every 6 hours
  $$
  SELECT
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/send-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'type', 'streak_at_risk'
      )
    ) AS request_id;
  $$
);

-- =====================================================
-- View Scheduled Jobs
-- =====================================================
-- To view all scheduled cron jobs, run:
-- SELECT * FROM cron.job;

-- To unschedule a job, run:
-- SELECT cron.unschedule('job-name');

-- =====================================================
-- Configuration Notes
-- =====================================================
-- The cron jobs use runtime settings that need to be configured:
-- 1. app.settings.supabase_url - Your Supabase project URL
-- 2. app.settings.service_role_key - Your Supabase service role key
--
-- These can be set using ALTER DATABASE:
-- ALTER DATABASE postgres SET app.settings.supabase_url = 'https://your-project.supabase.co';
-- ALTER DATABASE postgres SET app.settings.service_role_key = 'your-service-role-key';
--
-- Or you can modify the cron jobs above to use hardcoded values (not recommended for security)


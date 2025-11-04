-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Daily reminder at 9 AM UTC (6 AM Brasília)
SELECT cron.schedule(
  'send-daily-reminders',
  '0 9 * * *',
  $$
  SELECT
    net.http_post(
        url:='https://pyfgepdbxhbofrgainou.supabase.co/functions/v1/send-notification',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5ZmdlcGRieGhib2ZyZ2Fpbm91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNDE1MDEsImV4cCI6MjA3NjgxNzUwMX0.mQBnPHrO-wuB3iuJc-NO-TQ7ImUoETzuna_t9rZkmH4"}'::jsonb,
        body:='{"type": "daily_reminder"}'::jsonb
    ) as request_id;
  $$
);

-- Streak at risk check at 8 PM UTC (5 PM Brasília)
SELECT cron.schedule(
  'send-streak-at-risk',
  '0 20 * * *',
  $$
  SELECT
    net.http_post(
        url:='https://pyfgepdbxhbofrgainou.supabase.co/functions/v1/send-notification',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5ZmdlcGRieGhib2ZyZ2Fpbm91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNDE1MDEsImV4cCI6MjA3NjgxNzUwMX0.mQBnPHrO-wuB3iuJc-NO-TQ7ImUoETzuna_t9rZkmH4"}'::jsonb,
        body:='{"type": "streak_at_risk"}'::jsonb
    ) as request_id;
  $$
);
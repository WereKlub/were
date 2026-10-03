-- Mark abandoned checkouts as payment_failed every two hours.
-- The admin Failed filter only lists payment_failed rows.

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

DO $$
DECLARE
  existing_job bigint;
BEGIN
  SELECT jobid INTO existing_job
  FROM cron.job
  WHERE jobname = 'expire-pending-payments'
  LIMIT 1;

  IF existing_job IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job);
  END IF;
END $$;

SELECT cron.schedule(
  'expire-pending-payments',
  '15 */2 * * *',
  $$SELECT public.update_expired_pending_payments();$$
);

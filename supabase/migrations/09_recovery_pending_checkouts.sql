-- Abandoned checkouts become recoverable after 15 minutes, not 2 hours,
-- so the admin Failed list and recovery email can see them.

CREATE OR REPLACE FUNCTION public.update_expired_pending_payments()
RETURNS TABLE(
    affected_rows INTEGER,
    updated_purchase_ids TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    updated_ids TEXT[] := '{}';
    update_count INTEGER := 0;
    expiry_threshold TIMESTAMPTZ;
BEGIN
    expiry_threshold := NOW() - INTERVAL '15 minutes';

    WITH updated_purchases AS (
        UPDATE public.purchases
        SET
            status = 'payment_failed',
            updated_at = NOW()
        WHERE
            status = 'pending_payment'
            AND lomi_session_id IS NOT NULL
            AND created_at < expiry_threshold
        RETURNING id
    )
    SELECT
        ARRAY(SELECT id::text FROM updated_purchases),
        (SELECT COUNT(*) FROM updated_purchases)
    INTO updated_ids, update_count;

    RETURN QUERY SELECT update_count, updated_ids;
END;
$$;

COMMENT ON FUNCTION public.update_expired_pending_payments()
IS 'Marks checkout sessions still pending after 15 minutes as payment_failed so admin recovery can list them.';

DO $$
DECLARE
    fn regprocedure;
    src text;
    old_expr text := $old$
          p.status = 'payment_failed'
          AND NOT public.admin_purchase_has_paid_counterpart(p.id, p.event_id, p.customer_id, c.email)
          AND public.admin_email_is_valid_for_recovery(c.email)$old$;
    new_expr text := $new$
          (
            p.status = 'payment_failed'
            OR (
              p.status = 'pending_payment'
              AND p.lomi_session_id IS NOT NULL
              AND p.created_at < NOW() - INTERVAL '15 minutes'
            )
          )
          AND NOT public.admin_purchase_has_paid_counterpart(p.id, p.event_id, p.customer_id, c.email)
          AND public.admin_email_is_valid_for_recovery(c.email)$new$;
BEGIN
    FOREACH fn IN ARRAY ARRAY[
        'public.get_admin_purchases()'::regprocedure,
        'public.get_admin_purchases_by_event(text)'::regprocedure,
        'public.search_admin_purchases(text)'::regprocedure
    ]
    LOOP
        src := pg_get_functiondef(fn);
        IF position(new_expr IN src) > 0 THEN
            CONTINUE;
        END IF;
        IF position(old_expr IN src) = 0 THEN
            RAISE EXCEPTION 'recovery eligibility expression not found in %', fn::text;
        END IF;
        src := replace(src, old_expr, new_expr);
        EXECUTE src;
    END LOOP;
END $$;

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
    '*/15 * * * *',
    $$SELECT public.update_expired_pending_payments();$$
);

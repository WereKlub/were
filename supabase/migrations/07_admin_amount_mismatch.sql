-- Flag paid event tickets whose collected total does not match quantity * unit price.
-- Mirrors the events admin RPCs so the admin list can use the server flag.

CREATE OR REPLACE FUNCTION public.admin_purchase_amount_quantity_mismatch(
    p_status TEXT,
    p_event_id TEXT,
    p_quantity INTEGER,
    p_price_per_ticket NUMERIC,
    p_total_amount NUMERIC
)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
    SELECT
        p_status = 'paid'
        AND COALESCE(TRIM(p_event_id), '') <> ''
        AND COALESCE(p_price_per_ticket, 0) > 0
        AND COALESCE(p_quantity, 0) > 0
        AND COALESCE(p_total_amount, 0) <> (p_quantity::NUMERIC * p_price_per_ticket);
$$;

COMMENT ON FUNCTION public.admin_purchase_amount_quantity_mismatch(TEXT, TEXT, INTEGER, NUMERIC, NUMERIC)
IS 'TRUE when a paid event ticket row has total_amount not equal to quantity * price_per_ticket.';

DROP FUNCTION IF EXISTS public.get_admin_purchases();

CREATE OR REPLACE FUNCTION public.get_admin_purchases()
RETURNS TABLE(
    purchase_id UUID,
    customer_id UUID,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    event_id TEXT,
    event_title TEXT,
    event_date_text TEXT,
    event_time_text TEXT,
    event_venue_name TEXT,
    ticket_type_id TEXT,
    ticket_name TEXT,
    quantity INTEGER,
    price_per_ticket NUMERIC,
    total_amount NUMERIC,
    currency_code TEXT,
    status TEXT,
    email_dispatch_status TEXT,
    email_dispatch_attempts INTEGER,
    email_dispatch_error TEXT,
    unique_ticket_identifier TEXT,
    created_at TIMESTAMPTZ,
    pdf_ticket_sent_at TIMESTAMPTZ,
    used_at TIMESTAMPTZ,
    is_used BOOLEAN,
    verified_by TEXT,
    scanned_count BIGINT,
    is_bundle BOOLEAN,
    tickets_per_bundle INTEGER,
    admission_total INTEGER,
    abandonment_resolved_by_paid_order BOOLEAN,
    recovery_email_eligible BOOLEAN,
    amount_quantity_mismatch BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id AS purchase_id,
        p.customer_id,
        c.name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,
        p.event_id,
        p.event_title,
        p.event_date_text,
        p.event_time_text,
        p.event_venue_name,
        p.ticket_type_id,
        p.ticket_name,
        p.quantity,
        p.price_per_ticket,
        p.total_amount,
        p.currency_code,
        p.status,
        p.email_dispatch_status,
        p.email_dispatch_attempts,
        p.email_dispatch_error,
        p.unique_ticket_identifier,
        p.created_at,
        p.pdf_ticket_sent_at,
        p.used_at,
        p.is_used,
        p.verified_by,
        (
            CASE
                WHEN EXISTS (
                    SELECT 1 FROM public.individual_tickets it0 WHERE it0.purchase_id = p.id
                ) THEN
                    (
                        SELECT COUNT(*)::BIGINT
                        FROM public.individual_tickets it
                        WHERE it.purchase_id = p.id AND it.is_used = TRUE
                    )
                ELSE
                    p.use_count::BIGINT
            END
        ) AS scanned_count,
        COALESCE(p.is_bundle, FALSE) AS is_bundle,
        COALESCE(NULLIF(p.tickets_per_bundle, 0), 1) AS tickets_per_bundle,
        (
            CASE
                WHEN COALESCE(p.is_bundle, FALSE) THEN
                    p.quantity * GREATEST(COALESCE(NULLIF(p.tickets_per_bundle, 0), 1), 1)
                ELSE
                    GREATEST(p.quantity, 1)
            END
        )::INTEGER AS admission_total,
        public.admin_purchase_has_paid_counterpart(p.id, p.event_id, p.customer_id, c.email)
          AS abandonment_resolved_by_paid_order,
        (
          p.status = 'payment_failed'
          AND NOT public.admin_purchase_has_paid_counterpart(p.id, p.event_id, p.customer_id, c.email)
          AND public.admin_email_is_valid_for_recovery(c.email)
        ) AS recovery_email_eligible,
        public.admin_purchase_amount_quantity_mismatch(
            p.status, p.event_id, p.quantity, p.price_per_ticket, p.total_amount
        ) AS amount_quantity_mismatch
    FROM public.purchases p
    INNER JOIN public.customers c ON p.customer_id = c.id
    ORDER BY p.created_at DESC
    LIMIT 100;
END;
$$;

DROP FUNCTION IF EXISTS public.search_admin_purchases(text);

CREATE OR REPLACE FUNCTION public.search_admin_purchases(
    p_search_query TEXT
)
RETURNS TABLE(
    purchase_id UUID,
    customer_id UUID,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    event_id TEXT,
    event_title TEXT,
    event_date_text TEXT,
    event_time_text TEXT,
    event_venue_name TEXT,
    ticket_type_id TEXT,
    ticket_name TEXT,
    quantity INTEGER,
    price_per_ticket NUMERIC,
    total_amount NUMERIC,
    currency_code TEXT,
    status TEXT,
    email_dispatch_status TEXT,
    email_dispatch_attempts INTEGER,
    email_dispatch_error TEXT,
    unique_ticket_identifier TEXT,
    created_at TIMESTAMPTZ,
    pdf_ticket_sent_at TIMESTAMPTZ,
    used_at TIMESTAMPTZ,
    is_used BOOLEAN,
    verified_by TEXT,
    scanned_count BIGINT,
    is_bundle BOOLEAN,
    tickets_per_bundle INTEGER,
    admission_total INTEGER,
    abandonment_resolved_by_paid_order BOOLEAN,
    recovery_email_eligible BOOLEAN,
    amount_quantity_mismatch BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id AS purchase_id,
        p.customer_id,
        c.name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,
        p.event_id,
        p.event_title,
        p.event_date_text,
        p.event_time_text,
        p.event_venue_name,
        p.ticket_type_id,
        p.ticket_name,
        p.quantity,
        p.price_per_ticket,
        p.total_amount,
        p.currency_code,
        p.status,
        p.email_dispatch_status,
        p.email_dispatch_attempts,
        p.email_dispatch_error,
        p.unique_ticket_identifier,
        p.created_at,
        p.pdf_ticket_sent_at,
        p.used_at,
        p.is_used,
        p.verified_by,
        (
            CASE
                WHEN EXISTS (
                    SELECT 1 FROM public.individual_tickets it0 WHERE it0.purchase_id = p.id
                ) THEN
                    (
                        SELECT COUNT(*)::BIGINT
                        FROM public.individual_tickets it
                        WHERE it.purchase_id = p.id AND it.is_used = TRUE
                    )
                ELSE
                    p.use_count::BIGINT
            END
        ) AS scanned_count,
        COALESCE(p.is_bundle, FALSE) AS is_bundle,
        COALESCE(NULLIF(p.tickets_per_bundle, 0), 1) AS tickets_per_bundle,
        (
            CASE
                WHEN COALESCE(p.is_bundle, FALSE) THEN
                    p.quantity * GREATEST(COALESCE(NULLIF(p.tickets_per_bundle, 0), 1), 1)
                ELSE
                    GREATEST(p.quantity, 1)
            END
        )::INTEGER AS admission_total,
        public.admin_purchase_has_paid_counterpart(p.id, p.event_id, p.customer_id, c.email)
          AS abandonment_resolved_by_paid_order,
        (
          p.status = 'payment_failed'
          AND NOT public.admin_purchase_has_paid_counterpart(p.id, p.event_id, p.customer_id, c.email)
          AND public.admin_email_is_valid_for_recovery(c.email)
        ) AS recovery_email_eligible,
        public.admin_purchase_amount_quantity_mismatch(
            p.status, p.event_id, p.quantity, p.price_per_ticket, p.total_amount
        ) AS amount_quantity_mismatch
    FROM public.purchases p
    INNER JOIN public.customers c ON p.customer_id = c.id
    WHERE
        LOWER(c.name) LIKE LOWER('%' || p_search_query || '%') OR
        LOWER(c.email) LIKE LOWER('%' || p_search_query || '%') OR
        LOWER(p.event_title) LIKE LOWER('%' || p_search_query || '%') OR
        LOWER(p.id::text) LIKE LOWER('%' || p_search_query || '%') OR
        LOWER(p.unique_ticket_identifier) LIKE LOWER('%' || p_search_query || '%')
    ORDER BY p.created_at DESC
    LIMIT 50;
END;
$$;

DROP FUNCTION IF EXISTS public.get_admin_purchases_by_event(text);

CREATE OR REPLACE FUNCTION public.get_admin_purchases_by_event(
    p_event_id TEXT
)
RETURNS TABLE(
    purchase_id UUID,
    customer_id UUID,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    event_id TEXT,
    event_title TEXT,
    event_date_text TEXT,
    event_time_text TEXT,
    event_venue_name TEXT,
    ticket_type_id TEXT,
    ticket_name TEXT,
    quantity INTEGER,
    price_per_ticket NUMERIC,
    total_amount NUMERIC,
    currency_code TEXT,
    status TEXT,
    email_dispatch_status TEXT,
    email_dispatch_attempts INTEGER,
    email_dispatch_error TEXT,
    unique_ticket_identifier TEXT,
    created_at TIMESTAMPTZ,
    pdf_ticket_sent_at TIMESTAMPTZ,
    used_at TIMESTAMPTZ,
    is_used BOOLEAN,
    verified_by TEXT,
    scanned_count BIGINT,
    is_bundle BOOLEAN,
    tickets_per_bundle INTEGER,
    admission_total INTEGER,
    abandonment_resolved_by_paid_order BOOLEAN,
    recovery_email_eligible BOOLEAN,
    amount_quantity_mismatch BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id AS purchase_id,
        p.customer_id,
        c.name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,
        p.event_id,
        p.event_title,
        p.event_date_text,
        p.event_time_text,
        p.event_venue_name,
        p.ticket_type_id,
        p.ticket_name,
        p.quantity,
        p.price_per_ticket,
        p.total_amount,
        p.currency_code,
        p.status,
        p.email_dispatch_status,
        p.email_dispatch_attempts,
        p.email_dispatch_error,
        p.unique_ticket_identifier,
        p.created_at,
        p.pdf_ticket_sent_at,
        p.used_at,
        p.is_used,
        p.verified_by,
        (
            CASE
                WHEN EXISTS (
                    SELECT 1 FROM public.individual_tickets it0 WHERE it0.purchase_id = p.id
                ) THEN
                    (
                        SELECT COUNT(*)::BIGINT
                        FROM public.individual_tickets it
                        WHERE it.purchase_id = p.id AND it.is_used = TRUE
                    )
                ELSE
                    p.use_count::BIGINT
            END
        ) AS scanned_count,
        COALESCE(p.is_bundle, FALSE) AS is_bundle,
        COALESCE(NULLIF(p.tickets_per_bundle, 0), 1) AS tickets_per_bundle,
        (
            CASE
                WHEN COALESCE(p.is_bundle, FALSE) THEN
                    p.quantity * GREATEST(COALESCE(NULLIF(p.tickets_per_bundle, 0), 1), 1)
                ELSE
                    GREATEST(p.quantity, 1)
            END
        )::INTEGER AS admission_total,
        public.admin_purchase_has_paid_counterpart(p.id, p.event_id, p.customer_id, c.email)
          AS abandonment_resolved_by_paid_order,
        (
          p.status = 'payment_failed'
          AND NOT public.admin_purchase_has_paid_counterpart(p.id, p.event_id, p.customer_id, c.email)
          AND public.admin_email_is_valid_for_recovery(c.email)
        ) AS recovery_email_eligible,
        public.admin_purchase_amount_quantity_mismatch(
            p.status, p.event_id, p.quantity, p.price_per_ticket, p.total_amount
        ) AS amount_quantity_mismatch
    FROM public.purchases p
    INNER JOIN public.customers c ON p.customer_id = c.id
    WHERE p.event_id = p_event_id
    ORDER BY p.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_purchase_amount_quantity_mismatch(TEXT, TEXT, INTEGER, NUMERIC, NUMERIC) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_admin_purchases() TO service_role;
GRANT EXECUTE ON FUNCTION public.search_admin_purchases(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_admin_purchases_by_event(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_admin_purchases() TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_admin_purchases(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_purchases_by_event(TEXT) TO authenticated;

COMMENT ON FUNCTION public.get_admin_purchases()
IS 'Admin purchases list; admission_total expands bundles; amount_quantity_mismatch flags paid event tickets whose total does not match quantity * unit price.';

COMMENT ON FUNCTION public.search_admin_purchases(TEXT)
IS 'Search admin purchases; includes amount_quantity_mismatch for paid event tickets.';

COMMENT ON FUNCTION public.get_admin_purchases_by_event(TEXT)
IS 'Purchases for one event; includes amount_quantity_mismatch for paid event tickets.';

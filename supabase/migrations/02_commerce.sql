-- Commerce: customer/purchase RPCs, Lomi webhooks, email dispatch, merch, payment expiry

-- ---------------------------------------------------------------------------
-- Customer & purchase creation
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.upsert_customer(
    p_name TEXT,
    p_email TEXT,
    p_phone TEXT DEFAULT NULL,
    p_whatsapp TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    customer_id UUID;
BEGIN
    SELECT id INTO customer_id
    FROM public.customers
    WHERE email = p_email;

    IF customer_id IS NOT NULL THEN
        UPDATE public.customers
        SET
            name = p_name,
            phone = COALESCE(p_phone, phone),
            whatsapp = COALESCE(p_whatsapp, whatsapp),
            updated_at = NOW()
        WHERE id = customer_id;
    ELSE
        INSERT INTO public.customers (name, email, phone, whatsapp)
        VALUES (p_name, p_email, p_phone, p_whatsapp)
        RETURNING id INTO customer_id;
    END IF;

    RETURN customer_id;
END;
$$;

COMMENT ON FUNCTION public.upsert_customer(TEXT, TEXT, TEXT, TEXT)
IS 'Creates a new customer or updates existing customer by email. Returns customer ID.';

CREATE OR REPLACE FUNCTION public.create_purchase(
    p_customer_id UUID,
    p_event_id TEXT,
    p_event_title TEXT,
    p_ticket_type_id TEXT,
    p_ticket_name TEXT,
    p_quantity INTEGER,
    p_price_per_ticket NUMERIC,
    p_total_amount NUMERIC,
    p_currency_code TEXT DEFAULT 'XOF',
    p_event_date_text TEXT DEFAULT NULL,
    p_event_time_text TEXT DEFAULT NULL,
    p_event_venue_name TEXT DEFAULT NULL,
    p_is_bundle BOOLEAN DEFAULT FALSE,
    p_tickets_per_bundle INTEGER DEFAULT 1
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    purchase_id UUID;
BEGIN
    INSERT INTO public.purchases (
        customer_id,
        event_id,
        event_title,
        ticket_type_id,
        ticket_name,
        quantity,
        price_per_ticket,
        total_amount,
        currency_code,
        event_date_text,
        event_time_text,
        event_venue_name,
        is_bundle,
        tickets_per_bundle,
        status
    )
    VALUES (
        p_customer_id,
        p_event_id,
        p_event_title,
        p_ticket_type_id,
        p_ticket_name,
        p_quantity,
        p_price_per_ticket,
        p_total_amount,
        p_currency_code,
        p_event_date_text,
        p_event_time_text,
        p_event_venue_name,
        p_is_bundle,
        p_tickets_per_bundle,
        'pending_payment'
    )
    RETURNING id INTO purchase_id;

    RETURN purchase_id;
END;
$$;

COMMENT ON FUNCTION public.create_purchase(UUID, TEXT, TEXT, TEXT, TEXT, INTEGER, NUMERIC, NUMERIC, TEXT, TEXT, TEXT, TEXT, BOOLEAN, INTEGER)
IS 'Creates a new purchase record with pending_payment status. Supports both regular tickets and bundles. Returns purchase ID.';

CREATE OR REPLACE FUNCTION public.create_merch_purchase(
    p_customer_id UUID,
    p_product_id TEXT,
    p_product_title TEXT,
    p_quantity INTEGER,
    p_price_per_item NUMERIC,
    p_total_amount NUMERIC,
    p_merchandise_id TEXT,
    p_currency_code TEXT DEFAULT 'XOF'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    purchase_id UUID;
BEGIN
    INSERT INTO public.purchases (
        customer_id,
        event_id,
        event_title,
        ticket_type_id,
        ticket_name,
        quantity,
        price_per_ticket,
        total_amount,
        currency_code,
        merchandise_id,
        product_id,
        product_title,
        status
    )
    VALUES (
        p_customer_id,
        NULL,
        NULL,
        NULL,
        NULL,
        p_quantity,
        p_price_per_item,
        p_total_amount,
        p_currency_code,
        p_merchandise_id,
        p_product_id,
        p_product_title,
        'pending_payment'
    )
    RETURNING id INTO purchase_id;

    RETURN purchase_id;
END;
$$;

COMMENT ON FUNCTION public.create_merch_purchase(UUID, TEXT, TEXT, INTEGER, NUMERIC, NUMERIC, TEXT, TEXT)
IS 'Creates a new merchandise purchase record with pending_payment status. Returns purchase ID.';

CREATE OR REPLACE FUNCTION public.update_purchase_lomi_session(
    p_purchase_id UUID,
    p_lomi_session_id TEXT,
    p_lomi_checkout_url TEXT,
    p_payment_processor_details JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.purchases
    SET
        lomi_session_id = COALESCE(NULLIF(p_lomi_session_id, ''), lomi_session_id),
        lomi_checkout_url = COALESCE(p_lomi_checkout_url, lomi_checkout_url),
        payment_processor_details = COALESCE(p_payment_processor_details, payment_processor_details),
        updated_at = NOW()
    WHERE id = p_purchase_id;

    IF NOT FOUND THEN
        RAISE WARNING 'Purchase ID % not found during lomi session update', p_purchase_id;
    END IF;
END;
$$;

COMMENT ON FUNCTION public.update_purchase_lomi_session(UUID, TEXT, TEXT, JSONB)
IS 'Updates purchase with Lomi session details. Preserves existing lomi_session_id when NULL/blank (cart line items).';

-- ---------------------------------------------------------------------------
-- Lomi webhook & idempotency
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_purchase_status(p_purchase_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_status TEXT;
BEGIN
    SELECT status INTO v_status
    FROM public.purchases
    WHERE id = p_purchase_id;
    RETURN v_status;
END;
$$;

COMMENT ON FUNCTION public.get_purchase_status(UUID)
IS 'Returns the status of a purchase by id. Used by webhook handler for idempotency.';

CREATE OR REPLACE FUNCTION public.record_lomi_payment(
    p_purchase_id UUID,
    p_lomi_payment_id TEXT,
    p_lomi_checkout_session_id TEXT,
    p_payment_status TEXT,
    p_lomi_event_payload JSONB,
    p_amount_paid NUMERIC DEFAULT NULL,
    p_currency_paid TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_current_status TEXT;
    v_checkout_session TEXT;
BEGIN
    v_checkout_session := NULLIF(p_lomi_checkout_session_id, '');

    SELECT status INTO v_current_status
    FROM public.purchases
    WHERE id = p_purchase_id;

    IF NOT FOUND THEN
        RAISE WARNING 'Purchase ID % not found during record_lomi_payment', p_purchase_id;
        RETURN;
    END IF;

    IF v_current_status = 'paid' AND p_payment_status = 'paid' THEN
        RAISE NOTICE 'Purchase % already paid, skipping duplicate payment recording', p_purchase_id;
        RETURN;
    END IF;

    UPDATE public.purchases
    SET
        status = p_payment_status,
        lomi_session_id = COALESCE(lomi_session_id, v_checkout_session),
        total_amount = COALESCE(p_amount_paid, total_amount),
        currency_code = COALESCE(p_currency_paid, currency_code),
        payment_processor_details = COALESCE(payment_processor_details, '{}'::jsonb)
            || jsonb_build_object('lomi_event', p_lomi_event_payload),
        updated_at = NOW()
    WHERE id = p_purchase_id;
END;
$$;

COMMENT ON FUNCTION public.record_lomi_payment(UUID, TEXT, TEXT, TEXT, JSONB, NUMERIC, TEXT)
IS 'Records Lomi payment for any purchase. Pass NULL amount to keep line-item totals (cart checkouts).';

CREATE OR REPLACE FUNCTION public.check_webhook_already_processed(
    p_webhook_event_id TEXT,
    p_purchase_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_already_processed BOOLEAN := FALSE;
BEGIN
    IF p_purchase_id IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1
            FROM public.purchases
            WHERE id = p_purchase_id
              AND COALESCE(webhook_processing_log->'processed_webhooks'->>p_webhook_event_id, '') = 'true'
        ) INTO v_already_processed;
    ELSE
        SELECT EXISTS(
            SELECT 1
            FROM public.purchases
            WHERE COALESCE(webhook_processing_log->'processed_webhooks'->>p_webhook_event_id, '') = 'true'
            LIMIT 1
        ) INTO v_already_processed;
    END IF;
    RETURN v_already_processed;
END;
$$;

COMMENT ON FUNCTION public.check_webhook_already_processed(TEXT, UUID)
IS 'Checks if a webhook event has already been processed for a purchase. Pass purchase_id for reliable per-purchase idempotency.';

CREATE OR REPLACE FUNCTION public.update_purchase_webhook_metadata(
    p_purchase_id UUID,
    p_webhook_event_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.purchases
    SET
        webhook_processing_log = jsonb_set(
            COALESCE(webhook_processing_log, '{}'::jsonb),
            ARRAY['processed_webhooks', p_webhook_event_id],
            '"true"'::jsonb
        ),
        updated_at = NOW()
    WHERE id = p_purchase_id;

    IF NOT FOUND THEN
        RAISE WARNING 'Purchase ID % not found during update_purchase_webhook_metadata', p_purchase_id;
    END IF;
END;
$$;

COMMENT ON FUNCTION public.update_purchase_webhook_metadata(UUID, TEXT)
IS 'Updates webhook processing metadata for a purchase to prevent duplicate webhook processing';

-- ---------------------------------------------------------------------------
-- Email dispatch
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prepare_purchase_for_email_dispatch(
    p_purchase_id UUID
)
RETURNS TABLE(
    purchase_id UUID,
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
    unique_ticket_identifier TEXT,
    qr_code_data TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_current_status TEXT;
    v_dispatch_status TEXT;
BEGIN
    SELECT status, email_dispatch_status
    INTO v_current_status, v_dispatch_status
    FROM public.purchases
    WHERE id = p_purchase_id;

    IF NOT FOUND THEN
        RAISE WARNING 'Purchase ID % not found during prepare_purchase_for_email_dispatch', p_purchase_id;
        RETURN;
    END IF;

    IF v_dispatch_status IN ('SENT_SUCCESSFULLY', 'DISPATCH_IN_PROGRESS') THEN
        RAISE NOTICE 'Purchase % email dispatch already % , skipping duplicate preparation', p_purchase_id, v_dispatch_status;
        RETURN;
    END IF;

    IF v_current_status != 'paid' THEN
        RAISE WARNING 'Purchase % is not paid (status: %), skipping email dispatch preparation', p_purchase_id, v_current_status;
        RETURN;
    END IF;

    UPDATE public.purchases
    SET
        email_dispatch_status = 'PENDING_DISPATCH',
        email_dispatch_attempts = COALESCE(email_dispatch_attempts, 0) + 1,
        updated_at = NOW()
    WHERE id = p_purchase_id;

    RETURN QUERY
    SELECT
        p.id AS purchase_id,
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
        p.unique_ticket_identifier,
        p.unique_ticket_identifier AS qr_code_data
    FROM public.purchases p
    INNER JOIN public.customers c ON p.customer_id = c.id
    WHERE p.id = p_purchase_id
    AND p.status = 'paid';
END;
$$;

COMMENT ON FUNCTION public.prepare_purchase_for_email_dispatch(UUID)
IS 'Marks a paid purchase as PENDING_DISPATCH and returns row data for ticket email dispatch.';

CREATE OR REPLACE FUNCTION public.get_purchase_for_email_dispatch(
    p_purchase_id UUID
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
    unique_ticket_identifier TEXT,
    is_bundle BOOLEAN,
    tickets_per_bundle INTEGER,
    individual_tickets_generated BOOLEAN
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
        p.unique_ticket_identifier,
        p.is_bundle,
        p.tickets_per_bundle,
        p.individual_tickets_generated
    FROM public.purchases p
    INNER JOIN public.customers c ON p.customer_id = c.id
    WHERE p.id = p_purchase_id;
END;
$$;

COMMENT ON FUNCTION public.get_purchase_for_email_dispatch(UUID)
IS 'Purchase + customer row for email dispatch; includes individual_tickets_generated for QR strategy.';

CREATE OR REPLACE FUNCTION public.update_email_dispatch_status(
    p_purchase_id UUID,
    p_email_dispatch_status TEXT,
    p_email_dispatch_error TEXT DEFAULT NULL,
    p_email_dispatch_attempts INTEGER DEFAULT NULL,
    p_pdf_ticket_generated BOOLEAN DEFAULT NULL,
    p_pdf_ticket_sent_at TIMESTAMPTZ DEFAULT NULL,
    p_unique_ticket_identifier TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.purchases
    SET
        email_dispatch_status = p_email_dispatch_status,
        email_last_dispatch_attempt_at = NOW(),
        email_dispatch_error = COALESCE(p_email_dispatch_error, email_dispatch_error),
        email_dispatch_attempts = COALESCE(p_email_dispatch_attempts, email_dispatch_attempts),
        pdf_ticket_generated = COALESCE(p_pdf_ticket_generated, pdf_ticket_generated),
        pdf_ticket_sent_at = COALESCE(p_pdf_ticket_sent_at, pdf_ticket_sent_at),
        unique_ticket_identifier = COALESCE(p_unique_ticket_identifier, unique_ticket_identifier),
        updated_at = NOW()
    WHERE id = p_purchase_id;

    IF NOT FOUND THEN
        RAISE WARNING 'Purchase ID % not found during update_email_dispatch_status', p_purchase_id;
    END IF;
END;
$$;

COMMENT ON FUNCTION public.update_email_dispatch_status(UUID, TEXT, TEXT, INTEGER, BOOLEAN, TIMESTAMPTZ, TEXT)
IS 'Updates the email dispatch status and related fields for a purchase record';

CREATE OR REPLACE FUNCTION public.reset_stuck_email_dispatches()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    reset_count INTEGER;
BEGIN
    UPDATE public.purchases
    SET
        email_dispatch_status = 'DISPATCH_FAILED',
        email_dispatch_error = 'Dispatch timed out - reset by cleanup function',
        updated_at = NOW()
    WHERE email_dispatch_status = 'DISPATCH_IN_PROGRESS'
    AND email_last_dispatch_attempt_at < NOW() - INTERVAL '10 minutes';

    GET DIAGNOSTICS reset_count = ROW_COUNT;
    RETURN reset_count;
END;
$$;

COMMENT ON FUNCTION public.reset_stuck_email_dispatches()
IS 'Resets email dispatch statuses stuck in DISPATCH_IN_PROGRESS for more than 10 minutes';

CREATE OR REPLACE FUNCTION public.get_merch_purchase_for_email_dispatch(
    p_purchase_ids UUID[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_result JSONB;
    v_shipping NUMERIC := 0;
    v_first_id UUID;
BEGIN
    IF p_purchase_ids IS NULL OR array_length(p_purchase_ids, 1) IS NULL THEN
        RETURN NULL;
    END IF;

    v_first_id := p_purchase_ids[1];

    SELECT COALESCE(
        NULLIF((payment_processor_details->'request'->'metadata'->>'order_shipping')::NUMERIC, NULL),
        NULLIF((payment_processor_details->'lomi_event'->'data'->'metadata'->>'order_shipping')::NUMERIC, NULL),
        NULLIF((payment_processor_details->'data'->'metadata'->>'order_shipping')::NUMERIC, NULL),
        0
    )
    INTO v_shipping
    FROM public.purchases
    WHERE id = v_first_id;

    SELECT jsonb_build_object(
        'customer_name', MAX(c.name),
        'customer_email', MAX(c.email),
        'shipping_fee', v_shipping,
        'total_amount', COALESCE(SUM(p.total_amount), 0) + v_shipping,
        'items', COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'product_title', p.product_title,
                    'quantity', p.quantity,
                    'total_amount', p.total_amount
                )
                ORDER BY p.created_at
            ),
            '[]'::jsonb
        )
    )
    INTO v_result
    FROM public.purchases p
    JOIN public.customers c ON c.id = p.customer_id
    WHERE p.id = ANY(p_purchase_ids)
      AND p.product_id IS NOT NULL;

    RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.get_merch_purchase_for_email_dispatch(UUID[])
IS 'Returns customer and line items for merchandise receipt emails (cart checkout).';

-- ---------------------------------------------------------------------------
-- Payment expiry cleanup
-- ---------------------------------------------------------------------------
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
    expiry_threshold := NOW() - INTERVAL '2 hours';

    RAISE LOG 'Starting expired payments cleanup. Threshold: %', expiry_threshold;

    WITH updated_purchases AS (
        UPDATE public.purchases
        SET
            status = 'payment_failed',
            updated_at = NOW()
        WHERE
            status = 'pending_payment'
            AND created_at < expiry_threshold
        RETURNING id
    )
    SELECT
        ARRAY(SELECT id::text FROM updated_purchases),
        (SELECT COUNT(*) FROM updated_purchases)
    INTO updated_ids, update_count;

    RAISE LOG 'Expired payments cleanup completed. Updated % purchases: %', update_count, updated_ids;

    RETURN QUERY SELECT update_count, updated_ids;
END;
$$;

COMMENT ON FUNCTION public.update_expired_pending_payments()
IS 'Updates pending payments older than 2 hours to failed status. Returns count and updated purchase IDs.';

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.upsert_customer(TEXT, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_purchase(UUID, TEXT, TEXT, TEXT, TEXT, INTEGER, NUMERIC, NUMERIC, TEXT, TEXT, TEXT, TEXT, BOOLEAN, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_merch_purchase(UUID, TEXT, TEXT, INTEGER, NUMERIC, NUMERIC, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_purchase_lomi_session(UUID, TEXT, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_purchase_status(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_lomi_payment(UUID, TEXT, TEXT, TEXT, JSONB, NUMERIC, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_webhook_already_processed(TEXT, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_purchase_webhook_metadata(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.prepare_purchase_for_email_dispatch(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_purchase_for_email_dispatch(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_email_dispatch_status(UUID, TEXT, TEXT, INTEGER, BOOLEAN, TIMESTAMPTZ, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.reset_stuck_email_dispatches() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_merch_purchase_for_email_dispatch(UUID[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_expired_pending_payments() TO service_role;

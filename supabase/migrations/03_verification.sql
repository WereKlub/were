-- Ticket verification: scan logging, individual ticket generation, verify/mark admission

-- ---------------------------------------------------------------------------
-- Verification logging
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_verification_attempt(
    p_ticket_identifier TEXT,
    p_event_id TEXT,
    p_event_title TEXT,
    p_success BOOLEAN,
    p_error_code TEXT DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL,
    p_scanner_email TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.verification_attempts (
        ticket_identifier,
        event_id,
        event_title,
        success,
        error_code,
        error_message,
        scanner_email
    ) VALUES (
        p_ticket_identifier,
        p_event_id,
        p_event_title,
        p_success,
        p_error_code,
        p_error_message,
        p_scanner_email
    ) RETURNING id INTO log_id;

    RETURN log_id;
END;
$$;

COMMENT ON FUNCTION public.log_verification_attempt(TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT)
IS 'Logs a verification attempt with success status and optional error details';

CREATE OR REPLACE FUNCTION public.get_recent_verification_errors(
    p_limit INTEGER DEFAULT 20,
    p_event_id TEXT DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    ticket_identifier TEXT,
    event_id TEXT,
    event_title TEXT,
    attempt_timestamp TIMESTAMPTZ,
    error_code TEXT,
    error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
#variable_conflict use_column
BEGIN
    RETURN QUERY
    SELECT
        va.id,
        va.ticket_identifier,
        va.event_id,
        va.event_title,
        va.attempt_timestamp,
        va.error_code,
        va.error_message
    FROM public.verification_attempts va
    WHERE va.success = FALSE
    AND (p_event_id IS NULL OR va.event_id = p_event_id)
    ORDER BY va.attempt_timestamp DESC
    LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION public.get_recent_verification_errors(INTEGER, TEXT)
IS 'Returns recent failed verification attempts, optionally filtered by event';

CREATE OR REPLACE FUNCTION public.cleanup_old_verification_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.verification_attempts
    WHERE attempt_timestamp < NOW() - INTERVAL '30 days';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION public.cleanup_old_verification_logs()
IS 'Deletes verification logs older than 30 days';

-- ---------------------------------------------------------------------------
-- Staff PIN & stats
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verify_staff_pin(p_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    stored_pin TEXT;
BEGIN
    SELECT config_value INTO stored_pin
    FROM public.verification_config
    WHERE config_key = 'staff_verification_pin';

    RETURN (stored_pin = p_pin);
END;
$$;

COMMENT ON FUNCTION public.verify_staff_pin(TEXT)
IS 'Securely verifies staff PIN against stored value';

CREATE OR REPLACE FUNCTION public.get_event_verification_stats(p_event_id TEXT)
RETURNS TABLE(
    total_tickets INTEGER,
    used_tickets INTEGER,
    unused_tickets INTEGER,
    total_attendees INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER AS total_tickets,
        COUNT(CASE WHEN is_used = TRUE THEN 1 END)::INTEGER AS used_tickets,
        COUNT(CASE WHEN is_used = FALSE THEN 1 END)::INTEGER AS unused_tickets,
        COALESCE(SUM(CASE WHEN is_used = TRUE THEN quantity ELSE 0 END), 0)::INTEGER AS total_attendees
    FROM public.purchases
    WHERE event_id = p_event_id
    AND status = 'paid';
END;
$$;

COMMENT ON FUNCTION public.get_event_verification_stats(TEXT)
IS 'Returns verification statistics for an event (total, used, unused tickets)';

-- ---------------------------------------------------------------------------
-- Individual ticket generation & purchase sync
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_individual_tickets_for_purchase(
    p_purchase_id UUID
)
RETURNS TABLE (ticket_identifier TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    purchase_record RECORD;
    actual_ticket_quantity INTEGER;
    new_ticket_identifier TEXT;
    existing_ticket_count INTEGER;
BEGIN
    SELECT * INTO purchase_record FROM public.purchases WHERE id = p_purchase_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Purchase with ID % not found.', p_purchase_id;
    END IF;

    IF purchase_record.created_at < '2024-08-01' THEN
        RAISE EXCEPTION 'Cannot generate individual tickets for this legacy purchase.';
    END IF;

    actual_ticket_quantity := COALESCE(
        CASE WHEN purchase_record.is_bundle THEN purchase_record.quantity * purchase_record.tickets_per_bundle ELSE purchase_record.quantity END,
        purchase_record.quantity,
        1
    );

    SELECT count(*) INTO existing_ticket_count FROM public.individual_tickets WHERE purchase_id = p_purchase_id;

    IF existing_ticket_count >= actual_ticket_quantity THEN
        FOR new_ticket_identifier IN
            SELECT it.ticket_identifier FROM public.individual_tickets it WHERE it.purchase_id = p_purchase_id
        LOOP
            ticket_identifier := new_ticket_identifier;
            RETURN NEXT;
        END LOOP;
        RETURN;
    END IF;

    IF existing_ticket_count > 0 THEN
        PERFORM 1 FROM public.individual_tickets WHERE purchase_id = p_purchase_id AND is_used = TRUE;
        IF FOUND THEN
            RAISE EXCEPTION 'Cannot regenerate tickets for purchase % because some tickets are already used.', p_purchase_id;
        END IF;
        DELETE FROM public.individual_tickets WHERE purchase_id = p_purchase_id;
    END IF;

    FOR i IN 1..actual_ticket_quantity LOOP
        new_ticket_identifier := gen_random_uuid()::TEXT;
        INSERT INTO public.individual_tickets (purchase_id, ticket_identifier)
        VALUES (p_purchase_id, new_ticket_identifier);

        ticket_identifier := new_ticket_identifier;
        RETURN NEXT;
    END LOOP;

    UPDATE public.purchases
    SET individual_tickets_generated = TRUE
    WHERE id = p_purchase_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_purchase_admission_from_individuals(p_purchase_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.individual_tickets it WHERE it.purchase_id = p_purchase_id
    ) THEN
        RETURN;
    END IF;

    UPDATE public.purchases p
    SET
        use_count = (
            SELECT COUNT(*)::INTEGER
            FROM public.individual_tickets it
            WHERE it.purchase_id = p_purchase_id AND it.is_used = TRUE
        ),
        is_used = NOT EXISTS (
            SELECT 1 FROM public.individual_tickets it
            WHERE it.purchase_id = p_purchase_id AND it.is_used = FALSE
        ),
        used_at = (
            SELECT MAX(it.used_at)
            FROM public.individual_tickets it
            WHERE it.purchase_id = p_purchase_id AND it.used_at IS NOT NULL
        ),
        updated_at = NOW()
    WHERE p.id = p_purchase_id;
END;
$$;

COMMENT ON FUNCTION public.sync_purchase_admission_from_individuals(UUID)
IS 'Copies admission totals from individual_tickets into purchases for orders that use per-ticket rows.';

CREATE OR REPLACE FUNCTION public.purchase_has_individual_tickets(p_purchase_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.individual_tickets it
        WHERE it.purchase_id = p_purchase_id
    );
$$;

COMMENT ON FUNCTION public.purchase_has_individual_tickets(UUID)
IS 'TRUE if any individual_tickets rows exist for this purchase (e.g. guest list).';

-- ---------------------------------------------------------------------------
-- Verify & mark admission (individual + legacy)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verify_ticket(
    p_ticket_identifier TEXT,
    p_scanner_email TEXT DEFAULT NULL
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
    status TEXT,
    is_used BOOLEAN,
    used_at TIMESTAMPTZ,
    verified_by TEXT,
    use_count INTEGER,
    total_quantity INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    individual_ticket RECORD;
    purchase_record RECORD;
    v_used INTEGER;
    v_total INTEGER;
BEGIN
    IF p_ticket_identifier IS NULL OR TRIM(p_ticket_identifier) = '' THEN
        RAISE EXCEPTION 'INVALID_TICKET_ID: Ticket identifier cannot be empty';
    END IF;

    SELECT it.* INTO individual_ticket FROM public.individual_tickets it WHERE it.ticket_identifier = p_ticket_identifier;

    IF FOUND THEN
        SELECT p.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone
        INTO purchase_record
        FROM public.purchases p
        INNER JOIN public.customers c ON p.customer_id = c.id
        WHERE p.id = individual_ticket.purchase_id;

        IF NOT FOUND THEN
            PERFORM public.log_verification_attempt(
                p_ticket_identifier, NULL, NULL, FALSE, 'ORPHANED_TICKET', 'Individual ticket found but associated purchase not found', p_scanner_email
            );
            RAISE EXCEPTION 'ORPHANED_TICKET: Ticket found but purchase record missing';
        END IF;

        IF purchase_record.status != 'paid' THEN
            PERFORM public.log_verification_attempt(
                p_ticket_identifier, purchase_record.event_id, purchase_record.event_title, FALSE, 'UNPAID_TICKET', 'Ticket belongs to unpaid purchase', p_scanner_email
            );
            RAISE EXCEPTION 'UNPAID_TICKET: This ticket has not been paid for';
        END IF;

        SELECT
            COUNT(*) FILTER (WHERE ita.is_used)::INTEGER,
            COUNT(*)::INTEGER
        INTO v_used, v_total
        FROM public.individual_tickets ita
        WHERE ita.purchase_id = purchase_record.id;

        v_used := GREATEST(v_used, LEAST(purchase_record.use_count, v_total));

        RETURN QUERY SELECT
            purchase_record.id, purchase_record.customer_name, purchase_record.customer_email, purchase_record.customer_phone,
            purchase_record.event_id, purchase_record.event_title, purchase_record.event_date_text, purchase_record.event_time_text,
            purchase_record.event_venue_name, purchase_record.ticket_type_id, purchase_record.ticket_name,
            1, purchase_record.price_per_ticket, purchase_record.total_amount, purchase_record.currency_code,
            individual_ticket.status, individual_ticket.is_used, individual_ticket.used_at, individual_ticket.verified_by,
            v_used,
            v_total;
        RETURN;
    END IF;

    SELECT p.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone
    INTO purchase_record
    FROM public.purchases p
    INNER JOIN public.customers c ON p.customer_id = c.id
    WHERE p.unique_ticket_identifier = p_ticket_identifier;

    IF FOUND THEN
        IF purchase_record.status != 'paid' THEN
            PERFORM public.log_verification_attempt(
                p_ticket_identifier, purchase_record.event_id, purchase_record.event_title, FALSE, 'UNPAID_TICKET', 'Ticket belongs to unpaid purchase', p_scanner_email
            );
            RAISE EXCEPTION 'UNPAID_TICKET: This ticket has not been paid for';
        END IF;

        IF EXISTS (SELECT 1 FROM public.individual_tickets it0 WHERE it0.purchase_id = purchase_record.id) THEN
            SELECT
                COUNT(*) FILTER (WHERE ita.is_used)::INTEGER,
                COUNT(*)::INTEGER
            INTO v_used, v_total
            FROM public.individual_tickets ita
            WHERE ita.purchase_id = purchase_record.id;

            v_used := GREATEST(v_used, LEAST(purchase_record.use_count, v_total));

            RETURN QUERY SELECT
                purchase_record.id, purchase_record.customer_name, purchase_record.customer_email, purchase_record.customer_phone,
                purchase_record.event_id, purchase_record.event_title, purchase_record.event_date_text, purchase_record.event_time_text,
                purchase_record.event_venue_name, purchase_record.ticket_type_id, purchase_record.ticket_name,
                1, purchase_record.price_per_ticket, purchase_record.total_amount, purchase_record.currency_code,
                CASE WHEN v_used >= v_total THEN 'used' ELSE 'valid' END::TEXT,
                (v_used >= v_total),
                (SELECT MAX(itm.used_at) FROM public.individual_tickets itm WHERE itm.purchase_id = purchase_record.id),
                NULL::TEXT,
                v_used,
                v_total;
            RETURN;
        END IF;

        RETURN QUERY SELECT
            purchase_record.id, purchase_record.customer_name, purchase_record.customer_email, purchase_record.customer_phone,
            purchase_record.event_id, purchase_record.event_title, purchase_record.event_date_text, purchase_record.event_time_text,
            purchase_record.event_venue_name, purchase_record.ticket_type_id, purchase_record.ticket_name,
            purchase_record.quantity, purchase_record.price_per_ticket, purchase_record.total_amount, purchase_record.currency_code,
            purchase_record.status, (purchase_record.use_count >= purchase_record.quantity), purchase_record.used_at, purchase_record.verified_by,
            purchase_record.use_count, purchase_record.quantity;
        RETURN;
    END IF;

    PERFORM public.log_verification_attempt(
        p_ticket_identifier, NULL, NULL, FALSE, 'TICKET_NOT_FOUND', 'No ticket found with this identifier', p_scanner_email
    );
    RAISE EXCEPTION 'TICKET_NOT_FOUND: Ticket not found in system';
END;
$$;

COMMENT ON FUNCTION public.verify_ticket(TEXT, TEXT)
IS 'Admission state for purchases with individual_tickets is derived from those rows; purchase unique_ticket_identifier resolves to aggregate counts.';

CREATE OR REPLACE FUNCTION public.mark_ticket_used(
    p_ticket_identifier TEXT,
    p_verified_by TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    individual_ticket RECORD;
    purchase_record RECORD;
    time_since_last_scan INTERVAL;
    iused INTEGER;
    itotal INTEGER;
    target INTEGER;
    to_sync INTEGER;
BEGIN
    SELECT * INTO individual_ticket FROM public.individual_tickets it WHERE it.ticket_identifier = p_ticket_identifier;

    IF FOUND THEN
        IF individual_ticket.used_at IS NOT NULL THEN
            time_since_last_scan := NOW() - individual_ticket.used_at;
            IF time_since_last_scan < INTERVAL '2 seconds' THEN
                PERFORM public.log_verification_attempt(
                    p_ticket_identifier, NULL, NULL, FALSE, 'DUPLICATE_SCAN', 'Ticket scanned again within 2 seconds of last scan', p_verified_by
                );
                RETURN 'DUPLICATE_SCAN';
            END IF;
        END IF;

        IF individual_ticket.is_used THEN
            SELECT p.event_id, p.event_title INTO purchase_record
            FROM public.purchases p WHERE p.id = individual_ticket.purchase_id;

            PERFORM public.log_verification_attempt(
                p_ticket_identifier, purchase_record.event_id, purchase_record.event_title, FALSE, 'ALREADY_USED', 'Ticket has already been used for entry', p_verified_by
            );
            RETURN 'ALREADY_USED';
        END IF;

        UPDATE public.individual_tickets
        SET is_used = TRUE, used_at = NOW(), verified_by = p_verified_by, status = 'used', updated_at = NOW()
        WHERE id = individual_ticket.id;

        SELECT p.event_id, p.event_title INTO purchase_record
        FROM public.purchases p WHERE p.id = individual_ticket.purchase_id;

        PERFORM public.log_verification_attempt(
            p_ticket_identifier, purchase_record.event_id, purchase_record.event_title, TRUE, NULL, 'Admission recorded', p_verified_by
        );

        PERFORM public.sync_purchase_admission_from_individuals(individual_ticket.purchase_id);

        RETURN 'SUCCESS';
    END IF;

    SELECT * INTO purchase_record FROM public.purchases WHERE unique_ticket_identifier = p_ticket_identifier;

    IF FOUND THEN
        IF EXISTS (SELECT 1 FROM public.individual_tickets it0 WHERE it0.purchase_id = purchase_record.id) THEN
            SELECT
                COUNT(*) FILTER (WHERE ita.is_used)::INTEGER,
                COUNT(*)::INTEGER
            INTO iused, itotal
            FROM public.individual_tickets ita
            WHERE ita.purchase_id = purchase_record.id;

            target := GREATEST(iused, LEAST(purchase_record.use_count, itotal));
            to_sync := target - iused;

            IF to_sync > 0 THEN
                UPDATE public.individual_tickets it
                SET is_used = TRUE, used_at = COALESCE(it.used_at, NOW()), verified_by = COALESCE(it.verified_by, 'reconciled'),
                    status = 'used', updated_at = NOW()
                WHERE it.id IN (
                    SELECT it2.id
                    FROM public.individual_tickets it2
                    WHERE it2.purchase_id = purchase_record.id AND it2.is_used = FALSE
                    ORDER BY it2.ticket_identifier ASC
                    LIMIT to_sync
                );
            END IF;

            PERFORM public.sync_purchase_admission_from_individuals(purchase_record.id);

            SELECT it.* INTO individual_ticket
            FROM public.individual_tickets it
            WHERE it.purchase_id = purchase_record.id AND it.is_used = FALSE
            ORDER BY it.ticket_identifier ASC
            LIMIT 1;

            IF NOT FOUND THEN
                PERFORM public.log_verification_attempt(
                    p_ticket_identifier, purchase_record.event_id, purchase_record.event_title, FALSE, 'ALREADY_USED', 'All admissions for this purchase have been used', p_verified_by
                );
                RETURN 'ALREADY_USED';
            END IF;

            IF individual_ticket.used_at IS NOT NULL THEN
                time_since_last_scan := NOW() - individual_ticket.used_at;
                IF time_since_last_scan < INTERVAL '2 seconds' THEN
                    PERFORM public.log_verification_attempt(
                        p_ticket_identifier, purchase_record.event_id, purchase_record.event_title, FALSE, 'DUPLICATE_SCAN', 'Ticket scanned again within 2 seconds of last scan', p_verified_by
                    );
                    RETURN 'DUPLICATE_SCAN';
                END IF;
            END IF;

            UPDATE public.individual_tickets
            SET is_used = TRUE, used_at = NOW(), verified_by = p_verified_by, status = 'used', updated_at = NOW()
            WHERE id = individual_ticket.id;

            PERFORM public.log_verification_attempt(
                p_ticket_identifier, purchase_record.event_id, purchase_record.event_title, TRUE, NULL, 'Admission recorded', p_verified_by
            );

            PERFORM public.sync_purchase_admission_from_individuals(purchase_record.id);

            RETURN 'SUCCESS';
        END IF;

        IF purchase_record.used_at IS NOT NULL THEN
            time_since_last_scan := NOW() - purchase_record.used_at;
            IF time_since_last_scan < INTERVAL '2 seconds' THEN
                PERFORM public.log_verification_attempt(
                    p_ticket_identifier, purchase_record.event_id, purchase_record.event_title, FALSE, 'DUPLICATE_SCAN', 'Ticket scanned again within 2 seconds of last scan', p_verified_by
                );
                RETURN 'DUPLICATE_SCAN';
            END IF;
        END IF;

        IF purchase_record.use_count >= purchase_record.quantity THEN
            PERFORM public.log_verification_attempt(
                p_ticket_identifier, purchase_record.event_id, purchase_record.event_title, FALSE, 'ALREADY_USED', 'All admissions for this purchase have been used', p_verified_by
            );
            RETURN 'ALREADY_USED';
        END IF;

        UPDATE public.purchases
        SET use_count = purchase_record.use_count + 1, used_at = NOW(), verified_by = p_verified_by,
            is_used = (purchase_record.use_count + 1) >= purchase_record.quantity, updated_at = NOW()
        WHERE id = purchase_record.id;

        PERFORM public.log_verification_attempt(
            p_ticket_identifier, purchase_record.event_id, purchase_record.event_title, TRUE, NULL, 'Admission recorded', p_verified_by
        );

        RETURN 'SUCCESS';
    END IF;

    PERFORM public.log_verification_attempt(
        p_ticket_identifier, NULL, NULL, FALSE, 'NOT_FOUND', 'Ticket identifier not found in system', p_verified_by
    );

    RETURN 'NOT_FOUND';
END;
$$;

COMMENT ON FUNCTION public.mark_ticket_used(TEXT, TEXT)
IS 'Marks admission for individual or legacy tickets; returns SUCCESS, ALREADY_USED, DUPLICATE_SCAN, or NOT_FOUND.';

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.log_verification_attempt(TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.log_verification_attempt(TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_verification_errors(INTEGER, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_recent_verification_errors(INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_verification_logs() TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_staff_pin(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_staff_pin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_event_verification_stats(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_event_verification_stats(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_individual_tickets_for_purchase(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_individual_tickets_for_purchase(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_ticket(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_ticket(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_ticket_used(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_ticket_used(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_has_individual_tickets(UUID) TO service_role;

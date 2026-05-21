-- Admin panel, guest tickets, scan logs, and anon client grants

-- ---------------------------------------------------------------------------
-- Abandoned checkout / recovery helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_normalize_email_for_recovery_match(p_email text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $$
DECLARE
  e text;
  local_part text;
  domain_part text;
BEGIN
  IF p_email IS NULL THEN
    RETURN NULL;
  END IF;
  e := lower(trim(p_email));
  IF e = '' OR position('@' IN e) < 1 THEN
    RETURN e;
  END IF;
  local_part := split_part(e, '@', 1);
  domain_part := split_part(e, '@', 2);
  domain_part := CASE lower(domain_part)
    WHEN 'gmail.col' THEN 'gmail.com'
    WHEN 'gmail.con' THEN 'gmail.com'
    WHEN 'gmail.coom' THEN 'gmail.com'
    WHEN 'gmai.com' THEN 'gmail.com'
    WHEN 'gamil.com' THEN 'gmail.com'
    WHEN 'gmial.com' THEN 'gmail.com'
    WHEN 'gnail.com' THEN 'gmail.com'
    WHEN 'hotmai.com' THEN 'hotmail.com'
    WHEN 'hotnail.com' THEN 'hotmail.com'
    WHEN 'yahooo.com' THEN 'yahoo.com'
    WHEN 'yaho.com' THEN 'yahoo.com'
    WHEN 'outlok.com' THEN 'outlook.com'
    WHEN 'iclod.com' THEN 'icloud.com'
    ELSE lower(domain_part)
  END;
  RETURN local_part || '@' || domain_part;
END;
$$;

COMMENT ON FUNCTION public.admin_normalize_email_for_recovery_match(text)
IS 'Lowercases email and maps common domain typos (e.g. gmail.col) for matching failed vs paid checkouts.';

CREATE OR REPLACE FUNCTION public.admin_email_is_valid_for_recovery(p_email text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT
    p_email IS NOT NULL
    AND length(trim(p_email)) > 0
    AND trim(p_email) ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND trim(lower(p_email)) !~ '@gmail\.col$'
    AND trim(lower(p_email)) !~ '@gmai\.com$'
    AND trim(lower(p_email)) !~ '@gamil\.'
    AND trim(lower(p_email)) !~ '@gmial\.'
    AND trim(lower(p_email)) !~ '@gnail\.'
    AND trim(lower(p_email)) !~ '@hotnail\.'
    AND trim(lower(p_email)) !~ '@yahooo\.'
    AND trim(lower(p_email)) !~ '@yaho\.com$'
    AND trim(lower(p_email)) !~ '@outlok\.'
    AND trim(lower(p_email)) !~ '@iclod\.';
$$;

COMMENT ON FUNCTION public.admin_email_is_valid_for_recovery(text)
IS 'FALSE for malformed or common typo domains where recovery email should not be offered.';

CREATE OR REPLACE FUNCTION public.admin_purchase_has_paid_counterpart(
  p_purchase_id uuid,
  p_event_id text,
  p_customer_id uuid,
  p_customer_email text
)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.purchases p2
    INNER JOIN public.customers c2 ON p2.customer_id = c2.id
    WHERE COALESCE(TRIM(p_event_id), '') <> ''
      AND p2.event_id = p_event_id
      AND p2.status = 'paid'
      AND p2.id <> p_purchase_id
      AND (
        p2.customer_id = p_customer_id
        OR (
          nullif(trim(COALESCE(c2.email, '')), '') IS NOT NULL
          AND nullif(trim(COALESCE(p_customer_email, '')), '') IS NOT NULL
          AND public.admin_normalize_email_for_recovery_match(c2.email)
            = public.admin_normalize_email_for_recovery_match(p_customer_email)
        )
      )
  );
$$;

COMMENT ON FUNCTION public.admin_purchase_has_paid_counterpart(uuid, text, uuid, text)
IS 'TRUE if a different paid purchase exists for the same event for this customer or same normalized email.';

-- ---------------------------------------------------------------------------
-- Admin purchase listing & search
-- ---------------------------------------------------------------------------
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
    recovery_email_eligible BOOLEAN
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
        ) AS recovery_email_eligible
    FROM public.purchases p
    INNER JOIN public.customers c ON p.customer_id = c.id
    ORDER BY p.created_at DESC
    LIMIT 100;
END;
$$;

COMMENT ON FUNCTION public.get_admin_purchases()
IS 'Admin purchases list; admission_total expands bundles; abandonment and recovery flags for failed checkouts.';

CREATE OR REPLACE FUNCTION public.search_admin_purchases(p_search_query TEXT)
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
    recovery_email_eligible BOOLEAN
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
        ) AS recovery_email_eligible
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

COMMENT ON FUNCTION public.search_admin_purchases(TEXT)
IS 'Search admin purchases by customer, event, purchase id, or ticket id; includes admission and recovery flags.';

CREATE OR REPLACE FUNCTION public.get_admin_events_list(
    p_status_filter TEXT DEFAULT 'paid'
)
RETURNS TABLE(
    event_id TEXT,
    event_title TEXT,
    event_date_text TEXT,
    total_purchases BIGINT,
    total_tickets BIGINT,
    scanned_tickets BIGINT,
    last_purchase_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        event_stats.event_id,
        event_stats.event_title,
        event_stats.event_date_text,
        event_stats.total_purchases,
        event_stats.total_tickets,
        event_stats.individual_scanned + event_stats.legacy_scanned AS scanned_tickets,
        event_stats.last_purchase_date
    FROM (
        SELECT
            p.event_id,
            MAX(p.event_title) AS event_title,
            MAX(p.event_date_text) AS event_date_text,
            COUNT(DISTINCT p.id) AS total_purchases,
            SUM(p.quantity) AS total_tickets,
            MAX(p.created_at) AS last_purchase_date,
            COUNT(CASE WHEN it.is_used = TRUE THEN 1 END) AS individual_scanned,
            COUNT(CASE WHEN p.is_used = TRUE AND it.purchase_id IS NULL THEN 1 END) AS legacy_scanned
        FROM public.purchases p
        LEFT JOIN public.individual_tickets it ON it.purchase_id = p.id
        WHERE
            p.event_id IS NOT NULL
            AND TRIM(p.event_id) != ''
            AND (
                CASE
                    WHEN p_status_filter = 'paid' THEN p.status = 'paid'
                    WHEN p_status_filter = 'pending' THEN p.status = 'pending_payment'
                    WHEN p_status_filter = 'failed' THEN p.status = 'payment_failed'
                    WHEN p_status_filter = 'all' THEN TRUE
                    ELSE p.status = 'paid'
                END
            )
        GROUP BY p.event_id
    ) event_stats
    ORDER BY event_stats.last_purchase_date DESC;
END;
$$;

COMMENT ON FUNCTION public.get_admin_events_list(TEXT)
IS 'Events with purchase statistics for admin filtering (paid/pending/failed/all).';

CREATE OR REPLACE FUNCTION public.get_admin_purchases_by_event(p_event_id TEXT)
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
    recovery_email_eligible BOOLEAN
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
        ) AS recovery_email_eligible
    FROM public.purchases p
    INNER JOIN public.customers c ON p.customer_id = c.id
    WHERE p.event_id = p_event_id
    ORDER BY p.created_at DESC;
END;
$$;

COMMENT ON FUNCTION public.get_admin_purchases_by_event(TEXT)
IS 'Purchases for one event with admission totals and abandonment/recovery flags.';

-- ---------------------------------------------------------------------------
-- Resend, export, scan logs
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_customer_for_resend(
    p_customer_id UUID,
    p_new_email TEXT,
    p_new_name TEXT,
    p_new_phone TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    existing_customer_id UUID;
    current_customer_record RECORD;
BEGIN
    SELECT id, name, email, phone INTO current_customer_record
    FROM public.customers
    WHERE id = p_customer_id;

    IF NOT FOUND THEN
        RAISE WARNING 'Customer ID % not found during update_customer_for_resend', p_customer_id;
        RETURN;
    END IF;

    SELECT id INTO existing_customer_id
    FROM public.customers
    WHERE email = p_new_email AND id != p_customer_id;

    IF FOUND THEN
        IF LOWER(TRIM(COALESCE(current_customer_record.name, ''))) = LOWER(TRIM(COALESCE(p_new_name, '')))
           AND (
               (current_customer_record.phone IS NULL AND (p_new_phone IS NULL OR p_new_phone = '')) OR
               (p_new_phone IS NOT NULL AND p_new_phone != '' AND current_customer_record.phone = p_new_phone)
           ) THEN
            UPDATE public.purchases
            SET customer_id = existing_customer_id, updated_at = NOW()
            WHERE customer_id = p_customer_id;

            DELETE FROM public.customers WHERE id = p_customer_id;

            RAISE NOTICE 'Merged duplicate customer % into existing customer %', p_customer_id, existing_customer_id;
        ELSE
            RAISE EXCEPTION 'Email % already exists for a different customer. Manual review required.', p_new_email;
        END IF;
    ELSE
        UPDATE public.customers
        SET
            email = p_new_email,
            name = p_new_name,
            phone = COALESCE(NULLIF(p_new_phone, ''), phone),
            updated_at = NOW()
        WHERE id = p_customer_id;
    END IF;
END;
$$;

COMMENT ON FUNCTION public.update_customer_for_resend(UUID, TEXT, TEXT, TEXT)
IS 'Updates customer info when resending emails; merges duplicates with matching details.';

CREATE OR REPLACE FUNCTION public.reset_email_dispatch_status(p_purchase_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.purchases
    SET
        email_dispatch_status = 'PENDING_DISPATCH',
        email_dispatch_error = NULL,
        updated_at = NOW()
    WHERE id = p_purchase_id;

    IF NOT FOUND THEN
        RAISE WARNING 'Purchase ID % not found during reset_email_dispatch_status', p_purchase_id;
    END IF;
END;
$$;

COMMENT ON FUNCTION public.reset_email_dispatch_status(UUID)
IS 'Resets email dispatch status to allow resending ticket emails';

CREATE OR REPLACE FUNCTION public.export_admin_purchases_csv()
RETURNS TABLE(
    purchase_id TEXT,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    event_title TEXT,
    ticket_name TEXT,
    quantity TEXT,
    total_amount TEXT,
    currency_code TEXT,
    status TEXT,
    email_dispatch_status TEXT,
    email_sent_at TEXT,
    ticket_scanned_at TEXT,
    purchase_date TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id::TEXT AS purchase_id,
        c.name AS customer_name,
        c.email AS customer_email,
        COALESCE(c.phone, '') AS customer_phone,
        p.event_title,
        p.ticket_name,
        p.quantity::TEXT,
        p.total_amount::TEXT,
        p.currency_code,
        p.status,
        p.email_dispatch_status,
        COALESCE(p.pdf_ticket_sent_at::TEXT, '') AS email_sent_at,
        COALESCE(p.used_at::TEXT, '') AS ticket_scanned_at,
        p.created_at::TEXT AS purchase_date
    FROM public.purchases p
    INNER JOIN public.customers c ON p.customer_id = c.id
    ORDER BY p.created_at DESC;
END;
$$;

COMMENT ON FUNCTION public.export_admin_purchases_csv()
IS 'Exports all purchases data in CSV-friendly format for admin download';

CREATE OR REPLACE FUNCTION public.get_admin_verification_logs(
    p_event_id TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    ticket_identifier TEXT,
    event_id TEXT,
    event_title TEXT,
    customer_name TEXT,
    customer_email TEXT,
    attempt_timestamp TIMESTAMPTZ,
    success BOOLEAN,
    error_code TEXT,
    error_message TEXT,
    scanner_email TEXT
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
        COALESCE(c.name, 'Unknown Customer') AS customer_name,
        COALESCE(c.email, '') AS customer_email,
        va.attempt_timestamp,
        va.success,
        va.error_code,
        va.error_message,
        va.scanner_email
    FROM public.verification_attempts va
    LEFT JOIN public.individual_tickets it ON va.ticket_identifier = it.ticket_identifier
    LEFT JOIN public.purchases p ON (
        (it.purchase_id IS NOT NULL AND p.id = it.purchase_id)
        OR (it.purchase_id IS NULL AND va.ticket_identifier = p.unique_ticket_identifier)
    )
    LEFT JOIN public.customers c ON p.customer_id = c.id
    WHERE (p_event_id IS NULL OR va.event_id = p_event_id)
    ORDER BY va.attempt_timestamp DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

COMMENT ON FUNCTION public.get_admin_verification_logs(TEXT, INTEGER, INTEGER)
IS 'Paginated verification logs for admin review with customer data for individual and legacy tickets.';

-- ---------------------------------------------------------------------------
-- Guest / comp tickets
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.issue_guest_ticket(
    p_event_id TEXT,
    p_event_title TEXT,
    p_event_date_text TEXT,
    p_event_time_text TEXT,
    p_event_venue_name TEXT,
    p_guest_name TEXT,
    p_guest_email TEXT,
    p_guest_phone TEXT,
    p_ticket_type_name TEXT DEFAULT 'Guest List',
    p_quantity INTEGER DEFAULT 1,
    p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(
    purchase_id UUID,
    customer_id UUID,
    ticket_identifiers TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_customer_id UUID;
    v_purchase_id UUID;
    v_ticket_id TEXT;
    v_ticket_identifiers TEXT[] := ARRAY[]::TEXT[];
    i INTEGER;
BEGIN
    SELECT id INTO v_customer_id
    FROM public.customers
    WHERE email = p_guest_email;

    IF v_customer_id IS NULL THEN
        INSERT INTO public.customers (name, email, phone)
        VALUES (p_guest_name, p_guest_email, p_guest_phone)
        RETURNING id INTO v_customer_id;
    ELSE
        UPDATE public.customers
        SET name = p_guest_name,
            phone = COALESCE(p_guest_phone, phone),
            updated_at = NOW()
        WHERE id = v_customer_id;
    END IF;

    v_ticket_id := 'GUEST-' || substring(md5(random()::text || clock_timestamp()::text) FROM 1 FOR 16);

    INSERT INTO public.purchases (
        customer_id,
        event_id,
        event_title,
        event_date_text,
        event_time_text,
        event_venue_name,
        ticket_type_id,
        ticket_name,
        quantity,
        price_per_ticket,
        total_amount,
        currency_code,
        status,
        unique_ticket_identifier,
        email_dispatch_status,
        payment_method,
        notes
    ) VALUES (
        v_customer_id,
        p_event_id,
        p_event_title,
        p_event_date_text,
        p_event_time_text,
        p_event_venue_name,
        'guest-comp',
        p_ticket_type_name,
        p_quantity,
        0.00,
        0.00,
        'XOF',
        'paid',
        v_ticket_id,
        'NOT_INITIATED',
        'complimentary',
        p_notes
    ) RETURNING id INTO v_purchase_id;

    FOR i IN 1..p_quantity LOOP
        DECLARE
            v_individual_ticket_id TEXT;
        BEGIN
            v_individual_ticket_id := v_ticket_id || '-' || i::TEXT;

            INSERT INTO public.individual_tickets (
                purchase_id,
                ticket_identifier,
                status
            ) VALUES (
                v_purchase_id,
                v_individual_ticket_id,
                'valid'
            );

            v_ticket_identifiers := array_append(v_ticket_identifiers, v_individual_ticket_id);
        END;
    END LOOP;

    UPDATE public.purchases
    SET individual_tickets_generated = TRUE
    WHERE id = v_purchase_id;

    RETURN QUERY SELECT v_purchase_id, v_customer_id, v_ticket_identifiers;
END;
$$;

COMMENT ON FUNCTION public.issue_guest_ticket(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT)
IS 'Creates a complimentary ticket for VIPs, staff, or personal invitations';

CREATE OR REPLACE FUNCTION public.get_event_guest_list(p_event_id TEXT)
RETURNS TABLE(
    purchase_id UUID,
    guest_name TEXT,
    guest_email TEXT,
    guest_phone TEXT,
    ticket_count INTEGER,
    is_used BOOLEAN,
    used_at TIMESTAMPTZ,
    ticket_identifier TEXT,
    created_at TIMESTAMPTZ,
    notes TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
#variable_conflict use_column
BEGIN
    RETURN QUERY
    SELECT
        p.id AS purchase_id,
        c.name AS guest_name,
        c.email AS guest_email,
        c.phone AS guest_phone,
        p.quantity AS ticket_count,
        p.is_used,
        p.used_at,
        p.unique_ticket_identifier AS ticket_identifier,
        p.created_at,
        p.notes
    FROM public.purchases p
    INNER JOIN public.customers c ON p.customer_id = c.id
    WHERE p.event_id = p_event_id
    AND p.payment_method = 'complimentary'
    ORDER BY p.created_at DESC;
END;
$$;

COMMENT ON FUNCTION public.get_event_guest_list(TEXT)
IS 'Returns all complimentary tickets issued for an event';

-- ---------------------------------------------------------------------------
-- Grants: service_role, authenticated, anon (PIN-gated admin in browser)
-- ---------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.get_admin_purchases() TO service_role;
GRANT EXECUTE ON FUNCTION public.search_admin_purchases(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_admin_events_list(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_admin_purchases_by_event(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_customer_for_resend(UUID, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.reset_email_dispatch_status(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.export_admin_purchases_csv() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_admin_verification_logs(TEXT, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.issue_guest_ticket(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_event_guest_list(TEXT) TO service_role;

GRANT EXECUTE ON FUNCTION public.get_admin_events_list(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_purchases_by_event(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_verification_logs(TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.issue_guest_ticket(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_event_guest_list(TEXT) TO authenticated;

GRANT EXECUTE ON FUNCTION public.verify_staff_pin(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_admin_purchases() TO anon;
GRANT EXECUTE ON FUNCTION public.search_admin_purchases(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.update_customer_for_resend(UUID, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.reset_email_dispatch_status(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_admin_events_list(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_admin_purchases_by_event(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.issue_guest_ticket(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_admin_verification_logs(TEXT, INTEGER, INTEGER) TO anon;

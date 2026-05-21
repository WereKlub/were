-- Core schema: customers, purchases, verification config, individual tickets, verification logs

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    whatsapp TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT customer_email_valid CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

COMMENT ON TABLE public.customers IS 'Ticket and merch buyers; email is the stable identifier across sessions.';
COMMENT ON COLUMN public.customers.email IS 'Email is used to identify and potentially link anonymous sessions if the same email is used multiple times.';
COMMENT ON COLUMN public.customers.whatsapp IS 'WhatsApp number for customer communication.';

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service_role full access on customers"
ON public.customers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE INDEX idx_purchases_user_email ON public.customers(email);

-- ---------------------------------------------------------------------------
-- purchases
-- ---------------------------------------------------------------------------
CREATE TABLE public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Event (nullable for merchandise)
    event_id TEXT,
    event_title TEXT,
    event_date_text TEXT,
    event_time_text TEXT,
    event_venue_name TEXT,

    -- Ticket type (nullable for merchandise)
    ticket_type_id TEXT,
    ticket_name TEXT,

    -- Merchandise
    merchandise_id TEXT,
    product_id TEXT,
    product_title TEXT,

    -- Order
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_per_ticket NUMERIC NOT NULL CHECK (price_per_ticket >= 0),
    total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
    currency_code TEXT DEFAULT 'XOF' NOT NULL,
    is_bundle BOOLEAN DEFAULT FALSE,
    tickets_per_bundle INTEGER DEFAULT 1,

    -- Payment processor (Lomi)
    lomi_session_id TEXT UNIQUE,
    lomi_checkout_url TEXT,
    status TEXT DEFAULT 'pending_payment' NOT NULL,
    payment_processor_details JSONB,
    payment_method TEXT DEFAULT 'stripe',
    notes TEXT,

    -- Email dispatch
    email_dispatch_status TEXT DEFAULT 'NOT_INITIATED' NOT NULL,
    email_dispatch_attempts INTEGER DEFAULT 0 NOT NULL,
    email_last_dispatch_attempt_at TIMESTAMPTZ,
    email_dispatch_error TEXT,
    unique_ticket_identifier TEXT,
    webhook_processing_log JSONB DEFAULT '{}'::jsonb,
    pdf_ticket_generated BOOLEAN DEFAULT FALSE,
    pdf_ticket_sent_at TIMESTAMPTZ,

    -- Entry / verification (legacy purchase-level + aggregate mirror for individual tickets)
    is_used BOOLEAN DEFAULT FALSE NOT NULL,
    used_at TIMESTAMPTZ,
    verified_by TEXT,
    use_count INTEGER DEFAULT 0 NOT NULL,
    individual_tickets_generated BOOLEAN DEFAULT FALSE NOT NULL
);

COMMENT ON COLUMN public.purchases.customer_id IS 'Links to the customer who made the purchase.';
COMMENT ON COLUMN public.purchases.event_id IS 'Identifier for the event (e.g., Sanity document ID or slug). Null for merchandise.';
COMMENT ON COLUMN public.purchases.event_date_text IS 'Human-readable event date for display in emails/tickets.';
COMMENT ON COLUMN public.purchases.event_time_text IS 'Human-readable event time for display in emails/tickets.';
COMMENT ON COLUMN public.purchases.event_venue_name IS 'Event venue name for display in emails/tickets.';
COMMENT ON COLUMN public.purchases.ticket_type_id IS 'Identifier for the chosen ticket type (e.g., Sanity ticket type _key).';
COMMENT ON COLUMN public.purchases.merchandise_id IS 'Identifier for merchandise item (for cart-based purchases).';
COMMENT ON COLUMN public.purchases.product_id IS 'Product ID from external system (e.g., Sanity).';
COMMENT ON COLUMN public.purchases.product_title IS 'Title/name of the merchandise product.';
COMMENT ON COLUMN public.purchases.is_bundle IS 'Whether this purchase is for a bundle (true) or individual tickets (false).';
COMMENT ON COLUMN public.purchases.tickets_per_bundle IS 'Number of tickets included per bundle unit. For regular tickets, this is 1.';
COMMENT ON COLUMN public.purchases.lomi_session_id IS 'Unique ID from Lomi for the checkout session. Used to reconcile webhook events.';
COMMENT ON COLUMN public.purchases.status IS 'Tracks the state of the purchase and ticketing process.';
COMMENT ON COLUMN public.purchases.email_dispatch_status IS 'Tracks the status of the ticket email dispatch process.';
COMMENT ON COLUMN public.purchases.email_dispatch_attempts IS 'Number of times an attempt was made to dispatch the email.';
COMMENT ON COLUMN public.purchases.email_last_dispatch_attempt_at IS 'Timestamp of the last email dispatch attempt.';
COMMENT ON COLUMN public.purchases.email_dispatch_error IS 'Stores any error message from the last failed dispatch attempt.';
COMMENT ON COLUMN public.purchases.unique_ticket_identifier IS 'Legacy single QR identifier; individual_tickets used for multi-admission orders.';
COMMENT ON COLUMN public.purchases.updated_at IS 'Timestamp of when the purchase record was last updated.';
COMMENT ON COLUMN public.purchases.is_used IS 'Whether the ticket has been used for entry (legacy / aggregate).';
COMMENT ON COLUMN public.purchases.used_at IS 'Timestamp when the ticket was used for entry.';
COMMENT ON COLUMN public.purchases.verified_by IS 'Staff member or system that verified the ticket.';
COMMENT ON COLUMN public.purchases.use_count IS 'For legacy tickets, tracks how many times a multi-person ticket has been scanned.';
COMMENT ON COLUMN public.purchases.individual_tickets_generated IS 'Indicates if individual tickets have been generated for this purchase.';

CREATE INDEX idx_purchases_customer_id ON public.purchases(customer_id);
CREATE INDEX idx_purchases_event_id ON public.purchases(event_id);
CREATE INDEX idx_purchases_status ON public.purchases(status);
CREATE INDEX idx_purchases_lomi_session_id ON public.purchases(lomi_session_id);
CREATE INDEX idx_purchases_email_dispatch_status ON public.purchases(email_dispatch_status);
CREATE INDEX idx_purchases_unique_ticket_identifier ON public.purchases(unique_ticket_identifier);
CREATE INDEX idx_purchases_is_used ON public.purchases(is_used);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service_role full access on purchases"
ON public.purchases
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- individual_tickets
-- ---------------------------------------------------------------------------
CREATE TABLE public.individual_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
    ticket_identifier TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL,
    is_used BOOLEAN DEFAULT FALSE NOT NULL,
    used_at TIMESTAMPTZ,
    verified_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.individual_tickets IS 'Per-admission tickets for multi-ticket purchases; each row has a unique QR identifier.';
COMMENT ON COLUMN public.individual_tickets.status IS 'Status of the individual ticket (e.g., active, used, cancelled, valid).';

CREATE INDEX idx_individual_tickets_purchase_id ON public.individual_tickets(purchase_id);
CREATE INDEX idx_individual_tickets_ticket_identifier ON public.individual_tickets(ticket_identifier);

ALTER TABLE public.individual_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service_role full access on individual_tickets"
ON public.individual_tickets
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated read on individual_tickets"
ON public.individual_tickets
FOR SELECT
TO authenticated
USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.individual_tickets TO service_role;
GRANT SELECT ON public.individual_tickets TO authenticated;

-- ---------------------------------------------------------------------------
-- verification_config
-- ---------------------------------------------------------------------------
CREATE TABLE public.verification_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key TEXT UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.verification_config IS 'Configuration settings for ticket verification system';

ALTER TABLE public.verification_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service_role full access on verification_config"
ON public.verification_config
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated read on verification_config"
ON public.verification_config
FOR SELECT
TO authenticated
USING (true);

GRANT SELECT ON public.verification_config TO service_role;
GRANT SELECT ON public.verification_config TO authenticated;

INSERT INTO public.verification_config (config_key, config_value)
VALUES ('staff_verification_pin', '2603')
ON CONFLICT (config_key) DO UPDATE SET
    config_value = EXCLUDED.config_value,
    updated_at = NOW();

-- ---------------------------------------------------------------------------
-- verification_attempts
-- ---------------------------------------------------------------------------
CREATE TABLE public.verification_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_identifier TEXT NOT NULL,
    event_id TEXT,
    event_title TEXT,
    attempt_timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    success BOOLEAN NOT NULL,
    error_code TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    scanner_email TEXT
);

COMMENT ON TABLE public.verification_attempts IS 'Logs all ticket verification attempts for troubleshooting. Retains last 30 days.';

CREATE INDEX idx_verification_attempts_timestamp ON public.verification_attempts(attempt_timestamp DESC);
CREATE INDEX idx_verification_attempts_event_id ON public.verification_attempts(event_id);
CREATE INDEX idx_verification_attempts_success ON public.verification_attempts(success);
CREATE INDEX idx_verification_attempts_ticket ON public.verification_attempts(ticket_identifier);

ALTER TABLE public.verification_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service_role full access on verification_attempts"
ON public.verification_attempts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated read on verification_attempts"
ON public.verification_attempts
FOR SELECT
TO authenticated
USING (true);

GRANT SELECT, INSERT ON public.verification_attempts TO service_role;
GRANT SELECT ON public.verification_attempts TO authenticated;

-- ---------------------------------------------------------------------------
-- shared triggers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.trigger_set_timestamp() IS 'Trigger function to update updated_at timestamp';

CREATE TRIGGER set_customer_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER set_purchase_updated_at
BEFORE UPDATE ON public.purchases
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- ---------------------------------------------------------------------------
-- views
-- ---------------------------------------------------------------------------
CREATE VIEW public.ticket_verification_view
WITH (security_invoker = on)
AS
SELECT
    p.id AS purchase_id,
    p.unique_ticket_identifier,
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
    p.is_used,
    p.used_at,
    p.verified_by,
    p.created_at
FROM public.purchases p
INNER JOIN public.customers c ON p.customer_id = c.id
WHERE p.status = 'paid';

COMMENT ON VIEW public.ticket_verification_view IS 'View for ticket verification queries without security definer';

GRANT SELECT ON public.ticket_verification_view TO service_role;
GRANT SELECT ON public.ticket_verification_view TO authenticated;

CREATE VIEW public.payment_status_summary
WITH (security_invoker = on)
AS
SELECT
    status,
    COUNT(*) AS count,
    MIN(created_at) AS oldest_payment,
    MAX(created_at) AS newest_payment
FROM public.purchases
GROUP BY status
ORDER BY count DESC;

COMMENT ON VIEW public.payment_status_summary IS 'Provides summary of payment statuses for monitoring and admin purposes.';

GRANT SELECT ON public.payment_status_summary TO service_role;

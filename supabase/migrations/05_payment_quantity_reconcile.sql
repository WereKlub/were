-- When a Lomi payment lands, set ticket quantity from the amount paid
-- so the tickets issued match the money collected.
-- NULL amount still keeps the existing line total (cart checkouts).

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
    v_price NUMERIC;
    v_qty INTEGER;
    v_lomi_qty INTEGER;
    v_implied_qty INTEGER;
    v_new_qty INTEGER;
    v_qty_raw TEXT;
BEGIN
    v_checkout_session := NULLIF(p_lomi_checkout_session_id, '');

    SELECT status, price_per_ticket, quantity
    INTO v_current_status, v_price, v_qty
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

    v_new_qty := v_qty;

    IF p_payment_status = 'paid'
       AND COALESCE(v_price, 0) > 0
       AND COALESCE(p_amount_paid, 0) > 0 THEN
        IF (p_amount_paid % v_price) = 0 THEN
            v_implied_qty := (p_amount_paid / v_price)::INTEGER;
            IF v_implied_qty < 1 THEN
                v_implied_qty := NULL;
            END IF;
        END IF;

        v_qty_raw := NULLIF(TRIM(p_lomi_event_payload #>> '{data,quantity}'), '');
        IF v_qty_raw IS NOT NULL THEN
            BEGIN
                v_lomi_qty := FLOOR(v_qty_raw::NUMERIC)::INTEGER;
                IF v_lomi_qty < 1 THEN
                    v_lomi_qty := NULL;
                END IF;
            EXCEPTION WHEN OTHERS THEN
                v_lomi_qty := NULL;
            END;
        END IF;

        IF v_lomi_qty IS NOT NULL AND v_implied_qty IS NOT NULL AND v_lomi_qty = v_implied_qty THEN
            v_new_qty := v_lomi_qty;
        ELSIF v_implied_qty IS NOT NULL THEN
            v_new_qty := v_implied_qty;
        ELSIF v_lomi_qty IS NOT NULL AND (v_lomi_qty::NUMERIC * v_price) = p_amount_paid THEN
            v_new_qty := v_lomi_qty;
        ELSE
            RAISE NOTICE 'Purchase % paid amount % does not reconcile with unit price % (recorded qty %); leaving quantity unchanged',
                p_purchase_id, p_amount_paid, v_price, v_qty;
        END IF;
    END IF;

    UPDATE public.purchases
    SET
        status = p_payment_status,
        lomi_session_id = COALESCE(lomi_session_id, v_checkout_session),
        quantity = CASE
            WHEN p_amount_paid IS NULL THEN quantity
            ELSE v_new_qty
        END,
        total_amount = COALESCE(p_amount_paid, total_amount),
        currency_code = COALESCE(p_currency_paid, currency_code),
        payment_processor_details = COALESCE(payment_processor_details, '{}'::jsonb)
            || jsonb_build_object('lomi_event', p_lomi_event_payload),
        updated_at = NOW()
    WHERE id = p_purchase_id;
END;
$$;

COMMENT ON FUNCTION public.record_lomi_payment(UUID, TEXT, TEXT, TEXT, JSONB, NUMERIC, TEXT)
IS 'Records Lomi payment. Pass NULL amount to keep line-item totals. When paid amount is a clean multiple of unit price, updates quantity so tickets match money collected.';

GRANT EXECUTE ON FUNCTION public.record_lomi_payment(UUID, TEXT, TEXT, TEXT, JSONB, NUMERIC, TEXT) TO service_role;

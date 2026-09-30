import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { Buffer } from "node:buffer";

function parsePurchaseIds(metadata) {
  if (!metadata) return [];
  const plural = metadata.internal_purchase_ids;
  if (plural) {
    return String(plural)
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  }
  const single = metadata.internal_purchase_id;
  return single ? [String(single).trim()] : [];
}

function isMerchCheckout(metadata) {
  if (!metadata) return false;
  return (
    metadata.app_source === "wereklub_merch_app" ||
    metadata.is_cart_checkout === true ||
    metadata.is_cart_checkout === "true" ||
    Boolean(metadata.internal_purchase_ids)
  );
}

async function isWebhookAlreadyProcessed(supabase, webhookEventId, purchaseId) {
  try {
    const { data, error } = await supabase.rpc(
      "check_webhook_already_processed",
      {
        p_webhook_event_id: webhookEventId,
        p_purchase_id: purchaseId ?? null,
      },
    );

    if (error) {
      console.warn("Error checking webhook processing status via RPC:", error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.warn("Error checking webhook processing status:", error);
    return false;
  }
}

async function markWebhookAsProcessed(supabase, webhookEventId, purchaseIds) {
  for (const purchaseId of purchaseIds) {
    try {
      const { error } = await supabase.rpc("update_purchase_webhook_metadata", {
        p_purchase_id: purchaseId,
        p_webhook_event_id: webhookEventId,
      });

      if (error) {
        console.warn(
          `Error marking webhook as processed for ${purchaseId}:`,
          error,
        );
      }
    } catch (error) {
      console.warn(
        `Error marking webhook as processed for ${purchaseId}:`,
        error,
      );
    }
  }
}

async function verifyLomiWebhook(rawBody, signatureHeader, webhookSecret) {
  if (!signatureHeader) {
    throw new Error("Missing Lomi signature header (X-Lomi-Signature).");
  }
  if (!webhookSecret) {
    console.error("LOMI_WEBHOOK_SECRET is not set. Cannot verify webhook.");
    throw new Error("Webhook secret not configured internally.");
  }
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");
  const sigBuffer = Buffer.from(signatureHeader);
  const expectedSigBuffer = Buffer.from(expectedSignature);
  if (
    sigBuffer.length !== expectedSigBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)
  ) {
    throw new Error("Lomi webhook signature mismatch.");
  }
  return JSON.parse(rawBody.toString("utf8"));
}

async function recordPaymentForPurchase(
  supabase,
  purchaseId,
  {
    lomiTransactionId,
    lomiCheckoutSessionId,
    paymentStatusForDb,
    eventPayload,
    amount,
    currency,
    updateAmount,
  },
) {
  const { error: rpcError } = await supabase.rpc("record_lomi_payment", {
    p_purchase_id: purchaseId,
    p_lomi_payment_id: lomiTransactionId,
    p_lomi_checkout_session_id: lomiCheckoutSessionId,
    p_payment_status: paymentStatusForDb,
    p_lomi_event_payload: eventPayload,
    p_amount_paid: updateAmount ? amount : null,
    p_currency_paid: updateAmount ? currency : null,
  });

  if (rpcError) {
    console.error(
      `Webhook Error: record_lomi_payment failed for ${purchaseId}:`,
      rpcError,
    );
    if (paymentStatusForDb === "paid") {
      const { data: purchaseStatus } = await supabase.rpc(
        "get_purchase_status",
        {
          p_purchase_id: purchaseId,
        },
      );
      if (purchaseStatus === "paid") {
        console.warn(
          `Purchase ${purchaseId} already paid, treating RPC error as idempotent success`,
        );
        return { ok: true, alreadyPaid: true };
      }
    }
    return { ok: false, error: rpcError };
  }

  return { ok: true, alreadyPaid: false };
}

async function dispatchTicketEmail(
  supabase,
  supabaseUrl,
  supabaseServiceKey,
  purchaseId,
) {
  const { error: prepError } = await supabase.rpc(
    "prepare_purchase_for_email_dispatch",
    { p_purchase_id: purchaseId },
  );

  if (prepError) {
    console.error(
      `Failed to prepare purchase ${purchaseId} for email dispatch:`,
      prepError,
    );
    return;
  }

  try {
    const functionUrl = `${supabaseUrl}/functions/v1/send-ticket-email`;
    const emailResponse = await fetch(functionUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ purchase_id: purchaseId }),
    });

    const emailResult = await emailResponse.text();

    if (!emailResponse.ok) {
      console.error(
        `Error triggering send-ticket-email for ${purchaseId}:`,
        emailResponse.status,
        emailResult,
      );
      await supabase.rpc("update_email_dispatch_status", {
        p_purchase_id: purchaseId,
        p_email_dispatch_status: "DISPATCH_FAILED",
        p_email_dispatch_error: `HTTP call failed: ${emailResponse.status} - ${emailResult}`,
      });
    } else {
      console.log(
        `Successfully triggered send-ticket-email for ${purchaseId}:`,
        emailResult,
      );
    }
  } catch (functionError) {
    console.error(
      `Exception calling send-ticket-email for ${purchaseId}:`,
      functionError,
    );
    try {
      await supabase.rpc("update_email_dispatch_status", {
        p_purchase_id: purchaseId,
        p_email_dispatch_status: "DISPATCH_FAILED",
        p_email_dispatch_error: `Function invocation error: ${functionError.message}`,
      });
    } catch (updateError) {
      console.error("Failed to update email dispatch status:", updateError);
    }
  }
}

async function dispatchMerchReceiptEmail(
  supabaseUrl,
  supabaseServiceKey,
  purchaseIds,
) {
  try {
    const functionUrl = `${supabaseUrl}/functions/v1/send-merch-receipt-email`;
    const emailResponse = await fetch(functionUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ purchase_ids: purchaseIds }),
    });

    const emailResult = await emailResponse.text();

    if (!emailResponse.ok) {
      console.error(
        "Error triggering send-merch-receipt-email:",
        emailResponse.status,
        emailResult,
      );
    } else {
      console.log(
        "Successfully triggered send-merch-receipt-email:",
        emailResult,
      );
    }
  } catch (functionError) {
    console.error("Exception calling send-merch-receipt-email:", functionError);
  }
}

export async function POST(request) {
  console.log("Lomi webhook: received at", new Date().toISOString());

  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const lomiWebhookSecret = process.env.LOMI_WEBHOOK_SECRET;
  const missingEnv = [
    !supabaseUrl && "SUPABASE_URL",
    !supabaseServiceKey && "SUPABASE_SERVICE_ROLE_KEY",
    !lomiWebhookSecret && "LOMI_WEBHOOK_SECRET",
  ].filter(Boolean);

  if (missingEnv.length > 0) {
    console.error(
      "Lomi webhook: missing environment variables:",
      missingEnv.join(", "),
    );
    return new Response(
      JSON.stringify({ error: "Missing required environment variables" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let rawBody;
  try {
    rawBody = await request.text();
  } catch (bodyError) {
    console.error("Lomi webhook: error reading body:", bodyError);
    return new Response(
      JSON.stringify({ error: "Failed to read request body" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const signature = request.headers.get("x-lomi-signature");
  let eventPayload;

  try {
    eventPayload = await verifyLomiWebhook(
      rawBody,
      signature,
      lomiWebhookSecret,
    );
  } catch (err) {
    console.error("Lomi webhook: verification failed:", err.message);
    return new Response(
      JSON.stringify({ error: `Webhook verification failed: ${err.message}` }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const lomiEventType = eventPayload?.event;
    const eventData = eventPayload?.data;

    if (!lomiEventType || !eventData) {
      return new Response(
        JSON.stringify({ error: "Event type or data missing." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const metadata = eventData.metadata || {};
    const purchaseIds = parsePurchaseIds(metadata);
    const merchCheckout = isMerchCheckout(metadata);

    if (purchaseIds.length === 0) {
      console.error(
        "Lomi webhook: missing purchase id(s) in metadata.",
        metadata,
      );
      return new Response(
        JSON.stringify({
          error:
            "Missing internal_purchase_id or internal_purchase_ids in metadata.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const lomiTransactionId = eventData.transaction_id || eventData.id;
    const lomiCheckoutSessionId = String(
      eventData.checkout_session_id ||
        eventData.metadata?.checkout_session_id ||
        eventData.metadata?.linkId ||
        eventData.id ||
        "",
    );

    const amount = parseFloat(
      eventData.gross_amount || eventData.amount || eventData.net_amount || "0",
    );
    const currency = eventData.currency_code || eventData.currency || "XOF";

    const primaryPurchaseId = purchaseIds[0];
    const webhookEventId = `${lomiEventType}:${lomiTransactionId || lomiCheckoutSessionId}`;

    const webhookProcessed = await isWebhookAlreadyProcessed(
      supabase,
      webhookEventId,
      primaryPurchaseId,
    );
    if (webhookProcessed) {
      return new Response(
        JSON.stringify({
          received: true,
          message: "Webhook already processed",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    let paymentStatusForDb = "unknown";
    if (lomiEventType === "CHECKOUT_COMPLETED") {
      paymentStatusForDb = "paid";
    } else if (lomiEventType === "PAYMENT_SUCCEEDED") {
      paymentStatusForDb = "paid";
    } else if (lomiEventType === "PAYMENT_FAILED") {
      paymentStatusForDb = "payment_failed";
    } else {
      return new Response(
        JSON.stringify({
          received: true,
          message: "Webhook event type not handled for payment update.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    const updateAmount = !merchCheckout && purchaseIds.length === 1;

    for (const purchaseId of purchaseIds) {
      const result = await recordPaymentForPurchase(supabase, purchaseId, {
        lomiTransactionId,
        lomiCheckoutSessionId,
        paymentStatusForDb,
        eventPayload,
        amount,
        currency,
        updateAmount,
      });

      if (!result.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to process payment update in DB." }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    console.log(
      `Lomi webhook: ${purchaseIds.length} purchase(s) updated (${paymentStatusForDb}, merch=${merchCheckout})`,
    );

    await markWebhookAsProcessed(supabase, webhookEventId, purchaseIds);

    if (paymentStatusForDb === "paid") {
      if (merchCheckout) {
        await dispatchMerchReceiptEmail(
          supabaseUrl,
          supabaseServiceKey,
          purchaseIds,
        );
      } else {
        for (const purchaseId of purchaseIds) {
          await dispatchTicketEmail(
            supabase,
            supabaseUrl,
            supabaseServiceKey,
            purchaseId,
          );
        }
      }
    }

    return new Response(
      JSON.stringify({ received: true, message: "Webhook processed." }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Lomi webhook: uncaught error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error processing webhook event.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

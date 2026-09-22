import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@6.9.2";

const FORWARD_TO = "wereklub@gmail.com";
const FROM_EMAIL = "Wêrê Klub <notifications@updates.wereklub.com>";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
const resend = new Resend(resendApiKey);

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("ok", { status: 200 });
  }

  const payload = await req.text();
  const { data: config, error: configError } = await supabase
    .from("resend_inbound_config")
    .select("webhook_secret")
    .eq("id", 1)
    .single();

  if (configError || !config?.webhook_secret) {
    console.error("Inbound webhook secret is not configured", configError);
    return new Response("Webhook secret not configured", { status: 500 });
  }

  let event: {
    type: string;
    data: {
      email_id: string;
      from: string;
      to: string[];
      subject: string;
    };
  };

  try {
    event = resend.webhooks.verify({
      payload,
      headers: {
        "svix-id": req.headers.get("svix-id") ?? "",
        "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
        "svix-signature": req.headers.get("svix-signature") ?? "",
      },
      secret: config.webhook_secret,
    }) as typeof event;
  } catch (error) {
    console.error("Invalid Resend webhook signature", error);
    return new Response("Invalid signature", { status: 401 });
  }

  if (event.type !== "email.received") {
    return new Response("ok", { status: 200 });
  }

  const recipients = event.data.to ?? [];
  const isWereklub = recipients.some((address) =>
    address.toLowerCase().endsWith("@wereklub.com"),
  );
  if (!isWereklub) {
    return new Response("ok", { status: 200 });
  }

  const svixId = req.headers.get("svix-id") ?? event.data.email_id;
  const { data: existing } = await supabase
    .from("inbound_emails")
    .select("id")
    .eq("svix_id", svixId)
    .maybeSingle();
  if (existing) {
    return new Response("ok", { status: 200 });
  }

  const received = await resend.emails.receiving.get(event.data.email_id);
  const textBody = received.data?.text ?? received.data?.html ?? "";

  const { error: insertError } = await supabase.from("inbound_emails").insert({
    svix_id: svixId,
    resend_email_id: event.data.email_id,
    from_address: event.data.from,
    to_addresses: recipients,
    subject: event.data.subject,
    text_body: textBody,
  });
  if (insertError) {
    console.error("Failed to store inbound email", insertError);
    return new Response("Failed to store email", { status: 500 });
  }

  const forwarded = await resend.emails.send({
    from: FROM_EMAIL,
    to: [FORWARD_TO],
    replyTo: event.data.from,
    subject: `Fwd: ${event.data.subject || "(no subject)"}`,
    text: [
      `From: ${event.data.from}`,
      `To: ${recipients.join(", ")}`,
      "",
      textBody,
    ].join("\n"),
  });
  if (forwarded.error) {
    console.error("Failed to forward inbound email", forwarded.error);
    return new Response("Failed to forward email", { status: 500 });
  }

  return new Response("ok", { status: 200 });
});

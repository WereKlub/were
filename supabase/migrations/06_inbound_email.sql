-- Inbound mail received at @wereklub.com via Resend.

create table public.inbound_emails (
    id uuid primary key default gen_random_uuid(),
    svix_id text unique not null,
    resend_email_id text,
    from_address text,
    to_addresses text[],
    subject text,
    text_body text,
    created_at timestamptz default now() not null
);

comment on table public.inbound_emails is 'Mail received at @wereklub.com through Resend inbound.';

alter table public.inbound_emails enable row level security;
revoke all on public.inbound_emails from anon, authenticated;
grant select, insert, update on public.inbound_emails to service_role;

create table public.resend_inbound_config (
    id integer primary key,
    webhook_secret text not null
);

alter table public.resend_inbound_config enable row level security;
revoke all on public.resend_inbound_config from anon, authenticated;
grant select on public.resend_inbound_config to service_role;

-- Patient report access log
-- Run once in the Supabase SQL editor (Dashboard > SQL Editor > New Query).
--
-- HIPAA §164.312(b) requires audit controls — a record of access to the
-- information system. This logs every hit on a /r/<token> report page.
--
-- DELIBERATELY STORES NO RAW IP. An IP address is one of the 18 Safe Harbor
-- identifiers, so recording one here would put an identifier back into the
-- same database the reports live in. Instead we store a salted SHA-256 of the
-- IP: repeat visits from the same address collapse to the same hash (so the
-- log still answers "was this opened more than once, from how many places")
-- without the address itself ever being written down.

create table if not exists public.report_access_log (
  id          uuid primary key default gen_random_uuid(),
  report_id   uuid references public.patient_reports(id) on delete cascade,
  token       text not null,                    -- kept even if the report row is deleted
  accessed_at timestamptz not null default now(),
  outcome     text not null,                    -- served | expired | revoked | not_found | automated
  ip_hash     text,                             -- salted SHA-256, never the address itself
  user_agent  text,                             -- truncated client hint, for distinguishing bots
  automated   boolean not null default false    -- true when served the no-content interstitial
);

create index if not exists report_access_log_report_idx on public.report_access_log (report_id, accessed_at desc);
create index if not exists report_access_log_token_idx  on public.report_access_log (token, accessed_at desc);

alter table public.report_access_log enable row level security;

-- Writes happen only through the serverless report function using the
-- service-role key (which bypasses RLS). Authenticated admins may read the
-- log; there is intentionally no anonymous policy.
drop policy if exists "Admins read report access log" on public.report_access_log;
create policy "Admins read report access log" on public.report_access_log
  for select using (auth.role() = 'authenticated');

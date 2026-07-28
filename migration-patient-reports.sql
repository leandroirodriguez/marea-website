-- Patient Lab Reports migration
-- Run once in the Supabase SQL editor (Dashboard > SQL Editor > New Query).
--
-- Backs the clinician Lab Analysis tool at /admin/labs and the public,
-- Marea-branded shareable report at /r/<token>.
--
-- ZERO patient-identifiable data by design: this table has no name, DOB,
-- MRN, or email column. `created_by` identifies the CLINICIAN (the admin
-- who generated the report), never the patient, and is never rendered on
-- the public page. The share token is unguessable and every report expires.

create table if not exists public.patient_reports (
  id              uuid primary key default gen_random_uuid(),
  token           text unique not null,                          -- unguessable slug used in the share URL (/r/<token>)
  stage           text,                                          -- perimenopause stage (early/mid/late) — not PII
  labs            jsonb not null,                                -- { amh, fsh, estradiol, testosterone, on_trt, progesterone, progesterone_cycle_day }
  interpretation  text not null,                                 -- AI narrative, clinician-reviewed
  recommendations jsonb not null default '[]'::jsonb,            -- [{ category, title, detail }] — curated treatment options
  created_by      uuid references public.users(id) on delete set null,  -- clinician's own id; internal only
  created_at      timestamptz not null default now(),
  expires_at      timestamptz not null default (now() + interval '30 days'),
  revoked         boolean not null default false
);

create index if not exists patient_reports_token_idx   on public.patient_reports (token);
create index if not exists patient_reports_created_by_idx on public.patient_reports (created_by, created_at desc);

alter table public.patient_reports enable row level security;

-- Only authenticated admins interact with this table through the app. The
-- public /r/<token> page is served by a serverless function using the
-- service-role key, which bypasses RLS — so there is intentionally NO public
-- read policy here. That keeps the table unreadable to anonymous clients
-- even if they guess the table name.
drop policy if exists "Admins manage patient reports" on public.patient_reports;
create policy "Admins manage patient reports" on public.patient_reports
  for all using (auth.role() = 'authenticated');

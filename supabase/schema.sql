-- ═══════════════════════════════════════════════════════════════
--  AROGYOS — Supabase Database Schema
--  Run this once in your Supabase dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── User profiles ────────────────────────────────────────────
-- uid = the healthos_uid stored in user's localStorage
create table if not exists public.profiles (
  uid           text primary key,
  name          text,
  phone         text,
  email         text,
  bioage        integer,
  actual_age    integer,
  quiz_done     boolean default false,
  quiz_answers  jsonb,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── Subscriptions / Payments ─────────────────────────────────
create table if not exists public.subscriptions (
  id                   uuid default gen_random_uuid() primary key,
  uid                  text not null references public.profiles(uid) on delete cascade,
  plan                 text not null default 'plus',         -- 'plus'
  region               text not null default 'india',        -- 'india' | 'intl'
  billing_cycle        text,                                  -- 'monthly' | 'halfyear' | 'annual'
  status               text not null default 'trialing',     -- 'trialing' | 'active' | 'cancelled' | 'expired'
  payment_provider     text,                                  -- 'razorpay' | 'paddle'
  payment_id           text,                                  -- Razorpay payment_id or Paddle order_id
  order_id             text,                                  -- Razorpay order_id
  amount               integer,                               -- amount in paise (INR) or cents (USD)
  currency             text default 'INR',
  trial_ends_at        timestamptz default (now() + interval '30 days'),
  current_period_end   timestamptz,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- ── Lab reports ──────────────────────────────────────────────
create table if not exists public.lab_reports (
  id          uuid default gen_random_uuid() primary key,
  uid         text not null references public.profiles(uid) on delete cascade,
  filename    text,
  biomarkers  jsonb,
  raw_text    text,
  created_at  timestamptz default now()
);

-- ── Invites (mirrors invites.js in-memory fallback) ──────────
create table if not exists public.invites (
  code          text primary key,
  inviter_id    text not null,
  inviter_name  text,
  phone         text,
  relation      text,
  status        text default 'pending',
  created_at    timestamptz default now()
);

-- ── Family members ───────────────────────────────────────────
create table if not exists public.family_members (
  id            uuid default gen_random_uuid() primary key,
  invite_code   text references public.invites(code) on delete cascade,
  inviter_id    text not null,
  name          text,
  relation      text,
  actual_age    integer,
  bioage        integer,
  quiz_data     jsonb,
  joined_at     timestamptz default now()
);

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists idx_subscriptions_uid    on public.subscriptions(uid);
create index if not exists idx_subscriptions_status on public.subscriptions(status);
create index if not exists idx_lab_reports_uid      on public.lab_reports(uid);
create index if not exists idx_family_inviter        on public.family_members(inviter_id);
create index if not exists idx_invites_inviter        on public.invites(inviter_id);

-- ── Extra profile columns for full data sync ─────────────────────────────────
alter table public.profiles add column if not exists weight_kg      numeric;
alter table public.profiles add column if not exists theme          text    default 'teal';
alter table public.profiles add column if not exists lang           text    default 'en';
alter table public.profiles add column if not exists habits         jsonb   default '{}';
alter table public.profiles add column if not exists streak_dates   jsonb   default '[]';
alter table public.profiles add column if not exists best_streak    integer default 0;
alter table public.profiles add column if not exists first_open     bigint;

-- ── Row-Level Security (disable for now — using service key only) ──
-- All access goes through the backend with service role key.
-- Enable RLS only when you add Supabase Auth later.
alter table public.profiles      disable row level security;
alter table public.subscriptions disable row level security;
alter table public.lab_reports   disable row level security;
alter table public.invites       disable row level security;
alter table public.family_members disable row level security;

-- ── Helpful view for owner dashboard ────────────────────────
create or replace view public.owner_dashboard as
select
  p.uid,
  p.name,
  p.phone,
  p.bioage,
  p.actual_age,
  p.quiz_done,
  p.created_at                          as joined_at,
  s.plan,
  s.region,
  s.billing_cycle,
  s.status                              as subscription_status,
  s.payment_provider,
  s.amount,
  s.currency,
  s.trial_ends_at,
  s.current_period_end,
  s.created_at                          as paid_at
from public.profiles p
left join public.subscriptions s
  on s.uid = p.uid
  and s.status in ('trialing', 'active')
order by p.created_at desc;

-- ── OTP codes (real verification) ─────────────────────────────────────────────
create table if not exists public.otp_codes (
  id          uuid default gen_random_uuid() primary key,
  contact     text not null,            -- email address or phone with country code
  code        text not null,            -- 6-digit OTP
  type        text not null,            -- 'email' | 'sms'
  expires_at  timestamptz not null,     -- 10 minutes from creation
  used        boolean default false,
  used_at     timestamptz,
  created_at  timestamptz default now()
);

-- Index for fast lookup by contact
create index if not exists idx_otp_contact on public.otp_codes(contact, used);

-- Auto-delete OTPs older than 24 hours (run via Supabase cron or pg_cron)
-- select cron.schedule('cleanup-otps', '0 * * * *', $$
--   delete from public.otp_codes where created_at < now() - interval '24 hours';
-- $$);

-- ── Push notification subscriptions ───────────────────────────────────────────
create table if not exists public.push_subscriptions (
  uid        text primary key references public.profiles(uid) on delete cascade,
  endpoint   text not null,
  p256dh     text,
  auth       text,
  updated_at timestamptz default now()
);

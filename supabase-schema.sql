-- Run this in Supabase SQL editor: supabase.com → SQL Editor

create table if not exists reports (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null default 'demo',
  file_name   text,
  report_date date,
  lab_name    text,
  summary     text,
  biomarkers  jsonb not null default '[]',
  created_at  timestamptz default now()
);

-- Index for fast user lookups
create index if not exists reports_user_id_idx on reports(user_id, created_at desc);

-- Enable Row Level Security (optional — for multi-user auth later)
alter table reports enable row level security;

-- Allow all reads/writes for now (tighten when auth is added)
create policy "allow all" on reports for all using (true);

-- Run this in Supabase SQL Editor to set up the journal_pages table with auth
-- Dashboard: https://supabase.com/dashboard → Your Project → SQL Editor

-- Optional: Disable email confirmation for faster dev (Authentication → Providers → Email)
-- DROP POLICY IF EXISTS "Allow all for now" ON journal_pages;

-- Create table (if not exists)
create table if not exists journal_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  page_id text not null,
  blocks jsonb not null default '[]',
  updated_at timestamptz not null default now(),
  unique(user_id, page_id)
);

create index if not exists journal_pages_user_page on journal_pages(user_id, page_id);

alter table journal_pages enable row level security;

-- Drop permissive policy if it exists
drop policy if exists "Allow all for now" on journal_pages;
drop policy if exists "Users can read own pages" on journal_pages;
drop policy if exists "Users can insert own pages" on journal_pages;
drop policy if exists "Users can update own pages" on journal_pages;
drop policy if exists "Users can delete own pages" on journal_pages;

-- RLS: Users can only access their own journal pages
create policy "Users can read own pages" on journal_pages
  for select using (auth.uid() = user_id);

create policy "Users can insert own pages" on journal_pages
  for insert with check (auth.uid() = user_id);

create policy "Users can update own pages" on journal_pages
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete own pages" on journal_pages
  for delete using (auth.uid() = user_id);

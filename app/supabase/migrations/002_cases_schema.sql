-- Stage 2: core data model for BehördenReply
-- Based on 5.MVP_RULES_LOCKED.md and 6.SYSTEM_OVERVIEW_FOR_AI.md

-- =========================================================
-- profiles: extend with billing fields
-- =========================================================

alter table profiles
  add column if not exists plan text not null default 'free'
    check (plan in ('free', 'payperuse', 'subscription')),
  add column if not exists free_used boolean not null default false,
  add column if not exists subscription_active boolean not null default false,
  add column if not exists subscription_documents_used integer not null default 0,
  add column if not exists subscription_period_start date;

-- =========================================================
-- cases
-- =========================================================

create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'uploaded'
    check (status in ('uploaded', 'analyzing', 'questioning', 'done', 'cancelled')),
  original_pdf_path text not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- MVP Rule: only 1 active case at a time per user.
-- "active" = not done and not cancelled.
create unique index if not exists one_active_case_per_user
  on cases (user_id)
  where status not in ('done', 'cancelled');

alter table cases enable row level security;

create policy "Users can view own cases"
  on cases for select using (auth.uid() = user_id);

create policy "Users can insert own cases"
  on cases for insert with check (auth.uid() = user_id);

create policy "Users can update own cases"
  on cases for update using (auth.uid() = user_id);

-- MVP Rule: no deletion of completed cases -> no delete policy at all.

-- =========================================================
-- case_messages (Q&A history)
-- =========================================================

create table if not exists case_messages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  role text not null check (role in ('ai_question', 'user_answer')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table case_messages enable row level security;

create policy "Users can view own case messages"
  on case_messages for select using (
    exists (
      select 1 from cases
      where cases.id = case_messages.case_id
      and cases.user_id = auth.uid()
    )
  );

create policy "Users can insert own case messages"
  on case_messages for insert with check (
    exists (
      select 1 from cases
      where cases.id = case_messages.case_id
      and cases.user_id = auth.uid()
    )
  );

-- =========================================================
-- case_results (final answer + downloads)
-- =========================================================

create table if not exists case_results (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null unique references cases(id) on delete cascade,
  final_text text not null,
  pdf_path text,
  docx_path text,
  created_at timestamptz not null default now()
);

alter table case_results enable row level security;

create policy "Users can view own case results"
  on case_results for select using (
    exists (
      select 1 from cases
      where cases.id = case_results.case_id
      and cases.user_id = auth.uid()
    )
  );

create policy "Users can insert own case results"
  on case_results for insert with check (
    exists (
      select 1 from cases
      where cases.id = case_results.case_id
      and cases.user_id = auth.uid()
    )
  );

-- =========================================================
-- payments (simulated billing)
-- =========================================================

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id uuid references cases(id) on delete set null,
  amount numeric(6,2) not null,
  type text not null check (type in ('per_document', 'subscription')),
  created_at timestamptz not null default now()
);

alter table payments enable row level security;

create policy "Users can view own payments"
  on payments for select using (auth.uid() = user_id);

create policy "Users can insert own payments"
  on payments for insert with check (auth.uid() = user_id);

-- =========================================================
-- Storage buckets
-- =========================================================

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('results', 'results', false)
on conflict (id) do nothing;

-- Convention: object path = "<user_id>/<case_id>/<filename>"
-- so RLS can check the first path segment against auth.uid().

create policy "Users can read own uploads"
  on storage.objects for select using (
    bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can write own uploads"
  on storage.objects for insert with check (
    bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read own results"
  on storage.objects for select using (
    bucket_id = 'results' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can write own results"
  on storage.objects for insert with check (
    bucket_id = 'results' and (storage.foldername(name))[1] = auth.uid()::text
  );

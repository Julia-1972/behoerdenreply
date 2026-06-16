-- Stage 1: profiles table (created during Auth setup)

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  language text not null default 'ru',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

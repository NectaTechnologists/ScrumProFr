-- Coach Card system: coaches table, credentials, history, profile flags

-- 1. Add is_player / is_coach flags to profiles
alter table public.profiles
  add column if not exists is_player boolean default false,
  add column if not exists is_coach boolean default false;

-- 2. coaches core table
create table if not exists public.coaches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  role_title text,
  organisation text,
  org_type text,
  country text,
  bio text,
  headshot_url text,
  coaching_style text,
  philosophy text,
  specialties text,
  linkedin_url text,
  video_url text,
  share_token text unique default gen_random_uuid()::text,
  -- playing background
  played_position text,
  played_club text,
  played_era text,
  played_level text,
  played_nationality text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

-- 3. coaching credentials (qualifications, licences)
create table if not exists public.coaching_credentials (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  credential_type text,
  issuer text,
  year integer,
  notes text,
  order_index integer default 0,
  created_at timestamptz not null default now()
);

-- 4. coaching history (clubs coached)
create table if not exists public.coaching_history (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  club text,
  role text,
  start_year integer,
  end_year integer,
  level text,
  key_achievements text,
  order_index integer default 0,
  created_at timestamptz not null default now()
);

-- 5. RLS: coaches
alter table public.coaches enable row level security;

create policy "coaches_select_public"
  on public.coaches for select using (true);

create policy "coaches_insert_own"
  on public.coaches for insert with check (auth.uid() = user_id);

create policy "coaches_update_own"
  on public.coaches for update using (auth.uid() = user_id);

-- 6. RLS: coaching_credentials
alter table public.coaching_credentials enable row level security;

create policy "credentials_select_public"
  on public.coaching_credentials for select using (true);

create policy "credentials_insert_own"
  on public.coaching_credentials for insert with check (
    auth.uid() = (select user_id from public.coaches where id = coach_id)
  );

create policy "credentials_update_own"
  on public.coaching_credentials for update using (
    auth.uid() = (select user_id from public.coaches where id = coach_id)
  );

create policy "credentials_delete_own"
  on public.coaching_credentials for delete using (
    auth.uid() = (select user_id from public.coaches where id = coach_id)
  );

-- 7. RLS: coaching_history
alter table public.coaching_history enable row level security;

create policy "history_select_public"
  on public.coaching_history for select using (true);

create policy "history_insert_own"
  on public.coaching_history for insert with check (
    auth.uid() = (select user_id from public.coaches where id = coach_id)
  );

create policy "history_update_own"
  on public.coaching_history for update using (
    auth.uid() = (select user_id from public.coaches where id = coach_id)
  );

create policy "history_delete_own"
  on public.coaching_history for delete using (
    auth.uid() = (select user_id from public.coaches where id = coach_id)
  );

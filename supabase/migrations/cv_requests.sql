create table public.cv_requests (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  coach_name text,
  coach_org text,
  message text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(coach_id, player_id)
);

alter table public.cv_requests enable row level security;

-- Coach can insert their own requests
create policy "coaches_insert_requests" on public.cv_requests
  for insert with check (auth.uid() = coach_id);

-- Coach can read their own requests
create policy "coaches_read_own_requests" on public.cv_requests
  for select using (auth.uid() = coach_id);

-- Player can read requests directed to them
create policy "players_read_own_requests" on public.cv_requests
  for select using (
    exists (
      select 1 from public.players
      where players.id = cv_requests.player_id
        and players.profile_id = auth.uid()
    )
  );

-- Player can update status of requests directed to them
create policy "players_update_own_requests" on public.cv_requests
  for update using (
    exists (
      select 1 from public.players
      where players.id = cv_requests.player_id
        and players.profile_id = auth.uid()
    )
  );

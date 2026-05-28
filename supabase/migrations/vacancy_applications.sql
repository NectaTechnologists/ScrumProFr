-- vacancy_applications: tracks player applications to coach vacancies
create table if not exists public.vacancy_applications (
  id          uuid primary key default gen_random_uuid(),
  player_id   uuid references public.players(id) on delete cascade,
  vacancy_id  uuid references public.vacancies(id) on delete cascade,
  coach_id    uuid references public.coaches(id),
  status      text not null default 'new',   -- 'new' | 'reviewing' | 'shortlisted' | 'not_suitable'
  applied_at  timestamptz not null default now(),
  unique(player_id, vacancy_id)
);

create index if not exists vacancy_applications_vacancy_idx on public.vacancy_applications(vacancy_id);
create index if not exists vacancy_applications_player_idx on public.vacancy_applications(player_id);
create index if not exists vacancy_applications_coach_idx  on public.vacancy_applications(coach_id);

alter table public.vacancy_applications enable row level security;

-- Players can insert their own applications
create policy "Players can apply to vacancies"
  on public.vacancy_applications for insert
  with check (
    player_id in (select id from public.players where profile_id = auth.uid())
  );

-- Players can read their own applications
create policy "Players can read their own applications"
  on public.vacancy_applications for select
  using (
    player_id in (select id from public.players where profile_id = auth.uid())
  );

-- Coaches can read applications to their vacancies
create policy "Coaches can read applications to their vacancies"
  on public.vacancy_applications for select
  using (
    coach_id in (select id from public.coaches where user_id = auth.uid())
  );

-- Coaches can update status on their applications
create policy "Coaches can update application status"
  on public.vacancy_applications for update
  using (
    coach_id in (select id from public.coaches where user_id = auth.uid())
  );

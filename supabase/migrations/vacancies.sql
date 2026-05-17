-- ============================================================
-- VACANCIES FEATURE
-- Run this in Supabase SQL editor
-- ============================================================

-- 1. Vacancies table
create table if not exists public.vacancies (
  id                uuid primary key default gen_random_uuid(),
  coach_id          uuid references public.coaches(id) on delete cascade,
  club_name         text not null,
  positions         text[],
  season            text,
  level             text,
  country           text,
  eligibility_notes text,
  offer_details     text,
  contact_info      text,
  closing_date      date,
  is_active         boolean default true,
  is_demo           boolean default false,
  created_at        timestamptz default now()
);

-- 2. RLS
alter table public.vacancies enable row level security;

-- Public: read active vacancies
create policy "Active vacancies are publicly readable"
  on public.vacancies for select
  using (is_active = true);

-- Coaches: full control over their own
create policy "Coaches can insert their own vacancies"
  on public.vacancies for insert
  with check (
    coach_id in (select id from public.coaches where user_id = auth.uid())
  );

create policy "Coaches can update their own vacancies"
  on public.vacancies for update
  using (
    coach_id in (select id from public.coaches where user_id = auth.uid())
  );

create policy "Coaches can delete their own vacancies"
  on public.vacancies for delete
  using (
    coach_id in (select id from public.coaches where user_id = auth.uid())
  );

-- Coaches can also read their own inactive vacancies
create policy "Coaches can read their own vacancies"
  on public.vacancies for select
  using (
    coach_id in (select id from public.coaches where user_id = auth.uid())
  );

-- 3. Feature votes table (for roadmap voting)
create table if not exists public.feature_votes (
  feature     text primary key,
  vote_count  integer default 0
);

alter table public.feature_votes enable row level security;

create policy "Feature votes are publicly readable"
  on public.feature_votes for select
  using (true);

-- Seed vacancies vote
insert into public.feature_votes (feature, vote_count)
values ('vacancies', 0)
on conflict (feature) do nothing;

-- 4. RPC to safely increment a vote
create or replace function public.increment_feature_vote(feature_name text)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.feature_votes (feature, vote_count)
  values (feature_name, 1)
  on conflict (feature) do update
    set vote_count = public.feature_votes.vote_count + 1;
end;
$$;

-- 5. Demo vacancies (clearly marked is_demo = true)
insert into public.vacancies
  (club_name, positions, season, level, country, eligibility_notes, offer_details, contact_info, is_active, is_demo)
values
  (
    'Harpenden RFC',
    array['Loosehead Prop', 'Hooker', 'Scrum-half'],
    '2026/27',
    'National 2 East',
    'England',
    'Must hold UK or EU passport',
    'Semi-professional terms. Match fees, travel covered, access to strength & conditioning programme.',
    'recruitment@harpendenrfc.com',
    true,
    true
  ),
  (
    'Newport Salop RFC',
    array['Blindside Flanker', 'Openside Flanker', 'Fly-half'],
    '2026/27',
    'Midlands 1 — Level 5',
    'England',
    null,
    'Expenses covered. Welcoming club with strong community ties and a clear pathway to higher rugby.',
    'coach@newportsaloprfc.co.uk',
    true,
    true
  ),
  (
    'Denver Barbarians RFC',
    array['Left Lock', 'Right Lock', 'Number 8'],
    '2026',
    'USA Rugby Championship',
    'United States',
    'Must be eligible to play in the USA — valid visa or green card required',
    'Paid contract. Housing assistance provided. Excellent training facilities in Colorado.',
    '+1 720 555 0184',
    true,
    true
  ),
  (
    'Stade Aurillacois',
    array['Left Wing', 'Right Wing', 'Fullback'],
    '2026/27',
    'Pro D2',
    'France',
    'EU passport required or valid French work authorisation',
    'Professional contract. Accommodation provided, vehicle allowance, performance bonuses.',
    'recrutement@aurillac-rugby.fr',
    true,
    true
  ),
  (
    'Lusaka Arrows RFC',
    array['Inside Centre', 'Outside Centre', 'Fly-half', 'Scrum-half'],
    '2026',
    'Zimbabwe / Zambia Super Series',
    'Zimbabwe',
    null,
    'Expenses and accommodation covered. Competitive environment, great travel and regional exposure.',
    'arrows.rugby@gmail.com',
    true,
    true
  );

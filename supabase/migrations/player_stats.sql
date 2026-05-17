alter table public.players
  add column if not exists availability text default 'available',
  add column if not exists season text,
  add column if not exists matches_played integer,
  add column if not exists tries_scored integer,
  add column if not exists tackles_made integer,
  add column if not exists tackle_success_pct integer,
  add column if not exists penalties_conceded integer,
  add column if not exists lineout_win_pct integer,
  add column if not exists metres_carried integer;

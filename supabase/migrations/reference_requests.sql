create table if not exists public.reference_requests (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete cascade,
  referee_email text not null,
  referee_name text,
  status text not null default 'pending',
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);

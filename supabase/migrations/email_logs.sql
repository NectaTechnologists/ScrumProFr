-- email_logs: tracks all outbound transactional emails to prevent duplicates
create table if not exists public.email_logs (
  id          uuid primary key default gen_random_uuid(),
  player_id   uuid references public.players(id) on delete cascade,
  email_type  text not null,   -- e.g. 'vacancy_alert', 'reference_reminder', 'profile_nudge'
  sent_at     timestamptz not null default now(),
  status      text not null default 'sent',   -- 'sent' | 'failed'
  meta        jsonb                            -- optional: vacancy_id, reference_id, etc.
);

create index if not exists email_logs_player_type_idx on public.email_logs(player_id, email_type);
create index if not exists email_logs_sent_at_idx on public.email_logs(sent_at);

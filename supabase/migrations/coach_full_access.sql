-- Admin-grantable "full access" flag for trusted coaches.
-- When true, this coach sees every player's full card unlocked in the
-- coach dashboard, bypassing the normal per-player Request Card / share flow.
-- This does not change any RLS or the /cv/[token] page itself (that page was
-- already reachable by anyone holding the token) — it only changes which
-- coaches see the "View full card" link instead of "Request Card" in their
-- own dashboard.

alter table public.coaches
  add column if not exists full_access boolean not null default false;

comment on column public.coaches.full_access is
  'Admin-granted: when true, coach dashboard treats all players as shared with this coach, bypassing the cv_requests approval flow.';
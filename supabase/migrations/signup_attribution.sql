-- Ad-campaign attribution captured at signup (UTM params + fbclid), and an
-- admin RPC to break down signups by utm_source/utm_campaign, split
-- player vs coach, with the same test-account exclusion used elsewhere.

create table if not exists public.signup_attribution (
  id            uuid primary key references auth.users(id) on delete cascade,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_content   text,
  utm_term      text,
  fbclid        text,
  referrer      text,
  landing_path  text,
  created_at    timestamptz not null default now()
);

alter table public.signup_attribution enable row level security;

-- A user can record their own attribution row, once, at signup. This also
-- doubles as app-level idempotency: the primary key is the user id, so a
-- second insert attempt for the same account fails and the app treats that
-- as "already recorded" rather than firing the ad conversion event again.
create policy "Users can insert their own attribution row"
  on public.signup_attribution for insert
  with check (id = auth.uid());

-- No select policy for anon/authenticated — only readable via the
-- admin_signup_attribution_stats() function below (service_role), matching
-- how the rest of the admin dashboard's stats are exposed in this project.


-- ── Admin: signups by UTM source/campaign, split player vs coach ──
-- Signups with no attribution row (direct visits, or pre-consent rejects)
-- are grouped as 'direct / unknown'.

create or replace function public.admin_signup_attribution_stats()
returns table (
  utm_source   text,
  utm_campaign text,
  role         text,   -- 'player' | 'coach'
  signup_count bigint
)
language sql
security definer
set search_path = public
as $$
  with
    test_user_ids as (
      select au.id from auth.users au
      where au.email in (
        'bruce@necta.co.za',
        'brucekay@outlook.com',
        'bruce+1@necta.co.za',
        'brucekay+1@outlook.com',
        'brucekay+3@outlook.com'
      )
    ),
    player_signups as (
      select
        coalesce(sa.utm_source, 'direct / unknown')   as utm_source,
        coalesce(sa.utm_campaign, 'direct / unknown') as utm_campaign,
        'player'::text as role
      from public.players p
      left join public.signup_attribution sa on sa.id = p.profile_id
      where p.is_test is not true
        and p.profile_id not in (select id from test_user_ids)
    ),
    coach_signups as (
      select
        coalesce(sa.utm_source, 'direct / unknown')   as utm_source,
        coalesce(sa.utm_campaign, 'direct / unknown') as utm_campaign,
        'coach'::text as role
      from public.profiles pr
      left join public.signup_attribution sa on sa.id = pr.id
      where pr.role = 'org_user'
        and pr.id not in (select id from test_user_ids)
    )
  select utm_source, utm_campaign, role, count(*)::bigint as signup_count
  from (
    select * from player_signups
    union all
    select * from coach_signups
  ) all_signups
  group by utm_source, utm_campaign, role
  order by signup_count desc;
$$;

revoke all on function public.admin_signup_attribution_stats() from public, anon, authenticated;
grant execute on function public.admin_signup_attribution_stats() to service_role;

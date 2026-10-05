-- ============================================================
-- Admin marketplace stats functions
-- Security definer — callable only via service role
-- ============================================================

-- ── 1. CV / player-coverage stats ──────────────────────────

create or replace function public.admin_cv_stats(days int default 30)
returns table (
  views_total              bigint,
  views_in_period          bigint,
  distinct_players_viewed  bigint,
  players_total            bigint,
  players_never_viewed     bigint,
  pct_players_viewed       numeric,
  distinct_viewer_orgs_in_period bigint
)
language sql
security definer
set search_path = public
as $$
  with
    -- test coach IDs (resolved from auth.users email)
    test_coach_ids as (
      select au.id
      from auth.users au
      where au.email in (
        'bruce@necta.co.za',
        'brucekay@outlook.com',
        'bruce+1@necta.co.za'
      )
    ),
    -- clean views: exclude test coaches
    clean_views as (
      select cv.player_id, cv.coach_id, cv.organisation_name, cv.viewed_at
      from cv_views cv
      where cv.coach_id not in (select id from test_coach_ids)
    ),
    -- non-test players
    real_players as (
      select p.id
      from players p
      where p.is_test is not true
    ),
    period_start as (
      select now() - (days || ' days')::interval as ts
    )
  select
    (select count(*) from clean_views)::bigint                             as views_total,
    (select count(*) from clean_views cv, period_start ps
       where cv.viewed_at >= ps.ts)::bigint                               as views_in_period,
    (select count(distinct cv.player_id)
       from clean_views cv
       inner join real_players rp on rp.id = cv.player_id)::bigint        as distinct_players_viewed,
    (select count(*) from real_players)::bigint                           as players_total,
    (select count(*) from real_players rp
       where not exists (
         select 1 from clean_views cv where cv.player_id = rp.id
       ))::bigint                                                          as players_never_viewed,
    case
      when (select count(*) from real_players) = 0 then 0
      else round(
        (select count(distinct cv.player_id)
           from clean_views cv
           inner join real_players rp on rp.id = cv.player_id)::numeric
        / (select count(*) from real_players)::numeric * 100, 1
      )
    end                                                                    as pct_players_viewed,
    (select count(distinct cv.organisation_name)
       from clean_views cv, period_start ps
       where cv.viewed_at >= ps.ts
         and cv.organisation_name is not null)::bigint                    as distinct_viewer_orgs_in_period;
$$;

-- Only service role can execute
revoke all on function public.admin_cv_stats(int) from public, anon, authenticated;
grant execute on function public.admin_cv_stats(int) to service_role;


-- ── 2. Top-viewed players (test-excluded) ──────────────────

create or replace function public.admin_top_viewed_players(lim int default 10)
returns table (
  player_id   uuid,
  first_name  text,
  last_name   text,
  position    text,
  view_count  bigint
)
language sql
security definer
set search_path = public
as $$
  with
    test_coach_ids as (
      select au.id from auth.users au
      where au.email in (
        'bruce@necta.co.za', 'brucekay@outlook.com', 'bruce+1@necta.co.za'
      )
    ),
    clean_views as (
      select cv.player_id
      from cv_views cv
      where cv.coach_id not in (select id from test_coach_ids)
    )
  select
    p.id          as player_id,
    p.first_name,
    p.last_name,
    p.position_primary as position,
    count(*)      as view_count
  from clean_views cv
  inner join players p on p.id = cv.player_id
  where p.is_test is not true
  group by p.id, p.first_name, p.last_name, p.position_primary
  order by view_count desc
  limit lim;
$$;

revoke all on function public.admin_top_viewed_players(int) from public, anon, authenticated;
grant execute on function public.admin_top_viewed_players(int) to service_role;


-- ── 3. Application stats ────────────────────────────────────

create or replace function public.admin_app_stats(days int default 30)
returns table (
  apps_total              bigint,
  apps_in_period          bigint,
  unique_applicants       bigint,
  unreviewed_count        bigint,
  oldest_unreviewed_days  int
)
language sql
security definer
set search_path = public
as $$
  with
    test_coach_ids as (
      select au.id from auth.users au
      where au.email in (
        'bruce@necta.co.za', 'brucekay@outlook.com', 'bruce+1@necta.co.za'
      )
    ),
    test_vacancy_ids as (
      select v.id from vacancies v
      where v.coach_id in (select id from test_coach_ids)
         or v.is_demo = true
    ),
    clean_apps as (
      select va.*
      from vacancy_applications va
      where va.coach_id not in (select id from test_coach_ids)
        and va.vacancy_id not in (select id from test_vacancy_ids)
    ),
    period_start as (
      select now() - (days || ' days')::interval as ts
    ),
    unreviewed as (
      select ca.applied_at from clean_apps ca where ca.status = 'new'
    )
  select
    (select count(*) from clean_apps)::bigint                              as apps_total,
    (select count(*) from clean_apps ca, period_start ps
       where ca.applied_at >= ps.ts)::bigint                              as apps_in_period,
    (select count(distinct player_id) from clean_apps)::bigint            as unique_applicants,
    (select count(*) from unreviewed)::bigint                             as unreviewed_count,
    coalesce(
      (select extract(day from now() - min(applied_at))::int from unreviewed),
      0
    )                                                                      as oldest_unreviewed_days;
$$;

revoke all on function public.admin_app_stats(int) from public, anon, authenticated;
grant execute on function public.admin_app_stats(int) to service_role;


-- ── 4. Vacancy performance ──────────────────────────────────

create or replace function public.admin_vacancy_perf()
returns table (
  vacancy_id             uuid,
  club                   text,
  coach_last_seen        timestamptz,
  apps_total             bigint,
  apps_reviewed          bigint,
  apps_unreviewed        bigint,
  last_app_date          timestamptz,
  oldest_unreviewed_days int
)
language sql
security definer
set search_path = public
as $$
  with
    test_coach_ids as (
      select au.id from auth.users au
      where au.email in (
        'bruce@necta.co.za', 'brucekay@outlook.com', 'bruce+1@necta.co.za'
      )
    ),
    clean_vacancies as (
      select v.id, v.club_name, v.coach_id
      from vacancies v
      where v.coach_id not in (select id from test_coach_ids)
        and (v.is_demo is null or v.is_demo = false)
    )
  select
    cv.id                                                                   as vacancy_id,
    cv.club_name                                                            as club,
    p.last_seen                                                             as coach_last_seen,
    count(va.id)                                                            as apps_total,
    count(va.id) filter (where va.status <> 'new')                        as apps_reviewed,
    count(va.id) filter (where va.status = 'new')                         as apps_unreviewed,
    max(va.applied_at)                                                      as last_app_date,
    coalesce(
      extract(day from now() - min(va.applied_at) filter (where va.status = 'new'))::int,
      0
    )                                                                       as oldest_unreviewed_days
  from clean_vacancies cv
  left join vacancy_applications va on va.vacancy_id = cv.id
    and va.coach_id not in (select id from test_coach_ids)
  left join profiles p on p.id = cv.coach_id
  group by cv.id, cv.club_name, p.last_seen
  order by apps_total desc;
$$;

revoke all on function public.admin_vacancy_perf() from public, anon, authenticated;
grant execute on function public.admin_vacancy_perf() to service_role;

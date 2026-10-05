-- ============================================================
-- Admin marketplace stats v2
-- Key changes from v1:
--   - Vacancies are NEVER excluded by owner. All vacancies show.
--   - Applications excluded only where the APPLICANT is a test player
--     (players.is_test = true) or auth.users.email is a test account.
--   - CV views excluded only where the VIEWING coach is a test account,
--     or the viewed player is a test player.
--   - Demo/seed vacancies (is_demo = true, coach_id = null) now included.
--   - coach last seen: vacancies.coach_id → coaches.user_id → auth.users.last_sign_in_at
--     (not profiles, which had no last_seen column with reliable data).
--   - "Managed by Gainline" shown for demo vacancies or test-account owners.
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
    -- test coach user IDs (from auth.users)
    test_user_ids as (
      select au.id
      from auth.users au
      where au.email in (
        'bruce@necta.co.za',
        'brucekay@outlook.com',
        'bruce+1@necta.co.za'
      )
    ),
    -- test coach IDs in the coaches table (for joining to vacancies.coach_id)
    test_coach_ids as (
      select c.id
      from coaches c
      where c.user_id in (select id from test_user_ids)
    ),
    -- clean views: exclude where coach is a test user OR viewed player is test
    clean_views as (
      select cv.player_id, cv.organisation_name, cv.viewed_at
      from cv_views cv
      inner join players vp on vp.id = cv.player_id
      where cv.coach_id not in (select id from test_user_ids)
        and vp.is_test is not true
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
       from clean_views cv)::bigint                                        as distinct_players_viewed,
    (select count(*) from real_players)::bigint                           as players_total,
    (select count(*) from real_players rp
       where not exists (
         select 1 from clean_views cv where cv.player_id = rp.id
       ))::bigint                                                          as players_never_viewed,
    case
      when (select count(*) from real_players) = 0 then 0
      else round(
        (select count(distinct cv.player_id) from clean_views cv)::numeric
        / (select count(*) from real_players)::numeric * 100, 1
      )
    end                                                                    as pct_players_viewed,
    (select count(distinct cv.organisation_name)
       from clean_views cv, period_start ps
       where cv.viewed_at >= ps.ts
         and cv.organisation_name is not null)::bigint                    as distinct_viewer_orgs_in_period;
$$;

revoke all on function public.admin_cv_stats(int) from public, anon, authenticated;
grant execute on function public.admin_cv_stats(int) to service_role;


-- ── 2. Top-viewed players (test-excluded) ──────────────────

create or replace function public.admin_top_viewed_players(lim int default 10)
returns table (
  player_id   uuid,
  first_name  text,
  last_name   text,
  "position"  text,
  view_count  bigint
)
language sql
security definer
set search_path = public
as $$
  with
    test_user_ids as (
      select au.id from auth.users au
      where au.email in ('bruce@necta.co.za','brucekay@outlook.com','bruce+1@necta.co.za')
    ),
    clean_views as (
      select cv.player_id
      from cv_views cv
      inner join players vp on vp.id = cv.player_id
      where cv.coach_id not in (select id from test_user_ids)
        and vp.is_test is not true
    )
  select
    p.id, p.first_name, p.last_name, p.position_primary, count(*)::bigint
  from clean_views cv
  inner join players p on p.id = cv.player_id
  group by p.id, p.first_name, p.last_name, p.position_primary
  order by count(*) desc
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
    test_user_ids as (
      select au.id from auth.users au
      where au.email in ('bruce@necta.co.za','brucekay@outlook.com','bruce+1@necta.co.za')
    ),
    -- Exclude applications only where the APPLICANT is a test player
    -- (player.is_test = true, or the player's profile_id is a test account)
    clean_apps as (
      select va.*
      from vacancy_applications va
      inner join players ap on ap.id = va.player_id
      where ap.is_test is not true
        and ap.profile_id not in (select id from test_user_ids)
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
-- Includes ALL vacancies (is_demo vacancies have null coach_id — show "Managed by Gainline").
-- coach last seen: vacancies.coach_id → coaches(id) → coaches.user_id → auth.users.last_sign_in_at

create or replace function public.admin_vacancy_perf()
returns table (
  vacancy_id             uuid,
  club                   text,
  coach_last_seen        text,   -- ISO timestamp string, or sentinel 'Managed by Gainline'
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
    test_user_ids as (
      select au.id from auth.users au
      where au.email in ('bruce@necta.co.za','brucekay@outlook.com','bruce+1@necta.co.za')
    ),
    -- All vacancies, no exclusions by owner
    all_vacancies as (
      select v.id, v.club_name, v.coach_id
      from vacancies v
      where v.is_active = true
    ),
    -- Resolve coach → auth user → last sign in
    coach_last_sign_in as (
      select
        c.id as coach_id,
        au.last_sign_in_at,
        au.id as user_id
      from coaches c
      inner join auth.users au on au.id = c.user_id
    ),
    -- Clean apps: exclude only test applicants
    clean_apps as (
      select va.*
      from vacancy_applications va
      inner join players ap on ap.id = va.player_id
      where ap.is_test is not true
        and ap.profile_id not in (select id from test_user_ids)
    )
  select
    v.id                                                                    as vacancy_id,
    v.club_name                                                             as club,
    case
      when v.coach_id is null then 'Managed by Gainline'
      when cls.user_id in (select id from test_user_ids) then 'Managed by Gainline'
      when cls.last_sign_in_at is null then 'Managed by Gainline'
      else cls.last_sign_in_at::text
    end                                                                     as coach_last_seen,
    count(ca.id)                                                            as apps_total,
    count(ca.id) filter (where ca.status <> 'new')                        as apps_reviewed,
    count(ca.id) filter (where ca.status = 'new')                         as apps_unreviewed,
    max(ca.applied_at)                                                      as last_app_date,
    coalesce(
      extract(day from now() - min(ca.applied_at) filter (where ca.status = 'new'))::int,
      0
    )                                                                       as oldest_unreviewed_days
  from all_vacancies v
  left join coach_last_sign_in cls on cls.coach_id = v.coach_id
  left join clean_apps ca on ca.vacancy_id = v.id
  group by v.id, v.club_name, v.coach_id, cls.last_sign_in_at, cls.user_id
  order by count(ca.id) desc;
$$;

revoke all on function public.admin_vacancy_perf() from public, anon, authenticated;
grant execute on function public.admin_vacancy_perf() to service_role;

-- Migrate existing org_user profiles to is_coach=true and create coaches rows

-- 1. Flag all existing org_user profiles as coaches
update public.profiles
  set is_coach = true
  where role = 'org_user';

-- 2. Create coaches rows for existing org_user profiles that don't have one yet
insert into public.coaches (user_id, full_name, organisation, org_type, role_title, country)
select
  p.id,
  p.full_name,
  p.organisation_name,
  null,
  null,
  null
from public.profiles p
where p.role = 'org_user'
  and not exists (
    select 1 from public.coaches c where c.user_id = p.id
  )
on conflict (user_id) do nothing;

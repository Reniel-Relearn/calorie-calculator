set search_path = public, extensions;

revoke insert (
  user_id,
  display_name,
  date_of_birth,
  sex_for_energy_equation,
  height_cm,
  weight_kg,
  activity_category,
  goal_type,
  timezone_name
) on table public.profiles from authenticated;

revoke update (
  display_name,
  date_of_birth,
  sex_for_energy_equation,
  height_cm,
  weight_kg,
  activity_category,
  goal_type,
  timezone_name
) on table public.profiles from authenticated;

revoke insert (
  user_id,
  goal_type,
  maintenance_kcal,
  target_kcal,
  methodology,
  methodology_version,
  activity_category,
  input_snapshot,
  assumptions,
  warnings,
  effective_from,
  effective_to
) on table public.calorie_targets from authenticated;

revoke update (effective_to)
on table public.calorie_targets from authenticated;

create function public.complete_profile_onboarding(
  p_display_name text,
  p_date_of_birth date,
  p_sex_for_energy_equation text,
  p_height_cm numeric,
  p_weight_kg numeric,
  p_activity_category text,
  p_goal_type text,
  p_timezone_name text,
  p_maintenance_kcal numeric,
  p_target_kcal numeric,
  p_methodology text,
  p_methodology_version text,
  p_input_snapshot jsonb,
  p_assumptions jsonb,
  p_warnings jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_profile public.profiles%rowtype;
  v_target public.calorie_targets%rowtype;
  v_effective_from timestamptz := statement_timestamp();
  v_height_cm numeric(6, 2) := round(p_height_cm, 2);
  v_weight_kg numeric(6, 2) := round(p_weight_kg, 2);
  v_maintenance_kcal numeric(10, 2) := round(p_maintenance_kcal, 2);
  v_target_kcal numeric(10, 2) := round(p_target_kcal, 2);
begin
  if v_user_id is null then
    raise exception using
      errcode = '42501',
      message = 'authentication is required to complete onboarding';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_timezone_names
    where name = btrim(p_timezone_name)
  ) then
    raise exception using
      errcode = '23514',
      message = 'timezone_name must be a recognized IANA timezone';
  end if;

  if p_date_of_birth is null
    or p_date_of_birth > (v_effective_from at time zone btrim(p_timezone_name))::date - interval '18 years'
  then
    raise exception using
      errcode = '23514',
      message = 'profile must be eligible for an adult Version 2 target';
  end if;

  if p_goal_type is distinct from 'maintain'
    or p_target_kcal is null
    or round(p_target_kcal, 2) is distinct from round(p_maintenance_kcal, 2)
  then
    raise exception using
      errcode = '23514',
      message = 'Version 2 onboarding supports maintenance targets only';
  end if;

  if p_methodology is distinct from 'nasem-dri-energy-2023-eer'
    or p_methodology_version is distinct from '1.0.0'
  then
    raise exception using
      errcode = '23514',
      message = 'target methodology is not supported for Version 2 onboarding';
  end if;

  if jsonb_typeof(p_input_snapshot) is distinct from 'object'
    or p_input_snapshot ? 'lifeStageEligibilityConfirmed'
    or p_input_snapshot ->> 'sexForEnergyEquation' is distinct from p_sex_for_energy_equation
    or p_input_snapshot ->> 'activityCategory' is distinct from p_activity_category
    or p_input_snapshot ->> 'goalType' is distinct from p_goal_type
    or (p_input_snapshot ->> 'heightCm')::numeric is distinct from v_height_cm
    or (p_input_snapshot ->> 'weightKg')::numeric is distinct from v_weight_kg
    or (p_input_snapshot ->> 'ageYears')::numeric < 18
  then
    raise exception using
      errcode = '23514',
      message = 'target input snapshot does not match the canonical profile';
  end if;

  if jsonb_typeof(p_assumptions) is distinct from 'array'
    or jsonb_typeof(p_warnings) is distinct from 'array'
  then
    raise exception using
      errcode = '23514',
      message = 'target assumptions and warnings must be arrays';
  end if;

  select p.*
  into v_profile
  from public.profiles as p
  where p.user_id = v_user_id;

  select t.*
  into v_target
  from public.calorie_targets as t
  where t.user_id = v_user_id
    and t.effective_to is null;

  if (v_profile.user_id is null) <> (v_target.id is null) then
    raise exception using
      errcode = 'P0001',
      message = 'onboarding data is incomplete and requires support';
  end if;

  if v_profile.user_id is not null then
    if v_profile.display_name = btrim(p_display_name)
      and v_profile.date_of_birth = p_date_of_birth
      and v_profile.sex_for_energy_equation = p_sex_for_energy_equation
      and v_profile.height_cm = v_height_cm
      and v_profile.weight_kg = v_weight_kg
      and v_profile.activity_category = p_activity_category
      and v_profile.goal_type = p_goal_type
      and v_profile.timezone_name = btrim(p_timezone_name)
    then
      return jsonb_build_object(
        'profile', to_jsonb(v_profile),
        'target', to_jsonb(v_target),
        'idempotent', true
      );
    end if;

    raise exception using
      errcode = 'P0001',
      message = 'profile onboarding is already complete';
  end if;

  insert into public.profiles (
    user_id,
    display_name,
    date_of_birth,
    sex_for_energy_equation,
    height_cm,
    weight_kg,
    activity_category,
    goal_type,
    timezone_name
  ) values (
    v_user_id,
    btrim(p_display_name),
    p_date_of_birth,
    p_sex_for_energy_equation,
    v_height_cm,
    v_weight_kg,
    p_activity_category,
    p_goal_type,
    btrim(p_timezone_name)
  )
  returning * into v_profile;

  insert into public.calorie_targets (
    user_id,
    goal_type,
    maintenance_kcal,
    target_kcal,
    methodology,
    methodology_version,
    activity_category,
    input_snapshot,
    assumptions,
    warnings,
    effective_from
  ) values (
    v_user_id,
    p_goal_type,
    v_maintenance_kcal,
    v_target_kcal,
    p_methodology,
    p_methodology_version,
    p_activity_category,
    p_input_snapshot,
    p_assumptions,
    p_warnings,
    v_effective_from
  )
  returning * into v_target;

  return jsonb_build_object(
    'profile', to_jsonb(v_profile),
    'target', to_jsonb(v_target),
    'idempotent', false
  );
end;
$$;

revoke all on function public.complete_profile_onboarding(
  text,
  date,
  text,
  numeric,
  numeric,
  text,
  text,
  text,
  numeric,
  numeric,
  text,
  text,
  jsonb,
  jsonb,
  jsonb
) from public, anon, authenticated;

grant execute on function public.complete_profile_onboarding(
  text,
  date,
  text,
  numeric,
  numeric,
  text,
  text,
  text,
  numeric,
  numeric,
  text,
  text,
  jsonb,
  jsonb,
  jsonb
) to authenticated;

set search_path = public, extensions;

alter table public.calorie_targets
  alter column maintenance_kcal type numeric using maintenance_kcal::numeric,
  alter column target_kcal type numeric using target_kcal::numeric;

create or replace function public.validate_v2_energy_target_payload(
  p_date_of_birth date,
  p_effective_date date,
  p_sex_for_energy_equation text,
  p_height_cm numeric,
  p_weight_kg numeric,
  p_activity_category text,
  p_goal_type text,
  p_maintenance_kcal numeric,
  p_target_kcal numeric,
  p_methodology text,
  p_methodology_version text,
  p_input_snapshot jsonb,
  p_assumptions jsonb,
  p_warnings jsonb
)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_height_cm numeric(6, 2) := round(p_height_cm, 2);
  v_weight_kg numeric(6, 2) := round(p_weight_kg, 2);
  v_maintenance_kcal numeric := p_maintenance_kcal;
  v_target_kcal numeric := p_target_kcal;
  v_snapshot_age numeric;
  v_bmi numeric;
  v_expected_sepv numeric;
  v_expected_adjustment numeric;
  v_expected_target numeric;
  v_adjustment jsonb;
begin
  if p_goal_type is null or p_goal_type not in ('maintain', 'lose', 'gain') then
    raise exception using errcode = '23514', message = 'goal type is not supported';
  end if;

  if p_date_of_birth is null
    or p_effective_date is null
    or p_date_of_birth > p_effective_date - interval '18 years'
  then
    raise exception using
      errcode = '23514',
      message = 'profile must be eligible for an adult Version 2 target';
  end if;

  if p_maintenance_kcal is null or p_maintenance_kcal <= 0
    or p_target_kcal is null or p_target_kcal <= 0
  then
    raise exception using
      errcode = '23514',
      message = 'target calorie values must be positive';
  end if;

  if jsonb_typeof(p_input_snapshot) is distinct from 'object'
    or p_input_snapshot ? 'lifeStageEligibilityConfirmed'
    or p_input_snapshot ? 'directionalSafetyEligibilityConfirmed'
    or p_input_snapshot ->> 'sexForEnergyEquation' is distinct from p_sex_for_energy_equation
    or p_input_snapshot ->> 'activityCategory' is distinct from p_activity_category
    or p_input_snapshot ->> 'goalType' is distinct from p_goal_type
    or (p_input_snapshot ->> 'heightCm')::numeric is distinct from v_height_cm
    or (p_input_snapshot ->> 'weightKg')::numeric is distinct from v_weight_kg
  then
    raise exception using
      errcode = '23514',
      message = 'target input snapshot does not match the canonical profile';
  end if;

  v_snapshot_age := (p_input_snapshot ->> 'ageYears')::numeric;
  if v_snapshot_age < 18 then
    raise exception using
      errcode = '23514',
      message = 'target input snapshot age is not supported';
  end if;

  if jsonb_typeof(p_assumptions) is distinct from 'array'
    or jsonb_typeof(p_warnings) is distinct from 'array'
  then
    raise exception using
      errcode = '23514',
      message = 'target assumptions and warnings must be arrays';
  end if;

  if p_goal_type = 'maintain' then
    if v_target_kcal is distinct from v_maintenance_kcal
      or p_methodology is distinct from 'nasem-dri-energy-2023-eer'
      or p_methodology_version is distinct from '1.0.0'
      or p_input_snapshot ? 'directionalAdjustment'
    then
      raise exception using
        errcode = '23514',
        message = 'maintenance target metadata is not supported';
    end if;
    return;
  end if;

  if p_date_of_birth > p_effective_date - interval '19 years'
    or v_snapshot_age < 19
  then
    raise exception using
      errcode = '23514',
      message = 'directional targets are available from age 19';
  end if;

  if p_methodology is distinct from 'nasem-dri-energy-2023-directional-sepv'
    or p_methodology_version is distinct from '1.0.0'
  then
    raise exception using
      errcode = '23514',
      message = 'directional target methodology is not supported';
  end if;

  v_bmi := v_weight_kg / power(v_height_cm / 100, 2);
  if v_bmi < 16 or (p_goal_type = 'lose' and v_bmi < 18.5) then
    raise exception using
      errcode = '23514',
      message = 'directional target is outside the supported BMI safety policy';
  end if;

  v_expected_sepv := case p_sex_for_energy_equation
    when 'female' then 241
    when 'male' then 342
    else null
  end;
  if v_expected_sepv is null then
    raise exception using errcode = '23514', message = 'equation sex is not supported';
  end if;

  v_expected_adjustment := 1.96 * v_expected_sepv;
  v_expected_target := v_maintenance_kcal + case when p_goal_type = 'lose'
    then -v_expected_adjustment else v_expected_adjustment end;
  v_adjustment := p_input_snapshot -> 'directionalAdjustment';

  if jsonb_typeof(v_adjustment) is distinct from 'object'
    or v_adjustment ->> 'method' is distinct from 'prediction_interval_boundary'
    or (v_adjustment ->> 'sepvKcal')::numeric is distinct from v_expected_sepv
    or (v_adjustment ->> 'multiplier')::numeric is distinct from 1.96::numeric
    or (v_adjustment ->> 'adjustmentKcal')::numeric is distinct from v_expected_adjustment
    or v_adjustment ->> 'direction' is distinct from
      (case when p_goal_type = 'lose' then 'subtract' else 'add' end)
    or v_adjustment ->> 'safetyPolicyVersion' is distinct from '1.0.0'
    or v_target_kcal is distinct from v_expected_target
  then
    raise exception using
      errcode = '23514',
      message = 'directional target metadata does not match the approved method';
  end if;

  if p_goal_type = 'lose' and v_target_kcal < 1200 then
    raise exception using
      errcode = '23514',
      message = 'lose target is below the CalorieCheck safety boundary';
  end if;
exception
  when invalid_text_representation or numeric_value_out_of_range or division_by_zero then
    raise exception using
      errcode = '23514',
      message = 'target input snapshot contains malformed numeric metadata';
end;
$$;

revoke all on function public.validate_v2_energy_target_payload(
  date, date, text, numeric, numeric, text, text, numeric, numeric,
  text, text, jsonb, jsonb, jsonb
) from public, anon, authenticated;

create or replace function public.complete_profile_onboarding(
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
  v_effective_date date;
  v_height_cm numeric(6, 2) := round(p_height_cm, 2);
  v_weight_kg numeric(6, 2) := round(p_weight_kg, 2);
  v_maintenance_kcal numeric := p_maintenance_kcal;
  v_target_kcal numeric := p_target_kcal;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'authentication is required to complete onboarding';
  end if;

  if not exists (select 1 from pg_catalog.pg_timezone_names where name = btrim(p_timezone_name)) then
    raise exception using errcode = '23514', message = 'timezone_name must be a recognized IANA timezone';
  end if;

  v_effective_date := (v_effective_from at time zone btrim(p_timezone_name))::date;
  perform public.validate_v2_energy_target_payload(
    p_date_of_birth, v_effective_date, p_sex_for_energy_equation,
    v_height_cm, v_weight_kg, p_activity_category, p_goal_type,
    v_maintenance_kcal, v_target_kcal, p_methodology,
    p_methodology_version, p_input_snapshot, p_assumptions, p_warnings
  );

  select p.* into v_profile from public.profiles p where p.user_id = v_user_id;
  select t.* into v_target from public.calorie_targets t
    where t.user_id = v_user_id and t.effective_to is null;

  if (v_profile.user_id is null) <> (v_target.id is null) then
    raise exception using errcode = 'P0001', message = 'onboarding data is incomplete and requires support';
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
      return jsonb_build_object('profile', to_jsonb(v_profile), 'target', to_jsonb(v_target), 'idempotent', true);
    end if;
    raise exception using errcode = 'P0001', message = 'profile onboarding is already complete';
  end if;

  insert into public.profiles (
    user_id, display_name, date_of_birth, sex_for_energy_equation, height_cm,
    weight_kg, activity_category, goal_type, timezone_name
  ) values (
    v_user_id, btrim(p_display_name), p_date_of_birth, p_sex_for_energy_equation,
    v_height_cm, v_weight_kg, p_activity_category, p_goal_type, btrim(p_timezone_name)
  ) returning * into v_profile;

  insert into public.calorie_targets (
    user_id, goal_type, maintenance_kcal, target_kcal, methodology,
    methodology_version, activity_category, input_snapshot, assumptions,
    warnings, effective_from
  ) values (
    v_user_id, p_goal_type, v_maintenance_kcal, v_target_kcal, p_methodology,
    p_methodology_version, p_activity_category, p_input_snapshot, p_assumptions,
    p_warnings, v_effective_from
  ) returning * into v_target;

  return jsonb_build_object('profile', to_jsonb(v_profile), 'target', to_jsonb(v_target), 'idempotent', false);
end;
$$;

create or replace function public.update_profile_settings(
  p_display_name text,
  p_date_of_birth date,
  p_sex_for_energy_equation text,
  p_height_cm numeric,
  p_weight_kg numeric,
  p_activity_category text,
  p_goal_type text,
  p_timezone_name text,
  p_maintenance_kcal numeric default null,
  p_target_kcal numeric default null,
  p_methodology text default null,
  p_methodology_version text default null,
  p_input_snapshot jsonb default null,
  p_assumptions jsonb default null,
  p_warnings jsonb default null
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
  v_new_target public.calorie_targets%rowtype;
  v_target_changed boolean;
  v_effective_from timestamptz;
  v_effective_date date;
  v_height_cm numeric(6, 2) := round(p_height_cm, 2);
  v_weight_kg numeric(6, 2) := round(p_weight_kg, 2);
  v_maintenance_kcal numeric := p_maintenance_kcal;
  v_target_kcal numeric := p_target_kcal;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'authentication is required to update profile settings';
  end if;

  select p.* into v_profile from public.profiles p where p.user_id = v_user_id for update;
  select t.* into v_target from public.calorie_targets t
    where t.user_id = v_user_id and t.effective_to is null for update;

  if v_profile.user_id is null or v_target.id is null then
    raise exception using errcode = 'P0001', message = 'a complete profile and current target are required';
  end if;

  if not exists (select 1 from pg_catalog.pg_timezone_names where name = btrim(p_timezone_name)) then
    raise exception using errcode = '23514', message = 'timezone_name must be a recognized IANA timezone';
  end if;

  if p_goal_type is null or p_goal_type not in ('maintain', 'lose', 'gain') then
    raise exception using errcode = '23514', message = 'goal type is not supported';
  end if;

  v_target_changed :=
    v_profile.date_of_birth is distinct from p_date_of_birth
    or v_profile.sex_for_energy_equation is distinct from p_sex_for_energy_equation
    or v_profile.height_cm is distinct from v_height_cm
    or v_profile.weight_kg is distinct from v_weight_kg
    or v_profile.activity_category is distinct from p_activity_category
    or v_profile.goal_type is distinct from p_goal_type
    or v_profile.timezone_name is distinct from btrim(p_timezone_name);

  if v_target_changed then
    v_effective_date := (statement_timestamp() at time zone btrim(p_timezone_name))::date;
    perform public.validate_v2_energy_target_payload(
      p_date_of_birth, v_effective_date, p_sex_for_energy_equation,
      v_height_cm, v_weight_kg, p_activity_category, p_goal_type,
      v_maintenance_kcal, v_target_kcal, p_methodology,
      p_methodology_version, p_input_snapshot, p_assumptions, p_warnings
    );
  end if;

  update public.profiles set
    display_name = btrim(p_display_name), date_of_birth = p_date_of_birth,
    sex_for_energy_equation = p_sex_for_energy_equation, height_cm = v_height_cm,
    weight_kg = v_weight_kg, activity_category = p_activity_category,
    goal_type = p_goal_type, timezone_name = btrim(p_timezone_name)
  where user_id = v_user_id returning * into v_profile;

  if not v_target_changed then
    return jsonb_build_object('profile', to_jsonb(v_profile), 'target', to_jsonb(v_target), 'targetChanged', false);
  end if;

  v_effective_from := greatest(statement_timestamp(), v_target.effective_from + interval '1 microsecond');
  update public.calorie_targets set effective_to = v_effective_from where id = v_target.id;

  insert into public.calorie_targets (
    user_id, goal_type, maintenance_kcal, target_kcal, methodology,
    methodology_version, activity_category, input_snapshot, assumptions,
    warnings, effective_from
  ) values (
    v_user_id, p_goal_type, v_maintenance_kcal, v_target_kcal, p_methodology,
    p_methodology_version, p_activity_category, p_input_snapshot, p_assumptions,
    p_warnings, v_effective_from
  ) returning * into v_new_target;

  return jsonb_build_object('profile', to_jsonb(v_profile), 'target', to_jsonb(v_new_target), 'targetChanged', true);
end;
$$;

revoke all on function public.complete_profile_onboarding(
  text, date, text, numeric, numeric, text, text, text, numeric, numeric,
  text, text, jsonb, jsonb, jsonb
) from public, anon, authenticated;
grant execute on function public.complete_profile_onboarding(
  text, date, text, numeric, numeric, text, text, text, numeric, numeric,
  text, text, jsonb, jsonb, jsonb
) to authenticated;

revoke all on function public.update_profile_settings(
  text, date, text, numeric, numeric, text, text, text, numeric, numeric,
  text, text, jsonb, jsonb, jsonb
) from public, anon, authenticated;
grant execute on function public.update_profile_settings(
  text, date, text, numeric, numeric, text, text, text, numeric, numeric,
  text, text, jsonb, jsonb, jsonb
) to authenticated;

comment on function public.validate_v2_energy_target_payload(
  date, date, text, numeric, numeric, text, text, numeric, numeric,
  text, text, jsonb, jsonb, jsonb
) is 'Validates Maintain and adult directional target payloads at the trusted database boundary.';

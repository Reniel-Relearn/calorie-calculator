set search_path = public, extensions;

revoke update (
  consumed_at,
  timezone_at_entry,
  local_date,
  food_id,
  food_name_snapshot,
  entered_quantity,
  entered_unit,
  entered_descriptor,
  normalized_amount,
  normalized_unit,
  calories_kcal,
  protein_g,
  carbohydrates_g,
  fat_g,
  fiber_g,
  sugar_g,
  sodium_mg,
  nutrition_dataset_version,
  source_reference,
  calculation_snapshot
) on table public.food_logs from authenticated;

create function public.update_profile_settings(
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
  v_height_cm numeric(6, 2) := round(p_height_cm, 2);
  v_weight_kg numeric(6, 2) := round(p_weight_kg, 2);
  v_maintenance_kcal numeric(10, 2) := round(p_maintenance_kcal, 2);
  v_target_kcal numeric(10, 2) := round(p_target_kcal, 2);
begin
  if v_user_id is null then
    raise exception using
      errcode = '42501',
      message = 'authentication is required to update profile settings';
  end if;

  select p.*
  into v_profile
  from public.profiles as p
  where p.user_id = v_user_id
  for update;

  select t.*
  into v_target
  from public.calorie_targets as t
  where t.user_id = v_user_id
    and t.effective_to is null
  for update;

  if v_profile.user_id is null or v_target.id is null then
    raise exception using
      errcode = 'P0001',
      message = 'a complete profile and current target are required';
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
    or p_date_of_birth > (statement_timestamp() at time zone btrim(p_timezone_name))::date - interval '18 years'
  then
    raise exception using
      errcode = '23514',
      message = 'profile must remain eligible for an adult Version 2 target';
  end if;

  if p_goal_type is distinct from 'maintain' then
    raise exception using
      errcode = '23514',
      message = 'Version 2 settings support maintenance targets only';
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
    if p_target_kcal is null
      or v_target_kcal is distinct from v_maintenance_kcal
      or p_methodology is distinct from 'nasem-dri-energy-2023-eer'
      or p_methodology_version is distinct from '1.0.0'
      or jsonb_typeof(p_input_snapshot) is distinct from 'object'
      or p_input_snapshot ? 'lifeStageEligibilityConfirmed'
      or p_input_snapshot ->> 'sexForEnergyEquation' is distinct from p_sex_for_energy_equation
      or p_input_snapshot ->> 'activityCategory' is distinct from p_activity_category
      or p_input_snapshot ->> 'goalType' is distinct from p_goal_type
      or (p_input_snapshot ->> 'heightCm')::numeric is distinct from v_height_cm
      or (p_input_snapshot ->> 'weightKg')::numeric is distinct from v_weight_kg
      or (p_input_snapshot ->> 'ageYears')::numeric < 18
      or jsonb_typeof(p_assumptions) is distinct from 'array'
      or jsonb_typeof(p_warnings) is distinct from 'array'
    then
      raise exception using
        errcode = '23514',
        message = 'new target metadata does not match the canonical profile';
    end if;
  end if;

  update public.profiles
  set
    display_name = btrim(p_display_name),
    date_of_birth = p_date_of_birth,
    sex_for_energy_equation = p_sex_for_energy_equation,
    height_cm = v_height_cm,
    weight_kg = v_weight_kg,
    activity_category = p_activity_category,
    goal_type = p_goal_type,
    timezone_name = btrim(p_timezone_name)
  where user_id = v_user_id
  returning * into v_profile;

  if not v_target_changed then
    return jsonb_build_object(
      'profile', to_jsonb(v_profile),
      'target', to_jsonb(v_target),
      'targetChanged', false
    );
  end if;

  v_effective_from := greatest(
    statement_timestamp(),
    v_target.effective_from + interval '1 microsecond'
  );

  update public.calorie_targets
  set effective_to = v_effective_from
  where id = v_target.id;

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
  returning * into v_new_target;

  return jsonb_build_object(
    'profile', to_jsonb(v_profile),
    'target', to_jsonb(v_new_target),
    'targetChanged', true
  );
end;
$$;

revoke all on function public.update_profile_settings(
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

grant execute on function public.update_profile_settings(
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

create function public.update_food_log(
  p_log_id uuid,
  p_consumed_at timestamptz,
  p_timezone_at_entry text,
  p_local_date date,
  p_entered_quantity numeric,
  p_entered_unit text,
  p_entered_descriptor text,
  p_normalized_amount numeric,
  p_normalized_unit text,
  p_calories_kcal numeric,
  p_protein_g numeric,
  p_carbohydrates_g numeric,
  p_fat_g numeric,
  p_fiber_g numeric,
  p_sugar_g numeric,
  p_sodium_mg numeric,
  p_calculation_snapshot jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_log public.food_logs%rowtype;
  v_updated public.food_logs%rowtype;
  v_descriptor text := nullif(btrim(p_entered_descriptor), '');
begin
  if v_user_id is null then
    raise exception using
      errcode = '42501',
      message = 'authentication is required to update a food log';
  end if;

  select logs.*
  into v_log
  from public.food_logs as logs
  where logs.id = p_log_id
    and logs.user_id = v_user_id
  for update;

  if v_log.id is null then
    raise exception using
      errcode = 'P0002',
      message = 'food log was not found';
  end if;

  if p_entered_unit is distinct from v_log.entered_unit
    or v_descriptor is distinct from v_log.entered_descriptor
    or p_normalized_unit is distinct from v_log.normalized_unit
    or jsonb_typeof(p_calculation_snapshot) is distinct from 'object'
    or p_calculation_snapshot ->> 'schemaVersion' is distinct from '1.0.0'
    or p_calculation_snapshot -> 'dataset' is distinct from v_log.calculation_snapshot -> 'dataset'
    or p_calculation_snapshot -> 'food' is distinct from v_log.calculation_snapshot -> 'food'
    or p_calculation_snapshot -> 'reference' is distinct from v_log.calculation_snapshot -> 'reference'
    or p_calculation_snapshot #>> '{serving,conversionType}'
      is distinct from v_log.calculation_snapshot #>> '{serving,conversionType}'
    or p_calculation_snapshot #> '{serving,conversionMetadata}'
      is distinct from v_log.calculation_snapshot #> '{serving,conversionMetadata}'
    or (p_calculation_snapshot #>> '{serving,enteredQuantity}')::numeric
      is distinct from p_entered_quantity
    or p_calculation_snapshot #>> '{serving,enteredUnit}' is distinct from p_entered_unit
    or p_calculation_snapshot #>> '{serving,enteredDescriptor}' is distinct from v_descriptor
    or (p_calculation_snapshot #>> '{serving,normalizedAmount}')::numeric
      is distinct from p_normalized_amount
    or p_calculation_snapshot #>> '{serving,normalizedUnit}' is distinct from p_normalized_unit
    or (p_calculation_snapshot #>> '{calculation,nutrition,caloriesKcal}')::numeric
      is distinct from p_calories_kcal
    or (p_calculation_snapshot #>> '{calculation,nutrition,proteinG}')::numeric
      is distinct from p_protein_g
    or (p_calculation_snapshot #>> '{calculation,nutrition,carbohydratesG}')::numeric
      is distinct from p_carbohydrates_g
    or (p_calculation_snapshot #>> '{calculation,nutrition,fatG}')::numeric
      is distinct from p_fat_g
    or (p_calculation_snapshot #>> '{calculation,nutrition,fiberG}')::numeric
      is distinct from p_fiber_g
    or (p_calculation_snapshot #>> '{calculation,nutrition,sugarG}')::numeric
      is distinct from p_sugar_g
    or (p_calculation_snapshot #>> '{calculation,nutrition,sodiumMg}')::numeric
      is distinct from p_sodium_mg
  then
    raise exception using
      errcode = '23514',
      message = 'food-log edit must use its captured calculation snapshot';
  end if;

  update public.food_logs
  set
    consumed_at = p_consumed_at,
    timezone_at_entry = btrim(p_timezone_at_entry),
    local_date = p_local_date,
    entered_quantity = p_entered_quantity,
    entered_unit = p_entered_unit,
    entered_descriptor = v_descriptor,
    normalized_amount = p_normalized_amount,
    normalized_unit = p_normalized_unit,
    calories_kcal = p_calories_kcal,
    protein_g = p_protein_g,
    carbohydrates_g = p_carbohydrates_g,
    fat_g = p_fat_g,
    fiber_g = p_fiber_g,
    sugar_g = p_sugar_g,
    sodium_mg = p_sodium_mg,
    calculation_snapshot = p_calculation_snapshot
  where id = v_log.id
  returning * into v_updated;

  return jsonb_build_object(
    'log', to_jsonb(v_updated),
    'previousLocalDate', v_log.local_date
  );
end;
$$;

revoke all on function public.update_food_log(
  uuid,
  timestamptz,
  text,
  date,
  numeric,
  text,
  text,
  numeric,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  jsonb
) from public, anon, authenticated;

grant execute on function public.update_food_log(
  uuid,
  timestamptz,
  text,
  date,
  numeric,
  text,
  text,
  numeric,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  jsonb
) to authenticated;

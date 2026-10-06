set search_path = public, extensions;

revoke insert (
  user_id,
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

create function public.create_food_log(
  p_request_id uuid,
  p_consumed_at timestamptz,
  p_timezone_at_entry text,
  p_local_date date,
  p_food_id text,
  p_food_name_snapshot text,
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
  p_nutrition_dataset_version text,
  p_source_reference text,
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
  v_descriptor text := nullif(btrim(p_entered_descriptor), '');
begin
  if v_user_id is null then
    raise exception using
      errcode = '42501',
      message = 'authentication is required to create a food log';
  end if;

  if p_request_id is null then
    raise exception using
      errcode = '23514',
      message = 'a food-log request ID is required';
  end if;

  if jsonb_typeof(p_calculation_snapshot) is distinct from 'object'
    or p_calculation_snapshot ->> 'schemaVersion' is distinct from '1.0.0'
    or p_calculation_snapshot #>> '{dataset,version}' is distinct from p_nutrition_dataset_version
    or p_calculation_snapshot #>> '{food,id}' is distinct from p_food_id
    or p_calculation_snapshot #>> '{food,name}' is distinct from p_food_name_snapshot
    or p_calculation_snapshot #>> '{food,source,sourceReference}' is distinct from p_source_reference
    or (p_calculation_snapshot #>> '{serving,enteredQuantity}')::numeric
      is distinct from p_entered_quantity
    or p_calculation_snapshot #>> '{serving,enteredUnit}' is distinct from p_entered_unit
    or p_calculation_snapshot #>> '{serving,enteredDescriptor}' is distinct from v_descriptor
    or (p_calculation_snapshot #>> '{serving,normalizedAmount}')::numeric
      is distinct from p_normalized_amount
    or p_calculation_snapshot #>> '{serving,normalizedUnit}' is distinct from p_normalized_unit
    or (p_calculation_snapshot #>> '{calculation,nutrition,caloriesKcal}')::numeric
      is distinct from p_calories_kcal
  then
    raise exception using
      errcode = '23514',
      message = 'calculation snapshot does not match the food-log scalars';
  end if;

  insert into public.food_logs (
    id,
    user_id,
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
  ) values (
    p_request_id,
    v_user_id,
    p_consumed_at,
    btrim(p_timezone_at_entry),
    p_local_date,
    btrim(p_food_id),
    btrim(p_food_name_snapshot),
    p_entered_quantity,
    p_entered_unit,
    v_descriptor,
    p_normalized_amount,
    p_normalized_unit,
    p_calories_kcal,
    p_protein_g,
    p_carbohydrates_g,
    p_fat_g,
    p_fiber_g,
    p_sugar_g,
    p_sodium_mg,
    btrim(p_nutrition_dataset_version),
    btrim(p_source_reference),
    p_calculation_snapshot
  )
  on conflict (id) do nothing
  returning * into v_log;

  if v_log.id is not null then
    return jsonb_build_object(
      'log', to_jsonb(v_log),
      'idempotent', false
    );
  end if;

  select logs.*
  into v_log
  from public.food_logs as logs
  where logs.id = p_request_id;

  if v_log.id is null or v_log.user_id is distinct from v_user_id then
    raise exception using
      errcode = '23505',
      message = 'food-log request ID is already in use';
  end if;

  if v_log.consumed_at is distinct from p_consumed_at
    or v_log.timezone_at_entry is distinct from btrim(p_timezone_at_entry)
    or v_log.local_date is distinct from p_local_date
    or v_log.food_id is distinct from btrim(p_food_id)
    or v_log.food_name_snapshot is distinct from btrim(p_food_name_snapshot)
    or v_log.entered_quantity is distinct from round(p_entered_quantity, 6)
    or v_log.entered_unit is distinct from p_entered_unit
    or v_log.entered_descriptor is distinct from v_descriptor
    or v_log.normalized_amount is distinct from round(p_normalized_amount, 6)
    or v_log.normalized_unit is distinct from p_normalized_unit
    or v_log.calories_kcal is distinct from round(p_calories_kcal, 4)
    or v_log.protein_g is distinct from round(p_protein_g, 4)
    or v_log.carbohydrates_g is distinct from round(p_carbohydrates_g, 4)
    or v_log.fat_g is distinct from round(p_fat_g, 4)
    or v_log.fiber_g is distinct from round(p_fiber_g, 4)
    or v_log.sugar_g is distinct from round(p_sugar_g, 4)
    or v_log.sodium_mg is distinct from round(p_sodium_mg, 4)
    or v_log.nutrition_dataset_version is distinct from btrim(p_nutrition_dataset_version)
    or v_log.source_reference is distinct from btrim(p_source_reference)
    or v_log.calculation_snapshot is distinct from p_calculation_snapshot
  then
    raise exception using
      errcode = 'P0001',
      message = 'food-log retry payload does not match the original request';
  end if;

  return jsonb_build_object(
    'log', to_jsonb(v_log),
    'idempotent', true
  );
end;
$$;

revoke all on function public.create_food_log(
  uuid,
  timestamptz,
  text,
  date,
  text,
  text,
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
  text,
  text,
  jsonb
) from public, anon, authenticated;

grant execute on function public.create_food_log(
  uuid,
  timestamptz,
  text,
  date,
  text,
  text,
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
  text,
  text,
  jsonb
) to authenticated;

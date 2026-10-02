begin;

create extension if not exists pgtap with schema extensions;

create function pg_temp.sqlstate_for(statement text)
returns text
language plpgsql
as $$
begin
  execute statement;
  return null;
exception when others then
  return sqlstate;
end;
$$;

select plan(21);

insert into auth.users (id, email) values
  ('40000000-0000-0000-0000-000000000001', 'constraints-a@example.test'),
  ('40000000-0000-0000-0000-000000000002', 'cascade@example.test');

select is(
  pg_temp.sqlstate_for($$insert into public.profiles (
    user_id, display_name, date_of_birth, sex_for_energy_equation,
    height_cm, weight_kg, activity_category, goal_type, timezone_name
  ) values (
    '40000000-0000-0000-0000-000000000001', ' ', '1990-01-01', 'male',
    175, 75, 'active', 'maintain', 'UTC'
  )$$),
  '23514',
  'blank profile display names are rejected'
);

select is(
  pg_temp.sqlstate_for($$insert into public.profiles (
    user_id, display_name, date_of_birth, sex_for_energy_equation,
    height_cm, weight_kg, activity_category, goal_type, timezone_name
  ) values (
    '40000000-0000-0000-0000-000000000001', 'Invalid', '1990-01-01', 'other',
    175, 75, 'active', 'maintain', 'UTC'
  )$$),
  '23514',
  'unsupported equation sex is rejected'
);

select is(
  pg_temp.sqlstate_for($$insert into public.profiles (
    user_id, display_name, date_of_birth, sex_for_energy_equation,
    height_cm, weight_kg, activity_category, goal_type, timezone_name
  ) values (
    '40000000-0000-0000-0000-000000000001', 'Invalid', '1990-01-01', 'male',
    0, 75, 'active', 'maintain', 'UTC'
  )$$),
  '23514',
  'non-positive canonical height is rejected'
);

select is(
  pg_temp.sqlstate_for($$insert into public.profiles (
    user_id, display_name, date_of_birth, sex_for_energy_equation,
    height_cm, weight_kg, activity_category, goal_type, timezone_name
  ) values (
    '40000000-0000-0000-0000-000000000001', 'Invalid', '1990-01-01', 'male',
    175, 75, 'active', 'maintain', 'Not/A_Timezone'
  )$$),
  '23514',
  'unknown timezone names are rejected'
);

insert into public.profiles (
  user_id, display_name, date_of_birth, sex_for_energy_equation,
  height_cm, weight_kg, activity_category, goal_type, timezone_name
) values (
  '40000000-0000-0000-0000-000000000001', 'Valid User', '1990-01-01', 'male',
  175, 75, 'active', 'maintain', 'UTC'
);

select is(
  pg_temp.sqlstate_for($$insert into public.calorie_targets (
    user_id, goal_type, maintenance_kcal, target_kcal, methodology,
    methodology_version, activity_category, input_snapshot, effective_from
  ) values (
    '40000000-0000-0000-0000-000000000001', 'maintain', 0, 2000,
    'Test', '1', 'active', '{}', '2026-01-01 00:00:00+00'
  )$$),
  '23514',
  'non-positive maintenance calories are rejected'
);

select is(
  pg_temp.sqlstate_for($$insert into public.calorie_targets (
    user_id, goal_type, maintenance_kcal, target_kcal, methodology,
    methodology_version, activity_category, input_snapshot, effective_from
  ) values (
    '40000000-0000-0000-0000-000000000001', 'maintain', 2000, 2000,
    'Test', '1', 'active', '[]', '2026-01-01 00:00:00+00'
  )$$),
  '23514',
  'non-object target input snapshots are rejected'
);

select is(
  pg_temp.sqlstate_for($$insert into public.calorie_targets (
    user_id, goal_type, maintenance_kcal, target_kcal, methodology,
    methodology_version, activity_category, input_snapshot, effective_from, effective_to
  ) values (
    '40000000-0000-0000-0000-000000000001', 'maintain', 2000, 2000,
    'Test', '1', 'active', '{}', '2026-02-01 00:00:00+00', '2026-01-01 00:00:00+00'
  )$$),
  '23514',
  'target ranges must end after they begin'
);

insert into public.calorie_targets (
  user_id, goal_type, maintenance_kcal, target_kcal, methodology,
  methodology_version, activity_category, input_snapshot, effective_from
) values (
  '40000000-0000-0000-0000-000000000001', 'maintain', 2000, 2000,
  'Test', '1', 'active', '{}', '2026-01-01 00:00:00+00'
);

select ok(
  pg_temp.sqlstate_for($$insert into public.calorie_targets (
    user_id, goal_type, maintenance_kcal, target_kcal, methodology,
    methodology_version, activity_category, input_snapshot, effective_from
  ) values (
    '40000000-0000-0000-0000-000000000001', 'maintain', 2100, 2100,
    'Test', '2', 'active', '{}', '2027-01-01 00:00:00+00'
  )$$) in ('23505', '23P01'),
  'a user cannot have two current targets'
);

select is(
  pg_temp.sqlstate_for($$insert into public.calorie_targets (
    user_id, goal_type, maintenance_kcal, target_kcal, methodology,
    methodology_version, activity_category, input_snapshot, effective_from, effective_to
  ) values (
    '40000000-0000-0000-0000-000000000001', 'maintain', 1900, 1900,
    'Test', '0', 'inactive', '{}', '2025-06-01 00:00:00+00', '2026-06-01 00:00:00+00'
  )$$),
  '23P01',
  'overlapping target history is rejected'
);

select is(
  pg_temp.sqlstate_for($$insert into public.food_logs (
    user_id, consumed_at, timezone_at_entry, local_date,
    food_id, food_name_snapshot, entered_quantity, entered_unit,
    normalized_amount, normalized_unit, calories_kcal,
    nutrition_dataset_version, source_reference, calculation_snapshot
  ) values (
    '40000000-0000-0000-0000-000000000001',
    '2026-10-03 04:00:00+00', 'Asia/Manila', '2026-10-03',
    'banana', 'Banana', 0, 'grams', 100, 'g', 89,
    'v1-demo', 'Test source', '{}'
  )$$),
  '23514',
  'non-positive entered quantities are rejected'
);

select is(
  pg_temp.sqlstate_for($$insert into public.food_logs (
    user_id, consumed_at, timezone_at_entry, local_date,
    food_id, food_name_snapshot, entered_quantity, entered_unit,
    normalized_amount, normalized_unit, calories_kcal,
    nutrition_dataset_version, source_reference, calculation_snapshot
  ) values (
    '40000000-0000-0000-0000-000000000001',
    '2026-10-03 04:00:00+00', 'Asia/Manila', '2026-10-03',
    'banana', 'Banana', 1, 'servings', 100, 'g', 89,
    'v1-demo', 'Test source', '{}'
  )$$),
  '23514',
  'unsupported entered units are rejected'
);

select is(
  pg_temp.sqlstate_for($$insert into public.food_logs (
    user_id, consumed_at, timezone_at_entry, local_date,
    food_id, food_name_snapshot, entered_quantity, entered_unit,
    normalized_amount, normalized_unit, calories_kcal,
    nutrition_dataset_version, source_reference, calculation_snapshot
  ) values (
    '40000000-0000-0000-0000-000000000001',
    '2026-10-03 04:00:00+00', 'Asia/Manila', '2026-10-03',
    'banana', 'Banana', 100, 'grams', 100, 'kg', 89,
    'v1-demo', 'Test source', '{}'
  )$$),
  '23514',
  'unsupported normalized units are rejected'
);

select is(
  pg_temp.sqlstate_for($$insert into public.food_logs (
    user_id, consumed_at, timezone_at_entry, local_date,
    food_id, food_name_snapshot, entered_quantity, entered_unit,
    normalized_amount, normalized_unit, calories_kcal, protein_g,
    nutrition_dataset_version, source_reference, calculation_snapshot
  ) values (
    '40000000-0000-0000-0000-000000000001',
    '2026-10-03 04:00:00+00', 'Asia/Manila', '2026-10-03',
    'banana', 'Banana', 100, 'grams', 100, 'g', 89, -1,
    'v1-demo', 'Test source', '{}'
  )$$),
  '23514',
  'negative nutrients are rejected'
);

select is(
  pg_temp.sqlstate_for($$insert into public.food_logs (
    user_id, consumed_at, timezone_at_entry, local_date,
    food_id, food_name_snapshot, entered_quantity, entered_unit,
    normalized_amount, normalized_unit, calories_kcal,
    nutrition_dataset_version, source_reference, calculation_snapshot
  ) values (
    '40000000-0000-0000-0000-000000000001',
    '2026-10-03 04:00:00+00', 'Asia/Manila', '2026-10-02',
    'banana', 'Banana', 100, 'grams', 100, 'g', 89,
    'v1-demo', 'Test source', '{}'
  )$$),
  '23514',
  'local_date must match the consumed instant and entry timezone'
);

select is(
  pg_temp.sqlstate_for($$insert into public.food_logs (
    user_id, consumed_at, timezone_at_entry, local_date,
    food_id, food_name_snapshot, entered_quantity, entered_unit,
    normalized_amount, normalized_unit, calories_kcal,
    nutrition_dataset_version, source_reference, calculation_snapshot
  ) values (
    '40000000-0000-0000-0000-000000000001',
    '2026-10-03 04:00:00+00', 'Invalid/Timezone', '2026-10-03',
    'banana', 'Banana', 100, 'grams', 100, 'g', 89,
    'v1-demo', 'Test source', '{}'
  )$$),
  '23514',
  'food-log timezone must be recognized'
);

select is(
  pg_temp.sqlstate_for($$insert into public.food_logs (
    user_id, consumed_at, timezone_at_entry, local_date,
    food_id, food_name_snapshot, entered_quantity, entered_unit,
    normalized_amount, normalized_unit, calories_kcal,
    nutrition_dataset_version, source_reference, calculation_snapshot
  ) values (
    '40000000-0000-0000-0000-000000000001',
    '2026-10-03 04:00:00+00', 'Asia/Manila', '2026-10-03',
    'banana', 'Banana', 100, 'grams', 100, 'g', 89,
    'v1-demo', 'Test source', '[]'
  )$$),
  '23514',
  'non-object calculation snapshots are rejected'
);

insert into public.food_logs (
  user_id, consumed_at, timezone_at_entry, local_date,
  food_id, food_name_snapshot, entered_quantity, entered_unit,
  normalized_amount, normalized_unit, calories_kcal, protein_g, sugar_g,
  nutrition_dataset_version, source_reference, calculation_snapshot
) values (
  '40000000-0000-0000-0000-000000000001',
  '2026-10-03 04:00:00+00', 'Asia/Manila', '2026-10-03',
  'banana', 'Banana', 100, 'grams', 100, 'g', 89, 0, null,
  'v1-demo', 'Test source', '{}'
);

select is((select protein_g from public.food_logs where food_id = 'banana'), 0.0000::numeric, 'explicit zero nutrients remain zero');
select is((select sugar_g from public.food_logs where food_id = 'banana'), null::numeric, 'missing nutrients remain null');

insert into public.profiles (
  user_id, display_name, date_of_birth, sex_for_energy_equation,
  height_cm, weight_kg, activity_category, goal_type, timezone_name
) values (
  '40000000-0000-0000-0000-000000000002', 'Cascade User', '1995-05-05', 'female',
  165, 60, 'inactive', 'maintain', 'UTC'
);

insert into public.calorie_targets (
  user_id, goal_type, maintenance_kcal, target_kcal, methodology,
  methodology_version, activity_category, input_snapshot, effective_from
) values (
  '40000000-0000-0000-0000-000000000002', 'maintain', 1800, 1800,
  'Test', '1', 'inactive', '{}', '2026-01-01 00:00:00+00'
);

insert into public.food_logs (
  user_id, consumed_at, timezone_at_entry, local_date,
  food_id, food_name_snapshot, entered_quantity, entered_unit,
  normalized_amount, normalized_unit, calories_kcal,
  nutrition_dataset_version, source_reference, calculation_snapshot
) values (
  '40000000-0000-0000-0000-000000000002',
  '2026-10-03 04:00:00+00', 'UTC', '2026-10-03',
  'banana', 'Banana', 100, 'grams', 100, 'g', 89,
  'v1-demo', 'Test source', '{}'
);

delete from auth.users where id = '40000000-0000-0000-0000-000000000002';

select is((select count(*)::integer from public.profiles where user_id = '40000000-0000-0000-0000-000000000002'), 0, 'auth deletion cascades to profiles');
select is((select count(*)::integer from public.calorie_targets where user_id = '40000000-0000-0000-0000-000000000002'), 0, 'auth deletion cascades to targets');
select is((select count(*)::integer from public.food_logs where user_id = '40000000-0000-0000-0000-000000000002'), 0, 'auth deletion cascades to food logs');

select * from finish();
rollback;

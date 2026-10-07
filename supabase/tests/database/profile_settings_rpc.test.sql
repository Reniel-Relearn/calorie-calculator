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

select plan(15);

insert into auth.users (id, email) values
  ('70000000-0000-0000-0000-000000000001', 'settings-a@example.test'),
  ('70000000-0000-0000-0000-000000000002', 'settings-b@example.test');

insert into public.profiles (
  user_id, display_name, date_of_birth, sex_for_energy_equation,
  height_cm, weight_kg, activity_category, goal_type, timezone_name
) values
  ('70000000-0000-0000-0000-000000000001', 'Settings A', '1990-01-01', 'female', 165, 63, 'low_active', 'maintain', 'Asia/Manila'),
  ('70000000-0000-0000-0000-000000000002', 'Settings B', '1988-02-02', 'male', 178, 80, 'active', 'maintain', 'UTC');

insert into public.calorie_targets (
  id, user_id, goal_type, maintenance_kcal, target_kcal, methodology,
  methodology_version, activity_category, input_snapshot, assumptions,
  warnings, effective_from
) values
  ('71000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'maintain', 2000, 2000, 'nasem-dri-energy-2023-eer', '1.0.0', 'low_active', '{"ageYears":36,"sexForEnergyEquation":"female","heightCm":165,"weightKg":63,"activityCategory":"low_active","goalType":"maintain"}', '[]', '[]', '2026-01-01 00:00:00+00'),
  ('72000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000002', 'maintain', 2400, 2400, 'nasem-dri-energy-2023-eer', '1.0.0', 'active', '{"ageYears":38,"sexForEnergyEquation":"male","heightCm":178,"weightKg":80,"activityCategory":"active","goalType":"maintain"}', '[]', '[]', '2026-01-01 00:00:00+00');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"70000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

select lives_ok(
  $$select public.update_profile_settings(
    'Renamed A', '1990-01-01', 'female', 165, 63,
    'low_active', 'maintain', 'Asia/Manila'
  )$$,
  'display-name-only update succeeds without target input'
);
select is((select display_name from public.profiles where user_id = '70000000-0000-0000-0000-000000000001'), 'Renamed A', 'display name is updated');
select is((select count(*)::integer from public.calorie_targets where user_id = '70000000-0000-0000-0000-000000000001'), 1, 'name-only update creates no target row');
select is((select effective_to from public.calorie_targets where id = '71000000-0000-0000-0000-000000000001'), null::timestamptz, 'name-only update keeps current target open');

select lives_ok(
  $$select public.update_profile_settings(
    'Renamed A', '1990-01-01', 'female', 165, 64,
    'active', 'maintain', 'UTC',
    2150, 2150, 'nasem-dri-energy-2023-eer', '1.0.0',
    '{"ageYears":36,"sexForEnergyEquation":"female","heightCm":165,"weightKg":64,"activityCategory":"active","goalType":"maintain"}',
    '[]', '[]'
  )$$,
  'target-affecting settings update succeeds atomically'
);
select is((select weight_kg from public.profiles where user_id = '70000000-0000-0000-0000-000000000001'), 64.00::numeric, 'canonical profile values are updated');
select is((select timezone_name from public.profiles where user_id = '70000000-0000-0000-0000-000000000001'), 'UTC', 'timezone update is persisted for future entries');
select is((select count(*)::integer from public.calorie_targets where user_id = '70000000-0000-0000-0000-000000000001'), 2, 'target-affecting update creates one history row');
select ok((select effective_to is not null from public.calorie_targets where id = '71000000-0000-0000-0000-000000000001'), 'prior target is closed');
select is((select target_kcal from public.calorie_targets where user_id = '70000000-0000-0000-0000-000000000001' and effective_to is null), 2150.00::numeric, 'new target is current');

select is(
  pg_temp.sqlstate_for($$select public.update_profile_settings(
    'Broken', '1990-01-01', 'female', 165, 65,
    'active', 'maintain', 'UTC',
    2200, 2200, 'wrong-method', '1.0.0',
    '{"ageYears":36,"sexForEnergyEquation":"female","heightCm":165,"weightKg":65,"activityCategory":"active","goalType":"maintain"}',
    '[]', '[]'
  )$$),
  '23514',
  'invalid target metadata rejects the full settings update'
);
select is((select weight_kg from public.profiles where user_id = '70000000-0000-0000-0000-000000000001'), 64.00::numeric, 'failed atomic update leaves profile unchanged');
select is((select count(*)::integer from public.calorie_targets where user_id = '70000000-0000-0000-0000-000000000001'), 2, 'failed atomic update creates no target');

reset role;
select is((select display_name from public.profiles where user_id = '70000000-0000-0000-0000-000000000002'), 'Settings B', 'another user profile is unchanged');

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select is(
  pg_temp.sqlstate_for($$select public.update_profile_settings(
    'Anonymous', '1990-01-01', 'female', 165, 63,
    'low_active', 'maintain', 'UTC'
  )$$),
  '42501',
  'anonymous caller cannot execute settings RPC'
);

select * from finish();
rollback;

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

create function pg_temp.complete_onboarding(
  display_name text,
  maintenance_kcal numeric default 2200,
  date_of_birth date default '1990-01-01'
)
returns jsonb
language sql
as $$
  select public.complete_profile_onboarding(
    display_name,
    date_of_birth,
    'female',
    165,
    63,
    'low_active',
    'maintain',
    'Asia/Manila',
    maintenance_kcal,
    maintenance_kcal,
    'nasem-dri-energy-2023-eer',
    '1.0.0',
    '{"ageYears":36,"sexForEnergyEquation":"female","heightCm":165,"weightKg":63,"activityCategory":"low_active","goalType":"maintain"}'::jsonb,
    '["test assumption"]'::jsonb,
    '[{"code":"TEST_WARNING","message":"test warning"}]'::jsonb
  );
$$;

select plan(28);

select ok(
  to_regprocedure('public.complete_profile_onboarding(text,date,text,numeric,numeric,text,text,text,numeric,numeric,text,text,jsonb,jsonb,jsonb)') is not null,
  'atomic onboarding function exists'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.complete_profile_onboarding(text,date,text,numeric,numeric,text,text,text,numeric,numeric,text,text,jsonb,jsonb,jsonb)',
    'execute'
  ),
  'authenticated users can execute atomic onboarding'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.complete_profile_onboarding(text,date,text,numeric,numeric,text,text,text,numeric,numeric,text,text,jsonb,jsonb,jsonb)',
    'execute'
  ),
  'anonymous users cannot execute atomic onboarding'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.validate_v2_energy_target_payload(date,date,text,numeric,numeric,text,text,numeric,numeric,text,text,jsonb,jsonb,jsonb)',
    'execute'
  ),
  'clients cannot call the trusted target-payload validator directly'
);

insert into auth.users (id, email) values
  ('50000000-0000-0000-0000-000000000001', 'onboarding-a@example.test'),
  ('50000000-0000-0000-0000-000000000002', 'onboarding-b@example.test'),
  ('50000000-0000-0000-0000-000000000003', 'onboarding-c@example.test');

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"50000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);

select lives_ok(
  $$select pg_temp.complete_onboarding('Onboarding User')$$,
  'authenticated user atomically completes onboarding'
);
select is((select count(*)::integer from public.profiles), 1, 'onboarding creates one visible profile');
select is((select count(*)::integer from public.calorie_targets), 1, 'onboarding creates one visible target');
select is((select display_name from public.profiles), 'Onboarding User', 'profile values are stored');
select is((select target_kcal from public.calorie_targets), 2200.00::numeric, 'maintenance target is stored');
select ok(
  (
    select methodology = 'nasem-dri-energy-2023-eer'
      and methodology_version = '1.0.0'
      and input_snapshot ->> 'activityCategory' = 'low_active'
      and effective_from is not null
      and effective_to is null
    from public.calorie_targets
  ),
  'target history stores methodology, canonical snapshot, and a current effective range'
);
select ok(
  not ((select input_snapshot from public.calorie_targets) ? 'lifeStageEligibilityConfirmed'),
  'nonpersistent eligibility confirmation is absent from target history'
);
select is(
  (pg_temp.complete_onboarding('Onboarding User') ->> 'idempotent')::boolean,
  true,
  'an identical retry returns the existing atomic result'
);
select is((select count(*)::integer from public.calorie_targets), 1, 'an identical retry creates no duplicate target');
select is(
  pg_temp.sqlstate_for($$select pg_temp.complete_onboarding('Changed Name')$$),
  'P0001',
  'a changed retry cannot overwrite completed onboarding'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"50000000-0000-0000-0000-000000000002","role":"authenticated"}',
  true
);
select is(
  pg_temp.sqlstate_for($$select pg_temp.complete_onboarding('Underage User', 2200, '2010-01-01')$$),
  '23514',
  'database onboarding rejects an underage profile'
);
select is(
  pg_temp.sqlstate_for($$select pg_temp.complete_onboarding('Rollback User', -1)$$),
  '23514',
  'a target constraint failure aborts onboarding'
);
select is((select count(*)::integer from public.profiles), 0, 'failed onboarding rolls back the profile insert');
select is((select count(*)::integer from public.calorie_targets), 0, 'failed onboarding leaves no target');
select is(
  pg_temp.sqlstate_for($$select public.complete_profile_onboarding(
    'Age Boundary', ((statement_timestamp() at time zone 'Asia/Manila')::date - interval '18 years')::date, 'female', 165, 63,
    'low_active', 'gain', 'Asia/Manila', 2200, 2672.36,
    'nasem-dri-energy-2023-directional-sepv', '1.0.0',
    '{"ageYears":18,"sexForEnergyEquation":"female","heightCm":165,"weightKg":63,"activityCategory":"low_active","goalType":"gain","directionalAdjustment":{"method":"prediction_interval_boundary","sepvKcal":241,"multiplier":1.96,"adjustmentKcal":472.36,"direction":"add","safetyPolicyVersion":"1.0.0"}}',
    '[]', '[]'
  )$$),
  '23514',
  'database keeps age 18 directional targets unavailable'
);
select is(
  pg_temp.sqlstate_for($$select public.complete_profile_onboarding(
    'Underweight Lose', '1990-01-01', 'female', 180, 58,
    'low_active', 'lose', 'Asia/Manila', 2000, 1527.64,
    'nasem-dri-energy-2023-directional-sepv', '1.0.0',
    '{"ageYears":36,"sexForEnergyEquation":"female","heightCm":180,"weightKg":58,"activityCategory":"low_active","goalType":"lose","directionalAdjustment":{"method":"prediction_interval_boundary","sepvKcal":241,"multiplier":1.96,"adjustmentKcal":472.36,"direction":"subtract","safetyPolicyVersion":"1.0.0"}}',
    '[]', '[]'
  )$$),
  '23514',
  'database blocks Lose below BMI 18.5'
);
select is(
  pg_temp.sqlstate_for($$select public.complete_profile_onboarding(
    'Severe Underweight Gain', '1990-01-01', 'female', 180, 50,
    'low_active', 'gain', 'Asia/Manila', 2000, 2472.36,
    'nasem-dri-energy-2023-directional-sepv', '1.0.0',
    '{"ageYears":36,"sexForEnergyEquation":"female","heightCm":180,"weightKg":50,"activityCategory":"low_active","goalType":"gain","directionalAdjustment":{"method":"prediction_interval_boundary","sepvKcal":241,"multiplier":1.96,"adjustmentKcal":472.36,"direction":"add","safetyPolicyVersion":"1.0.0"}}',
    '[]', '[]'
  )$$),
  '23514',
  'database blocks directional targets below BMI 16'
);
select is(
  pg_temp.sqlstate_for($$select public.complete_profile_onboarding(
    'Low Intake Lose', '1990-01-01', 'female', 140, 37,
    'inactive', 'lose', 'Asia/Manila', 1600, 1127.64,
    'nasem-dri-energy-2023-directional-sepv', '1.0.0',
    '{"ageYears":36,"sexForEnergyEquation":"female","heightCm":140,"weightKg":37,"activityCategory":"inactive","goalType":"lose","directionalAdjustment":{"method":"prediction_interval_boundary","sepvKcal":241,"multiplier":1.96,"adjustmentKcal":472.36,"direction":"subtract","safetyPolicyVersion":"1.0.0"}}',
    '[]', '[]'
  )$$),
  '23514',
  'database rejects a Lose target below the CalorieCheck safety boundary'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"50000000-0000-0000-0000-000000000003","role":"authenticated"}',
  true
);
select lives_ok(
  $$select public.complete_profile_onboarding(
    'Directional User', '1990-01-01', 'female', 165, 63,
    'low_active', 'gain', 'Asia/Manila', 2200, 2672.36,
    'nasem-dri-energy-2023-directional-sepv', '1.0.0',
    '{"ageYears":36,"sexForEnergyEquation":"female","heightCm":165,"weightKg":63,"activityCategory":"low_active","goalType":"gain","directionalAdjustment":{"method":"prediction_interval_boundary","sepvKcal":241,"multiplier":1.96,"adjustmentKcal":472.36,"direction":"add","safetyPolicyVersion":"1.0.0"}}',
    '[]', '[]'
  )$$,
  'eligible adult can complete onboarding with a directional target'
);
select is((select goal_type from public.profiles), 'gain', 'directional goal is stored on the profile');
select is(
  (select methodology from public.calorie_targets),
  'nasem-dri-energy-2023-directional-sepv',
  'directional target stores the versioned methodology'
);
select ok(
  not ((select input_snapshot from public.calorie_targets) ? 'directionalSafetyEligibilityConfirmed'),
  'directional safety confirmation is not persisted'
);
select is(
  pg_temp.sqlstate_for($$select public.complete_profile_onboarding(
    'Directional User', '1990-01-01', 'female', 165, 63,
    'low_active', 'gain', 'Asia/Manila', 2200, 2500,
    'nasem-dri-energy-2023-directional-sepv', '1.0.0',
    '{"ageYears":36,"sexForEnergyEquation":"female","heightCm":165,"weightKg":63,"activityCategory":"low_active","goalType":"gain","directionalAdjustment":{"method":"prediction_interval_boundary","sepvKcal":241,"multiplier":1.96,"adjustmentKcal":472.36,"direction":"add","safetyPolicyVersion":"1.0.0"}}',
    '[]', '[]'
  )$$),
  '23514',
  'database rejects forged directional target arithmetic'
);

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select is(
  pg_temp.sqlstate_for($$select pg_temp.complete_onboarding('Anonymous User')$$),
  '42501',
  'anonymous onboarding execution is denied'
);

select * from finish();
rollback;

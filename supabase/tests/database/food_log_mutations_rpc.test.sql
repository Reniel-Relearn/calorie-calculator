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

select plan(10);

insert into auth.users (id, email) values
  ('80000000-0000-0000-0000-000000000001', 'edit-a@example.test'),
  ('80000000-0000-0000-0000-000000000002', 'edit-b@example.test');

insert into public.food_logs (
  id, user_id, consumed_at, timezone_at_entry, local_date,
  food_id, food_name_snapshot, entered_quantity, entered_unit,
  normalized_amount, normalized_unit, calories_kcal, protein_g,
  fiber_g, sugar_g, nutrition_dataset_version, source_reference,
  calculation_snapshot
) values
  (
    '81000000-0000-0000-0000-000000000001',
    '80000000-0000-0000-0000-000000000001',
    '2026-10-07 04:00:00+00', 'Asia/Manila', '2026-10-07',
    'cooked-white-rice', 'Cooked White Rice', 1, 'cups',
    158, 'g', 205.4, 4.2502, 0, null, '1.1.0', 'USDA test',
    '{"schemaVersion":"1.0.0","dataset":{"name":"Demo","version":"1.1.0"},"food":{"id":"cooked-white-rice","name":"Cooked White Rice"},"reference":{"amount":100,"unit":"g","nutrition":{"caloriesKcal":130,"proteinG":2.69,"carbohydratesG":28.17,"fatG":0.28,"fiberG":0,"sugarG":null,"sodiumMg":1}},"serving":{"enteredQuantity":1,"enteredUnit":"cups","enteredDescriptor":null,"normalizedAmount":158,"normalizedUnit":"g","conversionType":"unit","conversionMetadata":{"gramsPerUnit":158}},"calculation":{"scaleFactor":1.58,"nutrition":{"caloriesKcal":205.4,"proteinG":4.2502,"carbohydratesG":44.5086,"fatG":0.4424,"fiberG":0,"sugarG":null,"sodiumMg":1.58}}}'
  ),
  (
    '82000000-0000-0000-0000-000000000001',
    '80000000-0000-0000-0000-000000000002',
    '2026-10-07 04:00:00+00', 'Asia/Manila', '2026-10-07',
    'banana', 'Banana', 100, 'grams', 100, 'g', 89, 1.09, 2.6, 12.23,
    '1.1.0', 'USDA test', '{}'
  );

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"80000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

select lives_ok(
  $$select public.update_food_log(
    '81000000-0000-0000-0000-000000000001',
    '2026-10-07 16:30:00+00', 'Asia/Manila', '2026-10-08',
    2, 'cups', null, 316, 'g', 410.8, 8.5004, 89.0172,
    0.8848, 0, null, 3.16,
    '{"schemaVersion":"1.0.0","dataset":{"name":"Demo","version":"1.1.0"},"food":{"id":"cooked-white-rice","name":"Cooked White Rice"},"reference":{"amount":100,"unit":"g","nutrition":{"caloriesKcal":130,"proteinG":2.69,"carbohydratesG":28.17,"fatG":0.28,"fiberG":0,"sugarG":null,"sodiumMg":1}},"serving":{"enteredQuantity":2,"enteredUnit":"cups","enteredDescriptor":null,"normalizedAmount":316,"normalizedUnit":"g","conversionType":"unit","conversionMetadata":{"gramsPerUnit":158}},"calculation":{"scaleFactor":3.16,"nutrition":{"caloriesKcal":410.8,"proteinG":8.5004,"carbohydratesG":89.0172,"fatG":0.8848,"fiberG":0,"sugarG":null,"sodiumMg":3.16}}}'
  )$$,
  'owner can edit serving and local date from the captured snapshot'
);
select is((select local_date from public.food_logs where id = '81000000-0000-0000-0000-000000000001'), '2026-10-08'::date, 'edited local date is stored');
select is((select normalized_amount from public.food_logs where id = '81000000-0000-0000-0000-000000000001'), 316.000000::numeric, 'edited serving normalization is stored');
select is((select fiber_g from public.food_logs where id = '81000000-0000-0000-0000-000000000001'), 0.0000::numeric, 'explicit zero remains zero after edit');
select is((select sugar_g from public.food_logs where id = '81000000-0000-0000-0000-000000000001'), null::numeric, 'missing nutrient remains null after edit');

select is(
  pg_temp.sqlstate_for($$select public.update_food_log(
    '82000000-0000-0000-0000-000000000001',
    '2026-10-07 04:00:00+00', 'Asia/Manila', '2026-10-07',
    100, 'grams', null, 100, 'g', 89, 1.09, null, null, null, null, null,
    '{}'
  )$$),
  'P0002',
  'cross-user edit is not disclosed or applied'
);
select is((select food_name_snapshot from public.food_logs where id = '82000000-0000-0000-0000-000000000001'), null::text, 'cross-user row remains invisible');

select is(
  pg_temp.sqlstate_for($$update public.food_logs
    set entered_quantity = 3
    where id = '81000000-0000-0000-0000-000000000001'$$),
  '42501',
  'direct update cannot bypass the snapshot RPC'
);
select is((select entered_quantity from public.food_logs where id = '81000000-0000-0000-0000-000000000001'), 2.000000::numeric, 'denied direct update changes nothing');

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select is(
  pg_temp.sqlstate_for($$select public.update_food_log(
    '81000000-0000-0000-0000-000000000001',
    '2026-10-07 16:30:00+00', 'Asia/Manila', '2026-10-08',
    2, 'cups', null, 316, 'g', 410.8, 8.5004, 89.0172,
    0.8848, 0, null, 3.16, '{}'
  )$$),
  '42501',
  'anonymous caller cannot execute food-log edit RPC'
);

select * from finish();
rollback;

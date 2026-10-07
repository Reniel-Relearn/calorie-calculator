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

create function pg_temp.row_count_for(statement text)
returns integer
language plpgsql
as $$
declare
  affected integer;
begin
  execute statement;
  get diagnostics affected = row_count;
  return affected;
end;
$$;

select plan(12);

insert into auth.users (id, email) values
  ('30000000-0000-0000-0000-000000000001', 'log-a@example.test'),
  ('30000000-0000-0000-0000-000000000002', 'log-b@example.test');

insert into public.food_logs (
  id, user_id, consumed_at, timezone_at_entry, local_date,
  food_id, food_name_snapshot, entered_quantity, entered_unit,
  normalized_amount, normalized_unit, calories_kcal, protein_g,
  nutrition_dataset_version, source_reference, calculation_snapshot
) values
  (
    '31000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '2026-10-03 04:00:00+00', 'Asia/Manila', '2026-10-03',
    'banana', 'Banana', 100, 'grams', 100, 'g', 89, 1.1,
    'v1-demo', 'Test source', '{"reference":{"amount":100,"unit":"g"}}'
  ),
  (
    '32000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002',
    '2026-10-03 04:00:00+00', 'Asia/Manila', '2026-10-03',
    'cooked-white-rice', 'Cooked White Rice', 100, 'grams', 100, 'g', 130, 2.7,
    'v1-demo', 'Test source', '{"reference":{"amount":100,"unit":"g"}}'
  );

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"30000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);

select is((select count(*)::integer from public.food_logs), 1, 'User A sees only their own food logs');
select is((select food_id from public.food_logs), 'banana', 'User A reads their own food log');

select is(
  (select pg_temp.sqlstate_for(
  $$insert into public.food_logs (
      user_id, consumed_at, timezone_at_entry, local_date,
      food_id, food_name_snapshot, entered_quantity, entered_unit,
      normalized_amount, normalized_unit, calories_kcal,
      nutrition_dataset_version, source_reference, calculation_snapshot
    ) values (
      '30000000-0000-0000-0000-000000000001',
      '2026-10-04 04:00:00+00', 'Asia/Manila', '2026-10-04',
      'whole-milk', 'Whole Milk', 250, 'milliliters', 250, 'ml', 152.5,
      'v1-demo', 'Test source', '{"reference":{"amount":100,"unit":"ml"}}'
    )$$)),
  '42501',
  'User A cannot bypass the owner-derived food-log RPC with a direct insert'
);

select is(
  (select pg_temp.sqlstate_for($$insert into public.food_logs (
      user_id, consumed_at, timezone_at_entry, local_date,
      food_id, food_name_snapshot, entered_quantity, entered_unit,
      normalized_amount, normalized_unit, calories_kcal,
      nutrition_dataset_version, source_reference, calculation_snapshot
    ) values (
      '30000000-0000-0000-0000-000000000002',
      '2026-10-04 04:00:00+00', 'Asia/Manila', '2026-10-04',
      'banana', 'Banana', 100, 'grams', 100, 'g', 89,
      'v1-demo', 'Test source', '{"reference":{"amount":100,"unit":"g"}}'
    )$$)),
  '42501',
  'User A cannot insert a food log for User B'
);

select is(
  (select pg_temp.sqlstate_for($$update public.food_logs
    set entered_quantity = 125, normalized_amount = 125
    where id = '31000000-0000-0000-0000-000000000001'$$)),
  '42501',
  'User A cannot bypass the captured-snapshot edit RPC'
);
select is((select normalized_amount from public.food_logs where id = '31000000-0000-0000-0000-000000000001'), 100.000000::numeric, 'denied direct update changes nothing');

select is(
  (select pg_temp.sqlstate_for($$update public.food_logs set food_name_snapshot = 'Tampered'
    where id = '32000000-0000-0000-0000-000000000001'$$)),
  '42501',
  'cross-user direct food-log update is denied'
);

select is(
  (select pg_temp.sqlstate_for($$update public.food_logs
    set user_id = '30000000-0000-0000-0000-000000000002'
    where id = '31000000-0000-0000-0000-000000000001'$$)),
  '42501',
  'User A cannot reassign food-log ownership'
);

select is(
  pg_temp.row_count_for($$delete from public.food_logs
    where id = '31000000-0000-0000-0000-000000000001'$$),
  1,
  'User A can delete their own food log'
);
select is(
  pg_temp.row_count_for($$delete from public.food_logs
    where id = '32000000-0000-0000-0000-000000000001'$$),
  0,
  'cross-user food-log delete affects no row'
);

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select is(
  (select pg_temp.sqlstate_for('select * from public.food_logs')),
  '42501',
  'an unauthenticated client cannot read food logs'
);

select is(
  (select pg_temp.sqlstate_for($$insert into public.food_logs (
      user_id, consumed_at, timezone_at_entry, local_date,
      food_id, food_name_snapshot, entered_quantity, entered_unit,
      normalized_amount, normalized_unit, calories_kcal,
      nutrition_dataset_version, source_reference, calculation_snapshot
    ) values (
      '30000000-0000-0000-0000-000000000001',
      '2026-10-05 04:00:00+00', 'Asia/Manila', '2026-10-05',
      'banana', 'Banana', 100, 'grams', 100, 'g', 89,
      'v1-demo', 'Test source', '{}'
    )$$)),
  '42501',
  'an unauthenticated client cannot insert food logs'
);

select * from finish();
rollback;

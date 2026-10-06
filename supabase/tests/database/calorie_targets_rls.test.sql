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
  ('20000000-0000-0000-0000-000000000001', 'target-a@example.test'),
  ('20000000-0000-0000-0000-000000000002', 'target-b@example.test');

insert into public.calorie_targets (
  user_id, goal_type, maintenance_kcal, target_kcal, methodology,
  methodology_version, activity_category, input_snapshot, effective_from
) values
  (
    '20000000-0000-0000-0000-000000000001', 'maintain', 2200, 2200,
    'Test method', 'test-1', 'active', '{"source":"test"}', '2026-01-01 00:00:00+00'
  ),
  (
    '20000000-0000-0000-0000-000000000002', 'maintain', 1900, 1900,
    'Test method', 'test-1', 'inactive', '{"source":"test"}', '2026-01-01 00:00:00+00'
  );

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"20000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);

select is((select count(*)::integer from public.calorie_targets), 1, 'User A sees only their own target history');
select is((select maintenance_kcal from public.calorie_targets), 2200.00::numeric, 'User A reads their own target');

select is(
  (select pg_temp.sqlstate_for(
  $$insert into public.calorie_targets (
      user_id, goal_type, maintenance_kcal, target_kcal, methodology,
      methodology_version, activity_category, input_snapshot, effective_from, effective_to
    ) values (
      '20000000-0000-0000-0000-000000000001', 'maintain', 2100, 2100,
      'Earlier test method', 'test-0', 'low_active', '{"source":"test"}',
      '2025-01-01 00:00:00+00', '2026-01-01 00:00:00+00'
    )$$)),
  '42501',
  'User A cannot bypass atomic target creation with a direct insert'
);

select is(
  (select pg_temp.sqlstate_for($$insert into public.calorie_targets (
      user_id, goal_type, maintenance_kcal, target_kcal, methodology,
      methodology_version, activity_category, input_snapshot, effective_from, effective_to
    ) values (
      '20000000-0000-0000-0000-000000000002', 'maintain', 1800, 1800,
      'Spoofed', 'test-0', 'inactive', '{"source":"test"}',
      '2025-01-01 00:00:00+00', '2026-01-01 00:00:00+00'
    )$$)),
  '42501',
  'User A cannot insert target history for User B'
);

select is(
  (select pg_temp.sqlstate_for($$update public.calorie_targets
    set effective_to = '2027-01-01 00:00:00+00'
    where user_id = '20000000-0000-0000-0000-000000000001'
      and effective_to is null$$)),
  '42501',
  'User A cannot close a target outside a target-history RPC'
);
select is(
  (select effective_to from public.calorie_targets where effective_from = '2026-01-01 00:00:00+00'),
  null::timestamptz,
  'denied target closure changes nothing'
);

select is(
  (select pg_temp.sqlstate_for($$update public.calorie_targets
    set effective_to = '2027-01-01 00:00:00+00'
    where user_id = '20000000-0000-0000-0000-000000000002'$$)),
  '42501',
  'direct cross-user target update is denied'
);

select is(
  (select pg_temp.sqlstate_for($$update public.calorie_targets
    set maintenance_kcal = 9999
    where user_id = '20000000-0000-0000-0000-000000000001'$$)),
  '42501',
  'immutable target values cannot be updated by the client'
);

select is(
  (select pg_temp.sqlstate_for($$update public.calorie_targets
    set user_id = '20000000-0000-0000-0000-000000000002'
    where user_id = '20000000-0000-0000-0000-000000000001'$$)),
  '42501',
  'User A cannot reassign target ownership'
);

select ok(
  not has_table_privilege('authenticated', 'public.calorie_targets', 'delete'),
  'authenticated users cannot delete target history'
);

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select is(
  (select pg_temp.sqlstate_for('select * from public.calorie_targets')),
  '42501',
  'an unauthenticated client cannot read targets'
);

select is(
  (select pg_temp.sqlstate_for($$insert into public.calorie_targets (
      user_id, goal_type, maintenance_kcal, target_kcal, methodology,
      methodology_version, activity_category, input_snapshot, effective_from
    ) values (
      '20000000-0000-0000-0000-000000000001', 'maintain', 2000, 2000,
      'Anonymous', 'test', 'inactive', '{}', '2030-01-01 00:00:00+00'
    )$$)),
  '42501',
  'an unauthenticated client cannot insert targets'
);

select * from finish();
rollback;

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

select plan(10);

insert into auth.users (id, email) values
  ('10000000-0000-0000-0000-000000000001', 'profile-a@example.test'),
  ('10000000-0000-0000-0000-000000000002', 'profile-b@example.test'),
  ('10000000-0000-0000-0000-000000000003', 'profile-c@example.test');

insert into public.profiles (
  user_id, display_name, date_of_birth, sex_for_energy_equation,
  height_cm, weight_kg, activity_category, goal_type, timezone_name
) values
  (
    '10000000-0000-0000-0000-000000000001', 'User A', '1991-02-03', 'male',
    175, 72, 'low_active', 'maintain', 'Asia/Manila'
  ),
  (
    '10000000-0000-0000-0000-000000000002', 'User B', '1990-01-01', 'female',
    160, 55, 'active', 'maintain', 'Asia/Manila'
  );

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);

select is(
  (select pg_temp.sqlstate_for(
  $$insert into public.profiles (
      user_id, display_name, date_of_birth, sex_for_energy_equation,
      height_cm, weight_kg, activity_category, goal_type, timezone_name
    ) values (
      '10000000-0000-0000-0000-000000000001', 'User A', '1991-02-03', 'male',
      175, 72, 'low_active', 'maintain', 'Asia/Manila'
    )$$)),
  '42501',
  'User A cannot bypass atomic onboarding with a direct profile insert'
);

select is((select count(*)::integer from public.profiles), 1, 'User A sees only their own profile');
select is((select display_name from public.profiles), 'User A', 'User A reads their own profile');

select is(
  (select pg_temp.sqlstate_for($$update public.profiles set display_name = 'User A Updated'
    where user_id = '10000000-0000-0000-0000-000000000001'$$)),
  '42501',
  'User A cannot bypass target-aware profile updates'
);
select is((select display_name from public.profiles), 'User A', 'denied profile update changes nothing');

select is(
  (select pg_temp.sqlstate_for($$insert into public.profiles (
      user_id, display_name, date_of_birth, sex_for_energy_equation,
      height_cm, weight_kg, activity_category, goal_type, timezone_name
    ) values (
      '10000000-0000-0000-0000-000000000003', 'Spoofed', '1992-01-01', 'male',
      170, 70, 'inactive', 'maintain', 'UTC'
    )$$)),
  '42501',
  'User A cannot insert a profile owned by another user'
);

select is(
  (select pg_temp.sqlstate_for($$update public.profiles set display_name = 'Tampered'
    where user_id = '10000000-0000-0000-0000-000000000002'$$)),
  '42501',
  'direct cross-user profile update is denied'
);

select is(
  (select pg_temp.sqlstate_for($$update public.profiles
    set user_id = '10000000-0000-0000-0000-000000000003'
    where user_id = '10000000-0000-0000-0000-000000000001'$$)),
  '42501',
  'User A cannot reassign profile ownership'
);

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select is(
  (select pg_temp.sqlstate_for('select * from public.profiles')),
  '42501',
  'an unauthenticated client cannot read profiles'
);

select is(
  (select pg_temp.sqlstate_for($$insert into public.profiles (
      user_id, display_name, date_of_birth, sex_for_energy_equation,
      height_cm, weight_kg, activity_category, goal_type, timezone_name
    ) values (
      '10000000-0000-0000-0000-000000000003', 'Anonymous', '1992-01-01', 'male',
      170, 70, 'inactive', 'maintain', 'UTC'
    )$$)),
  '42501',
  'an unauthenticated client cannot insert profiles'
);

select * from finish();
rollback;

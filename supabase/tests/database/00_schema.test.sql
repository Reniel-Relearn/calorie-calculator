begin;

create extension if not exists pgtap with schema extensions;

select plan(45);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'calorie_targets', 'calorie_targets table exists');
select has_table('public', 'food_logs', 'food_logs table exists');

select has_column('public', 'profiles', 'user_id', 'profiles has an owner key');
select has_column('public', 'profiles', 'timezone_name', 'profiles stores an IANA timezone name');
select has_column('public', 'calorie_targets', 'input_snapshot', 'targets store an input snapshot');
select has_column('public', 'calorie_targets', 'effective_to', 'targets support effective history');
select has_column('public', 'food_logs', 'local_date', 'food logs store a stable local date');
select has_column('public', 'food_logs', 'calculation_snapshot', 'food logs store a calculation snapshot');

select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.profiles'::regclass),
  'profiles has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.calorie_targets'::regclass),
  'calorie_targets has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.food_logs'::regclass),
  'food_logs has RLS enabled'
);

select is(
  (select count(*)::integer from pg_catalog.pg_policies where schemaname = 'public' and tablename = 'profiles'),
  3,
  'profiles has separate select, insert, and update policies'
);
select is(
  (select count(*)::integer from pg_catalog.pg_policies where schemaname = 'public' and tablename = 'calorie_targets'),
  3,
  'calorie_targets has separate select, insert, and update policies'
);
select is(
  (select count(*)::integer from pg_catalog.pg_policies where schemaname = 'public' and tablename = 'food_logs'),
  4,
  'food_logs has separate select, insert, update, and delete policies'
);

select ok(not has_table_privilege('anon', 'public.profiles', 'select'), 'anon cannot select profiles');
select ok(not has_table_privilege('anon', 'public.calorie_targets', 'select'), 'anon cannot select targets');
select ok(not has_table_privilege('anon', 'public.food_logs', 'select'), 'anon cannot select food logs');

select ok(has_table_privilege('authenticated', 'public.profiles', 'select'), 'authenticated can select profiles');
select ok(not has_table_privilege('authenticated', 'public.profiles', 'insert'), 'profiles has no broad insert grant');
select ok(not has_column_privilege('authenticated', 'public.profiles', 'user_id', 'insert'), 'authenticated cannot bypass atomic profile creation');
select ok(not has_column_privilege('authenticated', 'public.profiles', 'created_at', 'insert'), 'authenticated cannot set profile creation time');
select ok(not has_table_privilege('authenticated', 'public.profiles', 'update'), 'profiles has no broad update grant');
select ok(not has_column_privilege('authenticated', 'public.profiles', 'display_name', 'update'), 'authenticated cannot bypass target-aware profile updates');
select ok(not has_column_privilege('authenticated', 'public.profiles', 'user_id', 'update'), 'authenticated cannot update profile ownership');
select ok(not has_table_privilege('authenticated', 'public.profiles', 'delete'), 'authenticated cannot delete profiles directly');

select ok(has_table_privilege('authenticated', 'public.calorie_targets', 'select'), 'authenticated can select targets');
select ok(not has_table_privilege('authenticated', 'public.calorie_targets', 'insert'), 'targets has no broad insert grant');
select ok(not has_column_privilege('authenticated', 'public.calorie_targets', 'user_id', 'insert'), 'authenticated cannot bypass atomic target creation');
select ok(not has_column_privilege('authenticated', 'public.calorie_targets', 'created_at', 'insert'), 'authenticated cannot set target creation time');
select ok(not has_column_privilege('authenticated', 'public.calorie_targets', 'effective_to', 'update'), 'authenticated cannot close target ranges outside a target-history RPC');
select ok(not has_column_privilege('authenticated', 'public.calorie_targets', 'maintenance_kcal', 'update'), 'authenticated cannot rewrite target values');
select ok(not has_table_privilege('authenticated', 'public.calorie_targets', 'delete'), 'authenticated cannot delete target history');

select ok(has_table_privilege('authenticated', 'public.food_logs', 'select'), 'authenticated can select food logs');
select ok(not has_table_privilege('authenticated', 'public.food_logs', 'insert'), 'food_logs has no broad insert grant');
select ok(not has_column_privilege('authenticated', 'public.food_logs', 'user_id', 'insert'), 'authenticated cannot insert food-log ownership directly');
select ok(not has_column_privilege('authenticated', 'public.food_logs', 'created_at', 'insert'), 'authenticated cannot set food-log creation time');
select ok(not has_table_privilege('authenticated', 'public.food_logs', 'update'), 'food_logs has no broad update grant');
select ok(has_column_privilege('authenticated', 'public.food_logs', 'entered_quantity', 'update'), 'authenticated can update serving values');
select ok(not has_column_privilege('authenticated', 'public.food_logs', 'user_id', 'update'), 'authenticated cannot update food-log ownership');
select ok(has_table_privilege('authenticated', 'public.food_logs', 'delete'), 'authenticated can delete food logs');

select has_index('public', 'calorie_targets', 'calorie_targets_one_current_idx', 'one-current-target unique index exists');

select ok(
  to_regprocedure('public.create_food_log(uuid,timestamp with time zone,text,date,text,text,numeric,text,text,numeric,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,text,text,jsonb)') is not null,
  'create_food_log RPC exists with the reviewed signature'
);
select ok(
  has_function_privilege('authenticated', 'public.create_food_log(uuid,timestamp with time zone,text,date,text,text,numeric,text,text,numeric,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,text,text,jsonb)', 'execute'),
  'authenticated can execute create_food_log'
);
select ok(
  not has_function_privilege('anon', 'public.create_food_log(uuid,timestamp with time zone,text,date,text,text,numeric,text,text,numeric,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,text,text,jsonb)', 'execute'),
  'anon cannot execute create_food_log'
);

select * from finish();
rollback;

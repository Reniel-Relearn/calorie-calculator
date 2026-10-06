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

create function pg_temp.create_log(
  request_id uuid,
  food_name text default 'Banana'
)
returns jsonb
language sql
as $$
  select public.create_food_log(
    request_id,
    '2026-10-07 04:30:00+00',
    'Asia/Manila',
    '2026-10-07',
    'banana',
    food_name,
    100,
    'grams',
    null,
    100,
    'g',
    89,
    1.09,
    22.84,
    0.33,
    2.6,
    12.23,
    1,
    'v1-demo-2026-09-25',
    'USDA FoodData Central test reference',
    jsonb_build_object(
      'schemaVersion', '1.0.0',
      'dataset', jsonb_build_object('version', 'v1-demo-2026-09-25'),
      'food', jsonb_build_object(
        'id', 'banana',
        'name', food_name,
        'source', jsonb_build_object(
          'sourceReference', 'USDA FoodData Central test reference'
        )
      ),
      'reference', jsonb_build_object(
        'amount', 100,
        'unit', 'g',
        'nutrition', jsonb_build_object('caloriesKcal', 89)
      ),
      'serving', jsonb_build_object(
        'enteredQuantity', 100,
        'enteredUnit', 'grams',
        'enteredDescriptor', null,
        'normalizedAmount', 100,
        'normalizedUnit', 'g',
        'conversionType', 'direct-grams',
        'conversionMetadata', null
      ),
      'calculation', jsonb_build_object(
        'scaleFactor', 1,
        'nutrition', jsonb_build_object(
          'caloriesKcal', 89,
          'proteinG', 1.09,
          'carbohydratesG', 22.84,
          'fatG', 0.33,
          'fiberG', 2.6,
          'sugarG', 12.23,
          'sodiumMg', 1
        )
      )
    )
  )
$$;

select plan(13);

insert into auth.users (id, email) values
  ('70000000-0000-0000-0000-000000000001', 'rpc-log-a@example.test'),
  ('70000000-0000-0000-0000-000000000002', 'rpc-log-b@example.test');

select ok(
  to_regprocedure('public.create_food_log(uuid,timestamp with time zone,text,date,text,text,numeric,text,text,numeric,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,text,text,jsonb)') is not null,
  'create_food_log exists'
);
select ok(
  has_function_privilege('authenticated', 'public.create_food_log(uuid,timestamp with time zone,text,date,text,text,numeric,text,text,numeric,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,text,text,jsonb)', 'execute'),
  'authenticated can execute the RPC'
);
select ok(
  not has_function_privilege('anon', 'public.create_food_log(uuid,timestamp with time zone,text,date,text,text,numeric,text,text,numeric,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,text,text,jsonb)', 'execute'),
  'anonymous callers cannot execute the RPC'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"70000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);

select lives_ok(
  $$select pg_temp.create_log('71000000-0000-0000-0000-000000000001')$$,
  'User A can create a food log through the RPC'
);
select is(
  (select count(*)::integer from public.food_logs),
  1,
  'one explicit RPC call creates one visible row'
);
select is(
  (select user_id from public.food_logs where id = '71000000-0000-0000-0000-000000000001'),
  '70000000-0000-0000-0000-000000000001'::uuid,
  'the RPC derives ownership from auth.uid()'
);
select is(
  (pg_temp.create_log('71000000-0000-0000-0000-000000000001') ->> 'idempotent')::boolean,
  true,
  'an identical retry returns an idempotent success'
);
select is(
  (select count(*)::integer from public.food_logs),
  1,
  'an identical retry creates no duplicate row'
);
select is(
  pg_temp.sqlstate_for($$select pg_temp.create_log(
    '71000000-0000-0000-0000-000000000001',
    'Changed Banana'
  )$$),
  'P0001',
  'a conflicting retry is rejected without creating another row'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"70000000-0000-0000-0000-000000000002","role":"authenticated"}',
  true
);
select is(
  pg_temp.sqlstate_for($$select pg_temp.create_log(
    '71000000-0000-0000-0000-000000000001'
  )$$),
  '23505',
  'User B cannot reuse User A request ID'
);
select lives_ok(
  $$select pg_temp.create_log('72000000-0000-0000-0000-000000000001')$$,
  'User B can create a separate owned log'
);
select is(
  (select count(*)::integer from public.food_logs),
  1,
  'User B still sees only their own food log'
);

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select is(
  pg_temp.sqlstate_for($$select pg_temp.create_log(
    '73000000-0000-0000-0000-000000000001'
  )$$),
  '42501',
  'anonymous RPC execution is denied'
);

select * from finish();
rollback;

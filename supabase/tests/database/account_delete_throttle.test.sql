begin;

create extension if not exists pgtap with schema extensions;

select plan(19);

select has_table('private', 'account_delete_attempt_limits', 'server-only deletion throttle table exists');
select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'private.account_delete_attempt_limits'::regclass),
  'deletion throttle table has RLS enabled'
);
select ok(not has_table_privilege('anon', 'private.account_delete_attempt_limits', 'select'), 'anon cannot read deletion throttle state');
select ok(not has_table_privilege('authenticated', 'private.account_delete_attempt_limits', 'select'), 'authenticated cannot read deletion throttle state');
select ok(
  to_regprocedure('public.consume_account_delete_attempt(uuid)') is not null,
  'deletion throttle RPC exists with the reviewed signature'
);
select ok(
  has_function_privilege('service_role', 'public.consume_account_delete_attempt(uuid)', 'execute'),
  'service role can consume a deletion attempt'
);
select ok(
  not has_function_privilege('anon', 'public.consume_account_delete_attempt(uuid)', 'execute'),
  'anon cannot consume or reset deletion attempts'
);
select ok(
  not has_function_privilege('authenticated', 'public.consume_account_delete_attempt(uuid)', 'execute'),
  'authenticated cannot consume or reset deletion attempts directly'
);
select ok(
  (select prosecdef from pg_catalog.pg_proc where oid = 'public.consume_account_delete_attempt(uuid)'::regprocedure),
  'deletion throttle RPC is security definer'
);
select is(
  (select proconfig[1] from pg_catalog.pg_proc where oid = 'public.consume_account_delete_attempt(uuid)'::regprocedure),
  'search_path=""',
  'deletion throttle RPC fixes an empty search path'
);

insert into auth.users (id, email)
values ('90000000-0000-0000-0000-000000000001', 'throttle@example.test');

select is((public.consume_account_delete_attempt('90000000-0000-0000-0000-000000000001')->>'allowed')::boolean, true, 'attempt one is allowed');
select is((public.consume_account_delete_attempt('90000000-0000-0000-0000-000000000001')->>'allowed')::boolean, true, 'attempt two is allowed');
select is((public.consume_account_delete_attempt('90000000-0000-0000-0000-000000000001')->>'allowed')::boolean, true, 'attempt three is allowed');
select is((public.consume_account_delete_attempt('90000000-0000-0000-0000-000000000001')->>'allowed')::boolean, true, 'attempt four is allowed');
select is((public.consume_account_delete_attempt('90000000-0000-0000-0000-000000000001')->>'allowed')::boolean, true, 'attempt five is allowed');
select is((public.consume_account_delete_attempt('90000000-0000-0000-0000-000000000001')->>'allowed')::boolean, false, 'attempt six is rate limited');
select ok(
  (public.consume_account_delete_attempt('90000000-0000-0000-0000-000000000001')->>'retryAfterSeconds')::integer between 1 and 900,
  'rate-limited response gives a bounded retry delay'
);
select is(
  (select count(*)::integer from information_schema.columns where table_schema = 'private' and table_name = 'account_delete_attempt_limits'),
  3,
  'throttle state stores only user, window, and count metadata'
);

delete from auth.users where id = '90000000-0000-0000-0000-000000000001';
select is(
  (select count(*)::integer from private.account_delete_attempt_limits where user_id = '90000000-0000-0000-0000-000000000001'),
  0,
  'account deletion cascades to throttle metadata'
);

select * from finish();
rollback;

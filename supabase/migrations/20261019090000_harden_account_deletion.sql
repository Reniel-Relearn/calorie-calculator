set search_path = public, extensions;

create table private.account_delete_attempt_limits (
  user_id uuid primary key references auth.users (id) on delete cascade,
  window_started_at timestamptz not null,
  attempt_count integer not null,
  constraint account_delete_attempt_count_check check (attempt_count > 0)
);

alter table private.account_delete_attempt_limits enable row level security;
revoke all on table private.account_delete_attempt_limits from public, anon, authenticated;

create function public.consume_account_delete_attempt(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := statement_timestamp();
  v_window interval := interval '15 minutes';
  v_max_attempts integer := 5;
  v_limit private.account_delete_attempt_limits%rowtype;
  v_retry_after integer;
begin
  if p_user_id is null or not exists (
    select 1 from auth.users as u where u.id = p_user_id
  ) then
    raise exception using
      errcode = '22023',
      message = 'a valid account is required';
  end if;

  insert into private.account_delete_attempt_limits (
    user_id,
    window_started_at,
    attempt_count
  ) values (
    p_user_id,
    v_now,
    1
  )
  on conflict (user_id) do update
  set
    window_started_at = case
      when private.account_delete_attempt_limits.window_started_at <= v_now - v_window
        then v_now
      else private.account_delete_attempt_limits.window_started_at
    end,
    attempt_count = case
      when private.account_delete_attempt_limits.window_started_at <= v_now - v_window
        then 1
      else private.account_delete_attempt_limits.attempt_count + 1
    end
  returning * into v_limit;

  v_retry_after := greatest(
    0,
    ceil(extract(epoch from (v_limit.window_started_at + v_window - v_now)))::integer
  );

  return jsonb_build_object(
    'allowed', v_limit.attempt_count <= v_max_attempts,
    'retryAfterSeconds', v_retry_after
  );
end;
$$;

comment on table private.account_delete_attempt_limits is
  'Server-only per-user counters for bounded account-deletion attempts; stores no request body, password, token, email, or IP address.';

revoke all on function public.consume_account_delete_attempt(uuid)
from public, anon, authenticated;
grant execute on function public.consume_account_delete_attempt(uuid)
to service_role;

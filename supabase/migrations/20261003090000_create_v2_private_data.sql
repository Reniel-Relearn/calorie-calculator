set search_path = public, extensions;

create extension if not exists btree_gist with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  date_of_birth date not null,
  sex_for_energy_equation text not null,
  height_cm numeric(6, 2) not null,
  weight_kg numeric(6, 2) not null,
  activity_category text not null,
  goal_type text not null,
  timezone_name text not null,
  onboarding_completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length_check
    check (char_length(btrim(display_name)) between 1 and 80),
  constraint profiles_sex_check
    check (sex_for_energy_equation in ('male', 'female')),
  constraint profiles_height_check
    check (height_cm > 0),
  constraint profiles_weight_check
    check (weight_kg > 0),
  constraint profiles_activity_check
    check (activity_category in ('inactive', 'low_active', 'active', 'very_active')),
  constraint profiles_goal_check
    check (goal_type in ('maintain', 'lose', 'gain')),
  constraint profiles_timezone_name_length_check
    check (char_length(btrim(timezone_name)) between 1 and 64),
  constraint profiles_audit_time_check
    check (updated_at >= created_at)
);

create table public.calorie_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  goal_type text not null,
  maintenance_kcal numeric(10, 2) not null,
  target_kcal numeric(10, 2),
  methodology text not null,
  methodology_version text not null,
  activity_category text not null,
  input_snapshot jsonb not null,
  assumptions jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  effective_from timestamptz not null,
  effective_to timestamptz,
  created_at timestamptz not null default now(),
  constraint calorie_targets_goal_check
    check (goal_type in ('maintain', 'lose', 'gain')),
  constraint calorie_targets_maintenance_check
    check (maintenance_kcal > 0),
  constraint calorie_targets_target_check
    check (target_kcal is null or target_kcal > 0),
  constraint calorie_targets_methodology_length_check
    check (char_length(btrim(methodology)) between 1 and 120),
  constraint calorie_targets_methodology_version_length_check
    check (char_length(btrim(methodology_version)) between 1 and 40),
  constraint calorie_targets_activity_check
    check (activity_category in ('inactive', 'low_active', 'active', 'very_active')),
  constraint calorie_targets_input_snapshot_check
    check (jsonb_typeof(input_snapshot) = 'object'),
  constraint calorie_targets_assumptions_check
    check (jsonb_typeof(assumptions) = 'array'),
  constraint calorie_targets_warnings_check
    check (jsonb_typeof(warnings) = 'array'),
  constraint calorie_targets_effective_range_check
    check (effective_to is null or effective_to > effective_from),
  constraint calorie_targets_no_overlapping_effective_ranges
    exclude using gist (
      user_id with =,
      tstzrange(effective_from, effective_to, '[)') with &&
    )
);

create unique index calorie_targets_one_current_idx
  on public.calorie_targets (user_id)
  where effective_to is null;

create index calorie_targets_user_effective_idx
  on public.calorie_targets (user_id, effective_from desc);

create table public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  consumed_at timestamptz not null,
  timezone_at_entry text not null,
  local_date date not null,
  food_id text not null,
  food_name_snapshot text not null,
  entered_quantity numeric(14, 6) not null,
  entered_unit text not null,
  entered_descriptor text,
  normalized_amount numeric(14, 6) not null,
  normalized_unit text not null,
  calories_kcal numeric(14, 4) not null,
  protein_g numeric(14, 4),
  carbohydrates_g numeric(14, 4),
  fat_g numeric(14, 4),
  fiber_g numeric(14, 4),
  sugar_g numeric(14, 4),
  sodium_mg numeric(14, 4),
  nutrition_dataset_version text not null,
  source_reference text not null,
  calculation_snapshot jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint food_logs_timezone_length_check
    check (char_length(btrim(timezone_at_entry)) between 1 and 64),
  constraint food_logs_food_id_length_check
    check (char_length(btrim(food_id)) between 1 and 120),
  constraint food_logs_food_name_length_check
    check (char_length(btrim(food_name_snapshot)) between 1 and 160),
  constraint food_logs_entered_quantity_check
    check (entered_quantity > 0),
  constraint food_logs_entered_unit_check
    check (entered_unit in ('grams', 'cups', 'milliliters', 'pieces')),
  constraint food_logs_entered_descriptor_check
    check (
      entered_descriptor is null
      or char_length(btrim(entered_descriptor)) between 1 and 80
    ),
  constraint food_logs_normalized_amount_check
    check (normalized_amount > 0),
  constraint food_logs_normalized_unit_check
    check (normalized_unit in ('g', 'ml')),
  constraint food_logs_calories_check
    check (calories_kcal >= 0),
  constraint food_logs_protein_check
    check (protein_g is null or protein_g >= 0),
  constraint food_logs_carbohydrates_check
    check (carbohydrates_g is null or carbohydrates_g >= 0),
  constraint food_logs_fat_check
    check (fat_g is null or fat_g >= 0),
  constraint food_logs_fiber_check
    check (fiber_g is null or fiber_g >= 0),
  constraint food_logs_sugar_check
    check (sugar_g is null or sugar_g >= 0),
  constraint food_logs_sodium_check
    check (sodium_mg is null or sodium_mg >= 0),
  constraint food_logs_dataset_version_length_check
    check (char_length(btrim(nutrition_dataset_version)) between 1 and 80),
  constraint food_logs_source_reference_length_check
    check (char_length(btrim(source_reference)) between 1 and 240),
  constraint food_logs_calculation_snapshot_check
    check (
      jsonb_typeof(calculation_snapshot) = 'object'
      and octet_length(calculation_snapshot::text) <= 65536
    ),
  constraint food_logs_audit_time_check
    check (updated_at >= created_at)
);

create index food_logs_user_local_date_idx
  on public.food_logs (user_id, local_date, consumed_at desc);

create function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := statement_timestamp();
  return new;
end;
$$;

create function private.validate_profile_timezone()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_timezone_names
    where name = new.timezone_name
  ) then
    raise exception using
      errcode = '23514',
      message = 'profiles.timezone_name must be a recognized IANA timezone';
  end if;

  return new;
end;
$$;

create function private.validate_food_log_time()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_timezone_names
    where name = new.timezone_at_entry
  ) then
    raise exception using
      errcode = '23514',
      message = 'food_logs.timezone_at_entry must be a recognized IANA timezone';
  end if;

  if new.local_date <> (new.consumed_at at time zone new.timezone_at_entry)::date then
    raise exception using
      errcode = '23514',
      message = 'food_logs.local_date must match consumed_at in timezone_at_entry';
  end if;

  return new;
end;
$$;

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function private.touch_updated_at();

create trigger profiles_validate_timezone
before insert or update of timezone_name on public.profiles
for each row execute function private.validate_profile_timezone();

create trigger food_logs_touch_updated_at
before update on public.food_logs
for each row execute function private.touch_updated_at();

create trigger food_logs_validate_time
before insert or update of consumed_at, timezone_at_entry, local_date on public.food_logs
for each row execute function private.validate_food_log_time();

revoke all on function private.touch_updated_at() from public, anon, authenticated;
revoke all on function private.validate_profile_timezone() from public, anon, authenticated;
revoke all on function private.validate_food_log_time() from public, anon, authenticated;

alter table public.profiles enable row level security;
alter table public.calorie_targets enable row level security;
alter table public.food_logs enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.calorie_targets from anon, authenticated;
revoke all on table public.food_logs from anon, authenticated;

grant select on table public.profiles to authenticated;
grant insert (
  user_id,
  display_name,
  date_of_birth,
  sex_for_energy_equation,
  height_cm,
  weight_kg,
  activity_category,
  goal_type,
  timezone_name
) on table public.profiles to authenticated;
grant update (
  display_name,
  date_of_birth,
  sex_for_energy_equation,
  height_cm,
  weight_kg,
  activity_category,
  goal_type,
  timezone_name
) on table public.profiles to authenticated;

grant select on table public.calorie_targets to authenticated;
grant insert (
  user_id,
  goal_type,
  maintenance_kcal,
  target_kcal,
  methodology,
  methodology_version,
  activity_category,
  input_snapshot,
  assumptions,
  warnings,
  effective_from,
  effective_to
) on table public.calorie_targets to authenticated;
grant update (effective_to) on table public.calorie_targets to authenticated;

grant select, delete on table public.food_logs to authenticated;
grant insert (
  user_id,
  consumed_at,
  timezone_at_entry,
  local_date,
  food_id,
  food_name_snapshot,
  entered_quantity,
  entered_unit,
  entered_descriptor,
  normalized_amount,
  normalized_unit,
  calories_kcal,
  protein_g,
  carbohydrates_g,
  fat_g,
  fiber_g,
  sugar_g,
  sodium_mg,
  nutrition_dataset_version,
  source_reference,
  calculation_snapshot
) on table public.food_logs to authenticated;
grant update (
  consumed_at,
  timezone_at_entry,
  local_date,
  food_id,
  food_name_snapshot,
  entered_quantity,
  entered_unit,
  entered_descriptor,
  normalized_amount,
  normalized_unit,
  calories_kcal,
  protein_g,
  carbohydrates_g,
  fat_g,
  fiber_g,
  sugar_g,
  sodium_mg,
  nutrition_dataset_version,
  source_reference,
  calculation_snapshot
) on table public.food_logs to authenticated;

create policy profiles_select_own
on public.profiles
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy calorie_targets_select_own
on public.calorie_targets
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy calorie_targets_insert_own
on public.calorie_targets
for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy calorie_targets_update_own
on public.calorie_targets
for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy food_logs_select_own
on public.food_logs
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy food_logs_insert_own
on public.food_logs
for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy food_logs_update_own
on public.food_logs
for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy food_logs_delete_own
on public.food_logs
for delete
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

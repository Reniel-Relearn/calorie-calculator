# CalorieCheck Version 2 — Operational Status

**Current Version:** V2
**Current Phase:** V2-P3 — Database Schema, Migrations, and Row-Level Authorization
**Current Phase Status:** BLOCKED — USER ACTION REQUIRED
**Next Phase:** V2-P4 — Evidence-Based Energy Target Engine (not authorized until V2-P3 is verified on staging and marked DONE)
**Overall V2 Status:** IN PROGRESS

## Completed Phases

- V2-P0 — Master Planning and Architecture — completed 2026-09-28
- V2-P1 — Development Platform and Staging Foundation — completed 2026-09-30
- V2-P2 — Authentication and Persistent Session Foundation — completed 2026-10-02

## Current Blockers

- The V2-P3 migration and database tests pass locally, but the project-local Supabase CLI is not linked to the staging Supabase project.
- The staging dry run has not been reviewed, and the migration has not been authorized or applied to staging.
- Staging migration history therefore cannot yet be compared with the repository migration history.

No V2-P4 work has started.

## Required Human Actions

Complete these steps in the VS Code terminal from the repository root:

1. Run `npx supabase login`. The CLI opens a browser to generate a personal access token and stores it locally. Do not paste the token into chat or add it to any project file.
2. In the Supabase dashboard, open the `calorie-calculator` staging project. Copy its project ID from the dashboard URL: `https://supabase.com/dashboard/project/<project-id>`.
3. Run `npx supabase link --project-ref <project-id>`, replacing the placeholder with that project ID. Enter the staging database password only in the terminal if prompted. Do not send or commit the password.
4. Tell Codex: **“The staging Supabase project is linked. Proceed with the V2-P3 dry run.”**

Codex will then run the read-only migration-history and `db push --dry-run` checks, report the exact pending migration, and ask for the required approval before applying it. Do not run `supabase db reset --linked`; that command is destructive to the staging database.

Successful completion will show that only `20261003090000_create_v2_private_data.sql` is pending, the migration applies without error, the remote migration history matches the repository, and staging exposes the expected private tables and policies without exposing any user data.

## V2-P3 Local Implementation Summary

- Added one reproducible migration for `profiles`, `calorie_targets`, and `food_logs`.
- Profile records use canonical centimeters/kilograms, normalized activity and goal values, recognized timezone names, and auth-user cascade ownership.
- Target records preserve methodology and input snapshots, allow only `effective_to` to be updated by clients, reject invalid ranges, reject overlaps, and allow only one current target per user.
- Food logs store stable local dates, entry timezones, serving and nutrient scalars, dataset/source provenance, and bounded object snapshots. Missing nutrients remain null and explicit zero remains zero.
- Timestamp triggers maintain `updated_at`; time validation rejects unknown timezone names and inconsistent local dates.
- Broad `anon` and `authenticated` grants are revoked. Authenticated users receive only the operations required for each table.
- RLS uses separate owner-only policies for each granted operation. Ownership reassignment and cross-user access are denied.
- No seed data, frontend persistence service, profile UI, target formula, dashboard query, account-deletion function, or production database work was added.

## Last Verified Tests

- `npm run supabase:db:reset` passed from a clean local database and applied `20261003090000_create_v2_private_data.sql`.
- 97 pgTAP assertions passed directly against the local Supabase PostgreSQL container: 42 schema/grant assertions, 34 owner/anonymous RLS assertions, and 21 constraint/cascade assertions.
- User A own-row operations passed for every granted operation; User A could not read, insert, update, or delete User B data where applicable.
- Anonymous reads and inserts were denied for all three private tables.
- Profile and food-log ownership reassignment was denied by RLS. Target ownership and immutable value changes were denied by column grants.
- Invalid canonical values, unsupported units, non-positive quantities, negative nutrients, malformed JSON shapes, invalid timezone names, inconsistent local dates, invalid target ranges, overlapping target history, and a second current target were rejected.
- Missing nutrient values remained null while explicit zero remained zero.
- Deleting a synthetic auth user cascaded to that user's profile, target history, and food logs inside a rolled-back test transaction.
- `npx supabase db lint --local` reported no schema errors.
- `npx supabase db diff --local --schema public,private` reported no schema changes after the clean reset.
- `npm run check` passed all 30 Node tests and the Vite production build.
- `npm run test:auth:local` passed the real local signup, confirmation, login, session, logout, recovery, password-update, and protected-calculator regression flow after the migration.
- The official `supabase test db` wrapper could not download its uncached `pg_prove` runner because Docker DNS could not resolve any container registry. The same checked-in pgTAP SQL passed through `psql` in the running Supabase database container; this tooling download issue is not a database-test failure.

## Reviewed Staging Migration Plan

The pending migration is designed to:

1. enable `btree_gist` for effective-range exclusion;
2. create the private helper schema and three user-owned public tables;
3. add checks, foreign-key cascades, owner/date indexes, one-current-target uniqueness, and non-overlapping target ranges;
4. add safe timestamp and timezone/local-date validation triggers;
5. revoke broad client grants and grant only the required authenticated operations;
6. enable RLS and add separate owner policies;
7. leave managed auth identities and existing staging users intact.

No seed data or destructive table operation is included.

## Next Intended Action

Link the CLI to the dedicated staging Supabase project, then let Codex perform and report the remote dry run. V2-P3 remains blocked until the reviewed migration is explicitly approved, applied, and verified on staging.

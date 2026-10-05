# CalorieCheck Version 2 — Operational Status

**Current Version:** V2
**Current Phase:** V2-P3 — Database Schema, Migrations, and Row-Level Authorization
**Current Phase Status:** DONE
**Next Phase:** V2-P4 — Evidence-Based Energy Target Engine (not started)
**Overall V2 Status:** IN PROGRESS

## Completed Phases

- V2-P0 — Master Planning and Architecture — completed 2026-09-28
- V2-P1 — Development Platform and Staging Foundation — completed 2026-09-30
- V2-P2 — Authentication and Persistent Session Foundation — completed 2026-10-02
- V2-P3 — Database Schema, Migrations, and Row-Level Authorization — completed 2026-10-05

## Current Blockers

None for V2-P3. No V2-P4 work has started.

## Required Human Actions

Review the completed V2-P3 changes. Commit and push them only if desired. After review, say **“Proceed with the next V2 phase.”** to authorize V2-P4.

## V2-P3 Implementation Summary

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
- The reviewed `supabase db push --dry-run` listed only `20261003090000_create_v2_private_data.sql`, with no seeds or role changes.
- The approved migration applied successfully to the linked staging project.
- `supabase migration list --linked` reports matching local and remote version `20261003090000`.
- A second linked `supabase db push --dry-run` reports that the remote database is up to date with no pending migrations, seeds, or role changes.
- `supabase db lint --linked` reports no errors in the `extensions`, `private`, or `public` schemas.
- Linked table inspection confirms `profiles`, `calorie_targets`, and `food_logs` exist on staging with zero estimated rows; no seed or user data was introduced.

## Staging Migration Verification

The applied migration:

1. enable `btree_gist` for effective-range exclusion;
2. create the private helper schema and three user-owned public tables;
3. add checks, foreign-key cascades, owner/date indexes, one-current-target uniqueness, and non-overlapping target ranges;
4. add safe timestamp and timezone/local-date validation triggers;
5. revoke broad client grants and grant only the required authenticated operations;
6. enable RLS and add separate owner policies;
7. leave managed auth identities and existing staging users intact.

No seed data, role change, or destructive table operation was applied. The repository and staging migration histories match exactly.

## Next Intended Action

Stop for human review. V2-P4 is the next planned phase and remains unstarted until explicitly authorized.

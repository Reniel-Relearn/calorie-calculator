# CalorieCheck Version 2 — Operational Status

**Current Version:** V2
**Current Phase:** V2-P5 — Profile Onboarding, Personal Data, and Target History
**Current Phase Status:** DONE
**Next Phase:** V2-P6 — Calculator to Food Log Integration (planned; not started)
**Overall V2 Status:** IN PROGRESS

## Completed Phases

- V2-P0 — Master Planning and Architecture — completed 2026-09-28
- V2-P1 — Development Platform and Staging Foundation — completed 2026-09-30
- V2-P2 — Authentication and Persistent Session Foundation — completed 2026-10-02
- V2-P3 — Database Schema, Migrations, and Row-Level Authorization — completed 2026-10-05
- V2-P4 — Evidence-Based Energy Target Engine — completed 2026-10-05
- V2-P5 — Profile Onboarding, Personal Data, and Target History — completed 2026-10-06

## Current Blocker

None for V2-P5.

## Required Human Action

Review the completed V2-P5 status update and any desired commit or push. After review, say **“Proceed with the next V2 phase.”** to authorize V2-P6.

## V2-P5 Implementation Summary

- Added a mobile-first accessible onboarding flow for the minimized profile and maintain-target inputs.
- Stores canonical height in centimeters, weight in kilograms, the selected PAL category, goal, and an IANA timezone.
- Keeps pregnancy/breastfeeding eligibility confirmation nonpersistent.
- Keeps `LOSE` and `GAIN` visible but unavailable under the approved maintain-only Version 2 scope.
- Uses the V2-P4 target engine and persists its method, input, assumption, uncertainty, and warning snapshots.
- Added one authenticated PostgreSQL RPC that validates the request, derives ownership from `auth.uid()`, and writes the profile and first target in one transaction.
- Revoked direct browser mutations for onboarding-owned profile/target fields and restricted RPC execution to authenticated users.
- Made identical retry requests idempotent so a retry does not create a duplicate target row.
- Routes incomplete profiles to onboarding and complete profiles to a minimal greeting/target home view before loading the frozen calculator.
- Added mobile, keyboard, focus, validation, service, rollback, ownership, retry, and snapshot coverage.
- Added no food logging, dashboard, full settings editor, account deletion, unsupported target method, or V2-P6 feature.

## Staging Verification

- `npx.cmd supabase db push --linked` applied `20261006090000_complete_profile_onboarding.sql` on 2026-10-06.
- A second linked dry run reported that the remote database was up to date and would apply no migration, seed, or role changes.
- Local and remote migration histories contain matching `20261003090000` and `20261006090000` entries.
- The linked `public` and `private` schema lint reported no errors.
- The deployed staging origin returned HTTP 200 and contained the onboarding interface.
- The user completed the signed-in staging onboarding flow and confirmed it passed on 2026-10-06.
- Staging onboarding produced the expected welcome and maintenance-target experience; refresh and logout/login restoration passed without a duplicate-onboarding prompt.

## Last Verified Tests

- `npm.cmd run check` passed all 55 Node tests and the Vite production build on 2026-10-06.
- `npm.cmd run test:db` passed all 115 local pgTAP assertions on 2026-10-06, including RPC atomicity, idempotence, snapshots, grants, RLS, and rollback behavior.
- `npm.cmd run test:auth:local` passed onboarding, refresh restoration, logout/login restoration, mobile overflow, focus, and frozen calculator checks on 2026-10-06.
- The Windows browser-test cleanup retries transient `EBUSY`, `ENOTEMPTY`, and `EPERM` profile-directory locks; the flow and cleanup completed successfully on rerun.
- The linked staging migration, migration parity, schema lint, deployment HTTP, deployed-content, and signed-in onboarding checks passed on 2026-10-06.

## Next Intended Action

Stop for human review. V2-P6 is the next planned phase and remains unstarted until the user says **“Proceed with the next V2 phase.”**

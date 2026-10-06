# CalorieCheck Version 2 — Operational Status

**Current Version:** V2
**Current Phase:** V2-P5 — Profile Onboarding, Personal Data, and Target History
**Current Phase Status:** BLOCKED — USER ACTION REQUIRED
**Next Phase:** V2-P6 — Calculator to Food Log Integration (planned; not authorized)
**Overall V2 Status:** IN PROGRESS

## Completed Phases

- V2-P0 — Master Planning and Architecture — completed 2026-09-28
- V2-P1 — Development Platform and Staging Foundation — completed 2026-09-30
- V2-P2 — Authentication and Persistent Session Foundation — completed 2026-10-02
- V2-P3 — Database Schema, Migrations, and Row-Level Authorization — completed 2026-10-05
- V2-P4 — Evidence-Based Energy Target Engine — completed 2026-10-05

## Current Blocker

V2-P5 is implemented and its reviewed migration is applied to staging. Automated remote checks confirm matching migration history, an up-to-date dry run, and no linked `public`/`private` schema lint errors. The deployed staging origin returns HTTP 200 and contains the onboarding interface.

The phase acceptance criteria still require one signed-in human staging pass through the real email/onboarding path. Codex has no staging test-account credentials or available browser surface in this session, so it cannot complete that account-bound check without the user.

## Required Human Action

Use synthetic information only:

1. Open `https://calorie-calculator-gamma-ten.vercel.app/`.
2. Sign in with a staging test account whose profile is incomplete. A fresh test account is also suitable.
3. Complete email confirmation if the account is new.
4. Complete onboarding. One safe synthetic example is:
   - display name: `Staging Tester`
   - date of birth: `1990-01-01`
   - either available equation sex
   - height: `165 cm`
   - weight: `63 kg`
   - activity: `Low active`
   - goal: `Maintain`
   - timezone: `Asia/Manila`
   - confirm the eligibility statement for this synthetic test case
5. Confirm the app shows `Welcome, Staging Tester`, a positive maintenance target, the National Academies 2023 EER method, and the calculator.
6. Refresh the page and confirm the completed home view and target remain.
7. Log out, log in again, and confirm the same completed profile and target return without an error or duplicate-onboarding prompt.
8. Reply **“V2-P5 staging onboarding passed.”** if all checks pass. If one fails, report the visible message and the step where it occurred.

Do not use real personal or medical information. Do not send a password, date of birth, API key, access token, or other secret in chat.

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

## Staging Migration Verification

- `npx.cmd supabase db push --linked` applied `20261006090000_complete_profile_onboarding.sql` on 2026-10-06.
- A second linked dry run reported that the remote database is up to date and would apply no migration, seed, or role changes.
- `npx.cmd supabase migration list --linked` shows `20261003090000` and `20261006090000` on both local and remote histories.
- `npx.cmd supabase db lint --linked --schema public,private` reported no schema errors.
- `https://calorie-calculator-gamma-ten.vercel.app/` returned HTTP 200 and the deployed document contains the onboarding heading.

## Last Verified Tests

- `npm.cmd run check` passed all 55 Node tests and the Vite production build on 2026-10-06.
- `npm.cmd run test:db` passed all 115 local pgTAP assertions on 2026-10-06, including RPC atomicity, idempotence, snapshots, grants, RLS, and rollback behavior.
- `npm.cmd run test:auth:local` passed onboarding, refresh restoration, logout/login restoration, mobile overflow, focus, and frozen calculator checks on 2026-10-06.
- The Windows browser-test cleanup now retries transient `EBUSY`, `ENOTEMPTY`, and `EPERM` profile-directory locks; the flow and cleanup both completed successfully on rerun.
- The linked staging migration, parity, schema lint, deployment HTTP, and deployed-content checks passed on 2026-10-06.

## Next Intended Action

Stop for the required human staging onboarding pass. Do not begin V2-P6. After the user confirms the staging flow, update V2-P5 to `DONE`, record the human verification, and stop for final V2-P5 review.

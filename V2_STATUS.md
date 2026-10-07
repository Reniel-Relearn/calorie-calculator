# CalorieCheck Version 2 — Operational Status

**Current Version:** V2
**Current Phase:** V2-P9 — Profile Settings, Goal Changes, Log Editing, and Account Deletion
**Current Phase Status:** BLOCKED — USER ACTION REQUIRED
**Next Phase:** V2-D0 — User Design Plan and Mockup Approval Gate (blocked until V2-P9 passes staging)
**Overall V2 Status:** IN PROGRESS

## Completed Phases

- V2-P0 — Master Planning and Architecture — completed 2026-09-28
- V2-P1 — Development Platform and Staging Foundation — completed 2026-09-30
- V2-P2 — Authentication and Persistent Session Foundation — completed 2026-10-02
- V2-P3 — Database Schema, Migrations, and Row-Level Authorization — completed 2026-10-05
- V2-P4 — Evidence-Based Energy Target Engine — completed 2026-10-05
- V2-P5 — Profile Onboarding, Personal Data, and Target History — completed 2026-10-06
- V2-P6 — Calculator to Food Log Integration — completed 2026-10-07
- V2-P7 — Daily Calorie Tracker — completed 2026-10-07
- V2-P8 — Weekly Dashboard and History — completed 2026-10-07

## Current Blocker

V2-P9 is implemented and verified locally. Completion requires applying the reviewed migration to the linked staging project, deploying the protected `delete-account` Edge Function, and passing the complete staging flow with synthetic data and a disposable account.

The linked staging dry run succeeded and reported exactly one pending migration:

- `20261007120000_add_v2_settings_and_log_mutations.sql`

No staging mutation or function deployment was performed during the dry run.

## Required Human Action

After reviewing the implementation diff:

1. Apply the reviewed migration from the repository root:

   ```powershell
   npx.cmd supabase db push --linked
   ```

2. Deploy the protected account-deletion function:

   ```powershell
   npx.cmd supabase functions deploy delete-account
   ```

3. Do not add or copy a privileged key manually. Supabase automatically supplies its project URL, anon/public key, and service-role credential to deployed Edge Functions. Never reveal or place a service-role/secret value in this repository, Vercel, browser code, `.env.local`, or any `VITE_*` variable.

4. Deploy the reviewed frontend commit to staging.

5. Use synthetic values only and verify with an ordinary staging test account:
   - open Settings and save a display-name-only change; confirm the greeting updates;
   - change one target input, accept the eligibility confirmation, and confirm the new maintenance target appears;
   - change timezone and confirm the explanation says existing logged dates remain stable;
   - add a food with a captured conversion, edit its amount and date/time, and confirm daily and weekly totals refresh on both affected dates;
   - open Delete on a log, cancel once, then confirm deletion and verify totals refresh;
   - verify the account deletion form rejects an incorrect current password without removing data.

6. Create a separate disposable staging account with synthetic onboarding and at least one food log. In Settings, enter its current password and the exact confirmation `DELETE`, then permanently delete it. Confirm the app signs out and the deleted credentials can no longer log in. Do not run this test on an account you intend to keep.

When all checks pass, reply exactly:

**V2-P9 staging settings, log correction, and account deletion passed.**

## V2-P9 Implementation Summary

- Added a mobile-first settings panel for display name, date of birth, equation sex, height, weight, activity category, maintain goal, timezone, eligibility confirmation, and hard account deletion.
- Added the authenticated `update_profile_settings` transaction. Display-name-only changes preserve the current target; target-affecting changes atomically update the profile, close the old target, and create one successor.
- Kept `LOSE` and `GAIN` unavailable under the approved maintain-only Version 2 scope.
- Preserved existing food-log dates when the profile timezone changes; the new timezone applies to future entries and current-day boundaries.
- Added pure captured-snapshot food-log recalculation plus accessible edit and delete dialogs.
- Kept saved food identity, dataset, reference nutrition, conversion route, unit, and descriptor immutable during edits. Current `foods.js` data is not used to rewrite old logs.
- Added the owner-derived `update_food_log` RPC and revoked direct authenticated updates to food-log calculation fields.
- Kept confirmed log deletion under owner-scoped RLS and refreshed daily and weekly dashboards after edit/delete mutations.
- Added the JWT-protected `delete-account` Edge Function. It validates the caller, verifies the current password, uses a server-only privileged client for hard auth-user deletion, and relies on reviewed cascades for profile, target, and log removal.
- Added no privileged credential to frontend code, environment examples, Vercel configuration, or the browser bundle.
- Added no V2-D0 design revision or V2-P10 security-hardening scope.

## V2-P9 Local Verification

- `npm.cmd run check` passed 110 Node tests and the Vite production build on 2026-10-07.
- `npm.cmd run test:db` passed all 156 pgTAP assertions across nine files.
- Local `public` and `private` schema lint reported no errors.
- A clean local database reset applied all migrations, including V2-P9.
- `npm.cmd run test:auth:local` passed signup, confirmation, onboarding, name-only settings, atomic target-affecting settings, captured-snapshot cup edit across a date boundary, delete cancel/confirm, daily and weekly refresh, incorrect-password rejection, protected hard account deletion, signed-out cleanup, failed login for the deleted account, session restoration, password recovery, responsive checks, and frozen calculator behavior.
- Responsive integration checks cover 320, 390, 768, and 1280 pixel widths with no page-level horizontal overflow and required touch-target sizing.
- `npx.cmd supabase db push --linked --dry-run` succeeded and identified only `20261007120000_add_v2_settings_and_log_mutations.sql` as pending.

## Local Development Port Note

Windows reserved the previous default Supabase local port range. The repository's local-only Supabase ports now use API `55321`, database `55432`, Studio `55323`, and Mailpit `55324`. `.env.example`, integration defaults, and README instructions match those ports. Staging URLs and provider configuration are unchanged.

## Scheduled Blocker Before V2-P10

**Status:** BLOCKED — USER ACTION REQUIRED

**Blocker:** Requires user's plan and mockups for design.

After V2-P9 passes staging, work must stop at V2-D0 until the user supplies a written design plan, approved mockups for the principal mobile journeys and states, responsive direction for larger screens, and explicit approval of the reviewed baseline.

After V2-D0 clears, V2-D1 through V2-D6 cover interface audit and traceability, visual foundations, mobile app shell and navigation, primary journeys, history/settings/data-control journeys, and integrated staging verification. V2-P10 cannot begin until all seven design phases are complete and the staged revision has explicit user approval.

## Next Intended Action

Stop for human review. Apply and verify V2-P9 on staging using the steps above. Do not begin V2-D0 or V2-P10 in the same phase.

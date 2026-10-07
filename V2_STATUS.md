# CalorieCheck Version 2 — Operational Status

**Current Version:** V2
**Current Phase:** V2-P8 — Weekly Dashboard and History
**Current Phase Status:** BLOCKED — USER ACTION REQUIRED
**Next Phase:** V2-P9 — Profile Settings, Goal Changes, Log Editing, and Account Deletion (planned; not authorized)
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

## Current Blocker

V2-P8 is implemented and verified locally. Completion is blocked on the required deployed phone-size review of weekly information density and language. No database migration or provider configuration is required.

## Required Human Action

1. Review the V2-P8 changes, especially the weekly summary, service, controller, view, mobile CSS, tests, and documented average policy.
2. Commit with the recommended message `Add accessible V2 weekly dashboard` and push to the branch connected to Vercel.
3. Wait for the Vercel deployment to finish, then open the public staging URL on a phone or phone-size browser viewport.
4. Sign in with a synthetic staging account that has completed onboarding.
5. Confirm the current week contains exactly seven Monday-through-Sunday rows and identifies the current day.
6. Save a calculator result and confirm the matching weekly row and average update without refreshing the page.
7. Confirm completed zero-log days show zero, future dates show `Upcoming`, and future dates are excluded from current-week averages.
8. Use Previous week and Current week. Confirm historical targets remain date-specific and missing targets are shown as unavailable rather than zero.
9. Confirm consumed, target, and remaining/above information is understandable without relying on color, controls are touch-friendly, and the page has no horizontal overflow.
10. Report **“V2-P8 staging weekly dashboard passed.”** if all checks pass.

Use synthetic staging data only. Do not share or add keys, tokens, passwords, or other secrets. No Supabase dashboard change or migration command is needed for this review.

## Scheduled Blocker Before V2-P10

**Status:** BLOCKED — USER ACTION REQUIRED

**Blocker:** Requires user's plan and mockups for design.

This scheduled blocker does not prevent V2-P8 or V2-P9. After V2-P9 is complete, work must stop at V2-D0 until the user supplies a written design plan, approved mockups for the principal mobile journeys and states, responsive direction for larger screens, and explicit approval of the reviewed baseline.

After V2-D0 clears, V2-D1 through V2-D6 cover interface audit and traceability, visual foundations, mobile app shell and navigation, primary journeys, history/settings/data-control journeys, and integrated staging verification. V2-P10 cannot begin until all seven design phases are complete and the staged revision has explicit user approval.

## V2-P8 Implementation Summary

- Added a private mobile-first weekly dashboard for completed profiles alongside the existing daily tracker.
- Derives a fixed Monday-through-Sunday interval from the profile timezone's current local date and produces exactly seven rows, including completed zero-log and upcoming dates.
- Queries only the authenticated owner's date-bounded logs and target history with deterministic pagination and ordering.
- Resolves each date's historical target instead of replacing past targets with the current profile value.
- Shows consumed, target, and neutral remaining/above values in a semantic ordered list with complete visible text.
- Defines current-week intake averages across elapsed dates, including zero-log dates, and completed-week intake averages across all seven dates.
- Defines target averages across only eligible dates with numeric targets and discloses full, partial, or unavailable coverage.
- Supports Previous week, Next week, and Current week navigation, while preventing navigation beyond the current week.
- Refreshes the selected week after a confirmed saved-log event only when the saved date belongs to that week.
- Implements loading, no-history, partial/missing-target, session-expired, retryable network, signed-out, and stale-response handling.
- Reuses shared dashboard normalization and pagination helpers for daily and weekly reads.
- Uses no chart or chart dependency because the semantic list is the complete canonical presentation; an optional visualization can be reconsidered during the scheduled design revision.
- Added no settings, log editing/deletion, monthly analytics, prediction, streaks, or V2-P9 functionality.

## V2-P8 Verification Status

- Automated local verification passed on 2026-10-07.
- The required deployed phone-size information-density and language review is pending.

## Weekly Tracker Contract

`V2_DATA_CONTRACTS.md` now documents fixed week boundaries, seven-row behavior, historical target resolution, average denominators and coverage, save refresh rules, navigation, and weekly loading/empty/error states. `V2_DECISIONS.md` records the average and semantic presentation policy, and `V2_RESEARCH.md` records the authoritative query, date, and accessibility recheck.

## Last Verified Tests

- `npm.cmd run check` passed all 94 Node tests and the Vite production build on 2026-10-07.
- Weekly unit coverage includes Monday/Sunday boundaries, month/year/leap-day and DST-adjacent dates, seven rows, zero-log and upcoming dates, changing historical targets, average denominator policy, partial and unavailable target coverage, explicit zeros, invalid inputs, owner/date filters, ordered pagination, navigation, save refresh, retry, session expiry, stale private-state rejection, nonmutation, and determinism.
- `npm.cmd run test:auth:local` passed signup, onboarding, daily and weekly empty states, target display, responsive/touch checks at 320, 390, 768, and 1280 pixels, explicit food logging, immediate daily and weekly refresh, seven-row weekly semantics, previous/current-week navigation, persistence after refresh, logout/login, password recovery, and frozen calculator behavior.
- `npm.cmd run test:db` passed all 131 pgTAP assertions across seven files, including signed-out and cross-user food-log and target-history isolation.
- Local `public` and `private` schema lint reported no errors.
- No database migration, provider setting, dependency, or environment-variable change was introduced.

## Next Intended Action

Stop for the required deployed phone-size review. Do not mark V2-P8 done or begin V2-P9 until the user reports that the staging weekly dashboard passed. The separate design blocker becomes the active stop after V2-P9.

# CalorieCheck Version 2 — Operational Status

**Current Version:** V2
**Current Phase:** V2-P7 — Daily Calorie Tracker
**Current Phase Status:** DONE
**Next Phase:** V2-P8 — Weekly Dashboard and History (planned; not authorized)
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

None for V2-P7.

## Required Human Action

Review and commit the design-program planning update when ready. After review, say **“Proceed with the next V2 phase.”** to authorize V2-P8.

## Scheduled Blocker Before V2-P10

**Status:** BLOCKED — USER ACTION REQUIRED

**Blocker:** Requires user's plan and mockups for design.

This scheduled blocker does not prevent V2-P8 or V2-P9. After V2-P9 is complete, work must stop at V2-D0 until the user supplies a written design plan, approved mockups for the principal mobile journeys and states, responsive direction for larger screens, and explicit approval of the reviewed baseline.

After V2-D0 clears, V2-D1 through V2-D6 cover interface audit and traceability, visual foundations, mobile app shell and navigation, primary journeys, history/settings/data-control journeys, and integrated staging verification. V2-P10 cannot begin until all seven design phases are complete and the staged revision has explicit user approval.

## V2-P7 Implementation Summary

- Added a private mobile-first daily tracker above the calculator for completed profiles.
- Defaults to the profile timezone's current local date and supports Previous day, Next day, Today, and native date selection through today.
- Queries only the authenticated owner's logs for the selected stable `local_date` and paginates ordered results.
- Resolves today's target at the current instant and a completed day's target from effective history in the profile timezone.
- Calculates calorie and nutrient totals on demand without a summary table.
- Preserves explicit zero, known partial totals, and unavailable nutrient values as separate states.
- Uses neutral remaining/above-target language and a labeled native calorie meter.
- Shows a semantic saved-food list with serving, normalized amount when useful, local entry time, and calories.
- Refreshes the current date after a confirmed `caloriecheck:food-log-saved` event.
- Implements loading, empty, unavailable-target, session-expired, and retryable network states.
- Keeps the tracker and its private in-memory state hidden or cleared during signed-out, incomplete-profile, and user-change flows.
- Added no weekly chart, edit/delete controls, meal categories, streaks, badges, recommendations, or offline cache.

## V2-P7 Staging Verification

- The user confirmed **“V2-P7 staging daily tracker passed.”** on 2026-10-07.
- The deployed daily tracker passed the required signed-in, phone-size staging review.
- The staging checklist covered visible saved entries with serving and calorie context, correct totals, immediate refresh after saving, date navigation, mobile overflow and touch controls, neutral comparison wording, and null-aware nutrient display.

## Daily Tracker Contract

`V2_DATA_CONTRACTS.md` now documents selected-date behavior, effective-target resolution, complete/partial/unavailable nutrient totals, empty-day semantics, refresh behavior, serving context, and accessible target comparison.

## Last Verified Tests

- `npm.cmd run check` passed all 81 Node tests and the Vite production build on 2026-10-07.
- Daily unit coverage includes multiple entries, empty days, all-null and mixed-null nutrients, explicit zeros, neutral comparisons, missing targets, target effective-date selection, local midnight, a DST transition, date arithmetic, owner/date filters, pagination range, navigation, refresh after save, retry, expired session, stale private-state rejection, and serving formatting.
- `npm.cmd run test:auth:local` passed signup, onboarding, empty daily state, target display, responsive/touch checks at 320, 390, 768, and 1280 pixels, explicit food logging, immediate daily refresh, accessible meter text, previous/Today navigation, persistence after refresh, logout/login, password recovery, and frozen calculator behavior.
- `npm.cmd run test:db` passed all 131 pgTAP assertions across seven files, including signed-out and cross-user food-log and target-history isolation.
- Local `public` and `private` schema lint reported no errors.
- No database migration, provider setting, dependency, or environment-variable change was introduced.

## Next Intended Action

Stop for human review of this planning update. V2-P8 remains the next unfinished implementation phase and must be separately authorized. The design blocker becomes the active stop after V2-P9.

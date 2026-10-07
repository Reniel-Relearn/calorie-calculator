# CalorieCheck Version 2 — Operational Status

**Current Version:** V2
**Current Phase:** V2-P7 — Daily Calorie Tracker
**Current Phase Status:** BLOCKED — USER ACTION REQUIRED
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

## Current Blocker

V2-P7 is implemented and verified locally. It requires no database migration. The new daily tracker has not yet been deployed or reviewed on the staging origin at a phone-sized viewport, so the phase cannot be marked done.

## Required Human Action

1. Review the V2-P7 diff, especially `js/dashboard/`, `css/dashboard.css`, the daily tracker markup in `index.html`, and the Daily Tracker Contract in `V2_DATA_CONTRACTS.md`.
2. Commit the reviewed files with the recommended message `Add V2 daily calorie tracker`.
3. Push the commit so Vercel deploys the matching frontend.
4. Wait for the staging deployment to report Ready, then open `https://calorie-calculator-gamma-ten.vercel.app/` at a phone-sized viewport or on a smartphone.
5. Sign in with a synthetic confirmed account and verify:
   - today's summary loads with the estimated target and an empty state or existing saved foods;
   - saving a new calculator result immediately updates consumed calories, nutrient totals, and the food list;
   - the food row shows its serving and calories;
   - Previous day and Today navigation load the expected dates;
   - the page has no horizontal overflow and all date controls are comfortable to tap;
   - comparison wording is neutral and no unavailable nutrient is displayed as zero.
6. Report **“V2-P7 staging daily tracker passed.”** if all checks succeed. Report the exact failed step and visible message if a check fails.

Do not share an account password, access token, database password, or API secret in chat. No Supabase dashboard change or migration is required for this phase.

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

Stop for deployment and the required phone-sized staging review. Do not mark V2-P7 done or begin V2-P8 until the staging daily tracker passes.

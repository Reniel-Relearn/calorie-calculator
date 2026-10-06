# CalorieCheck Version 2 — Operational Status

**Current Version:** V2
**Current Phase:** V2-P6 — Calculator to Food Log Integration
**Current Phase Status:** DONE
**Next Phase:** V2-P7 — Daily Calorie Tracker (planned; not authorized)
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

None for V2-P6.

## Required Human Action

Review and commit this completion-status update when ready. After review, say **“Proceed with the next V2 phase.”** to authorize V2-P7.

## V2-P6 Implementation Summary

- Added **Add to Today's Log** only to an authenticated, onboarded successful calculator result.
- Analysis and recalculation do not write food logs.
- Added a pure mapper from the frozen V1 result to scalar serving/nutrient fields and a versioned provenance snapshot.
- Added stable dataset version `v1-demo-2026-09-25` and calculation snapshot version `1.0.0`.
- Captures the source food, reference nutrition, exact food-specific conversion metadata, calculated nutrition, consumed instant, profile timezone, and stable local date.
- Preserves unavailable nutrients as null and explicit zero as zero.
- Added an owner-derived `create_food_log` RPC with a browser-generated UUID used as the log ID and idempotency key.
- Revoked direct authenticated inserts so the browser cannot supply or spoof `user_id` during initial log creation.
- Keeps an identical command for network retry; identical retries return the existing row and conflicting retries fail.
- Disables the action while pending, prevents double-click races, confirms success, and keeps the result available after recoverable failure.
- Publishes `caloriecheck:food-log-saved` with only the saved log ID and local date for V2-P7 refresh integration.
- Added no daily list, aggregate dashboard, weekly view, log editing/deletion UI, meal grouping, or offline queue.

## Snapshot Contract

`V2_DATA_CONTRACTS.md` documents the scalar mapping, null semantics, time model, request identity, snapshot version, and event contract. The snapshot contains the saved dataset, food source, reference, serving conversion, scale factor, and nutrients needed for a later edit without consulting current food data.

## Last Verified Tests

- A clean `npm.cmd run supabase:db:reset` applied all three local migrations on 2026-10-07.
- `npm.cmd run test:db` passed all 131 pgTAP assertions across seven files.
- Database coverage includes RPC execution grants, direct-insert denial, owner derivation, identical retry idempotency, conflicting retry rejection, cross-user denial, anonymous denial, RLS regressions, constraints, and cascades.
- `npm.cmd run check` passed all 69 Node tests and the Vite production build.
- Mapper coverage includes grams, food-specific cups, milliliters, source/dataset snapshots, edit reproduction, null versus zero, timezone boundaries, validation, and source-object nonmutation.
- Controller and service coverage includes no write on analysis, one write on explicit action, double-click prevention, identical network retry, expired-session handling, safe errors, and no caller-supplied user ID.
- `npm.cmd run test:auth:local` passed the real local signup, onboarding, explicit food-log RPC, responsive result, refresh, logout/login, password recovery, and frozen calculator flow.
- Local `public` and `private` schema lint reported no errors.
- `npx.cmd supabase db push --linked` applied `20261007090000_create_food_log_rpc.sql` to staging on 2026-10-07.
- Local and remote migration histories contain matching `20261003090000`, `20261006090000`, and `20261007090000` entries.
- The post-apply linked dry run reports that the remote database is up to date with no pending migration, seed, or role changes.
- The linked `public` and `private` schema lint reports no errors.
- The deployed staging flow passed human verification on 2026-10-07 for representative grams, food-specific cups, and milliliters.
- Each staging save displayed **Added to today's log** and disabled the action after the confirmed write.
- A visible daily log is intentionally absent from V2-P6; V2-P7 owns the daily tracker, saved-food list, and aggregate display.

## Next Intended Action

Stop for human review. V2-P7 is the next planned phase and remains unstarted until the user says **“Proceed with the next V2 phase.”**

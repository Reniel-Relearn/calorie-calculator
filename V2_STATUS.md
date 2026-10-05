# CalorieCheck Version 2 — Operational Status

**Current Version:** V2
**Current Phase:** V2-P4 — Evidence-Based Energy Target Engine
**Current Phase Status:** DONE
**Next Phase:** V2-P5 — Profile Onboarding, Personal Data, and Target History (planned; not started)
**Overall V2 Status:** IN PROGRESS

## Completed Phases

- V2-P0 — Master Planning and Architecture — completed 2026-09-28
- V2-P1 — Development Platform and Staging Foundation — completed 2026-09-30
- V2-P2 — Authentication and Persistent Session Foundation — completed 2026-10-02
- V2-P3 — Database Schema, Migrations, and Row-Level Authorization — completed 2026-10-05
- V2-P4 — Evidence-Based Energy Target Engine — completed 2026-10-05

## Current Blocker

None for V2-P4. The user approved maintain-only calorie targets for Version 2 on 2026-10-05. `LOSE` and `GAIN` remain recognized but unavailable because neither passed the separate Version 2 scientific and implementation gate.

No V2-P5 work has started.

## Required Human Action

Review the completed V2-P4 changes and test results. The approved scope is:

- `MAINTAIN` uses the verified 2023 National Academies EER engine;
- `LOSE` and `GAIN` remain recognized goal concepts but return a clear unavailable outcome;
- Version 2 includes no fixed deficit, fixed surplus, copied NIDDK implementation, or partial Hall approximation;
- a later version may revisit weight change through a separately approved scientific and licensing plan.

After review and any desired commit or push, say **“Proceed with the next V2 phase.”** to authorize V2-P5.

## V2-P4 Implementation Summary

- Added a pure National Academies 2023 EER equation layer for the 14–18.99 and 19+ branches.
- Implemented all male/female source categories and inactive, low-active, active, and very-active equation branches.
- Added the 20 kcal/day growth term only for the supported age-18 adolescent branch.
- Added structured `success`, `invalid`, `ineligible`, and `unavailable` outcomes.
- Added positive finite canonical input validation for age in years, height in centimeters, and weight in kilograms.
- Added explicit underage and nonpersistent life-stage eligibility outcomes.
- Added methodology ID/version, equation branch and table, normalized input snapshot, assumptions, source RMSE uncertainty, and warnings.
- Kept the life-stage confirmation out of the returned snapshot so later persistence cannot store it accidentally.
- Kept presentation rounding in a separate helper; the core returns unrounded safe-precision values.
- Added explicit unavailable outcomes for unsupported equation categories and goals.
- Added explicit `GOAL_METHOD_UNAVAILABLE` results for `LOSE` and `GAIN` while preserving the verified maintenance estimate.
- Added no onboarding UI, database service, profile write, target-history write, deficit/surplus rule, dashboard, or future-phase feature.

## Scientific Gate Outcome

- National Academies Tables S-2 and S-3 supplied the complete maintenance coefficient set and unit definitions.
- The official worked example independently confirms the implementation's 2,275.37 kcal/day result before whole-kcal display rounding.
- Exact tests protect the age 18 and age 19 branch boundaries; adult coefficients are never extended below age 19.
- The National Academies report describes material individual variation and approximate PAL selection, so the result includes uncertainty metadata and is labeled as an estimate.
- The Hall model requires a coupled numerical simulation and additional inputs and assumptions that are not defined by the current product model.
- The official NIDDK implementation is listed through NIH Technology Transfer, and no reusable software license was identified for its code or assets.
- Official validation and product material center on weight loss and maintenance; intentional gain lacks sufficient independent consumer target vectors.

## Last Verified Tests

- 16 fixed reference cases pass across both age branches, both source sex categories, and all four activity categories.
- The National Academies worked example passes before and after separate presentation rounding.
- Values immediately below, at, and above ages 18 and 19 select the required ineligible, adolescent, or adult outcome.
- Missing, unitless-string, zero, negative, `NaN`, and infinite canonical values fail safely.
- Finite values that overflow calculation fail without returning an infinite target.
- Underage and unconfirmed/excluded life-stage inputs return explicit ineligible outcomes.
- Unsupported sex, activity, and goal categories return unavailable outcomes.
- `LOSE` and `GAIN` return no target and do not apply a fixed calorie adjustment.
- Methodology metadata is stable, life-stage confirmation is not snapshotted, inputs are not mutated, and repeated calls are deterministic.
- `node --test tests/energy-target.test.js` passed all 11 V2-P4 tests.
- `npm run check` passed all 41 project tests and the Vite production build, including authentication and frozen Version 1 regressions.

## Next Intended Action

Stop for human review. V2-P5 is the next planned phase and remains unstarted until the user authorizes the next V2 phase.

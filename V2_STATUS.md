# CalorieCheck Version 2 Status

**Current Version:** V2

**Current Program:** V2 design integration — V2-D2 authorized

**Current Status:** V2-D1 DONE — USER-APPROVED 2026-11-23; COMMIT/PUSH REQUESTED. V2-D2 AUTHORIZED.
**Next Phase:** V2-D2 — Visual Foundations and Shared Components

## Completed Baseline

- V2-P1 through V2-P9 are complete and staging-verified.
- V2-S0 public-exposure security hardening is complete and production-verified.
- V2-D0 design planning, references, wireframes, and isolated prototype were approved on 2026-11-03.
- V2-G0 scientific/product methodology was authorized by the product owner on 2026-11-03.
- V2-G1 through V2-G3 are complete for staging; the user confirmed the full G3 staging checklist passed on 2026-11-23. Evidence and its attribution are in `V2_G3_STAGING_VERIFICATION.md`.

## V2-G0 Decision

- Maintain uses the existing 2023 NASEM EER from age 18.
- Lose uses raw `EER − 1.96 × adult SEPV` from age 19.
- Gain uses raw `EER + 1.96 × adult SEPV` from age 19.
- Adult SEPV is `342 kcal/day` for the male equation and `241 kcal/day` for the female equation.
- These are starting estimates, not rate/date/body-composition predictions.
- Goal weight, goal date, desired rate, and forecasting are excluded.
- Lose is unavailable below BMI `18.5`; both directional goals are unavailable below BMI `16` or when the non-persistent safety confirmation is not satisfied.
- Lose below the CalorieCheck `1,200 kcal/day` safety boundary is unavailable and is never clamped.
- Professional review remains recommended and outstanding. It is not a product-owner release prerequisite, and no professional endorsement or clinical validation is claimed.

The controlling records are V2-ADR-032, R-029, and `V2_LOSE_GAIN_TARGET_PLAN.md`.

## Local Implementation Evidence

Implemented:

- shared pure BMI and Maintain/Lose/Gain target engine;
- structured age, life-stage, safety-confirmation, BMI, low-intake, unsupported, and non-finite outcomes;
- versioned directional methodology and reproducibility snapshot;
- raw calculation precision with display-only rounding;
- onboarding and Settings goal selection and non-persistent safety confirmations;
- exact bottommost Settings disclaimer;
- existing profile/settings services and effective target history integration;
- additive migration `20261103090000_enable_directional_energy_targets.sql`;
- database-side goal/age/method/snapshot/SEPV/arithmetic/BMI/floor validation;
- pgTAP directional onboarding/settings cases;
- unit, controller, UI-contract, boundary, security, and regression tests.

Verified locally on 2026-11-03:

- `npm.cmd run check` — 140 tests passed; the 101-module production build passed; dependency audit reported 0 vulnerabilities; repository security scan passed.
- `npm.cmd run supabase:db:reset` — all six migrations applied cleanly, including `20261103090000_enable_directional_energy_targets.sql`.
- `npm.cmd run test:db` — 10 pgTAP files and 189 database/RPC/RLS tests passed.
- `npx.cmd supabase db lint --local --level warning` — no schema errors found.
- `npm.cmd run test:auth:local` — full browser integration passed, including real Maintain/Lose/Gain Settings target changes.

Verified on staging infrastructure on 2026-11-03:

- `20261103090000_enable_directional_energy_targets.sql` was the only pending linked migration and was applied successfully after explicit approval;
- linked local and remote migration ledgers match through `20261103090000`;
- `npx.cmd supabase db lint --linked --level warning` reported no schema errors;
- Vercel preview deployment `dpl_2BG7ntErw59QvJH4KAHBegau93UJ` reached `READY` without promoting to production;
- authenticated Vercel preview smoke returned HTTP 200 with the expected security headers and the Lose/Gain controls and Settings estimate disclaimer in the built HTML.

Verified on 2026-11-23:

- Remote migration ledger, schema lint, RLS/ownership/grants, Security Advisor findings, matching preview smoke, and five existing PR checks were inspected by the agent.
- Provider callback/hostname configuration was confirmed by the user. Login was resolved using the original account password; attempting signup with the existing email had not replaced that password.
- The full hosted browser checklist was reported passed by the user. This is human-reported acceptance, not an agent-run hosted browser test.
- Controlled production deployment remains outside this closeout and has not been performed.

## Current Blockers / Human Actions

No G3 or D1 blocker remains. The user approved D1, requested its commit/push, and authorized D2 on 2026-11-23.

- Separate backup-factor enrollment remains recommended and unconfirmed; it is not a design-phase blocker.
- Four intentional SECURITY DEFINER RPC warnings, one free-plan leaked-password-protection warning, and one private throttle-table informational finding remain documented in `V2_G3_STAGING_VERIFICATION.md`.
- Professional review remains recommended and outstanding under the accepted decision.
- [V2_DESIGN_TRACEABILITY.md](V2_DESIGN_TRACEABILITY.md) is user-approved; D2 follows its visual-foundation scope.
- Commit/push G3 completed as `71990c2` on `feature/v2-design-revision`; all five PR checks passed and its new Vercel preview is Ready. No merge or production deployment occurred.
- D1 commit/push is authorized. D2 implementation must return for local review before its commit/push. The two research PDFs remain excluded.

## V2-D1 Evidence

- Read the canonical product, design, architecture, decisions, research, and testing documents; audited runtime markup, view/controller/service boundaries, CSS, and isolated prototype sources.
- Mapped all 10 auth states, all 7 calculator states, profile/onboarding/target outcomes, daily/weekly variants, logging/management/settings/deletion states, and cross-application feedback.
- Defined component ownership, allowed query/history behavior, responsive/asset rules, concrete D2–D6 slices/tests, catalog checkpoint, and regression risks in `V2_DESIGN_TRACEABILITY.md`.
- Reconciled prototype goal weight/date/BMI/sample data against ADR-032; no new formula, data field, or product feature approved.
- Source/anchor/prototype inventory checks, referenced-file checks, and whitespace checks passed. D1 changed documentation only; no new runtime, database, visual, or hosted acceptance test is claimed.

## Ordered Roadmap

1. V2-P1 through V2-P9 — **DONE**
2. V2-S0 — **DONE**
3. V2-D0 — **DONE — APPROVED 2026-11-03**
4. V2-G0 — **DONE — APPROVED 2026-11-03**
5. V2-G1 — **DONE LOCALLY; UNIT/REGRESSION VERIFIED**
6. V2-G2 — **STAGING MIGRATION APPLIED; LOCAL/REMOTE LEDGERS MATCH; REMOTE LINT PASSED**
7. V2-G3 — **DONE — STAGING CHECKLIST PASSED, USER-CONFIRMED 2026-11-23**
8. V2-D1 — **DONE — USER-APPROVED 2026-11-23**; V2-D2 **AUTHORIZED**; V2-D3 through V2-D6 **NOT STARTED**
9. V2-P10 onward — **NOT STARTED**

## Next Intended Action

Commit/push the approved D1 documents, then implement D2 tokens and reusable presentation primitives and provide a local component specimen for review. Do not begin D3 navigation. Accepted G3 functional evidence remains in `V2_G3_STAGING_VERIFICATION.md`; new preview hostnames may need provider allow-listing before Auth tests.

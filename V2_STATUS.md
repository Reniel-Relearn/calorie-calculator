# CalorieCheck Version 2 Status

**Current Version:** V2

**Current Program:** V2 design integration — V2-D2 staging review

**Current Status:** BLOCKED — USER ACTION REQUIRED: V2-D2 STAGING SAMPLE ACCEPTANCE. Local review approved and commit/push authorized 2026-11-23. Implementation/local checks passed 2026-11-23.
**Next Phase after D2 acceptance:** V2-D3 — Mobile App Shell and Navigation Revision (not started)

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

No G3 or D1 blocker remains. D1 was committed/pushed as `5ee3340` after explicit approval. D2 is implemented and verified locally; its local visual review passed; staging visual acceptance remains open.

- Separate backup-factor enrollment remains recommended and unconfirmed; it is not a design-phase blocker.
- Four intentional SECURITY DEFINER RPC warnings, one free-plan leaked-password-protection warning, and one private throttle-table informational finding remain documented in `V2_G3_STAGING_VERIFICATION.md`.
- Professional review remains recommended and outstanding under the accepted decision.
- [V2_DESIGN_TRACEABILITY.md](V2_DESIGN_TRACEABILITY.md) is user-approved; D2 follows its visual-foundation scope.
- Commit/push G3 completed as `71990c2` on `feature/v2-design-revision`; all five PR checks passed and its new Vercel preview is Ready. No merge or production deployment occurred.
- D1's five PR checks passed and preview `dpl_67ifyGsmuDC9ozN8PeLCK4o365Ny` is Ready (`https://calorie-calculator-o0q2nalm2-reniel-relearn-qg-x-plai.vercel.app/`). This preview contains D1 documentation, not uncommitted D2 code.
- Open `http://localhost:5173/prototypes/v2-foundations/` while Vite is running; review the components at phone and desktop widths using [V2_VISUAL_FOUNDATIONS.md](V2_VISUAL_FOUNDATIONS.md). No Docker/Supabase login is needed for this specimen.
- The user approved D2 locally and authorized commit/push on 2026-11-23. After CI/preview readiness, review the same specimen path on staging; confirm acceptance before authorizing D3.
- D2 commit/push is authorized. The two research PDFs remain excluded; no merge or production deployment occurred.

## V2-D2 Evidence

- Shared runtime color/type/space/control/focus/elevation/motion tokens, standardized buttons/fields/status/surfaces, and ten original local SVG symbols implemented. No controller/service/domain/data/migration changes.
- Added a functioning review-only specimen at `prototypes/v2-foundations/`, included as a second Vite build entry. Existing screen layouts and navigation stay assigned to D3–D5.
- `npm.cmd run check` passed: 140 JavaScript tests, two-entry Vite build, npm audit 0 vulnerabilities, security scan.
- `npm.cmd run test:design:local` passed against development and built-artifact servers: eleven viewport/short-height checks, visible important control dimensions, semantics, local assets, twelve contrast pairs, keyboard/dialog/validation interactions, reduced motion, and scaling/reflow. Lowest checked normal-text contrast: 4.839:1.
- Existing `npm.cmd run test:auth:local` passed against confirmed local Supabase, including onboarding, all goals, log edit/delete, Today/Week, recovery, deletion, and session restoration.
- Phone/desktop screenshots inspected locally in ignored `.vercel/design-review/`. Hosted D2 acceptance, Firefox/Safari, real touch/soft-keyboard, and dedicated assistive technology are not claimed.
- Local Supabase and the build-preview server were stopped after verification. Vite development server remains available on 127.0.0.1:5173 for the requested review.

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
8. V2-D1 — **DONE — USER-APPROVED/PUSHED**; V2-D2 **LOCAL REVIEW APPROVED — STAGING REVIEW PENDING**; V2-D3 through V2-D6 **NOT STARTED**
9. V2-P10 onward — **NOT STARTED**

## Next Intended Action

Local review is approved and commit/push is explicitly authorized; verify CI and built specimen on its Ready preview, then obtain staging sample acceptance. D3 follows only after review/authorization. [V2_VISUAL_FOUNDATIONS.md](V2_VISUAL_FOUNDATIONS.md) records exact tokens, changed files, evidence, limitations, and next actions. The specimen has no Auth/Turnstile dependency, so reviewing it alone needs no new provider hostname configuration.

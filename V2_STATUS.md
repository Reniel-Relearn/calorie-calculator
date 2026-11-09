# CalorieCheck Version 2 Status

**Current Version:** V2

**Current Program:** V2-G1 through V2-G3 — Adult Lose/Gain Targets

**Current Status:** BLOCKED — USER ACTION REQUIRED: RESTORE SUPABASE DASHBOARD MFA ACCESS FOR AUTHENTICATED STAGING VERIFICATION
**Next Phase after verification:** V2-D1 — Interface Audit and Design Traceability

## Completed Baseline

- V2-P1 through V2-P9 are complete and staging-verified.
- V2-S0 public-exposure security hardening is complete and production-verified.
- V2-D0 design planning, references, wireframes, and isolated prototype were approved on 2026-11-03.
- V2-G0 scientific/product methodology was authorized by the product owner on 2026-11-03.

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

Not yet verified:

- authenticated end-to-end application behavior on the protected staging preview;
- Supabase advisors/RLS after migration;
- controlled production deployment.

## Current Blockers / Human Actions

1. Restore the project owner's Supabase dashboard MFA access using the synchronized or repaired TOTP device. Supabase support reports no recovery path when all registered factors are unavailable.
2. Preserve the currently authenticated Supabase CLI session: do not log out, delete its local account state, or treat it as a replacement for dashboard account recovery.
3. Allow-list the exact preview origin in Supabase Auth redirect URLs and Cloudflare Turnstile hostnames for this temporary verification deployment.
4. Open the Vercel-protected preview while signed into the authorized Vercel account.
5. Verify eligible and unavailable Maintain/Lose/Gain onboarding and Settings flows, target history, Today, Week, disclaimer placement, mobile, and desktop on staging.
6. Inspect Supabase Security Advisor/RLS after migration and report any new finding.
7. Explicitly approve the later controlled production rollout only after staging passes.

Do not promote the preview to production, commit, push, or merge automatically. Do not mark V2-G3 complete until authenticated staging verification passes.

## Ordered Roadmap

1. V2-P1 through V2-P9 — **DONE**
2. V2-S0 — **DONE**
3. V2-D0 — **DONE — APPROVED 2026-11-03**
4. V2-G0 — **DONE — APPROVED 2026-11-03**
5. V2-G1 — **DONE LOCALLY; UNIT/REGRESSION VERIFIED**
6. V2-G2 — **STAGING MIGRATION APPLIED; LOCAL/REMOTE LEDGERS MATCH; REMOTE LINT PASSED**
7. V2-G3 — **PREVIEW READY; AUTHENTICATED STAGING VERIFICATION PENDING**
8. V2-D1 through V2-D6 — **NOT STARTED; BLOCKED BY V2-G2/G3 VERIFICATION**
9. V2-P10 onward — **NOT STARTED**

## Next Intended Action

Restore Supabase dashboard MFA access, enroll a separate backup factor, then complete the protected preview configuration and human staging matrix. Professional review may occur later and must be recorded honestly, but it is not the active blocker.

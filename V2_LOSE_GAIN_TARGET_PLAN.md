# CalorieCheck V2 Lose/Gain Target Methodology and Implementation Plan

**Program:** V2-G0 through V2-G3

**Decision date:** 2026-11-03
**Status:** PRODUCT METHOD APPROVED; STAGING MIGRATION APPLIED; PREVIEW READY; AUTHENTICATED STAGING VERIFICATION BLOCKED BY SUPABASE DASHBOARD MFA ACCESS

## 1. Accepted product method

The product owner explicitly authorized production Lose Weight and Gain Weight without making licensed-professional signoff a release prerequisite. Professional review remains recommended and outstanding; CalorieCheck does not claim clinical validation or professional endorsement.

The accepted calculations are:

- Maintain, age 18+: the existing 2023 National Academies Estimated Energy Requirement (EER).
- Lose, age 19+: raw EER minus `1.96 × adult SEPV`.
- Gain, age 19+: raw EER plus `1.96 × adult SEPV`.
- Female-equation adult SEPV: `241 kcal/day`; directional displacement `472.36 kcal/day`.
- Male-equation adult SEPV: `342 kcal/day`; directional displacement `670.32 kcal/day`.

Source: National Academies of Sciences, Engineering, and Medicine, *Dietary Reference Intakes for Energy* (2023), Chapter 7, “Individuals Seeking to Lose or Gain Weight,” and Table 5-8. DOI: `10.17226/26818`.

These values are directional starting estimates. They are not predictions of a weight-change rate, date, body composition, or guaranteed outcome. The calculation retains raw internal precision; presentation rounds separately.

## 2. Product boundaries

Version 2 does not collect or derive:

- goal weight;
- goal date;
- desired weekly rate;
- weight-change forecasts;
- automatic background recalculation;
- muscle-gain or body-composition predictions.

Targets recalculate only after an explicit change to a target-affecting profile field. Every accepted change appends a new effective-dated target and closes the prior row without rewriting history.

## 3. Safety policy

The following rules fail closed:

- age below 18: no target;
- age 18 through 18.99: Maintain only;
- pregnancy or breastfeeding: no target under the supported contract;
- missing or negative non-persistent safety confirmations: no applicable target;
- BMI below `18.5`: Lose unavailable;
- BMI below `16`: both directional goals unavailable with professional-care guidance;
- calculated Lose result below `1,200 kcal/day`: unavailable, never clamped;
- unsupported equation category, activity category, malformed metadata, or non-finite result: unavailable or invalid as appropriate.

The `1,200 kcal/day` boundary is a conservative CalorieCheck product policy, not a NASEM equation constant or universal physiological floor. BMI is used only as a safety screen; it is not a calorie equation or diagnosis. CalorieCheck cannot medically screen users. The interface therefore distinguishes known profile inputs and user confirmation from conditions the application does not assess.

## 4. Versioned target contract

Maintain targets retain:

- methodology: `nasem-dri-energy-2023-eer`;
- version: `1.0.0`.

Lose/Gain targets use:

- methodology: `nasem-dri-energy-2023-directional-sepv`;
- version: `1.0.0`;
- source DOI: `10.17226/26818`;
- snapshot `directionalAdjustment` containing method, SEPV, multiplier, displacement, direction, and safety-policy version.

The life-stage and directional-safety confirmations are evaluated in memory and are not stored in the profile or target snapshot. Target history stores the canonical calculation inputs and reproducibility metadata. Existing RLS, grants, authentication, owner derivation, and effective-dated history remain unchanged.

## 5. Implementation phases

### V2-G0 — methodology and safety decision

**Status:** DONE — product authorization recorded 2026-11-03.

The NASEM directional method, age boundary, sex-specific adult SEPV constants, raw-precision policy, BMI safeguards, low-intake rule, no-forecasting scope, and professional-review status are settled for this release.

### V2-G1 — pure engine and validation

**Status:** DONE LOCALLY — automated JavaScript verification passed.

The shared deterministic engine calculates Maintain/Lose/Gain, returns structured unavailable/ineligible outcomes, does not mutate inputs, preserves raw precision, and keeps display rounding outside the engine.

### V2-G2 — data contract and additive migration

**Status:** STAGING MIGRATION APPLIED — clean reset, schema lint, pgTAP, linked ledger, and remote lint passed.

The additive migration widens stored target precision, installs a non-client-callable payload validator, and replaces both trusted profile RPC bodies without changing their signatures. The database validates goal/age compatibility, method/version, snapshot canonical fields, SEPV constants, displacement arithmetic, BMI boundaries, and the Lose floor. Existing data, RLS, and effective-dated history are preserved.

### V2-G3 — application integration

**Status:** BLOCKED — preview ready and enhanced local browser integration passed; authenticated staging verification requires restored Supabase dashboard MFA access.

Onboarding and Settings expose all three goals, collect non-persistent safety confirmations, display structured failures, persist versioned targets through existing services, and keep daily/weekly consumers goal-agnostic. The required disclaimer is the bottommost Settings section.

## 6. Verification evidence and remaining gates

Locally verified:

- Maintain regression and all EER branches;
- female/male directional arithmetic and metadata;
- age 18 versus age 19 boundary;
- BMI `<18.5` Lose and BMI `<16` directional blocks;
- `<1,200 kcal/day` Lose fail-closed behavior;
- missing/negative safety confirmations;
- non-persistence of confirmations;
- Settings target change and historical-target command shape;
- bottommost disclaimer contract;
- full JavaScript suite and production Vite build.
- clean local Supabase reset with every migration applied;
- 189 pgTAP database, RPC, constraint, rollback, and RLS tests;
- Supabase schema lint with no errors;
- browser integration covering onboarding, Maintain/Lose/Gain Settings changes, non-persistent confirmations, target direction, disclaimer placement, Today, Week, logs, authentication, recovery, and account deletion.

Staging infrastructure verified on 2026-11-03:

- the reviewed additive migration was the only pending linked migration and was applied successfully;
- linked local and remote migration ledgers match through `20261103090000`;
- remote schema lint reported no errors;
- Vercel preview deployment `dpl_2BG7ntErw59QvJH4KAHBegau93UJ` reached `READY` without a production promotion;
- authenticated preview smoke returned HTTP 200 with security headers and the expected Lose/Gain and disclaimer markup.

Still required before production deployment:

1. Restore Supabase dashboard MFA access and enroll a separate backup TOTP factor.
2. Allow-list the temporary preview origin in Supabase Auth and Cloudflare Turnstile.
3. Complete authenticated staging verification for onboarding/settings Maintain, Lose, Gain, unavailable cases, Today, Week, and historical targets on mobile and desktop.
4. Inspect Supabase advisors and RLS after migration.
5. Perform a controlled production rollout only after explicit approval.

Professional review is an outstanding recommendation, not an active implementation or deployment gate. Any later professional finding must be handled through a new versioned decision and migration; history must not be rewritten.

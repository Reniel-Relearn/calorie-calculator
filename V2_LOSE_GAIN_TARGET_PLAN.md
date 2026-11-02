# CalorieCheck V2 Lose/Gain Target Methodology and Implementation Plan

**Phase:** V2-G0 — Lose/Gain Scientific Methodology and Safety Gate<br>
**Status:** METHODOLOGY REVIEW REQUIRED — PRODUCTION LOGIC NOT AUTHORIZED<br>
**Created:** 2026-11-03<br>
**Decision owner:** Product owner

## 1. Purpose and boundary

The user approved Lose Weight and Gain Weight as intended CalorieCheck product directions and approved their presentation in the isolated V2 prototype. This plan defines the evidence, safety, data, architecture, persistence, interface, and verification work required before either goal may become a production calculation.

This document does **not** authorize a deficit, surplus, database migration, RPC change, production UI integration, or deployed target. The current production application remains Maintain-only until the methodology gate is explicitly approved and each later implementation stage passes.

## 2. Current production baseline

- Maintenance uses the implemented National Academies 2023 Estimated Energy Requirement equations.
- `maintain`, `lose`, and `gain` are recognized schema concepts.
- The pure target engine returns `GOAL_METHOD_UNAVAILABLE` for Lose and Gain.
- Profile validation and both atomic profile RPCs reject every non-Maintain goal.
- `profiles` has no goal-weight or goal-date fields.
- `calorie_targets` already records goal type, maintenance and target calories, methodology name/version, activity, an input snapshot, assumptions, warnings, and effective history.
- Today and Week resolve immutable effective target history; this behavior must remain intact.
- The prototype's Lose/Gain calorie figures are sample design content and are not calculation test vectors.

## 3. Evidence findings

### 3.1 Maintenance remains the baseline

The National Academies 2023 EER equations estimate energy needs from age, equation sex, height, weight, and physical-activity category. For a weight-stable adult, EER is based on total energy expenditure. This remains CalorieCheck's baseline maintenance estimate and must stay visible separately from any goal-specific method.

Source: [National Academies — Dietary Reference Intakes for Energy, Chapter 5](https://www.nationalacademies.org/read/26818/chapter/7)

### 3.2 BMI is context and a safety signal, not the calorie formula

Adult BMI is `weight in kilograms / height in meters²`. CDC describes BMI as a screening measure that must be considered with other factors; it is not a diagnosis and does not distinguish fat, muscle, or bone mass. CalorieCheck may calculate current and goal BMI for neutral context and goal screening, but must not derive calorie intake from a BMI category.

Sources: [CDC Adult BMI Categories](https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html), [CDC BMI FAQ](https://www.cdc.gov/bmi/faq/)

Filipino-first use also creates a threshold-policy question: some clinical screening guidance uses lower action points for people with Asian backgrounds. CalorieCheck must not silently choose an ethnicity-based classification or infer ethnicity. A separate approved display and safety policy is required before categorical BMI labels become authoritative.

### 3.3 Static calorie rules are not an acceptable target engine

CDC describes gradual weight loss of about 1–2 pounds per week as more sustainable for many people, and NHS consumer guidance gives a general 300–500 kcal/day addition for gradual adult weight gain. These are useful review and warning references, but they are not personalized predictive equations.

The Hall adult dynamic model accounts for metabolic adaptation and the slow, nonlinear response of body weight to energy imbalance. The research specifically explains why static `3,500 kcal per pound`, fixed `−500 kcal`, and mirrored fixed-surplus rules can create inaccurate timelines.

Sources: [CDC Steps for Losing Weight](https://www.cdc.gov/healthy-weight-growth/losing-weight/), [NHS Healthy Ways to Gain Weight](https://www.nhs.uk/live-well/healthy-weight/managing-your-weight/healthy-ways-to-gain-weight/), [Hall et al. 2011](https://pmc.ncbi.nlm.nih.gov/articles/PMC3880593/)

### 3.4 The strongest candidate is an independently implemented dynamic model

NIDDK states that its Body Weight Planner uses the published Hall adult model to produce calorie/activity plans for reaching a goal weight within a specific period and maintaining it afterward. The documented inputs include current weight, sex, age, height, physical activity, goal weight, goal time, and optional activity changes. Its scope is adults 18 or older and excludes pregnancy and breastfeeding.

Sources: [NIDDK Research Behind the Body Weight Planner](https://www.niddk.nih.gov/research-funding/at-niddk/labs-branches/laboratory-biological-modeling/integrative-physiology-section/research/body-weight-planner), [published model appendix](https://www.niddk.nih.gov/-/media/Files/BWP/Hall_Lancet_Web_Appendix.pdf)

The official simulator/applet has an NIH technology-transfer and licensing path. CalorieCheck must not copy the official application's code, assets, UI, or binary. Before implementation, the project needs a documented licensing position for an original implementation of the published equations and must reproduce independent reference outputs.

Source: [NIDDK Body Weight Simulator licensing record](https://www.niddk.nih.gov/research-funding/technology-advancement-transfer/research-materials-licensing/body-weight-simulator-java-applet)

### 3.5 Lose and Gain require separate acceptance evidence

The published equations describe positive and negative energy imbalance, but the reviewed official consumer planner, product language, and validation emphasis center on adult weight loss and maintenance. Gain must not be enabled merely by reversing the sign of a loss calculation. It requires gain-specific reference vectors, safe domains, warnings, and acceptance evidence.

## 4. Recommended methodology disposition

| Goal | Recommended disposition | Production condition |
|---|---|---|
| Maintain | Keep the verified National Academies 2023 EER implementation | Existing tests remain green |
| Lose | Evaluate an original implementation of the published Hall adult dynamic model | Licensing position, numerical specification, independent reference outputs, safety policy, and complete tests approved |
| Gain | Evaluate separately using the same published dynamics only if positive-energy behavior receives independent validation | Gain-specific vectors and safety review pass; otherwise remain unavailable while Maintain/Lose proceed |

Rejected shortcuts:

- BMI category → calorie target;
- maintenance minus or plus a universal number;
- `7,700 kcal per kilogram` linear scheduling;
- copying or scraping the NIDDK planner;
- sending private profile inputs to an undocumented third-party calculator;
- calling a sample prototype number a recommendation;
- silently choosing a goal date, target rate, activity change, or serving intake floor.

## 5. Proposed adult eligibility and inputs

The implementation may proceed only for a validated input domain. The proposed minimum input contract is:

- date of birth and exact age on the target's local effective date;
- equation sex required by the selected source equation;
- height in centimeters;
- current weight in kilograms;
- current activity category or a separately validated continuous activity value;
- goal type: Maintain, Lose, or Gain;
- goal weight in kilograms for Lose/Gain;
- goal date for Lose/Gain;
- IANA timezone;
- non-persistent confirmation that the adult is not pregnant or breastfeeding;
- an explicit assumption that activity stays constant, unless activity-change input is approved.

Direction rules:

- Maintain: goal weight and goal date are absent.
- Lose: goal weight is lower than current weight.
- Gain: goal weight is higher than current weight.
- Goal date must be a future local date and must create a numerically solvable interval.
- Zero, negative, non-finite, malformed, or out-of-domain values fail before simulation.

Open input decisions requiring methodology review:

1. Keep the current four activity categories or collect a continuous physical-activity level?
2. Assume unchanged activity or allow a planned activity change?
3. Should the goal be recalculated only after an explicit profile/weight update, or does V2 add periodic weigh-ins?
4. Which BMI presentation policy is appropriate for a Filipino-first audience without inferring ethnicity?

## 6. Required safety policy

The accepted method must define structured `SUCCESS`, `INVALID`, `INELIGIBLE`, and `UNAVAILABLE` outcomes. It must not use exceptions for ordinary user-correctable input.

Mandatory protections:

- adults only;
- pregnancy and breastfeeding excluded;
- BMI shown only as screening context;
- block an internally inconsistent goal direction;
- reject past or impossible target dates;
- detect solver failure, non-convergence, non-finite values, and out-of-domain inputs;
- preserve full internal precision and round only for display;
- label every output as an estimate rather than a medical prescription;
- state the constant-activity and adherence assumptions;
- advise professional review for extreme, rapid, clinically concerning, or otherwise unsupported goals;
- never silently replace an unsafe goal with a different goal;
- never turn a missing or failed target into maintenance without telling the user.

Still unresolved and therefore blocking production:

- the exact minimum calorie floor and whether it varies by source-equation sex or other factors;
- the maximum allowed rate/timeframe policy and whether it blocks or warns;
- low/high BMI warning thresholds, including Asian-risk context;
- extreme starting/goal weight domains supported by validation evidence;
- handling for medical conditions, medications, recent unintentional weight change, and eating-disorder risk;
- Gain-specific safety and output limits.

Provider rules such as the NIDDK planner's 1,000 kcal/day floor must not be imported as unexplained constants.

## 7. Calculation and output contract

The pure calculation layer should remain DOM-, Supabase-, clock-, network-, and locale-independent.

Conceptual input:

```js
{
  effectiveLocalDate,
  ageYears,
  sexForEnergyEquation,
  heightCm,
  currentWeightKg,
  activityCategory,
  goalType,
  goalWeightKg,
  goalDate,
  activityChange
}
```

Conceptual successful output:

```js
{
  ok: true,
  maintenanceKcal,
  targetKcal,
  currentBmi,
  goalBmi,
  goalType,
  goalWeightKg,
  goalDate,
  methodology,
  methodologyVersion,
  assumptions,
  warnings,
  inputSnapshot,
  modelSnapshot
}
```

The model snapshot should contain only the reproducibility metadata needed to validate the result. It must not store unnecessary health data or a huge daily trajectory unless a reviewed product requirement needs it.

## 8. Proposed persistence contract

### `profiles`

Proposed nullable fields:

- `goal_weight_kg numeric(6,2)`;
- `goal_date date`.

Maintain requires both to be null. Lose/Gain require both to be present. Profile fields represent the current user preference, not historical truth.

### `calorie_targets`

Proposed explicit historical fields:

- `goal_weight_kg numeric(6,2)`;
- `goal_date date`;
- optional compact `model_snapshot jsonb` if the accepted method needs reproducibility data not already represented by `input_snapshot`, `assumptions`, and `warnings`.

The existing `methodology` and `methodology_version` columns remain authoritative; do not add duplicate method-name fields. Every effective target record must capture baseline weight, goal weight/date, maintenance estimate, goal-specific estimate, model version, assumptions, and warnings as they existed when created.

Constraints and RPC validation must enforce nullability by goal type, positive finite values, direction consistency, supported methodology/version pairs, and matching snapshots. RLS and owner derivation remain unchanged.

### Historical behavior

- A new target closes the previous effective range and creates a new current record atomically.
- Past targets and food logs are never rewritten.
- Today and Week continue resolving the target effective for each local date.
- An explicit profile/weight/activity/goal change creates a new target; no silent background target mutation occurs.
- If later periodic weigh-ins are approved, they require a separate contract rather than overloading food logs.

## 9. Architecture boundaries

- `js/targets/eer-equations.js`: existing maintenance equations only.
- New weight-change model module: numerical simulation and model constants only.
- `js/targets/energy-target.js`: validates common eligibility and orchestrates Maintain/Lose/Gain outcomes.
- New BMI helper: pure screening calculation and neutral category/context formatting; never provides calories.
- Profile/settings validation: canonical user input and direction/date validation.
- Services: map approved commands to atomic RPCs; never recalculate targets.
- Database RPCs: enforce ownership, supported method/version, snapshot integrity, and atomic history.
- UI: collect inputs, explain assumptions, render outcomes, and preserve accessible pending/error states; never contain formula constants.

## 10. Execution stages and commit boundaries

### V2-G0 — Methodology and safety gate — current

- approve or reject the dynamic-model candidate;
- settle licensing/independent-implementation boundaries;
- approve supported goal types and adult domains;
- approve inputs, safeguards, floors, warnings, and recalculation policy;
- obtain independent Lose vectors and separate Gain vectors.

**Stop condition:** No production logic changes until this gate is approved.

**Suggested commit:** `Plan V2 Lose and Gain target methodology`

### V2-G1 — Pure model implementation and validation

- implement the approved numerical method independently;
- keep BMI separate;
- create deterministic fixtures and tolerance policies;
- compare with published/independent reference outputs;
- retain explicit unavailable outcomes for every unapproved goal/domain.

**Suggested commit:** `Add validated weight target calculations`

### V2-G2 — Data contracts and reviewed migration

- finalize profile and target-history fields;
- add constraints, indexes only if justified, grants, RLS-preserving RPC updates, and pgTAP coverage;
- reset and lint the local database;
- stop for migration review before remote application.

**Suggested commit:** `Extend private target history for weight goals`

### V2-G3 — Application validation and persistence integration

- extend onboarding/settings validation and services;
- create targets atomically;
- preserve idempotence, owner derivation, effective history, and rollback behavior;
- add unit/controller/service tests.

**Suggested commit:** `Integrate weight goals with profile targets`

### V2-D1 through V2-D6 — Approved interface integration

- implement the approved visual system and navigation;
- replace sample prototype values with the validated calculation output;
- integrate goal inputs/review, Today Goals, Settings, target history, loading/error/unavailable states, and Week historical resolution;
- perform complete responsive, accessibility, regression, and staging review.

Do not copy prototype constants into production.

## 11. Required verification matrix

Scientific and numerical:

- every approved reference vector within documented tolerance;
- repeatability and nonmutation;
- current weight equals goal weight;
- small and large but supported changes;
- near/far goal dates;
- loss and gain tested independently;
- solver convergence and failure;
- floating-point noise and display rounding;
- maintenance remains identical to the frozen verified engine.

Eligibility and safeguards:

- under 18;
- exact eighteenth birthday;
- pregnancy/breastfeeding exclusion;
- direction mismatch;
- past/missing date;
- missing, zero, negative, NaN, Infinity, malformed, and overflow inputs;
- unsupported BMI/domain/rate/floor cases;
- unapproved Gain remains unavailable rather than approximated.

Persistence and authorization:

- schema constraints and method/version allow list;
- owner-only RLS and anonymous denial;
- no client-supplied owner identity;
- atomic profile + target update;
- rollback on any mismatch;
- historical effective ranges never overlap;
- target snapshots reproduce the saved result;
- cross-user and direct REST/RPC bypass attempts denied.

Product and interface:

- onboarding and settings for all approved goals;
- field-level errors and focus behavior;
- Today remaining/above-target wording;
- goal card and target history;
- historical Week behavior across a target change;
- unavailable/ineligible/scientific-warning states;
- 320–430 px phones, tablet, desktop, zoom/reflow, keyboard, reduced motion, and non-color cues.

## 12. Methodology-review blockers

Production implementation is blocked until the product owner reviews and approves:

1. **Lose candidate:** independently implement the published Hall adult dynamic model, subject to licensing and output validation.
2. **Gain gate:** require separate positive-energy validation; allow Maintain/Lose to proceed without Gain if that evidence is insufficient.
3. **Activity assumption:** keep activity constant or collect an explicit planned change.
4. **Recalculation policy:** explicit profile updates only, or add a separately scoped weigh-in feature.
5. **BMI policy:** numeric context only, or approved standard/Asian-risk categorical wording.
6. **Safety thresholds:** calorie floor, rate/timeframe boundaries, extreme-input handling, and clinician-referral wording.
7. **Release sequencing:** complete V2-G1 through V2-G3 before production design integration of goal calculations.

Until those decisions are accepted, Lose/Gain remain visible only in the isolated prototype and production continues returning `GOAL_METHOD_UNAVAILABLE`.

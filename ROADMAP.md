# Calorie Calculator — Product Roadmap

## Development Principle

The application is developed incrementally.

Future functionality may influence architecture, but future features must not be implemented before their version is approved.

---

# Version 1 — Core Calorie Calculator

STATUS: COMPLETE / FROZEN

## Goal

Prove the basic:

food → amount → match → nutrition

workflow.

## Required Features

### Input

- natural food text field
- quantity support
- grams for solid foods
- cups for compatible solid foods when a source-backed conversion exists
- milliliters (mL) for liquid foods
- optional pieces, servings, and food-specific descriptors when reliably defined
- optional preparation method
- optional Advanced Input mode

Examples of food-specific descriptors may include:

- medium banana
- large egg
- slice

These descriptors remain secondary conveniences. They must be defined per food and must not use universal conversions, but they are not required for Version 1 completion.

### Food Matching

- supported food recognition
- exact/close demo matching
- ambiguous food handling
- user-selectable alternatives
- food-not-found state

### Nutrition

Display:

- calories
- serving amount
- protein
- carbohydrates
- fat
- fiber
- sugar
- sodium

### Quantity

- direct numeric amount entry
- increment and decrement controls
- unit-aware steps: 10 g, 0.25 cup, and 10 mL
- automatic recalculation
- food-specific unit conversion
- decrement protection against zero and negative amounts

### Application States

- initial/default
- analyzing/loading
- ambiguous match
- needs amount
- success
- food not found
- invalid input
- reset/analyze another

The NEEDS_AMOUNT state occurs when a food has been identified but the user has not supplied a usable serving amount.

The application must not silently assume 100 g or one serving.

### Device Support

Mobile-first.

Support:

- small smartphone
- standard smartphone
- tablet
- desktop

### Data

Use a small local demo dataset.

Suggested starting foods:

- grilled chicken breast
- fried chicken
- roasted chicken thigh
- fried egg
- boiled egg
- cooked white rice
- banana
- saba banana
- cheeseburger

These nine solid records remain part of Version 1. Prompt 4.1 added two sourced liquid records, Whole Milk and Orange Juice, so the mL path can be verified across more than one record.

Each food record should include:

- aliases
- preparation information
- food type and measurement basis
- reference amount and reference unit
- nutrition values
- supported serving conversions
- source metadata

Nutrition values should be curated from a defined trusted reference rather than invented by AI.

The interface must continue to identify this limited local catalog as:

Demo nutrition dataset

### Quantity Rules

Serving amounts must be numeric, finite, and greater than zero.

If the user identifies a food without supplying an amount, enter the NEEDS_AMOUNT state.

Mass-based foods normalize to grams. Volume-based foods normalize to milliliters. Food-specific cups and optional units normalize through their sourced conversion metadata.

Version 1 does not impose an arbitrary maximum gram or milliliter amount. A supported input such as 10,000 g or 6,000 mL must not fail solely because of its size when its normalized amount and calculated results remain finite.

Zero, negative, missing, malformed, NaN, and infinite amounts remain invalid. Non-finite calculated output must fail safely.

Version 1 primary measurement acceptance requires:

- solids measured in grams
- compatible solids measured in cups using food-specific sourced conversions
- liquids measured in mL

Pieces and size descriptors are optional. Existing reliable support may remain without blocking completion when unsupported.

### Version 1 Completion

Version 1 is complete and frozen for the validated demo scope. The full core flow works on mobile, tablet, and desktop using the 11-record local demo dataset, including verified mass, food-specific cup, and volume pathways. Prompts 1–12, R1–R2, and refinements 4.1–7.1 established and verified the release.

The frozen release does not include later functionality. The active Version 2 roadmap begins below.

---

# Version 2 — Personalized Calorie Tracking

STATUS: CURRENT / IN PROGRESS

## Goal

Extend the frozen Version 1 calculator into a private authenticated application with personalized calorie estimates, explicit consumption logging, and useful daily and weekly tracking.

Committed Version 2 areas:

- email/password authentication and persistent sessions
- private profile onboarding and settings
- evidence-based, versioned calorie target methodology
- user-selected maintain/lose/gain goal concepts with scientific gates
- explicit Add to Today's Log action
- persistent food and nutrition snapshots
- daily calorie tracking and neutral target comparison
- Monday-through-Sunday seven-day history
- edit/delete controls and account deletion
- database migrations, constraints, and per-user authorization
- early staging plus late production deployment
- a user-directed mobile interface revision after the complete feature surface exists and before security/release QA
- mobile-first responsive and accessibility QA

The existing 11-food curated catalog remains the Version 2 nutrition source and continues to be labeled **Demo nutrition dataset**. Production-scale nutrition search is deferred.

The authoritative scope and implementation sequence are maintained in:

- `V2_MASTER_SPEC.md`
- `V2_PLAN.md`
- `V2_STATUS.md`
- `V2_DECISIONS.md`
- `V2_RESEARCH.md`

V2-P9 is complete on staging. The interface revision is now the active program before V2-P10. It is divided into V2-D0 through V2-D6 so design inputs, audit, shared foundations, navigation, primary flows, management flows, and staging verification remain reviewable. The mandatory active gate is: **Blocker: Requires user's plan and mockups for design.** V2-P10 may not begin until the design program is complete and approved on staging.

---

# Future Version — Production Nutrition Search

STATUS: DEFERRED / VERSION UNASSIGNED

The former Version 2 production nutrition search milestone is retained as future work rather than deleted. Its potential scope remains:

- evaluate trusted nutrition providers
- introduce a protected backend/API layer where required
- food search and normalization
- expanded standard, branded, and Philippine food coverage
- improved serving metadata and matching

This work requires separate approval and must not be introduced during the current Version 2 tracker roadmap.

---

# Version 3 — Smart Natural-Language Parsing

STATUS: NOT STARTED

## Goal

Understand more flexible food descriptions.

Examples:

"I ate 2 eggs and 1 cup of rice."

"150g grilled chicken with half a cup of rice."

"Two slices of toast and one banana."

Potential capabilities:

- multiple foods in one sentence
- quantity extraction
- unit extraction
- preparation extraction
- ingredient separation
- confidence handling

Nutrition values must still come from nutrition data sources rather than being invented by the language model.

---

# Version 4 — Meal Builder

STATUS: NOT STARTED

## Goal

Allow several foods to form one meal.

Example:

Breakfast

- 2 eggs
- 1 cup rice
- coffee

Show:

- individual food nutrition
- total calories
- total protein
- total carbohydrates
- total fat

Potential actions:

- add food
- remove food
- edit quantity
- rename meal
- clear meal

---

# Version 5 — Daily Nutrition Tracking

STATUS: HISTORICAL PLAN / SUPERSEDED BY VERSION 2

## Goal

Allow meals to become part of a daily record.

Example:

Breakfast — 480 kcal

Lunch — 650 kcal

Snack — 180 kcal

Dinner — 720 kcal

Daily total — 2,030 kcal

Potential features:

- daily totals
- meal history
- recent foods
- favorite foods
- nutrition goals
- calorie target
- macro target

This historical milestone is preserved for context. Its account, target, history, and daily tracking scope has been deliberately moved into the active Version 2 roadmap and should not be implemented again as a separate Version 5.

---

# Version 6 — Advanced Food Input

STATUS: NOT STARTED

## Goal

Reduce manual food entry.

Potential capabilities:

- barcode scanning
- food photo recognition
- packaged-food recognition
- restaurant food lookup
- custom food creation
- Philippine/local food expansion

Photo-based food estimation must communicate uncertainty because visual portion estimation may not be exact.

---

# Beyond Version 6

Potential future areas should only be considered after the core product proves useful.

Examples:

- cross-device accounts
- nutrition trends
- exports
- integrations
- health platform connections

These are ideas, not committed requirements.

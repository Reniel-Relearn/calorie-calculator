# Calorie Calculator — Product Roadmap

## Development Principle

The application is developed incrementally.

Future functionality may influence architecture, but future features must not be implemented before their version is approved.

---

# Version 1 — Core Calorie Calculator

STATUS: CURRENT

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

Serving amounts must be greater than zero.

If the user identifies a food without supplying an amount, enter the NEEDS_AMOUNT state.

Version 1 uses a maximum normalized mass quantity of:

5,000 g per individual calculation

Amounts above this limit should produce validation rather than a nutrition result.

An appropriate normalized mL maximum remains an explicit decision for Prompt 6.1. No liquid maximum is assumed by this roadmap revision.

Version 1 primary measurement acceptance requires:

- solids measured in grams
- compatible solids measured in cups using food-specific sourced conversions
- liquids measured in mL

Pieces and size descriptors are optional. Existing reliable support may remain without blocking completion when unsupported.

### Version 1 Completion

Version 1 is complete when the complete core flow works reliably on mobile and desktop using the demo dataset, including verified mass and volume pathways. Liquid data is now present; mL parsing, volume calculation, and UI integration still require the planned 5.1–7.1 refinement prompts.

---

# Version 2 — Production Nutrition Search

STATUS: NOT STARTED

## Goal

Replace the limited demo food catalog with real nutrition search.

Potential work:

- evaluate trusted nutrition providers
- introduce backend/API layer
- protect API credentials
- food search service
- food normalization
- real nutrition source information
- larger food catalog
- branded foods when available
- improved serving metadata
- better matching

The final provider should be selected during Version 2 rather than hard-coded during Version 1 planning.

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

STATUS: NOT STARTED

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

User accounts/storage requirements must be designed before this version is implemented.

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

- personalized dashboards
- cross-device accounts
- nutrition trends
- exports
- integrations
- health platform connections

These are ideas, not committed requirements.

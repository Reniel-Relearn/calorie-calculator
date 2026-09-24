# Calorie Calculator — Codex Implementation Prompt Tracker

## Important

Codex should read AGENTS.md and the project documentation before each major implementation stage.

Version 1 only.

Do not combine all stages into one giant implementation unless explicitly requested.

Prompts 1–7 record completed historical work. Prompts R1 and R2 revise the Version 1 measurement architecture and validation policy without changing those completion statuses.

---

# Prompt 1 — Project Audit

STATUS: COMPLETE

Goal:

Have Codex inspect the repository and project documentation without implementing anything.

Codex should confirm:

- product understanding
- Version 1 scope
- future-version exclusions
- mobile-first requirement
- architecture
- recommended Version 1 files
- any conflicts or missing requirements

---

# Prompt 2 — Version 1 Project Skeleton

STATUS: COMPLETE

Goal:

Create the minimum implementation structure required for Version 1.

Expected areas:

- index
- CSS
- JavaScript modules
- data module
- assets

Do not implement the entire application in this step.

---

# Prompt 3 — Mobile-First Base UI

STATUS: DONE

Goal:

Implement the primary mobile interface based on DESIGN.md and the approved mobile reference.

Focus:

- header
- headline
- food input
- Analyze Food
- Advanced Input control
- initial result structure
- mobile spacing
- typography
- accessibility

Do not prioritize desktop yet.

---

# Prompt 4 — Local Nutrition Dataset

STATUS: DONE

Goal:

Implement the Version 1 demo food data model.

Starting foods should include:

- grilled chicken breast
- fried chicken
- roasted chicken thigh
- fried egg
- boiled egg
- cooked white rice
- banana
- saba banana
- cheeseburger

Each record should contain, where applicable:

- id
- display name
- aliases
- preparation
- reference weight
- nutrition values
- supported units
- food-specific serving conversions
- food-specific descriptors
- sourceType
- sourceName
- sourceReference

Do not invent nutrition values with AI.

Use defined nutrition references for each curated record.

The application must still label the local catalog as:

Demo nutrition dataset

---

# Prompt 5 — Input Parsing and Food Matching

STATUS: DONE

Goal:

Implement deterministic Version 1 food parsing and matching.

Support representative inputs such as:

150g grilled chicken breast

2 fried eggs

1 cup cooked white rice

1 medium banana

chicken

grilled chicken breast

Implement:

- normalized search
- aliases
- quantity extraction
- unit extraction
- food-specific descriptor extraction
- preparation extraction
- ambiguity detection
- no-result handling
- missing-amount detection

Important:

Input parsing must not invent a serving quantity.

If a food is identified without an amount, the application must be able to transition to:

NEEDS_AMOUNT

Do not add AI parsing.

---

# Prompt 6 — Serving Conversion and Nutrition Calculation

STATUS: DONE

Goal:

Implement:

- food-specific serving conversion
- food-specific serving descriptors
- normalized gram calculation
- quantity validation
- maximum normalized quantity validation
- calorie scaling
- macro scaling
- secondary nutrient scaling
- consistent rounding

Version 1 maximum normalized amount:

5,000 g equivalent

Keep calculation logic separate from UI code.

Do not use universal conversions for:

- cups
- pieces
- servings
- small
- medium
- large

unless the matched food record explicitly defines the conversion.

---

# Prompt 7 — Result Interaction

STATUS: DONE

Goal:

Connect calculation results to the mobile UI.

Implement:

- calories
- serving
- food name
- matched food
- protein
- carbohydrates
- fat
- fiber
- sugar
- sodium
- serving adjustment
- recalculation
- Analyze Another

---

# Prompt R1 — Client Measurement Architecture Revision

STATUS: DONE

Goal:

Revise Version 1 documentation to establish:

- grams for solid foods
- source-backed cups for compatible solid foods
- mL for liquid foods
- separate mass and volume normalization paths
- optional pieces and size descriptors
- direct entry and unit-aware increment/decrement controls

This prompt changes documentation and architecture requirements only. It does not implement the revised data, parsing, conversion, calculation, or UI behavior.

---

# Prompt 4.1 — Measurement Dataset Enrichment

STATUS: DONE

Goal:

Revise the food schema for explicit food type, measurement basis, reference amount, and reference unit. Preserve the nine solid records, source and add a rice cup conversion when it can be authoritatively verified, and add sourced liquid demo coverage for the mL path.

Nutrition and conversion values must remain source-backed. Decide and document the liquid records before adding them.

---

# Prompt 5.1 — Measurement-Aware Input Parsing

STATUS: DONE

Goal:

Extend deterministic parsing and matching for grams, cups, and mL while enforcing food-compatible units. Preserve reliable optional piece and descriptor support.

---

# Prompt R2 — Measurement Validation Normalization

STATUS: DONE

Goal:

Remove the arbitrary 5,000 g nutrition-domain ceiling from active Version 1 requirements. Define valid normalized mass and volume as numeric, finite, greater than zero, unit-compatible, and capable of producing finite calculated output.

Preserve historical Prompt 6 context while superseding its quantity limit through ADR-023.

---

# Prompt 6.1 — Mass and Volume Conversion Engine

STATUS: NOT SENT

Goal:

Implement separate normalized gram and milliliter paths, reference-amount calculation, food-specific cup conversion, and mass/volume validation.

Validate positive finite normalized amounts and finite calculated output without imposing an arbitrary gram or milliliter maximum.

---

# Prompt 7.1 — Measurement UI Integration and Regression

STATUS: NOT SENT

Goal:

Integrate food-dependent grams, cups, and mL into amount entry and results. Provide direct editing plus unit-aware decrement/increment steps and run regression coverage for the completed Prompt 7 flow.

---

# Prompt 8 — UX States

STATUS: NOT SENT

Goal:

Implement and refine:

- IDLE
- ANALYZING
- AMBIGUOUS
- NEEDS_AMOUNT
- SUCCESS
- NOT_FOUND
- INVALID

NEEDS_AMOUNT must appear when the selected food is known but the application does not yet know the consumed amount.

Do not assume:

100 g

or:

one serving

Verify that application states do not overlap incorrectly.

---

# Prompt 9 — Tablet and Desktop Enhancement

STATUS: NOT SENT

Goal:

Progressively enhance the approved mobile experience for larger screens.

Do not redesign the application into a different desktop product.

Test:

- tablet
- laptop
- desktop

---

# Prompt 10 — Accessibility and Responsive QA

STATUS: NOT SENT

Goal:

Perform a focused quality pass against:

DESIGN.md

and

TESTING.md

Fix:

- accessibility
- touch-target issues
- keyboard issues
- overflow
- mobile spacing
- breakpoint issues
- invalid states
- calculation regressions

---

# Prompt 11 — Version 1 Final Audit

STATUS: NOT SENT

Goal:

Perform final Version 1 verification.

Do not add new features.

Check:

- functionality
- calculations
- architecture
- mobile usability
- responsive behavior
- accessibility
- documentation

---

# Prompt 12 — Version 1 Freeze

STATUS: NOT SENT

Goal:

Update:

README.md

ROADMAP.md

DECISIONS.md

TESTING.md

PROMPTS.md

Mark Version 1 complete only if all acceptance criteria pass.

Document remaining known limitations.

Do not begin Version 2 automatically.

# Calorie Calculator — Version 1 Testing Specification

## Purpose

Version 1 is not complete simply because the interface looks correct.

The core workflow must behave correctly across expected inputs and screen sizes.

## Primary Measurement Acceptance

Blocking Version 1 measurement coverage is:

- grams for mass-based solid foods
- cups for compatible solid foods with food-specific source-backed conversions
- milliliters for volume-based liquid foods
- direct numeric amount entry
- unit-aware increment and decrement controls

Piece counts, servings, and size descriptors are secondary tests. Preserve and test reliable existing support, but their absence does not fail the revised client measurement acceptance criteria.

# Functional Tests

## Basic Search

Test:

150g grilled chicken breast

Expected:

- supported food is matched
- serving becomes 150 g
- calories scale correctly
- nutrients scale correctly
- result state is displayed

Test:

250g cooked white rice

Expected:

- Cooked White Rice is matched
- serving becomes 250 g
- nutrition scales from the record's mass reference

## Liquid Search

Test after Prompts 5.1–7.1 connect the sourced liquid records:

250ml liquid food

300 mL liquid food

Expected:

- the correct liquid is matched
- mL spelling and spacing variants normalize to milliliters
- the normalized unit remains mL
- nutrition scales from a volume reference
- no density-based gram conversion is invented

## Optional Piece-Based Search

Test:

2 fried eggs

Expected when the selected record defines the necessary conversion:

- egg food is identified
- quantity is 2
- food-specific piece weight/conversion is used
- nutrition is multiplied correctly

If the record lacks a source-backed piece conversion, a clear unsupported-serving result is acceptable. This optional path does not block Version 1 measurement acceptance.

## Cup-Based Search

Test:

1 cup cooked white rice

Expected:

- rice is identified
- cup conversion comes from rice metadata
- nutrition is calculated correctly

Repeat with:

0.5 cup cooked white rice

Verify that no global cup-to-gram conversion is used.

## Optional Food Descriptor

Test:

1 medium banana

Expected:

- banana is identified
- supported serving conversion is used
- nutrition is displayed

If the descriptor is unavailable, a clear unsupported-serving result is acceptable and does not block primary Version 1 acceptance.

# Ambiguous Search

Test:

chicken

Expected:

Do not immediately display a random chicken result.

Show multiple relevant supported choices.

User can select one.

Selected result then displays nutrition.

# Unknown Food

Test an unsupported food.

Expected:

- no fabricated result
- Food Not Found state
- user can edit search
- user can try again

# Empty Input

Submit an empty search.

Expected:

- no calculation
- concise validation message
- focus remains usable

# Invalid Quantity

Test zero, negative, missing, malformed, NaN, and infinite quantities.

Expected:

- safe validation
- no NaN
- no Infinity
- no broken layout

# Serving Recalculation

Start with:

100 g grilled chicken breast

Change to:

150 g

Expected:

All scalable nutrition fields update according to the same ratio.

Verify direct amount entry and unit-aware buttons:

- 150 g increment becomes 160 g
- 1 cup increment becomes 1.25 cups
- 250 mL increment becomes 260 mL
- the corresponding decrement reverses each valid increment
- decrement never produces zero or a negative amount
- directly entered valid amounts recalculate without repeated button presses
- invalid direct edits preserve the previous valid result

# Analyze Another

Expected:

- previous result state is cleared appropriately
- user can immediately perform another search
- no stale data remains

# Advanced Input

Test manual:

Food:
grilled chicken breast

Amount:
150

Unit:
grams

Preparation:
grilled

Expected:

Same nutrition calculation as equivalent supported natural input.

Repeat Advanced Input with a liquid record and mL after the measurement refinements are implemented.

# Missing Amount Test

Test:

chicken

Expected:

- application identifies that "chicken" is ambiguous
- user selects a chicken type
- application does NOT immediately calculate nutrition
- application enters NEEDS_AMOUNT
- user is asked how much they ate
- nutrition is calculated only after a valid amount is entered

Test:

grilled chicken breast

Expected:

If no quantity is supplied:

- matched food may be identified
- application enters NEEDS_AMOUNT
- application does not assume 100 g
- application does not assume one serving

# Secondary Food-Specific Descriptor Test

Test:

1 medium banana

Expected when the descriptor remains source-backed:

- banana is identified
- "medium" is interpreted using banana-specific serving metadata
- no universal "medium" conversion exists
- nutrition calculation uses the banana record's defined conversion

If the descriptor is not supported, verify a clear unsupported-serving result. Descriptor support is not a blocking measurement requirement.

# Secondary Preparation and Piece Test

Test:

2 fried eggs

Expected when the Fried Egg record defines the required piece conversion:

- fried egg record is matched
- generic raw egg or unrelated preparation is not silently substituted
- quantity is 2
- piece conversion comes from the fried egg record
- nutrition scales correctly

If the piece conversion is unavailable, verify that preparation still matches Fried Egg and that the serving is rejected without guessing. Piece support is not a blocking measurement requirement.

# Unsupported Unit Test

Test a food with a unit not supported by that food.

Expected:

- application does not guess a conversion
- application requests a valid supported unit
- INVALID or clarification state is shown appropriately

Required cross-basis cases:

- a mass-based solid rejects mL unless its record explicitly supports a sourced cross-basis conversion
- a volume-based liquid rejects grams unless its record explicitly supports a sourced cross-basis conversion
- a liquid rejects cups unless its own metadata explicitly supports them
- a solid without cup metadata rejects cups

# Quantity Validation Tests

Verify:

- `0 g` produces INVALID
- `-10 g` produces INVALID
- positive grams are valid when compatible with the selected food
- `10000 g` for a supported solid does not fail solely because of the amount
- `0 mL` produces INVALID
- `-250 mL` produces INVALID
- positive milliliters are valid when compatible with the selected food
- `6000 mL` for a supported liquid does not fail solely because of the amount
- missing required amounts, malformed values, NaN, Infinity, and -Infinity produce INVALID
- a calculation that produces a non-finite result fails safely

Version 1 has no arbitrary maximum gram or milliliter amount. These tests verify numeric and arithmetic safety rather than serving-size or health guidance.

# Rounding

Verify:

- calories display sensibly as whole kcal
- gram nutrients avoid unnecessary precision
- milligram values display sensibly

# State Tests

Verify each state:

- IDLE
- ANALYZING
- AMBIGUOUS
- NEEDS_AMOUNT
- SUCCESS
- NOT_FOUND
- INVALID

No state should accidentally display content that belongs to another state.

Maintain the Prompt 8 state-flow regression checks:

- empty main submission stays in IDLE with inline feedback and input focus
- rapid repeated analysis requests produce one transition and one rendered outcome
- ambiguous selection preserves a parsed amount when one was supplied
- NEEDS_AMOUNT validation stays inline and preserves the selected food and unit
- NOT_FOUND and INVALID recovery preserve useful search or food context
- serving adjustments update SUCCESS without showing the full ANALYZING state
- invalid serving edits retain the last valid result
- Analyze Another clears candidates, results, normalized serving, and validation messages
- every transition leaves exactly one primary state visible

# Mobile UX Tests

Primary testing target.

Test approximately:

320px width

360px width

390px width

430px width

Verify:

- no page-level horizontal scrolling
- food input fits screen
- text remains readable
- buttons are comfortably tappable
- macro information remains legible
- serving controls remain usable
- ambiguous matches remain tappable
- result does not become overly dense

# Tablet Tests

Verify intermediate layouts do not become awkward or excessively stretched.

# Maintained Responsive Viewport Matrix

Run the complete state and overflow checks at these exact viewport sizes:

- 320 × 568
- 360 × 800
- 390 × 844
- 430 × 932
- 768 × 1024
- 820 × 1180
- 1024 × 768
- 1280 × 800
- 1440 × 900
- 1920 × 1080

At every viewport, verify:

- IDLE, ANALYZING, AMBIGUOUS, NEEDS_AMOUNT, SUCCESS, NOT_FOUND, and INVALID each render as the only visible primary state
- there is no page-level horizontal overflow
- long match and source text wraps inside its container
- visible interactive controls remain at least 44 × 44 CSS pixels
- the primary food input and Analyze Food button remain visible without scrolling on the 1280 × 800 desktop viewport
- responsive changes are controlled by CSS and do not alter parsing, matching, conversion, calculation, or application-state behavior

## Prompt 10 QA Record

Completed on September 25, 2026:

- Chrome 154 received the complete semantic, keyboard, focus, form, state, responsive, reflow, rapid-interaction, console, and network test pass.
- Edge 153 received a Chromium cross-browser smoke pass covering grams, food-specific cups, milliliters, ambiguity, not-found and invalid outcomes, Enter submission, reduced motion, overflow, console errors, and runtime requests.
- All seven application states passed at the ten maintained viewports and the 1280 × 600 short-height viewport with one primary state visible and no page-level horizontal overflow.
- Effective 100%, 200%, and 400% reflow checks passed for IDLE, Advanced Input, AMBIGUOUS, and SUCCESS, including serving controls.
- Keyboard checks covered forward and reverse tabbing, native details operation, Enter submission, example-chip activation, ambiguity selection, serving controls, and recovery focus.
- Automated DOM checks found no duplicate IDs, missing label targets, unnamed controls, or accidental implicit-submit buttons.
- Contrast checks passed for body, muted, placeholder, error, source, primary-action, nutrient, and focus-indicator colors.
- Dataset validation, large valid quantities, non-finite quantity rejection, missing-versus-zero nutrients, determinism, and source-record immutability passed.
- Firefox, Safari, dedicated screen-reader software, and their platform-specific accessibility APIs were not available for direct testing. Semantic markup, the Chromium accessibility tree, live-region behavior, and compatibility risks were reviewed instead.

# Desktop Tests

Verify:

- sensible maximum content width
- adequate whitespace
- result can use larger-screen layout effectively
- mobile hierarchy remains recognizable
- no huge empty areas
- no unnecessarily oversized controls

# Keyboard Tests

Verify:

- tab order is logical
- buttons can be activated by keyboard
- inputs have visible focus
- match options are keyboard accessible

# Content Integrity

Version 1 must describe the local nutrition values honestly.

Do not display wording such as:

"verified live nutrition database"

until a production data source is actually connected.

# Regression Rule

After fixing a bug:

Re-test the workflow that caused the bug plus the core happy path.

Do not consider a visually correct page sufficient proof that the calculation still works.

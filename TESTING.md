# Calorie Calculator — Version 1 Testing Specification

## Purpose

Version 1 is not complete simply because the interface looks correct.

The core workflow must behave correctly across expected inputs and screen sizes.

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

## Piece-Based Search

Test:

2 fried eggs

Expected:

- egg food is identified
- quantity is 2
- food-specific piece weight/conversion is used
- nutrition is multiplied correctly

## Cup-Based Search

Test:

1 cup cooked white rice

Expected:

- rice is identified
- cup conversion comes from rice metadata
- nutrition is calculated correctly

## Single Food

Test:

1 medium banana

Expected:

- banana is identified
- supported serving conversion is used
- nutrition is displayed

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

Test:

0g chicken

Negative quantities

Unreasonably large invalid manually entered values

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

# Food-Specific Descriptor Test

Test:

1 medium banana

Expected:

- banana is identified
- "medium" is interpreted using banana-specific serving metadata
- no universal "medium" conversion exists
- nutrition calculation uses the banana record's defined conversion

# Preparation-Specific Food Test

Test:

2 fried eggs

Expected:

- fried egg record is matched
- generic raw egg or unrelated preparation is not silently substituted
- quantity is 2
- piece conversion comes from the fried egg record
- nutrition scales correctly

# Unsupported Unit Test

Test a food with a unit not supported by that food.

Expected:

- application does not guess a conversion
- application requests a valid supported unit
- INVALID or clarification state is shown appropriately

# Maximum Quantity Test

Test:

5001 g grilled chicken breast

Expected:

- no nutrition result is calculated
- clear validation is shown
- no NaN, Infinity, or broken state occurs

Version 1 normalized quantity limit:

5,000 g equivalent

This is an application safeguard, not a dietary recommendation.

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
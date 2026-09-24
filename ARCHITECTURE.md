# Calorie Calculator — Architecture

## Architecture Goal

Version 1 should remain simple while avoiding a structure that becomes impossible to extend later.

## Version 1 Technology

Use:

- HTML
- custom CSS
- vanilla JavaScript
- local JavaScript/JSON nutrition data

Do not require a backend for Version 1.

Do not introduce Bootstrap or another CSS framework unless the decision is explicitly changed.

## Logical Architecture

User Interface

↓

Input Parser

↓

Food Search / Matching

↓

Serving Normalization

↓

Nutrition Calculator

↓

Result Renderer

## Responsibilities

### User Interface

Responsible for:

- search field
- Advanced Input
- buttons
- match selection
- result display
- validation messages
- loading state
- direct amount entry
- unit-aware increment and decrement controls

UI code should not contain the nutrition database itself.

Recommended adjustment steps are 10 g, 0.25 cup, and 10 mL. Optional pieces use a step of 1. The decrement action must not create a zero or negative amount.

### Input Parser

Version 1 uses limited deterministic parsing.

Examples to support:

150g grilled chicken breast

250g cooked white rice

1 cup cooked white rice

250ml whole milk

Optional source-backed inputs may include 2 fried eggs and 1 medium banana.

The parser may identify:

- quantity
- unit
- preparation
- remaining food description

Version 1 is not an AI natural-language engine.

If an input cannot be confidently parsed, fall back to asking the user to clarify or use Advanced Input.

### Food Search

Responsible for finding foods in the local demo dataset.

Search may use:

- normalized names
- aliases
- preparation
- keywords

The search layer should be replaceable later by a production nutrition search service.

### Ambiguity Handling

Search should be able to return:

- one confident match
- multiple matches
- no match

The UI determines what is shown to the user.

### Food Data

Keep demo nutrition data separate from application logic.

Each food should contain enough metadata to perform calculations.

Example conceptual structure:

id

name

aliases

preparation

foodType

measurementBasis

referenceAmount

referenceUnit

nutritionPerReference

supportedUnits

servingConversions

optionalServingDescriptors

sourceType

sourceName

sourceReference

The schema must represent both mass references such as 100 g and volume references such as 100 mL. Exact property names may be adapted during Prompt 4.1, but the basis and reference unit must be explicit.

### Example Serving Metadata

A banana may define:

piece

medium

large

A rice record may define:

grams

cup

A liquid record may define:

mL

A chicken breast record may define:

grams

Conversions are specific to the matched food.

### Measurement-Aware Normalization

All internal nutrition calculation uses a normalized amount with an explicit unit.

Mass-based solid foods normalize to:

g

Volume-based liquid foods normalize to:

mL

Compatible solid foods may accept a food-specific cup measure:

user amount

↓

food-specific sourced cup conversion

↓

grams

↓

nutrition calculation

Example solid cup path:

1 cup cooked rice

↓

food metadata says one cup corresponds to the reference gram weight

↓

convert to grams

↓

calculate nutrients

Do not create universal cup/piece conversion constants.

Do not force liquid records through grams or density conversion. A cross-basis conversion is valid only if a future food record explicitly defines and sources it.

Pieces, servings, and size descriptors are optional conveniences. Preserve reliable food-specific support, but the primary Version 1 paths are grams, food-specific cups, and mL.

### Quantity Validation

Normalized serving amount must be:

greater than 0

For mass-based inputs, it must also be no more than:

5,000 g

for Version 1.

This mass upper bound exists to prevent accidental extreme input.

The normalized mL maximum must be explicitly decided before or during Prompt 6.1. The architecture does not infer a liquid limit from the 5,000 g safeguard.

The normalization layer should never pass invalid, negative, zero, NaN, infinite, or unit-incompatible amounts to the nutrition calculator.

### Nutrition Calculator

The calculator receives:

food reference nutrition

+

normalized serving amount and unit

and returns scaled nutrition.

General formula:

result nutrient =
reference nutrient × consumed normalized amount / reference amount

The normalized unit must match the food's reference unit: grams for a mass reference or mL for a volume reference.

The calculator must not know anything about DOM rendering.

### UI Renderer

Responsible for presenting calculated data.

It should not repeat calculation formulas.

## Recommended Version 1 File Structure

calorie-calculator/

index.html

css/
- main.css
- components.css
- responsive.css

js/
- app.js
- input-parser.js
- food-search.js
- serving-converter.js
- nutrition-calculator.js
- ui.js

data/
- foods.js

assets/
- images/
- icons/
- reference/

Documentation files remain at repository root.

Codex may recommend a small variation if it produces a simpler architecture.

## Application State

Version 1 states:

IDLE

ANALYZING

AMBIGUOUS

NEEDS_AMOUNT

SUCCESS

NOT_FOUND

INVALID

Application behavior should explicitly handle these states rather than relying on unrelated DOM elements being shown or hidden independently.

### State Flow

Typical successful flow:

IDLE

↓

ANALYZING

↓

food search

If exactly one usable food match exists and a valid amount is already known:

SUCCESS

If multiple plausible food matches exist:

AMBIGUOUS

↓

user selects food

If a valid amount is already known:

SUCCESS

If amount is missing:

NEEDS_AMOUNT

↓

user enters amount

↓

SUCCESS

If no food exists:

NOT_FOUND

If input or quantity is invalid:

INVALID

### Missing Amount Rule

The application controller must not manufacture a serving amount.

If the selected food is known but serving amount is unknown:

transition to:

NEEDS_AMOUNT

Do not automatically use:

- 100 g
- one serving
- one piece

unless explicitly defined by a future product requirement.

## Data Status

Version 1 local nutrition data should carry:

sourceType: "demo"

The interface should describe it honestly.

Example:

Demo nutrition dataset

Do not say:

Verified nutrition database

unless the application is actually connected to one.

The nine original foods remain the solid-food baseline. Prompt 4.1 added sourced Whole Milk and Orange Juice records so the future mL pathway can be verified without a single-record special case.

## Future Version 2 Architecture

Production architecture is expected to evolve toward:

Browser

↓

Application Backend / API Route

↓

Nutrition Search Service

↓

Nutrition Provider

↓

Normalized Application Food Model

↓

Frontend

Reasons for using a backend include:

- protecting API credentials
- normalizing provider-specific data
- centralizing search logic
- controlling caching and rate limits
- allowing provider changes without rewriting the frontend

Version 1 does not need this backend.

## API Abstraction Principle

Future external nutrition data should be converted to an internal normalized structure.

UI components should not depend directly on a third-party API's raw response format.

## Security Principle

Never place production private API credentials in:

- index.html
- frontend JavaScript
- committed source files

Use server-side environment variables when backend integration begins.

## Storage

Version 1 does not require persistent storage.

No account.

No database.

No meal history.

No localStorage requirement unless explicitly approved.

This prevents accidental expansion into Version 5 functionality.

## Performance

Mobile performance matters.

Avoid:

- unnecessary frameworks
- very large images
- excessive animation
- blocking scripts
- unnecessarily large libraries

Version 1 should feel immediate on a normal smartphone connection.

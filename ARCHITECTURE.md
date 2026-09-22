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

UI code should not contain the nutrition database itself.

### Input Parser

Version 1 uses limited deterministic parsing.

Examples to support:

150g grilled chicken breast

2 fried eggs

1 cup cooked white rice

1 medium banana

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

referenceWeightGrams

nutritionPerReference

supportedServingUnits

servingConversions

servingDescriptors

sourceType

sourceName

sourceReference

### Example Serving Metadata

A banana may define:

piece

medium

large

A rice record may define:

grams

cup

A chicken breast record may define:

grams

serving

Conversions are specific to the matched food.

### Unit Conversion

All internal nutrition calculation should use a normalized quantity.

Preferred normalized unit:

grams

When possible:

user amount

↓

food-specific conversion

↓

grams

↓

nutrition calculation

Example:

1 cup cooked rice

↓

food metadata says one cup corresponds to the reference gram weight

↓

convert to grams

↓

calculate nutrients

Do not create universal cup/piece conversion constants.

### Quantity Validation

Normalized serving amount must be:

greater than 0

and no more than:

5,000 g equivalent

for Version 1.

This upper bound exists to prevent accidental extreme input.

The nutrition calculator should never receive invalid, negative, zero, NaN, or infinite normalized quantities.

### Nutrition Calculator

The calculator receives:

food reference nutrition

+

normalized serving amount

and returns scaled nutrition.

General formula:

result nutrient =
reference nutrient × consumed grams / reference grams

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
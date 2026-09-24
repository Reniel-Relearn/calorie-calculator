# Calorie Calculator — Product Specification

## Product Vision

Build a simple, trustworthy website where a user can describe a food they ate and specify how much they consumed.

The system determines the intended food, calculates nutrition for the consumed amount, and presents the result clearly.

The primary use case is a person using the website from a smartphone.

## Core Product Promise

Tell us what you ate and how much, and we will show you what is in it.

## Primary User

The primary user is a smartphone user.

The product should be fast and comfortable to use while:

- eating
- preparing food
- checking a meal
- grocery shopping
- planning food
- reviewing nutrition

The user should not need to navigate a complicated dashboard just to check calories.

## Core Input

The main interaction is a natural food entry field.

Example:

150g grilled chicken breast

Other examples:

- 250g cooked white rice
- 1 cup cooked white rice
- 250ml whole milk
- 300 mL orange juice
- 1 medium banana (optional descriptor support)
- 2 fried eggs (optional piece support)
- 250g chicken adobo

## Input Concepts

The application must eventually understand:

### Food

Examples:

- chicken breast
- rice
- egg
- banana
- chicken adobo

### Quantity

Examples:

- 150
- 2
- 1
- 0.5

### Unit

Required Version 1 units:

- grams for solid foods
- cups for compatible solid foods with a source-backed conversion
- milliliters (mL) for liquid foods

Optional convenience units may include:

- ounces
- kilograms
- pieces
- servings
- food-specific size descriptors
- tablespoons
- teaspoons
- slices

Pieces and descriptors such as small, medium, and large are secondary capabilities. They are not required for Version 1 completion, but reliable source-backed support may remain.

## Measurement Model

The application distinguishes solid and liquid foods.

Solid foods use a mass measurement basis and normalize supported amounts to grams.

Liquid foods use a volume measurement basis and normalize supported amounts to milliliters.

Food-specific cups for compatible solid foods convert to sourced gram equivalents before nutrition calculation. Cups are not a universal mass conversion.

The data model must be able to represent nutrition references such as:

- 100 g for a mass-based solid
- 100 mL for a volume-based liquid

Liquid foods must not be forced through a grams conversion unless a future record has an explicit, source-backed density conversion.

### Preparation

Examples:

- grilled
- fried
- boiled
- roasted
- steamed

Preparation is important because cooking method may change the nutritional match.

## Advanced Input

The primary experience should remain the natural-language search field.

An optional Advanced Input control may allow manual entry of:

- food
- quantity
- unit
- preparation method

This helps when natural input is ambiguous.

## Core User Journey

User opens website

↓

User enters food

Example:

150g grilled chicken breast

↓

Application interprets supported input

↓

Application searches available nutrition data

↓

If food is ambiguous, user selects the intended match

↓

Serving amount is converted to a normalized mass or volume quantity

↓

Nutrition is calculated

↓

Result is displayed

↓

User can adjust the amount

↓

Nutrition immediately recalculates

↓

User can analyze another food

## Primary Output

The result should prioritize:

1. Calories
2. Serving amount
3. Protein
4. Carbohydrates
5. Fat

Secondary nutrition:

- Fiber
- Sugar
- Sodium

Future nutrition fields may include:

- saturated fat
- cholesterol
- potassium
- calcium
- iron
- vitamins

## Example Result

Food:

Grilled Chicken Breast

Matched food:

Chicken breast, cooked, grilled

Serving:

150 g

Calories:

248 kcal

Protein:

46 g

Carbohydrates:

0 g

Fat:

5 g

Fiber:

0 g

Sugar:

0 g

Sodium:

110 mg

The exact values above are product examples and should not automatically be treated as production nutrition data.

## Ambiguous Food Handling

The application must not create false precision.

Example input:

Chicken

This is not specific enough.

Instead of silently selecting one food, the application should present reasonable matches.

Example:

- Grilled chicken breast
- Fried chicken
- Roasted chicken thigh
- Roasted chicken breast

The user selects the intended match.

## Unknown Food Handling

If no supported food is found:

Do not fabricate a nutrition result.

Show a clear Food Not Found state.

Allow the user to:

- change the search
- provide more detail
- analyze another food

## Nutrition Data Principle

AI must not invent nutritional values.

Production nutrition information should come from trusted food/nutrition datasets.

Version 1 uses a small local demo dataset strictly for application development.

Later versions will replace or supplement this dataset with real nutrition data sources.

## Serving Calculation Principle

Nutrition should scale according to the consumed amount.

General calculation:

scaled nutrient = reference nutrient × consumed normalized amount / reference amount

Example solid:

Reference food:

151 kcal per 100 g

Consumed amount:

150 g

Calculation:

151 × (150 / 100)

Example liquid:

Reference food:

61 kcal per 100 mL

Consumed amount:

250 mL

Calculation:

61 × (250 / 100)

The same ratio should scale applicable nutrients.

## Unit Conversion Principle

Mass-based solids normalize to grams.

Volume-based liquids normalize to milliliters.

Household cup units are food-specific and apply only where they are meaningful and source-backed.

For example:

1 cup of cooked rice

and

1 cup of chopped chicken

do not have the same gram weight.

Therefore conversions for:

- cups
- pieces
- servings

must come from metadata for the matched food.

Never use a universal piece/cup/serving-to-gram conversion.

Do not accept mL for a solid or grams for a liquid unless that specific record explicitly supports the cross-basis conversion.

## Food-Specific Serving Descriptors

Pieces, servings, and size descriptors are optional Version 1 conveniences. Individual foods may define them when the descriptor has a known conversion for that food.

Examples:

- 1 medium banana
- 1 large egg
- 1 slice of bread

These descriptors are NOT universal units.

For example:

"medium" only has meaning when the matched food defines what a medium serving represents.

Each supported descriptor must be stored with the food record and converted using that food's serving metadata.

Do not create a universal conversion for:

- small
- medium
- large
- slice
- piece
- cup
- serving

unless the specific food record defines it.

## Missing Quantity Rule

The application must not silently assume a serving amount.

If a food is identified but the user did not specify how much they ate, the application enters:

NEEDS_AMOUNT

Example:

User enters:

chicken

↓

Application shows possible chicken matches

↓

User chooses:

Grilled Chicken Breast

↓

No amount was provided

↓

Application asks:

How much did you eat?

↓

User enters:

150 g

↓

Nutrition is calculated

Do not automatically assume:

- 100 g
- 1 serving
- 1 piece
- any other default amount

unless a future product decision explicitly introduces that behavior.

Food identification and serving identification are separate steps.

## Quantity Validation

Version 1 accepts only positive serving amounts.

Invalid examples:

- 0 g
- -50 g
- negative servings
- non-numeric quantities where a number is required

For Version 1, normalized mass quantity is limited to:

5,000 g per individual calculation

This is an application safeguard against accidental or extreme input.

It is not a nutritional recommendation.

If the normalized amount exceeds the limit, show a clear validation message rather than calculating the result.

The liquid pathway requires its own explicit maximum normalized mL decision before or during Prompt 6.1. This documentation revision does not invent that limit.

The result amount control must provide direct numeric entry plus increment and decrement controls. Recommended Version 1 steps are:

- grams: 10 g
- cups: 0.25 cup
- milliliters: 10 mL
- pieces, when retained: 1 piece

Decrement must not produce zero or a negative amount. Validation remains authoritative for direct entry and button adjustments.

## Demo Data Provenance

The Version 1 food catalog is limited, but its nutrition values should still be traceable to a defined reference.

Each demo food record should contain source metadata such as:

- sourceType
- sourceName
- sourceReference

Example:

sourceType:
demo

sourceName:
USDA FoodData Central

sourceReference:
identifier or documented reference used when curating the record

The application UI should still describe Version 1 as:

Demo nutrition dataset

because the application is using a small manually curated local subset rather than querying a live production nutrition service.

Do not claim the Version 1 dataset is a live API.

## Rounding

Recommended Version 1 presentation:

Calories:
nearest whole kcal

Macronutrients:
up to 1 decimal place where useful

Milligram nutrients:
nearest whole mg where useful

Avoid displaying unnecessary decimal precision.

## Version 1 Goal

Version 1 proves that the fundamental workflow works:

food + amount → match → calculation → nutrition result

Primary measurement acceptance covers grams for solids, source-backed cups for compatible solids, and mL for liquids. At least one liquid record is required to exercise the volume path; two simple liquid records are preferred so the implementation is not tailored to one food.

It is not intended to contain the full final product.

## Version 1 Non-Goals

Version 1 does not include:

- accounts
- authentication
- cloud database
- meal history
- daily tracking
- calorie goals
- macro goals
- AI-powered language understanding
- image recognition
- barcode scanning
- restaurant integrations
- medical recommendations
- personalized dieting recommendations

## Long-Term Product Direction

The product may eventually support:

- thousands of foods
- branded products
- Philippine foods
- restaurant foods
- multiple foods in one sentence
- meal building
- daily tracking
- saved foods
- favorites
- history
- barcode scanning
- food photography
- custom foods
- personal nutrition targets

These belong to later versions and should not complicate Version 1 unnecessarily.

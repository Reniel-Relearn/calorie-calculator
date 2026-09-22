# Calorie Calculator — Design Specification

## Design Philosophy

The application is MOBILE-FIRST.

The primary design is the phone experience.

Tablet and desktop versions are progressive enhancements of the mobile product.

Do not design a large desktop website first and then attempt to compress it onto a phone.

## Primary Design Goal

A first-time user should immediately understand:

1. enter food
2. specify how much
3. analyze
4. see calories and nutrition

The interface should require very little explanation.

## Product Personality

The website should feel:

- clean
- premium
- modern
- calm
- trustworthy
- health-focused
- minimal
- professional
- easy to understand

Avoid:

- stereotypical bright-green fitness design
- bodybuilding aesthetics
- gamification
- excessive dashboards
- childish food graphics
- neon colors
- excessive gradients
- excessive glassmorphism
- decorative clutter

## Mobile-First Rule

Base CSS targets the phone experience.

Larger-screen layouts are introduced progressively with min-width media queries.

Conceptually:

mobile base

↓

tablet enhancement

↓

desktop enhancement

Do not use desktop styles as the default and then repair them with max-width patches.

## Version 1 Mobile Header

Keep the phone header simple.

Primary requirement:

CalorieCheck branding

Do not fill Version 1 with navigation links for features that do not exist.

Do not show:

- Meal Tracker as a working feature
- Sign In if authentication does not exist
- fake dashboards

A minimal menu/help/about control may be added only if it serves actual Version 1 functionality.

## Primary Mobile Hero

The main screen should begin with:

small optional label:

A HEALTHIER YOU

headline:

Know what's on your plate.

supporting text for Version 1:

Enter a supported food and instantly see its calories and nutrition.

The long-term product may later use broader wording such as:

Search any food and instantly see its calories and nutrition.

Do not use the broader claim in Version 1 while the application only contains a limited demo catalog.

Then immediately show the primary food input.

The food search must appear early in the experience.

Avoid large decorative artwork pushing the search below the first useful viewport.

## Main Search

Large natural-language input.

Placeholder:

Try: 150g grilled chicken breast

Primary button:

Analyze Food

On mobile:

- input should span available width
- CTA should be highly visible
- button may become full-width
- controls must be comfortable to tap
- input text must remain readable without browser zoom

Optional secondary control:

Advanced Input

Helper text may say:

Not sure which food? We'll help you choose the closest match.

## Advanced Input

When opened, allow:

Food

Amount

Unit

Preparation

The interface should remain compact and understandable on a phone.

## Version 1 Result Hierarchy

Result priority:

1. Calories
2. Food name
3. Serving
4. Protein / carbohydrates / fat
5. Serving adjustment
6. Secondary nutrition
7. Match/source information
8. secondary actions

## Result Layout — Mobile

Example structure:

Food matched

Grilled Chicken Breast

248 kcal

150 g serving

Protein | Carbs | Fat

46 g | 0 g | 5 g

Adjust serving

[ serving control ]

Other Nutrition

Fiber
Sugar
Sodium

Matched food:
Chicken breast, cooked, grilled

Data:
Demo nutrition dataset

[ Analyze Another Food ]

The exact visual arrangement may evolve, but this information hierarchy must remain.

## Calories

Calories should be the strongest quantitative value.

Do not surround them with unnecessary gauges or fitness rings.

Version 1 does not have calorie goals.

## Macronutrients

Display:

- Protein
- Carbohydrates
- Fat

These should be easy to scan.

On mobile, a compact three-column layout is acceptable when it remains readable.

Suggested restrained accents:

Protein:
soft blue

Carbohydrates:
soft amber

Fat:
soft coral/red

Do not communicate meaning through color alone.

## Secondary Nutrition

Display:

- Fiber
- Sugar
- Sodium

Use a quieter presentation than the calorie/macronutrient section.

## Serving Adjustment

Must be easy to operate by touch.

Possible controls:

- numeric input
- minus/plus controls
- slider plus numeric value
- combination of the above

The selected quantity must always be visible.

Changing serving amount should recalculate the result.

## Food Imagery

Food imagery is optional and secondary.

If used:

- use small, realistic food imagery
- keep nutrition information dominant
- do not create a giant decorative hero food photo
- do not use images that make the page feel like a restaurant advertisement

The application UI is the main subject.

## Ambiguous Match State

Example:

User searches:

Chicken

Show:

Which chicken did you mean?

Possible results:

- Grilled chicken breast
- Fried chicken
- Roasted chicken thigh

Each result should be comfortably tappable.

Do not silently choose an arbitrary food.

## Needs Amount State

Food identification and serving identification are separate interactions.

If the application identifies the food but does not know how much the user ate, show a clear amount-request state.

Example:

Food:

Grilled Chicken Breast

Prompt:

How much did you eat?

Provide touch-friendly controls for:

Amount

Unit

Possible units depend on the food.

Examples:

- grams
- pieces
- cups
- servings
- food-specific descriptors when available

Primary action:

Calculate Nutrition

Do not calculate nutrition until a valid amount is available.

Do not silently assume:

100 g

or:

1 serving

The amount-request interaction must remain simple enough to complete comfortably on a phone.

## Food Not Found State

Use a calm state such as:

We couldn't find that food in the current database.

Suggestions:

- check the spelling
- provide more detail
- try another food

Do not fabricate nutrition.

## Loading State

Show immediate acknowledgement after Analyze Food is tapped.

Examples:

- small spinner
- subtle progress indicator
- "Analyzing food..."

Avoid fake long loading animations.

## Error State

Errors should explain what the user can fix.

Examples:

Enter a food first.

Amount must be greater than zero.

Choose a valid unit.

Avoid technical error messages in the primary UI.

## Popular Searches

Optional Version 1 section.

Examples:

2 fried eggs

1 cup cooked white rice

1 medium banana

Keep examples compact and tappable.

They are helpers, not the main content.

## Visual System

### Background

White or very light neutral.

### Primary Text

Dark navy or near-black.

### Secondary Text

Neutral gray.

### Primary Action

Premium medium/deep blue.

### Cards

- subtle border
- restrained radius
- very light shadow if needed
- avoid heavy floating effects

### Typography

Modern sans-serif.

Clear hierarchy.

No handwriting fonts.

No decorative display fonts.

## Touch Targets

Important touch controls should be approximately 44px or larger in practical tappable area.

Do not make essential interactions hover-only.

## Form Typography

Mobile text inputs should use a comfortable font size.

Avoid tiny text that triggers browser zoom or harms readability.

## Responsive Behavior

### Small Phone

Single column.

Primary actions full-width where appropriate.

No page-level horizontal scrolling.

### Standard Phone

Primary reference layout.

### Tablet

Use additional horizontal space without making controls excessively wide.

Result cards may use multi-column layouts.

### Desktop

Desktop should feel like an expanded premium version of the phone experience.

Possible enhancements:

- wider content container
- food/result information displayed side by side
- additional whitespace
- horizontal nutrient groups

Do not redesign desktop as a completely different product.

## Accessibility

Use:

- semantic structure
- associated input labels
- visible focus indicators
- adequate contrast
- keyboard-accessible controls
- readable text
- logical tab order

Status changes should be understandable to assistive technology where appropriate.

## Approved Visual References

Primary reference:

assets/reference/approved-mobile-ui.png

Mobile reference takes priority.

A desktop reference may later be added as:

assets/reference/approved-desktop-ui.png

If mobile and desktop references conflict, use the mobile interaction model as the source of truth.

## Reference Image Scope

The approved mobile reference illustrates the three primary visual states:

- Food Search / Home
- Ambiguous Food Match
- Nutrition Result

It is not an exhaustive representation of every functional state.

Additional documented states such as:

- NEEDS_AMOUNT
- INVALID
- NOT_FOUND
- ANALYZING

must still be implemented even if they are not shown in the approved reference image.

## Final Design Principle

The user should feel:

"I can check this food in a few seconds."

not:

"I need to learn how to use this nutrition app."
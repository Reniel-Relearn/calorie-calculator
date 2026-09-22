# Calorie Calculator — Approved Mobile UI Generation Prompt

## Purpose

Use this prompt to generate the primary visual design reference for the Calorie Calculator project.

The generated design will eventually be saved as:

assets/reference/approved-mobile-ui.png

Do not treat the generated image as approved until it has been reviewed by the project owner.

---

Create a high-fidelity mobile-first UI design board for a modern calorie and nutrition calculator named:

CalorieCheck

The main users are smartphone users.

This design will become the primary visual reference used by developers, so it must look realistic, polished, implementable, internally consistent, and production-ready.

This is NOT a desktop website shrunk onto phones.

Design the product specifically for smartphone use.

Create THREE mobile application screen states arranged side-by-side on a clean neutral design board.

Do not place the screens inside exaggerated physical phone mockups.

Show the UI screens themselves.

Approximate each mobile viewport as a modern smartphone layout around 390px wide.

The three states are:

SCREEN 1:
Food Search / Home

SCREEN 2:
Ambiguous Food Match

SCREEN 3:
Nutrition Result

==================================================
OVERALL PRODUCT STYLE
==================================================

The application should feel:

clean
premium
modern
minimal
trustworthy
health-focused
professional
calm
fast
easy to understand

Do NOT create a stereotypical bright-green fitness application.

Do NOT use:

neon green
bodybuilding aesthetics
weight-loss imagery
BMI displays
exercise statistics
fitness rings
gamification
badges
streaks
advertising
social-media widgets
chatbot bubbles
excessive glassmorphism
excessive gradients
large decorative food photography

Use:

white or very light neutral backgrounds
deep navy / near-black typography
premium blue primary actions
subtle gray borders
soft restrained shadows
comfortable rounded corners
generous but mobile-efficient spacing

Use subtle nutrition accents:

Protein:
soft blue

Carbohydrates:
soft amber

Fat:
soft coral

Do not use color as the only way to distinguish data.

==================================================
SCREEN 1 — FOOD SEARCH / HOME
==================================================

Create a simple top header.

Left:

CalorieCheck

Keep branding minimal and modern.

Do not show nonfunctional navigation such as Meal Tracker or Sign In in the Version 1 mobile design.

The interface should immediately focus on food search.

Small optional label:

A HEALTHIER YOU

Main headline:

Know what's on your plate.

Supporting copy:

Search any food and instantly see its calories and nutrition.

Below this, create a large natural-language food input.

Placeholder:

Try: 150g grilled chicken breast

Include a subtle search icon.

Below or attached to the input, show a strong full-width primary CTA:

Analyze Food

Below the CTA show a quiet text action:

Advanced Input

Include subtle helper copy:

Not sure which food? We'll help you choose the closest match.

Below that, optionally include compact popular search chips such as:

2 fried eggs

1 cup cooked white rice

1 medium banana

Do not make the example section visually dominant.

The primary hierarchy must be:

headline
food input
Analyze Food

==================================================
SCREEN 2 — AMBIGUOUS FOOD MATCH
==================================================

Show the state after the user searches:

chicken

Keep the normal CalorieCheck header.

Title:

Which chicken did you mean?

Supporting text:

Choose the closest match for a more accurate estimate.

Show vertically stacked touch-friendly food match cards.

Examples:

Grilled Chicken Breast

Fried Chicken

Roasted Chicken Thigh

Each card should have:

small restrained food thumbnail or food icon
food name
short preparation description
small approximate reference such as kcal per 100g where appropriate
clear tappable treatment

Do not preselect one option.

Do not make any result appear as definitely correct before the user chooses.

Include a quiet action:

Edit Search

The cards must be comfortably tappable with one hand.

==================================================
SCREEN 3 — NUTRITION RESULT
==================================================

Show the result for:

150g grilled chicken breast

At the top show a small status:

Food matched

Then:

Grilled Chicken Breast

Secondary text:

Chicken breast, cooked, grilled

Make the calorie value visually dominant:

248 kcal

Below:

150 g serving

Show a compact macronutrient row:

Protein
46 g

Carbs
0 g

Fat
5 g

Use the subtle nutrition accent colors without making them loud.

Then include:

Adjust serving

Show a realistic mobile touch-friendly serving control.

The selected amount must clearly read:

150 g

The control can use:

minus button
quantity field/value
plus button

or another clearly usable mobile control.

Do not rely only on a tiny slider.

Below show:

Other Nutrition

Fiber
0 g

Sugar
0 g

Sodium
110 mg

Present secondary nutrition as simple readable rows or compact cards.

Then show:

Matched food:
Chicken breast, cooked, grilled

Data:
Demo nutrition dataset

This demo-data wording is important.

Do not claim the application is connected to a live verified nutrition API.

Primary bottom action:

Analyze Another Food

Optional secondary action:

Change Amount

Do not show:

Add to Meal

because meal building is not part of Version 1.

==================================================
MOBILE UX REQUIREMENTS
==================================================

Controls should appear comfortable for thumb interaction.

Use practical touch target sizes.

Use readable mobile typography.

Avoid tiny labels.

Avoid excessive information density.

No horizontal scrolling.

No desktop navigation squeezed across the top.

No sidebar.

No dashboard layout.

No hover-dependent interaction.

The UI should feel usable on a 360–430px wide smartphone.

==================================================
FOOD IMAGERY
==================================================

Food imagery is secondary.

If thumbnails are used:

make them realistic
small
clean
natural

Do not use a giant bowl or dramatic restaurant food photography as the hero.

The interface itself should remain the subject.

==================================================
DESIGN HIERARCHY
==================================================

Highest importance:

Food search

Calories

Food identity

Serving amount

Macronutrients

Serving adjustment

Secondary nutrition

Everything else is secondary.

==================================================
FINAL DESIGN INTENT
==================================================

The visual experience should communicate:

"I can check my food in a few seconds."

The product should look like a credible modern health-tech utility rather than a fitness game or generic website template.

The screens should be realistic enough that a frontend developer can use them as the visual source of truth for HTML, CSS, and JavaScript implementation.
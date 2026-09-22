# CalorieCheck — Approved Responsive UI Notes

## Purpose

This folder contains the approved visual references for the CalorieCheck project.

These images are used as the primary design references for frontend implementation.

The project is MOBILE-FIRST.

If the mobile and desktop references ever conflict, the mobile design and interaction model take priority.

---

# Reference Files

## approved-mobile-ui.png

PRIMARY DESIGN REFERENCE

This is the main visual reference for CalorieCheck.

The primary users of the application are smartphone users.

The mobile UI should define:

- information hierarchy
- touch interaction
- spacing
- input behavior
- food search flow
- ambiguous food selection
- nutrition result structure
- serving adjustment
- primary actions

The implementation should not treat this as a desktop design compressed onto a small screen.

The product must be built from the mobile experience outward.

---

## approved-desktop-ui.png

SECONDARY DESIGN REFERENCE

This image shows how the CalorieCheck experience may expand on larger screens.

Desktop should remain visually and functionally consistent with the mobile product.

Desktop may use:

- wider content containers
- additional horizontal spacing
- side-by-side result sections
- larger food/result areas
- more efficient horizontal use of space

Desktop must NOT introduce a completely different navigation or user journey.

---

# Responsive Priority

The implementation priority is:

1. Mobile
2. Tablet
3. Desktop

Base CSS should target mobile.

Larger layouts should progressively enhance the application using min-width media queries.

Conceptually:

Mobile base

↓

Tablet enhancement

↓

Desktop enhancement

Do not build desktop first and then attempt to repair the phone layout afterward.

---

# Primary User Journey

The visual references support this Version 1 flow:

Food Search / Home

↓

User enters food and amount

↓

Analyze Food

↓

If the food is ambiguous:

Show food-match options

↓

User selects intended food

↓

Display Nutrition Result

↓

User adjusts serving if necessary

↓

Nutrition recalculates

↓

Analyze Another Food

---

# Mobile Screen States

The approved mobile reference represents the core Version 1 states.

## Screen 1 — Food Search / Home

Purpose:

Allow the user to immediately enter food.

Primary elements:

- CalorieCheck branding
- "Know what's on your plate."
- supporting description
- natural-language food input
- Analyze Food button
- Advanced Input option
- food-match helper text
- optional popular searches

Primary hierarchy:

1. Headline
2. Food input
3. Analyze Food
4. Secondary controls

---

## Screen 2 — Ambiguous Food Match

Purpose:

Prevent the application from guessing when a food description is too vague.

Example input:

chicken

The application should display possible matches such as:

- Grilled Chicken Breast
- Fried Chicken
- Roasted Chicken Thigh

The user selects the intended match.

Do not automatically preselect one option.

The match cards must remain comfortable to tap on a phone.

---

## Screen 3 — Nutrition Result

Purpose:

Present the nutritional result clearly and quickly.

Primary information:

- food match status
- food name
- matched food description
- calories
- serving size
- protein
- carbohydrates
- fat

Secondary information:

- fiber
- sugar
- sodium
- data/source status

Interaction:

- adjust serving
- recalculate nutrition
- analyze another food

Calories should remain the strongest numerical element.

---

# Serving Controls

Serving adjustment must be touch-friendly.

The quantity must always be visible.

Example:

- button
- 150 g
+ button

A slider may be used only when it remains easy to control accurately on a phone.

Do not rely on a tiny slider as the only serving control.

---

# Nutrition Hierarchy

Visual importance should generally follow:

1. Calories
2. Food identity
3. Serving size
4. Protein / carbohydrates / fat
5. Serving adjustment
6. Fiber / sugar / sodium
7. Match/source information

Do not overwhelm the user with unnecessary nutritional fields in Version 1.

---

# Color Direction

Primary interface:

- white / light neutral background
- deep navy or near-black text
- premium blue primary actions
- subtle gray borders

Nutrition accents:

Protein:
soft blue

Carbohydrates:
soft amber

Fat:
soft coral/red

Secondary nutrition should use restrained neutral styling.

Do not make the interface predominantly green.

---

# Mobile Interaction Rules

All important interactions must work by touch.

Do not rely on:

- hover
- tiny icons
- desktop-only menus
- very small text
- narrow click areas

Important controls should have practical touch areas of approximately 44px or larger where possible.

There should be no page-level horizontal scrolling.

---

# Food Imagery

Food imagery is secondary to nutrition information.

If used:

- keep images small
- use realistic food photography
- avoid giant hero photography
- avoid restaurant-advertisement styling

The application UI should remain the visual focus.

---

# Version 1 Restrictions

The approved references must NOT be interpreted as permission to implement future features.

Version 1 does NOT include:

- Meal Tracker
- user accounts
- Sign In
- food history
- daily tracking
- calorie goals
- macro goals
- Add to Meal
- barcode scanning
- food photo recognition
- AI chatbot
- health recommendations

Future features are documented in ROADMAP.md.

---

# Data Source Display

Version 1 uses a local demo nutrition dataset.

The interface should honestly communicate this.

Example:

Data:
Demo nutrition dataset

Do not display:

Verified live nutrition database

unless a real production nutrition provider has actually been connected.

---

# Developer Interpretation

The reference images are visual guides, not screenshots that should be copied pixel-for-pixel.

The implementation should preserve:

- visual hierarchy
- overall appearance
- spacing philosophy
- component relationships
- responsive behavior
- interaction flow

while still using clean semantic HTML, maintainable CSS, and accessible controls.

If a visual detail conflicts with usability, accessibility, or the documented Version 1 requirements, prioritize the documented requirement.

---

# Final Rule

When there is uncertainty:

Use the mobile reference first.

Then check:

DESIGN.md

PROJECT.md

ARCHITECTURE.md

ROADMAP.md

The primary goal is a fast, simple mobile calorie-checking experience.
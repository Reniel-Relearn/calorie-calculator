# CalorieCheck

CalorieCheck is a mobile-first food calorie and nutrition calculator built as a static vanilla HTML, CSS, and JavaScript application.

## Version 1 Status

**Version 1 is complete and frozen for the validated demo scope.**

The release proves the core workflow:

food + amount → deterministic match → serving normalization → nutrition calculation → result

No Version 2 functionality is included.

## Core Functionality

- Natural food-and-amount input
- Optional Advanced Input form
- Deterministic food matching and preparation-aware aliases
- Ambiguous-match selection
- Missing-amount collection
- Food-specific serving normalization
- Calories, protein, carbohydrates, fat, fiber, sugar, and sodium
- Direct serving edits with decrement and increment controls
- Analyze Another and error-recovery flows
- Seven explicit states: IDLE, ANALYZING, AMBIGUOUS, NEEDS_AMOUNT, SUCCESS, NOT_FOUND, and INVALID
- Mobile-first layouts with tablet and desktop enhancements

## Measurement Model

- Solid foods use grams.
- Compatible solid foods may use a food-specific sourced cup conversion.
- Liquid foods use milliliters.
- Pieces and size descriptors are optional and available only when the matched record contains sourced metadata.

Mass and volume remain separate measurement bases. Version 1 does not convert every food to grams and does not impose an arbitrary gram or milliliter maximum.

Serving adjustment steps are 10g, 0.25 cup, 10mL, and 1 for supported discrete servings. Manual amounts are not snapped to these increments.

## Demo Food Catalog

Version 1 contains 11 curated local demo records:

1. Grilled Chicken Breast
2. Fried Chicken
3. Roasted Chicken Thigh
4. Fried Egg
5. Boiled Egg
6. Cooked White Rice
7. Banana
8. Saba Banana
9. Cheeseburger
10. Whole Milk
11. Orange Juice

Nine records use mass references in grams. Whole Milk and Orange Juice use volume references in milliliters. Cooked White Rice defines the sourced food-specific conversion `1 cup = 158g`.

Nutrition values are stored locally with provenance from sources including USDA FoodData Central and the DOST-FNRI Philippine Food Composition Table. The interface identifies the catalog as a **Demo nutrition dataset** because it is a curated local subset rather than a live production nutrition service.

## Run Locally

The application requires no build tools, package installation, Docker, backend, database, or API credentials.

Recommended VS Code workflow:

1. Open the repository folder in VS Code.
2. Install or enable a local static-server extension such as Live Server if needed.
3. Use **Go Live** or **Open with Live Server**.
4. Open the provided `localhost` or `127.0.0.1` address.

You may also use any simple local static HTTP server, for example:

```powershell
python -m http.server 8000
```

Then open `http://127.0.0.1:8000/`.

Opening `index.html` directly through `file://` is not the recommended test method because the application uses ES modules, whose local-file behavior and security restrictions vary by browser. Use a local HTTP server instead.

## Architecture

- `data/foods.js` — demo food data, serving metadata, and provenance
- `js/input-parser.js` — deterministic input parsing
- `js/food-search.js` — food matching
- `js/serving-converter.js` — measurement validation and normalization
- `js/nutrition-calculator.js` — proportional nutrient scaling
- `js/state.js` — application states
- `js/app.js` — application orchestration
- `js/ui.js` — DOM rendering and interaction binding
- `css/` — mobile-first components and progressive responsive enhancements

Runtime remains fully static and contains no external scripts, analytics, nutrition requests, credentials, or unsafe raw user HTML rendering.

## Validation Status

Version 1 passed functional, dataset, calculation, state, responsive, reflow, accessibility, console, network, and repository-hygiene checks.

Directly tested:

- Google Chrome 154 — full QA and release matrix
- Microsoft Edge 153 — compatibility and release matrix

Unverified external environments:

- Firefox
- Safari
- Dedicated screen-reader and platform accessibility combinations

These environments are unverified rather than passed or failed. The project does not claim formal WCAG certification or exhaustive assistive-technology certification.

## Known Limitations

- The catalog contains only 11 curated demo foods.
- Matching is deterministic and limited to supported names, aliases, and preparations.
- Optional piece and descriptor metadata varies by food.
- Generic `2 fried eggs` is unsupported because the record requires the sourced `large` descriptor for piece-based conversion.
- No production nutrition API is connected.
- No accounts, meal tracking, history, goals, barcode scanning, image recognition, restaurant search, backend, database, or AI nutrition generation is included.

## Project Documentation

- `PROJECT.md` — product requirements and frozen Version 1 scope
- `ROADMAP.md` — completed Version 1 and future versions
- `DESIGN.md` — mobile-first interface requirements
- `ARCHITECTURE.md` — technical boundaries and data flow
- `DECISIONS.md` — architecture and product decision records
- `TESTING.md` — maintained acceptance criteria and freeze status
- `PROMPTS.md` — implementation history
- `assets/reference/approved-responsive-notes.md` — approved responsive interpretation

Future work is documented in `ROADMAP.md` and begins with Version 2 only after explicit approval.

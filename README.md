# CalorieCheck

CalorieCheck is a mobile-first food calorie and nutrition calculator built as a static vanilla HTML, CSS, and JavaScript application.

## Version Status

**Version 1 is complete and frozen for the validated demo scope.**

The release proves the core workflow:

food + amount → deterministic match → serving normalization → nutrition calculation → result

**Version 2 is the active roadmap.** V2-P1 completed the local Vite and Supabase development foundation plus an isolated HTTPS staging deployment while preserving Version 1 behavior. V2-P2 authentication is next; no Version 2 product feature is included yet.

Version 2 planning and operational documents:

- [Master specification](V2_MASTER_SPEC.md)
- [Phase plan](V2_PLAN.md)
- [Current status](V2_STATUS.md)
- [Architecture decisions](V2_DECISIONS.md)
- [Research record](V2_RESEARCH.md)

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

The supported Version 2 development workflow requires Node.js 22.12 or newer and npm. The interface remains vanilla HTML, CSS, and JavaScript; Vite supplies the development server and static production build.

```powershell
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://127.0.0.1:5173/` or `http://localhost:5173/`.

Run the automated regression checks and production build with:

```powershell
npm run check
```

Preview the built `dist` artifact with:

```powershell
npm run preview
```

On Windows systems where PowerShell blocks `npm.ps1`, use `npm.cmd` in place of `npm`.

### Public environment configuration

Version 1 calculator behavior does not require Supabase configuration. Version 2 provider features will load the client lazily and fail fast when their public configuration is missing or malformed.

1. Copy `.env.example` to `.env.local`.
2. Keep `VITE_APP_ENV=local` for local development.
3. Set the local Supabase URL and current `sb_publishable_...` key printed by the local CLI.

Every `VITE_*` value is embedded in the browser bundle. Never put a Supabase secret key, legacy `service_role` key, database password, SMTP credential, or Vercel token in `.env.local`, frontend code, or a Vercel variable whose name starts with `VITE_`.

### Local Supabase stack

Docker Desktop must be installed and its Linux container engine must be running. Then use:

```powershell
npm run supabase:start
npm run supabase:status
```

The version-controlled configuration is in `supabase/config.toml`. It currently initializes provider services only; Version 2 tables and migrations belong to later phases. Stop the local stack with `npm run supabase:stop`.

### Staging

Staging uses dedicated Supabase and Vercel projects with synthetic data only. The verified public build is available at `https://calorie-calculator-gamma-ten.vercel.app/`. Provider values remain in Vercel environment settings and are intentionally absent from the repository. Current phase status is maintained in `V2_STATUS.md`.

## Architecture

- `data/foods.js` — demo food data, serving metadata, and provenance
- `js/input-parser.js` — deterministic input parsing
- `js/food-search.js` — food matching
- `js/serving-converter.js` — measurement validation and normalization
- `js/nutrition-calculator.js` — proportional nutrient scaling
- `js/state.js` — application states
- `js/app.js` — application orchestration
- `js/ui.js` — DOM rendering and interaction binding
- `js/config/environment.js` — validated public runtime configuration
- `js/services/supabase-client.js` — lazy browser client construction for later V2 features
- `css/` — mobile-first components and progressive responsive enhancements
- `supabase/config.toml` — reproducible local Supabase service configuration
- `tests/` — Node-based environment and frozen V1 regression checks

The production output remains a static Vite build. The current calculator still makes no provider request because the Supabase client is not connected to the frozen Version 1 flow.

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

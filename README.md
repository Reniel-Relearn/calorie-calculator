# CalorieCheck

CalorieCheck is a mobile-first food calorie and nutrition calculator built as a static vanilla HTML, CSS, and JavaScript application.

## Version Status

**Version 1 is complete and frozen for the validated demo scope.**

The release proves the core workflow:

food + amount → deterministic match → serving normalization → nutrition calculation → result

**Version 2 is the active roadmap.** V2-P2 completed the email/password authentication foundation. V2-P3 database schema and row-level authorization are implemented and verified locally; staging migration review and application are the current completion gate.

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

Version 2 currently adds email/password signup, required email confirmation, login, logout, session restoration, password reset, and a protected application shell. Its private profile, target-history, and food-log tables are implemented locally behind grants and RLS; profile onboarding and persistence services remain later phases.

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

Version 1 calculation logic remains local, while Version 2 account access requires Supabase configuration. The application fails safely when its public provider configuration is missing or malformed.

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

The version-controlled configuration is in `supabase/config.toml`. Local email confirmation is required, passwords have an eight-character minimum, and callback URLs are limited to the local Vite origins. V2 database changes live in `supabase/migrations/` and must be applied from a clean local database before staging:

```powershell
npm run supabase:db:reset
npm run test:db
```

The database tests cover schema shape, constraints, grants, RLS ownership, anonymous denial, target-history invariants, missing nutrients, and auth-user cascades. Stop the local stack with `npm run supabase:stop`.

Local confirmation and password-reset emails are captured by Mailpit at `http://127.0.0.1:54324/`; they are not delivered to the internet. With the Supabase stack and Vite server running, execute the browser integration flow with:

```powershell
npm run test:auth:local
```

The integration script uses an isolated headless Chrome profile and synthetic local accounts. Set `AUTH_TEST_CHROME_PATH` only when Chrome is installed outside the common platform locations.

### Staging

Staging uses dedicated Supabase and Vercel projects with synthetic data only. The public origin is `https://calorie-calculator-gamma-ten.vercel.app/`. Provider values remain in Vercel environment settings and are intentionally absent from the repository.

For V2-P2, the staging Supabase Auth URL configuration must use that origin as the Site URL and allow these application-generated callbacks:

- `https://calorie-calculator-gamma-ten.vercel.app/?auth=confirm`
- `https://calorie-calculator-gamma-ten.vercel.app/?auth=recovery`

Remote email confirmation must remain enabled and the remote minimum password length must be at least eight characters. Production SMTP remains deferred; staging uses Supabase's limited test sender. Repeated staging email requests may temporarily return a rate-limit error, so wait for the provider quota to reset before requesting another message. Current phase status is maintained in `V2_STATUS.md`.

## Architecture

- `data/foods.js` — demo food data, serving metadata, and provenance
- `js/input-parser.js` — deterministic input parsing
- `js/food-search.js` — food matching
- `js/serving-converter.js` — measurement validation and normalization
- `js/nutrition-calculator.js` — proportional nutrient scaling
- `js/state.js` — application states
- `js/app.js` — application orchestration
- `js/ui.js` — DOM rendering and interaction binding
- `js/main.js` — authentication-first browser bootstrap
- `js/auth/` — auth validation, redirects, service calls, session state, controller, and accessible view binding
- `js/config/environment.js` — validated public runtime configuration
- `js/services/supabase-client.js` — persistent Supabase browser client construction
- `css/auth.css` — mobile-first account and protected-shell presentation
- `css/` — mobile-first components and progressive responsive enhancements
- `supabase/config.toml` — reproducible local Supabase service configuration
- `supabase/migrations/` — versioned private-data schema, constraints, grants, and RLS policies
- `supabase/tests/database/` — pgTAP schema, constraint, ownership, and cascade checks
- `tests/` — auth unit/integration checks plus environment and frozen V1 regressions

The production output remains a static Vite build. Supabase handles account sessions; food parsing and nutrition calculations remain local and use the frozen demo dataset.

## Validation Status

Version 1 passed functional, dataset, calculation, state, responsive, reflow, accessibility, console, network, and repository-hygiene checks.

V2-P2 passes signup validation, confirmation, existing/new signup response parity, valid/invalid login, logout, refresh restoration, expired-session rejection, password request/update, bad-link recovery, mobile overflow, keyboard focus, protected-view boundaries, and frozen V1 regressions. Local Mailpit and real staging confirmation/reset delivery and callbacks were verified.

V2-P3 is implemented and verified locally. Its migration creates private profiles, effective target history, and food-log snapshots with least-privilege grants and owner-only RLS. Staging migration review and application remain the completion gate.

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
- Profile onboarding, meal tracking, history, goals, barcode scanning, image recognition, restaurant search, private application tables, and AI nutrition generation are not included yet.
- Production SMTP is deferred to the production release phase.

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

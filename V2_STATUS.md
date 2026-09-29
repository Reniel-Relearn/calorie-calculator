# CalorieCheck Version 2 — Operational Status

**Current Version:** V2
**Current Phase:** V2-P1 — Development Platform and Staging Foundation
**Current Phase Status:** BLOCKED — USER ACTION REQUIRED
**Next Phase:** V2-P2 — Authentication and Persistent Session Foundation, after V2-P1 is completed
**Overall V2 Status:** IN PROGRESS

## Completed Phases

- V2-P0 — Master Planning and Architecture — completed 2026-09-28

## V2-P1 Work Completed Locally

- Added pinned Vite 8.3.1, Supabase JS 2.117.2, and Supabase CLI 2.118.0 dependencies with a reproducible lockfile.
- Added development, build, preview, test/check, and local Supabase scripts.
- Kept the semantic HTML, custom CSS, vanilla JavaScript, frozen V1 entry point, and existing module boundaries.
- Added lazy Supabase client creation and fail-fast validation for app environment, HTTPS remote URLs, and current publishable keys.
- Documented public browser values and protected privileged values in `.env.example` and `README.md`.
- Initialized `supabase/config.toml` with Vite-compatible local auth origins and no tables, migrations, or production values.
- Added environment-validation tests and representative frozen V1 regression tests.
- Completed clean install, test, build, development-server, production-preview, asset, and bundle-secret checks.

## Current Blockers

1. Docker Desktop's Linux engine is not running, so the initialized local Supabase stack cannot start. The CLI reported that `dockerDesktopLinuxEngine` was unavailable.
2. No dedicated staging Supabase project, staging Vercel project, or HTTPS staging URL is available in this workspace.
3. The applicable Vercel plan must fit the project's intended use. Current Vercel guidance limits Hobby to personal, non-commercial use; commercial use requires an eligible paid plan.
4. Staging phone/desktop loading and browser console/network checks cannot be completed until the staging URL exists.

## Required Human Actions

Complete these steps without sending any password, secret key, legacy `service_role` key, SMTP credential, or Vercel token through chat or committing one to Git.

### 1. Start the local container engine

1. Open Docker Desktop.
2. Wait until Docker Desktop reports that the engine is running and Linux containers are available.
3. From this repository, run `docker info`. Success means the command displays both client and server information without a daemon connection error.
4. Do not expose the local Supabase ports to the public internet.

### 2. Create the isolated staging Supabase project

1. Sign in at [Supabase Dashboard](https://supabase.com/dashboard).
2. Select the intended organization and choose **New project**.
3. Use a clear staging name such as `caloriecheck-v2-staging`.
4. Choose a region near the expected test users and a plan appropriate for staging.
5. Generate a strong database password and store it in a password manager. Do not put it in this repository, a `VITE_*` variable, or chat.
6. Wait for project provisioning to finish.
7. Open the project's **Connect** dialog and locate the Project URL and current publishable key beginning with `sb_publishable_`.
8. Do not copy a secret key or legacy `service_role` key into frontend configuration.

Success means a dedicated non-production project exists and its Project URL and publishable key are available for direct entry into Vercel. Do not add tables or real personal data during this phase.

### 3. Create the isolated staging Vercel project

1. After reviewing this working-tree diff, commit and push the P1 foundation so the remote repository contains `package.json` and the Vite setup. Codex has not committed or pushed anything; explicitly request that action if you want Codex to perform it.
2. Confirm that the Vercel plan is permitted for the intended personal/non-commercial or commercial use.
3. Sign in at [Vercel](https://vercel.com/) and choose **Add New → Project**.
4. Import this Git repository into a dedicated project such as `caloriecheck-v2-staging`. Do not reuse a production project.
5. Select the **Vite** framework preset.
6. Use `npm install` as the install command, `npm run build` as the build command, and `dist` as the output directory if Vercel does not detect them automatically.
7. In **Project Settings → Environment Variables**, add these values to the environment used by this staging project:
   - `VITE_APP_ENV` = `staging`
   - `VITE_SUPABASE_URL` = the staging Supabase Project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = the staging `sb_publishable_...` key
8. Do not create any `VITE_*` variable containing a database password, Supabase secret key, legacy `service_role` key, SMTP credential, or Vercel token.
9. Deploy the project and retain the resulting HTTPS URL.

Success means the deployed URL loads the unchanged Version 1 calculator over HTTPS and uses only the dedicated staging public configuration.

### 4. Configure staging auth origins

1. In the staging Supabase project, open **Authentication → URL Configuration**.
2. Set **Site URL** to the exact HTTPS staging Vercel URL.
3. Add the exact staging URL to the redirect allow list. Route-specific auth callback paths will be added and tested in V2-P2.
4. Do not add a production domain during V2-P1.

### 5. Return for phase completion

After the projects and Docker engine are ready, place any local public values directly in ignored `.env.local` if needed and provide only the HTTPS staging URL in the next message. Codex will then start the local stack, verify the staging build on phone and desktop sizes, inspect console/network behavior, confirm staging isolation, and mark V2-P1 `DONE` only if every acceptance criterion passes.

## Last Verified Tests

- `npm ci` — passed; 32 packages installed, 0 audit vulnerabilities reported.
- `npm run check` after the clean install — passed; 10 Node tests and the Vite production build succeeded.
- Frozen V1 regression coverage passed for mass, food-specific cups, mL, ambiguity, missing amount, incompatible bases, large finite quantities, and Banana/Saba separation.
- Environment validation passed for valid local/staging values and rejection of missing, insecure, legacy, placeholder, and malformed values.
- Vite development server returned HTTP 200 for the page and existing source assets.
- Vite production preview returned HTTP 200 for the page, JavaScript bundle, and CSS bundle.
- Production `dist` scan found no Supabase secret key, legacy `service_role` value, private key, or embedded publishable value.
- `git diff --check` passed after the final code and documentation updates; final diff and status were inspected.
- Local Supabase startup remains unverified because Docker Desktop's Linux engine is stopped.
- Staging HTTPS, responsive, console, network, and provider-isolation checks remain unverified because no staging URL exists.

## Next Intended Action

Finish and verify V2-P1 after the required Docker and staging-provider setup. Do not begin V2-P2 until V2-P1 is marked `DONE`.

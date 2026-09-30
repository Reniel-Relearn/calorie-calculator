# CalorieCheck Version 2 — Operational Status

**Current Version:** V2
**Current Phase:** V2-P1 — Development Platform and Staging Foundation
**Current Phase Status:** DONE
**Next Phase:** V2-P2 — Authentication and Persistent Session Foundation
**Overall V2 Status:** IN PROGRESS

## Completed Phases

- V2-P0 — Master Planning and Architecture — completed 2026-09-28
- V2-P1 — Development Platform and Staging Foundation — completed 2026-09-30

## Current Blockers

- None for starting V2-P2.
- V2-P2 will require a human check of real staging email receipt and the configured confirmation/reset redirects before that phase can be marked complete.

## Required Human Actions

1. Review the V2-P1 completion diff and verified staging URL.
2. Commit and push the completion changes if approved. Codex has not committed or pushed them.
3. Start V2-P2 by saying: **“Proceed with the next V2 phase.”**

Do not send passwords, database credentials, Supabase secret keys, legacy `service_role` keys, SMTP credentials, session tokens, or Vercel tokens through chat or commit them to Git.

## V2-P1 Completion Summary

- The repository uses pinned Vite 8.3.1, Supabase JS 2.117.2, and Supabase CLI 2.118.0 dependencies with a reproducible lockfile.
- Development, build, preview, test/check, and local Supabase scripts are available without adding a UI framework.
- Public Supabase configuration is validated before client creation. Remote URLs require HTTPS, and only current `sb_publishable_...` keys are accepted.
- `.env.local` is ignored and contains only the local environment name, local API URL, and local publishable key.
- The local Supabase stack is reproducible. Database, Auth, REST, Storage, Realtime, Studio, Edge Runtime, gateway, metadata, and Mailpit services run locally.
- Local analytics is disabled because its optional Vector log collector could not connect to Docker Desktop's log socket on this Windows host. Version 2 does not require local analytics.
- Database seeding is disabled until a later database phase introduces an actual seed file.
- The dedicated free staging Supabase and Vercel projects contain no real personal data. The user confirmed Vercel Hobby is used only for personal, non-commercial testing.
- Staging public configuration is stored in Vercel rather than the repository, and staging Auth origins are configured in Supabase.
- The verified staging URL is `https://calorie-calculator-gamma-ten.vercel.app/`.
- No authentication screen, private table, RLS policy, onboarding, food logging, dashboard, target formula, or production environment was implemented in V2-P1.

## Last Verified Tests

- Docker Desktop Linux engine 29.7.2 responded successfully.
- The local Supabase stack started successfully; all required containers remained running and all containers with defined health checks reported healthy.
- The local stack stopped cleanly after verification with its development state preserved for V2-P2.
- Local Auth settings, Studio, and Mailpit returned HTTP 200.
- The ignored local public configuration passed validation and constructed a Supabase browser client.
- `npm run check` passed: 10 Node tests and the Vite production build succeeded.
- Frozen V1 regression coverage passed for mass, food-specific cups, mL, ambiguity, missing amount, incompatible bases, large finite quantities, and Banana/Saba separation.
- Missing, insecure, legacy, placeholder, and malformed public configurations were rejected without exposing values.
- The production `dist` artifact contained no secret, private key, legacy `service_role` value, or embedded publishable value.
- Tracked source contained no secret-key or private-key pattern.
- The staging page returned HTTPS 200 with HSTS; its HTML, JavaScript, and CSS artifacts matched the verified local Vite build.
- Chrome device emulation at 390 × 844 and 1440 × 900 reported equal client and scroll widths, confirming no page-level horizontal overflow.
- At both staging viewports, `150g grilled chicken breast` reached `SUCCESS`, displayed Grilled Chicken Breast, and returned 227 kcal.
- Staging browser diagnostics found no actionable failed request, console warning/error, or runtime exception.
- Mobile and desktop staging screenshots were inspected and preserved the frozen Version 1 hierarchy and responsive layout.

## Next Intended Action

After human review, execute only V2-P2 from [V2_PLAN.md](V2_PLAN.md): implement and verify email/password authentication, confirmation/reset flows, session restoration, protected application boundaries, and the unchanged V1 calculator inside the authenticated shell.

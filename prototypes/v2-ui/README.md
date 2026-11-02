# CalorieCheck V2 UI Prototype

Status: **VISUALLY APPROVED V2-D0 BASELINE — 2026-11-03**

This is an isolated, browser-based design prototype. It is not the production application and it does not connect to Supabase, read the food catalog, calculate authoritative nutrition, save profile data, or write food logs.

## Run locally

From the repository root:

```powershell
npm.cmd run dev
```

Open the Vite URL shown in the terminal, then add:

```text
/prototypes/v2-ui/
```

The usual local address is:

```text
http://localhost:5173/prototypes/v2-ui/
```

Use **Preview screens** at the top of the prototype to jump between:

- Today
- Analyze
- Week
- Settings
- Login, signup, email confirmation, recovery, and password reset
- five-step onboarding
- representative loading, slow-network, offline, error, session-expiry, and success states
- empty and missing-target Week states
- profile editing and target history
- selectable Maintain, Lose, and Gain goal concepts with goal-weight, target-date, and BMI context

The preview menu also exposes the complete review-state inventory for this prototype pass:

- Today: populated, loading, empty, missing target, recoverable error, and permission denied;
- Analyze: idle, analyzing, ambiguity, missing amount, invalid input, not found, and success;
- logging: ready, saving, saved with **View today’s log**, and retryable save error;
- Week: populated, loading, empty, missing target, future week, and recoverable error;
- auth: login, signup, verification, recovery, reset, invalid credentials, invalid/expired links, configuration failure, and account-deleted completion;
- onboarding: normal progression, validation, atomic-save pending, and save failure;
- settings and data controls: validation, pending, success, retryable errors, food edit/delete states, and account-deletion pending/error/throttle states;
- general application feedback: loading, slow network, offline, recoverable error, permission denied, configuration unavailable, session expired, and success.

The main four destinations also demonstrate same-document query-state navigation and browser Back/Forward behavior.

## Review boundary

Allowed during prototype review:

- visual hierarchy, color, spacing, typography, density, cards, lists, controls, navigation placement, responsive compositions, and restrained motion;
- static interaction demonstrations for search choices, results, serving adjustment, onboarding, dialogs, and screen navigation;
- prototype-only BMI calculation and illustrative Lose/Gain calorie values for reviewing the intended goal experience;
- iterative revisions to these prototype files.

Not authorized by this prototype:

- production HTML, CSS, JavaScript, controller, service, database, provider, deployment, or security changes;
- changes to the frozen calculator engine, Supabase contracts, RLS, authentication, target methodology, food logging, or dashboard behavior;
- treating sample values or interactions as authoritative application data or logic;
- React, Tailwind, another framework, or an authoritative Lose/Gain target calculation.

The BMI preview uses `weight (kg) / height (m)²` as screening context. The Lose/Gain calorie amounts are explicitly fixed sample design content. They are not derived recommendations and must not be copied into production logic. Production Lose/Gain support still requires an approved scientific method, input contract, safeguards, persistence changes, and independent validation.

The user visually approved this prototype on 2026-11-03. Production integration follows V2-G0 through V2-G3 and then V2-D1 through V2-D6. The existing application remains authoritative for behavior, data, science, security, and calculations until those phases pass.

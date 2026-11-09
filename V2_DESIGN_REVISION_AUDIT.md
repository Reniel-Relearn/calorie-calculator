# CalorieCheck V2 Design Revision Audit

**Audit date:** 2026-11-02<br>
**Branch:** `feature/v2-design-revision`<br>
**Status:** COMPLETE — V2-D0 BASELINE VISUALLY APPROVED 2026-11-03; V2-G0 METHODOLOGY GATE AUTHORIZED.

## 1. Executive summary

CalorieCheck is already a deployed, secured, Vite-built application with completed Version 2 authentication, onboarding, calculator, food logging, daily tracking, weekly tracking, settings, target history, log correction, and account deletion. Its frontend is semantic HTML, custom mobile-first CSS, and modular vanilla JavaScript. Supabase is already integrated; it is not a future placeholder.

The redesign should therefore be an evolutionary interface revision, not a ground-up product or architecture rewrite. The frozen deterministic Version 1 nutrition engine can remain unchanged or nearly unchanged. The existing V2 services, controllers, database contracts, RLS boundary, security headers, and test suites should also remain authoritative.

The evidence does **not** justify React or Tailwind for the current V2 redesign. Both are technically compatible, but introducing them would replace a mature rendering/controller layer, add dependencies and migration risk, and conflict with the approved V2 vanilla-JavaScript/custom-CSS boundary. Vite should remain. No external state library, component library, chart library, or icon package is currently necessary.

The user resolved the architecture and product-design questionnaire on 2026-11-02. The accepted baseline retains vanilla JavaScript, uses four mobile destinations, introduces lightweight same-document history, makes consumed-of-target the dominant Today metric, uses progressive onboarding, progressively enhances desktop, and keeps submitted deterministic food matching.

The approved workflow is now:

1. retain the visually approved isolated prototype as the design source of truth;
2. keep optional hands-on behavioral research deferred and never infer hidden reference-app behavior;
3. preserve the verified target engine and integrate only the V2-ADR-032 approved directional method;
4. complete the approved V2-G0 through V2-G3 goal program without copying prototype sample values;
5. execute V2-D1 through V2-D6 in small tested slices; and
6. preserve V2-P10 as the post-redesign security and regression gate.

No UI code, dependencies, food records, Supabase configuration, deployment configuration, or accepted architectural decisions were changed during this audit.

## 2. Current branch and Git safety

- The requested branch, `feature/v2-design-revision`, was already checked out.
- The working tree was clean: no staged, modified, or untracked files existed before this audit.
- `feature/v2-design-revision` and `main` both pointed to `bb863dd` at the start of the audit.
- No branch switch, merge, rebase, cherry-pick, stash, reset, deletion, commit, or push was performed.

## 3. Branch compatibility findings

| Branch | Relationship to design branch | Relevant changes | Conflict assessment |
| --- | --- | --- | --- |
| `main` | Identical at audit start (`0/0` unique commits) | Merged security hardening and CodeQL correction | None at audit start |
| `feature/v2-design-revision` | Active branch at `bb863dd` | Design audit/planning work belongs here | Safe base |
| `feature/v2-filipino-catalog-expansion` | Two commits ahead of the common base; no design-only commits on the opposite side | Documentation-only plan and 69-candidate source matrix so far | Low runtime conflict now; high documentation-conflict potential because both programs may edit `README.md`, `ROADMAP.md`, `TESTING.md`, and core V2 documents |
| `security/codeql-test-harness` | Fully merged; design is one merge commit ahead | Removes dynamic code construction from the browser test harness | No pending merge; redesign must preserve the fix |
| `security/v2-public-exposure-hardening` | Fully merged; design is three commits ahead | CSP, Turnstile, throttling, security tests, dependency controls, operations documentation | No pending merge; redesign must preserve all controls |

The catalog branch currently changes only documentation, including new `V2_FOOD_CATALOG_PLAN.md` and `V2_FOOD_SOURCE_MATRIX.md`. It does not yet change food data or search code. Runtime design work may be planned in parallel, but catalog implementation and design implementation should not independently edit the same core V2 tracker documents without an explicit integration order. Design documents created by this audit use unique filenames to minimize that risk.

When catalog implementation begins, the redesign must anticipate a substantially larger result set, preparation-specific matches, aliases, source/provenance display, zero-result recovery, and ambiguity choices. It must not copy, merge, or prematurely implement unfinished catalog records.

## 4. Documentation reviewed

The audit reviewed the repository instructions and active product, architecture, design, testing, deployment, security, data, and roadmap documentation:

- `AGENTS.md`
- `PROJECT.md`
- `ROADMAP.md`
- `DESIGN.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `TESTING.md`
- `PROMPTS.md`
- `README.md`
- `UI_REFERENCE_PROMPT.md`
- `assets/reference/approved-responsive-notes.md`
- `V2_MASTER_SPEC.md`
- `V2_PLAN.md`
- `V2_STATUS.md`
- `V2_DECISIONS.md`
- `V2_RESEARCH.md`
- `V2_DATA_CONTRACTS.md`
- `V2_PUBLIC_SECURITY_HARDENING_PLAN.md`
- `V2_SECURITY_OPERATIONS.md`
- `V2_SECURITY_THREAT_MODEL.md`
- `SECURITY.md`
- the catalog-branch versions of `V2_FOOD_CATALOG_PLAN.md` and `V2_FOOD_SOURCE_MATRIX.md`

The approved Version 1 mobile and desktop reference images were also visually inspected. They remain useful for brand continuity and calculator hierarchy, but they do not cover the authenticated V2 product.

## 5. Current frontend architecture

### Runtime and build

- `index.html` is the single semantic document and contains all signed-out, onboarding, authenticated, calculator, daily, weekly, settings, and dialog regions.
- Vite 8.3.4 is already the local development server and production build tool.
- Node 22.12 or newer and npm with a committed lockfile are the supported toolchain.
- Production is a static Vite build deployed through Vercel.
- Supabase JS 2.117.2 and Supabase CLI 2.118.0 are pinned.
- `vite.config.js` disables production source maps.

### Styling

- Custom CSS is separated into `main.css`, `components.css`, `auth.css`, `profile.css`, `dashboard.css`, `settings.css`, and `responsive.css`.
- Existing root tokens cover color, spacing, radii, elevation, and page width.
- Mobile is the base; min-width enhancements exist at 36, 48, 64, and 80 rem.
- Reduced-motion handling already exists.
- No Bootstrap, Tailwind, CSS-in-JS, or component-library styling exists.

### JavaScript

- The project uses browser ES modules.
- Authentication, profile, dashboard, logs, settings, targets, Supabase services, application orchestration, and rendering are separated into modules.
- Supabase client initialization and public environment validation already exist.
- Auth callbacks use sanitized same-origin query parameters; the application does not have a general view router.
- V2 services/controllers/views are distinct enough to support incremental visual refactoring.

### Testing and delivery

- The Node test runner covers domain, controller, service, security, and regression behavior.
- A custom headless-Chrome integration harness covers the local authenticated journey; Playwright is not installed.
- pgTAP covers database schema, RLS, RPCs, and throttling.
- GitHub security checks include locked install, tests, build, audit, secret/build scanning, and CodeQL.
- Dependabot is configured.

## 6. Version 1 engine preservation

The stable deterministic engine is already DOM-independent:

- `data/foods.js`
- `js/input-parser.js`
- `js/food-search.js`
- `js/serving-converter.js`
- `js/nutrition-calculator.js`
- `js/state.js`

These modules can survive either the recommended vanilla-JavaScript redesign or a hypothetical React migration unchanged or nearly unchanged. The likely exceptions would be import-path changes or a narrow adapter where UI state is coordinated. The parsing, matching, serving conversion, nutrition scaling, provenance, null-versus-zero semantics, and calculator state meanings do not need a rewrite.

If React were later approved, the expensive part would be replacing the current HTML/view/controller composition—not replacing the calculator engine.

**Conclusion:** the V1 engine is preservable.
**Confidence:** HIGH.

## 7. Existing Version 2 constraints

The redesign must preserve:

- Version 1 calculation and serving behavior;
- the curated demo-data disclosure and source provenance;
- V2 calorie targets with Maintain plus the V2-ADR-032 adult directional Lose/Gain contract;
- private user data, RLS, captured log snapshots, and effective-dated target history;
- explicit logging rather than automatic logging;
- neutral remaining/above-target language;
- Monday-through-Sunday weekly semantics and the documented denominator policy;
- accessible semantic equivalents for any visualization;
- protected account deletion and all security boundaries;
- mobile-first design and comfortable touch targets;
- the currently approved vanilla JavaScript/custom CSS architecture unless the user explicitly approves a separate architectural decision.

The design program does not authorize new analytics, gamification, public profiles, social features, PWA packaging, native-app packaging, AI parsing, barcode/photo recognition, health advice, or imitation of another product's visual identity.

## 8. Stack compatibility and recommendations

### React

React can be added incrementally to an existing modular site, and its official documentation explicitly supports that approach. Technically, it would work with Vite and Supabase. It could improve component composition and declarative rendering if CalorieCheck were beginning a major multi-route frontend expansion.

For this V2 redesign, however, the benefit does not outweigh the cost:

- all required V2 journeys already work;
- the code already has controller/service/view separation;
- a migration would rewrite most markup, rendering, focus handling, and integration tests;
- it would create a mixed architecture unless completed in one coordinated migration;
- the accepted V2 documents expressly preserve vanilla JavaScript;
- it adds dependency, bundle, CodeQL, CSP-review, and regression surface without adding a required user capability.

**Recommendation:** retain vanilla JavaScript for V2-D1 through V2-D6. Reconsider React only through a separately approved ADR and migration phase after a concrete limitation is demonstrated.
**Confidence:** HIGH.

Official reference: [React — Add React to an Existing Project](https://react.dev/learn/add-react-to-an-existing-project).

### Vite

Vite is already installed, pinned, deployed, and compatible with the repository's Node requirement. Vite 8 requires Node 20.19+ or 22.12+, and this repository requires Node 22.12+, so the constraint is aligned. Vite supports the current vanilla entry point and would also support React if that were separately approved.

**Recommendation:** keep the current Vite workflow and do not reinitialize the project.
**Confidence:** HIGH.

Official references: [Vite — Getting Started](https://vite.dev/guide/) and [Vite 8 announcement](https://vite.dev/blog/announcing-vite8).

### Tailwind CSS

Current Tailwind uses a Vite plugin and generated static CSS, so it is technically compatible and has no inherent runtime CSP requirement. But adopting it would create a second styling model or require rewriting seven existing CSS modules. CalorieCheck already has tokens, mobile-first breakpoints, component classes, and security-reviewed external stylesheets. Utility-class migration would add churn and make a generic dashboard aesthetic easier to produce unless tightly governed.

**Recommendation:** do not add Tailwind for this redesign. Extend and normalize the existing token/component CSS. If a later prototype demonstrates a measurable maintenance advantage, evaluate it in a separate branch rather than mixing systems.
**Confidence:** HIGH.

Official reference: [Tailwind CSS — Installing with Vite](https://tailwindcss.com/docs/installation/using-vite).

### Routing

The app currently uses sanitized `?auth=` callback states and section visibility, not a general router. A polished mobile shell needs predictable destinations and browser back/forward behavior, but that does not by itself justify React Router.

**Recommendation:** first approve the information architecture. If distinct app destinations need navigation history, add a small framework-free navigation module using same-document History API state and a stable query or URL convention. Preserve the existing auth callback contract. Do not introduce path routes until Vercel fallback behavior and direct-load handling are explicitly designed and tested. If React is rejected, React Router has no role.
**Confidence:** MEDIUM, because the desired navigation and deep-link behavior are unresolved.

Official references: [MDN — Working with the History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API) and, for comparison only, [React Router — Declarative installation](https://reactrouter.com/start/declarative/installation).

### State management

No external state library is justified. Preserve three layers:

1. pure calculator/domain states;
2. session/application/navigation state coordinated at the shell boundary;
3. feature-local async/form state owned by each controller/view.

Supabase remains the server source of truth. The app should not copy server data into an elaborate client store. If React were later approved, built-in component state plus a small auth/profile context would be sufficient initially.

**Recommendation:** no Redux, Zustand, or equivalent.
**Confidence:** HIGH.

### Component library

The current complex primitives are forms, native dialogs, progress/meter output, date controls, and confirmation flows. Native semantic elements plus shared project components can cover them. A large library would introduce visual conventions and dependencies that the reference process has not approved.

**Recommendation:** no component library. Consider one narrowly scoped accessible primitive only if a documented native implementation cannot meet the approved interaction.
**Confidence:** HIGH.

### Charts

The daily view already has a labeled native meter, while the weekly view intentionally uses a complete seven-item semantic list. A chart is optional, not the data source.

**Recommendation:** use CSS/native HTML or a small project-owned SVG only if reference review proves that it improves comprehension. Retain the textual list, labels, non-color cues, reduced motion, and responsive equivalence. Do not add a chart library.
**Confidence:** HIGH.

### Icons

A small icon set could improve navigation recognition, but it is not yet proven necessary. Icons must remain supplementary to text labels and must not be fetched from an external runtime origin.

**Recommendation:** defer the package decision until the shell mockup is approved. Prefer a small audited set of local SVG assets or a tightly scoped package only if consistency would otherwise suffer.
**Confidence:** MEDIUM because the final navigation design is unresolved.

### Supabase

Supabase is already the active production architecture. The framework-neutral service modules can remain. Supabase's current React quickstart uses the same `@supabase/supabase-js` browser client and Vite-exposed project URL/publishable key, so React would be technically compatible, but it is not required.

Any visual refactor must preserve the singleton client, session-restoration boundary, auth-event behavior, sanitized callbacks, RLS ownership, RPC mutation boundaries, Edge Function account deletion, public-versus-secret environment separation, and Turnstile tokens.

**Recommendation:** preserve the existing Supabase integration; redesign around its public interfaces instead of moving provider calls into components.
**Confidence:** HIGH.

Official references: [Supabase — Auth with React](https://supabase.com/docs/guides/auth/quickstarts/react) and [Supabase — React user-management tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-react).

## 9. Security compatibility

The merged security branches are compatible with a visual redesign if their invariants remain acceptance criteria:

- keep the exact-origin CSP and avoid inline script/style or unsafe evaluation;
- preserve production source-map disablement;
- keep only the Supabase URL, publishable key, and Turnstile site key in browser-visible `VITE_*` variables;
- never expose privileged Supabase, SMTP, database, Vercel, or Turnstile secrets;
- keep the session-checking boundary before private content;
- preserve same-origin, allow-listed confirmation and recovery callbacks;
- continue using safe DOM/text rendering; never introduce raw HTML injection for food, profile, error, or provider content;
- keep Turnstile on the protected auth/account actions;
- retain RLS, grants, RPC boundaries, Edge Function validation, and abuse throttling;
- retain dependency audit, CodeQL, secret/build scanning, and locked builds;
- review every new dependency and every new external image/font/script origin before use.

React itself would not necessarily weaken the CSP, and Tailwind's compiled CSS has no runtime dependency. The risk is migration error and increased dependency/build surface, not an inherent incompatibility. Staying with the existing architecture is the lower-risk choice.

## 10. Filipino catalog compatibility

The catalog branch's approved planning documents currently add 69 candidates and a source-verification matrix, not production food records. Future catalog work is expected to affect food data and matching while preserving the calculator's import and calculation boundaries.

Design implications:

- ambiguity results must support more than three candidates without becoming a tall undifferentiated card stack;
- food name, preparation, brand where applicable, serving support, and provenance must be scannable;
- generic category input such as “beef” should lead to an explicit set of supported preparation-specific choices rather than a guessed result;
- zero results need a clear edit-search/retry path;
- keyboard and touch interaction must remain equivalent;
- results should not promise fuzzy search, remote search, or complete food coverage unless catalog implementation actually supplies it.

Integration order recommendation: finish and merge catalog documentation first; keep runtime implementation branches small; merge/rebase the design branch from current `main` before production design work; then verify calculator/search regressions after catalog code is merged. Do not independently rewrite `foods.js` or matching code from the design branch.

## 11. Proposed design-reference workflow

Create `V2_DESIGN_REFERENCES.md` only after the user supplies the V2 reference set. For every screenshot or mockup, record:

1. artifact filename/source and intended CalorieCheck screen;
2. information hierarchy;
3. spacing and density;
4. typography and number emphasis;
5. progress visualization;
6. navigation and active-state behavior;
7. card, list, form, empty, loading, and error patterns;
8. touch interaction and one-handed use;
9. mobile/tablet/desktop behavior;
10. accessibility risks;
11. **BORROW THE PRINCIPLE**;
12. **DO NOT COPY THE EXPRESSION**.

Examples of acceptable principle transfer include “the important metric is immediately visible” or “the next action is within thumb reach.” Product-specific rings, logos, illustrations, branded navigation, proprietary layouts, and exact visual identities must not be copied.

The approved reference notes should then be traceable to tokens, components, and screens during V2-D1. No fake observations should be recorded before real artifacts are supplied.

## 12. Proposed design-first workflow

The user's proposed workflow is compatible in intent but not in one detail: “frontend migration” is not authorized and is not necessary. The safe sequence is:

```text
Repository/design audit
→ Required product and architecture decisions
→ Reference ingestion and principle classification
→ Information architecture and navigation approval
→ Screen, state, and journey inventory
→ Design principles and responsive direction
→ Design tokens and shared component specification
→ V2-D1 traceability and implementation slicing
→ V2-D2 foundations/components
→ V2-D3 shell/navigation
→ V2-D4 primary journeys
→ V2-D5 weekly/settings/data controls
→ V2-D6 integrated staging/accessibility approval
→ V2-P10 post-design security regression
```

Mock data may be used only in isolated visual fixtures if it is clearly marked and cannot leak into production behavior. Since the real services already exist, production screens should normally be verified against deterministic fixtures and the real local/staging contracts rather than rebuilding a parallel fake application.

The detailed current-to-proposed mapping is in `V2_DESIGN_REVISION_PLAN_PROPOSAL.md`.

## 13. Design-system plan

V2-D2 should normalize, document, and test the following without changing product behavior:

| Area | Planned direction |
| --- | --- |
| Color | Semantic surface/text/border/action/success/warning/danger tokens; nutrition accents remain restrained and never carry meaning alone |
| Typography | System-first family unless an approved self-hosted font is justified; clear display, heading, body, label, caption, and tabular-number roles |
| Spacing | Small mobile-first scale; consistent page, section, card, field, and inline gaps |
| Radius/elevation | Few purposeful levels; no decorative card-on-card nesting |
| Borders | Visible boundaries and focus states that work in high contrast |
| Motion | Short functional transitions only; fully honor reduced motion |
| Icons | Optional, consistent, local/audited, and always paired with accessible names where meaningful |
| Touch targets | Aim for at least 44 CSS pixels for primary controls; never rely on hover |
| Breakpoints | Content-driven mobile base with progressive enhancements; verify 320 CSS px reflow and required phone/tablet/desktop widths |
| Progress | Labeled consumed/target/remaining-or-above semantics; no color-only or decorative ring dependency |
| Cards/lists | Use cards for grouped actions or summaries, lists for repeated logs/history; avoid excessive containers |
| Buttons | Clear primary/secondary/quiet/destructive hierarchy; busy and disabled semantics |
| Inputs | Persistent labels, descriptions, field errors, units, input modes, and visible focus |
| Navigation | Approved destinations, active state, current-page semantics, back behavior, and responsive transformation |
| Status | Live regions for meaningful async outcomes; inline recovery action where possible |
| Loading | Preserve layout, identify what is loading, avoid endless indeterminate UI, support retry/slow-network copy |
| Empty/error | State the condition, preserve context, and provide one useful next action |
| Charts | Optional supplement only; semantic equivalent remains primary and tested |
| Dialogs | Native dialog where suitable; label, initial focus, cancel, focus return, and destructive distinction |

Accessibility should target WCAG 2.2 AA behavior, including reflow, visible focus, status messages, meaningful labels, non-color cues, and practical targets. W3C's reflow guidance requires non-exempt content to work at a width equivalent to 320 CSS pixels without two-dimensional scrolling.

Official references: [W3C — Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/understanding/) and [W3C — Understanding Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).

## 14. Proposed UI state architecture

### A. Calculator/domain states — preserve

- `IDLE`
- `ANALYZING`
- `AMBIGUOUS`
- `NEEDS_AMOUNT`
- `SUCCESS`
- `NOT_FOUND`
- `INVALID`

These meanings belong to the deterministic calculator, not the app shell.

### B. Application/auth/navigation states

- boot/session restoring;
- signed out;
- login, signup, forgot password, verification pending, reset requested, update password;
- authenticated/profile loading;
- onboarding required;
- private app ready at an approved destination;
- session expired;
- permission denied or unavailable;
- fatal configuration error.

Navigation destination should be separate from authentication state. “Today,” “Analyze,” “Week,” and “Settings,” if approved, are destinations rather than auth states.

### C. Feature/component async states

- idle;
- loading;
- slow response message;
- saving/submitting;
- success/saved;
- empty;
- zero search results;
- validation error;
- recoverable provider/network error with retry;
- offline messaging without claiming offline functionality;
- destructive confirmation;
- unavailable target or partial nutrient data.

Offline and slow network are presentation/recovery conditions, not new business states. Version 2 has no offline cache or synchronization promise. Permission-denied outcomes should be sanitized and must not reveal another user's resource. Session expiry is distinct because it requires reauthentication and safe preservation/discarding of unsaved input.

## 15. Likely screen inventory

This inventory reorganizes existing approved scope; it does not add features.

### Authentication

- signed-out welcome/entry;
- log in;
- create account;
- email verification pending;
- forgot password;
- reset requested;
- update password;
- auth error/session expired;
- session-restoring boundary.

### Onboarding

- welcome and privacy/eligibility context;
- personal information;
- measurements;
- activity category;
- maintain-only goal and target eligibility;
- timezone review;
- target estimate/methodology review;
- saving, failure/retry, and completion.

These may be stages of one progressive flow rather than independent routes; that decision is unresolved.

### Home / Today

- personalized greeting;
- current-date navigation;
- consumed, target, and neutral remaining/above summary;
- macro/supporting nutrient summary with complete/partial/unavailable semantics;
- analyze-food primary action;
- today's log populated and empty states;
- loading, unavailable-target, network, incomplete-profile, and session-expired states.

### Calculator

- initial input;
- analyzing;
- ambiguity selection;
- missing amount;
- invalid input;
- zero results;
- result and serving adjustment;
- explicit Add to Today's Log success/failure/already-added behavior.

### Tracker and log control

- selected-day log;
- empty day;
- edit log;
- delete confirmation;
- save/delete busy, success, and failure states.

### Weekly

- selected Monday-to-Sunday week;
- seven-day semantic summary;
- optional equivalent visualization;
- complete, partial-target, no-history, and error states;
- previous/current/next week navigation.

### Profile / Settings

- profile and measurement editing;
- activity, maintain-goal, and timezone editing;
- target methodology/history explanation;
- logout;
- account deletion confirmation, password verification, CAPTCHA, failure, and completion.

### System conditions

- configuration unavailable;
- loading and slow network;
- offline/reconnect messaging;
- recoverable error;
- permission denied;
- expired session;
- validation;
- success announcement.

## 16. Accepted architecture and design baseline

The user resolved R1–R8 and D1–D5 on 2026-11-02:

1. **Frontend:** retain Vite, semantic HTML, custom CSS, and modular vanilla JavaScript. Preserve the tested controller/service/view boundaries and deterministic V1 engine. React, Tailwind, and other frameworks are excluded from this redesign.
2. **References:** use a hybrid model. V1 references preserve calculator and brand continuity. Lose It! is the primary V2 product/UX reference; Apple Fitness supports glanceability, hierarchy, progress, and premium feel; Cronometer supports nutrition and diary hierarchy. References inform principles only. Codex may prepare low-fidelity wireframes for uncovered screens/states.
3. **Navigation:** use four persistent primary mobile destinations—Today, Analyze, Week, Settings—with visible text labels. Any icons are supplementary.
4. **Navigation mechanics:** use lightweight same-document History API and safe query state. Back/Forward and refresh must behave logically; auth callbacks remain compatible; private views do not become public/shareable deep links.
5. **Today hierarchy:** make calories consumed of target dominant. Remaining is secondary; above-target language remains neutral.
6. **Onboarding:** use five progressive stages—personal information, body measurements, activity, goal/target inputs, and review/estimate. Keep the existing atomic final server save. A temporary local/session draft may support recovery but must never imply permanent save.
7. **Responsive behavior:** preserve one information architecture across sizes. Mobile is primary; tablet/desktop may use restrained two-column enhancement. No permanent sidebar or dense enterprise dashboard is approved.
8. **Food search:** submit deterministic input, proceed on exact match, or show accessible ranked preparation-specific choices. No live autocomplete, silent preparation selection, or claims of fuzzy/remote/complete database search.
9. **Icons:** use a very small local audited SVG set only where useful; labels remain authoritative. No icon package by default.
10. **Weekly visualization:** retain the semantic seven-day list. CSS bars may supplement it after reference review; no chart library.
11. **Motion:** restrained functional motion around 100–200 ms, with full reduced-motion support.
12. **Imagery:** no food imagery by default. Names, serving information, nutrition, and progress remain primary.
13. **Theme:** defer dark mode while keeping semantic tokens future-compatible.

## 17. Maintain/Lose/Gain scope audit

### A. Was Maintain-only intentional at the time of the D0 audit?

Yes. Maintain-only was an intentional, evidence-gated Version 2 limitation approved on 2026-10-05. It was not introduced by the wireframe or merely disabled styling. That historical finding was later superseded by V2-ADR-032, which approved the NASEM adult directional method; deployment still depends on V2-G2/G3 verification.

### B. Which accepted decision established it?

The controlling decision is **V2-ADR-011 — Weight-Change Target Method** in `V2_DECISIONS.md`. V2-ADR-010 establishes the three goal concepts; V2-ADR-011 decides to ship Version 2 with only the verified maintenance method and says a later version may revisit weight change after a separate scientific, licensing, input, and validation plan.

The decision is reinforced by:

- `V2_RESEARCH.md` R-004 and R-021;
- `V2_MASTER_SPEC.md` sections 9, 10, and 24;
- the V2-P4 research gate and acceptance criteria in `V2_PLAN.md`;
- `js/targets/energy-target.js`, which returns `GOAL_METHOD_UNAVAILABLE` for Lose/Gain;
- `js/profile/profile-validation.js`, the onboarding/settings UI, and the profile/settings database RPCs, which allow authoritative persistence only for Maintain; and
- unit and database tests that enforce the same boundary.

### C. Why were Lose/Gain deferred?

Yes: the evidence-based methodology remained unresolved, and the blocker is broader than choosing a percentage or visual control. The reviewed dynamic Hall model requires goal/timeframe and additional modeling assumptions, numerical simulation behavior, and input decisions outside the accepted profile. The review did not identify a reusable license for the official implementation, and it lacked adequate independent consumer validation vectors—especially for intentional gain. A fixed deficit or surplus was explicitly rejected as indefensible.

### D. Work required before safely supporting Lose/Gain

A future enablement phase would need to complete all of the following before production logic or selectable controls are added:

1. approve goal-specific scientific methods for loss and gain rather than assuming one model validates both;
2. establish the licensing position for any equations, implementation, assets, and reference outputs;
3. define the minimum required product inputs, including goal weight and goal timeframe/rate, plus every numerical assumption the selected model actually needs;
4. define supported adult domains, exclusions, input bounds, safe/unavailable outcomes, neutral limitations, and any product safety rules from authoritative evidence rather than copying another tool;
5. implement a versioned deterministic calculation specification, numerical integration behavior where applicable, uncertainty metadata, and non-prescriptive wording;
6. obtain independently reproducible validation vectors, boundary cases, and separate intentional-gain evidence;
7. review privacy/data-minimization implications for any new body-composition, diet-composition, sodium, activity-change, or goal-history fields;
8. extend profile validation, atomic onboarding/settings contracts, target-history snapshots, database constraints/RPCs/migrations, UI states, and rollback behavior without rewriting historical targets; and
9. complete unit, database, integration, accessibility, security, staging, and user-acceptance verification, with qualified domain review where the approved methodology requires it.

This is product and scientific development, not visual styling.

### E. Where does enablement belong?

It does **not** belong inside V2-D0 or get smuggled into V2-D4 as styling work. On 2026-11-03, the product owner authorized a separate Version 2 scientific/product program, V2-G0 through V2-G3. That program must settle the method, safety policy, data contract, pure engine, migration, and application integration before the corresponding production onboarding/settings design is integrated.

The approved prototype may show all three selectable concepts and BMI safety context, but goal weight/date and sample calorie figures are not production inputs or fixtures. V2-ADR-032 now controls the target method, and deployment remains gated on V2-G2/G3 database and staging verification.

## 18. Risks

1. **Premature framework migration:** rewrites working behavior and invalidates tests without a user benefit.
2. **Catalog/design branch divergence:** both programs modify central documentation and may later touch search UI.
3. **Reference incompleteness:** polished happy-path screenshots without loading, error, empty, destructive, and responsive states leave material design decisions unresolved.
4. **Dashboard over-density:** a desktop-style card grid can obscure the phone's primary action.
5. **Health-language drift:** progress visuals can become judgmental or imply medical precision.
6. **Security regression:** new dependencies, inline styles/scripts, external fonts/images, unsafe SVG/HTML rendering, or changed callbacks can weaken the hardened deployment.
7. **Routing overreach:** path routing without Vercel fallback/direct-load tests can break auth or refresh.
8. **Accessibility retrofitting:** charts, sticky navigation, dialogs, and progressive onboarding need semantics and focus behavior designed from the start.
9. **Parallel fake UI:** a mock-only app can drift from real Supabase/service contracts.
10. **Scope leakage:** redesign must not introduce unsupported goals, analytics, social/gamified features, or expanded nutrition claims.

## 19. Blockers

V2-D0 has no remaining blocker. Production target and design integration are now blocked by V2-G0 methodology review, specifically the model/licensing decision, separate Gain evidence, activity and recalculation assumptions, BMI policy, safety thresholds, and release sequence recorded in `V2_LOSE_GAIN_TARGET_PLAN.md`.

## 20. Recommended next step

Review `V2_LOSE_GAIN_TARGET_PLAN.md` section 12. Do not change production target logic until the V2-G0 methodology and safety decisions are explicitly approved.

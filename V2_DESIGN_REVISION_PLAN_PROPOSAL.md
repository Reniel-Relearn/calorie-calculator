# CalorieCheck V2 Design Revision Plan Proposal

**Status:** APPROVED FOR V2-D0 PLANNING — VISUAL REFERENCES INGESTED; VISUAL DECISIONS, BEHAVIORAL GATE, AND GOAL DISPOSITION PENDING<br>
**Created:** 2026-11-02<br>
**Implementation authorization:** None. This document does not authorize UI code, dependencies, framework migration, or changes to completed product behavior.

## Purpose

This proposal reconciles the requested design-first workflow with the existing mandatory V2-D0 through V2-D6 program. It preserves completed history and the post-design V2-P10 security gate.

The user resolved the audit questionnaire on 2026-11-02. The finalized architecture is Vite, semantic HTML, custom CSS, modular vanilla JavaScript, existing Supabase services, and the frozen deterministic calculator engine. React, Tailwind, and other framework migrations are excluded from this redesign.

## Accepted decision baseline

- Four primary destinations: Today, Analyze, Week, Settings.
- Lightweight same-document History API/query-state navigation; no full path router.
- Consumed of target is the dominant Today metric; remaining/above is secondary and neutral.
- Five-stage progressive onboarding with atomic completion and truthful temporary-draft behavior.
- One information architecture across breakpoints, with restrained two-column enhancement.
- Submitted deterministic food matching with accessible preparation-specific ambiguity choices; no typeahead.
- Small local audited SVG set only if useful; text labels remain authoritative.
- Semantic weekly list first; optional CSS bars; no chart library.
- Restrained 100–200 ms functional motion and full reduced-motion handling.
- No food imagery by default and no dark mode in this revision.
- Hybrid reference model: V1 continuity, Lose It! primary, Apple Fitness and Cronometer secondary, principles rather than copied expression.

## Current approved order

```text
V2-D0  User Design Plan and Mockup Approval Gate
V2-D1  Interface Audit and Design Traceability
V2-D2  Visual Foundations and Shared Components
V2-D3  Mobile App Shell and Navigation Revision
V2-D4  Authentication, Onboarding, Calculator, and Today Revision
V2-D5  Weekly, Settings, and Data-Control Revision
V2-D6  Integrated Design Verification and Approval
V2-P10 Post-design security hardening and regression
```

## Proposed refinement

The existing phase names remain. The proposal adds explicit gates and deliverables inside them rather than rewriting completed history.

| Current phase | Proposed refinement | Exit evidence |
| --- | --- | --- |
| V2-D0 | D0-A repository/architecture audit; D0-B answer required questionnaire; D0-C ingest references; D0-D approve IA, state/journey inventory, responsive direction, and mockups | Approved reference register, decisions, screen/state map, responsive rules, exclusions |
| V2-D1 | Trace every approved reference principle and requirement to existing markup, CSS, views, controllers, and tests; define small implementation slices | Traceability matrix, debt/risk list, ordered slices, regression map |
| V2-D2 | Normalize tokens and implement only shared visual/interaction primitives | Token specification, shared components, focus/loading/error patterns, isolated component checks |
| V2-D3 | Implement the approved mobile shell, destinations, active states, browser history behavior, and desktop transformation | Mobile/desktop navigation tests, back/forward behavior, focus movement, all destinations reachable |
| V2-D4 | Revise auth, progressive onboarding, calculator states, food ambiguity/results, explicit logging, and Today | Full signup-to-log-to-refresh journey, calculator regression, non-happy states, phone first-view review |
| V2-D5 | Revise Weekly, Settings, edit/delete, account deletion, and all data-control states | History equivalence, settings validation, confirmation/focus behavior, privacy/data-history regression |
| V2-D6 | Integrated local/staging visual, responsive, accessibility, browser, and security verification; user approval | Evidence matrix and explicit approval; no known critical design/accessibility/security regression |
| V2-P10 | Retain the existing post-design security regression gate | Existing V2-P10 acceptance evidence |

## D0 deliverables before implementation

### D0-A — Audit

- `V2_DESIGN_REVISION_AUDIT.md`
- branch compatibility and toolchain findings
- architecture recommendations with confidence levels
- unresolved-question register

**Status:** Complete.

### D0-B — User decisions

The user resolved all Required Before Implementation questions:

- framework boundary;
- reference source of truth;
- mobile navigation;
- browser history/deep-link level;
- Today hierarchy;
- onboarding form structure;
- desktop transformation;
- expanded-catalog search behavior.

**Status:** Complete. The answers are recorded in the audit, this finalized proposal, and V2-ADR-030. Record the final artifact approval date and D0 completion only after the user approves the complete wireframe baseline.

### D0-C — Reference ingestion

`V2_DESIGN_REFERENCES.md` records the supplied artifacts. Each artifact receives:

- screen/purpose mapping;
- hierarchy, spacing, typography, density, navigation, cards, states, charts, touch, and responsive observations;
- **BORROW THE PRINCIPLE**;
- **DO NOT COPY THE EXPRESSION**;
- conflicts with scope, accessibility, security, or data semantics;
- approval status.

**Status:** **COMPLETE FOR THE CURRENT SCREENSHOT BATCH.** All ten supplied Lose It!, Apple Fitness, and Cronometer artifacts are inventoried and interpreted in `V2_DESIGN_REFERENCES.md`. The register separates visible screenshot evidence from behavior. Hands-on Lose It! behavioral UX research remains pending and no hidden interaction is inferred.

### D0-D — Design definition and approval

Approve:

- information architecture and destination map;
- screen inventory;
- state inventory;
- primary user journeys;
- responsive behavior;
- Today/dashboard hierarchy;
- onboarding progression;
- design principles;
- preliminary token and component plan;
- representative mobile mockups for signed-out, onboarding, Today, Analyze/result, Week, Settings, and destructive actions;
- representative loading, empty, error, offline/slow, validation, zero-result, and session-expiry states;
- tablet and desktop direction.

No production UI implementation begins until D0-D is explicitly approved.

**Status:** The information architecture, navigation, Today/Analyze/Week/Settings structure, responsive transformation, system-state architecture, onboarding progression concept, and accessibility principles are provisionally accepted. The visual batch now supplies evidence for Today hierarchy, diary rows, progress, settings lists, and nutrition detail. Goal-screen wording, the remaining visual choices, and whether behavioral research precedes D0 closeout remain provisional. Explicit approval of the complete D0 baseline is still required.

## Proposed user journeys to specify

1. New user: signed out → create account → confirmation → login → onboarding → target review → Today.
2. Returning user: session restore/login → Today → Analyze → resolve ambiguity/amount → result → add to today's log → refreshed Today.
3. Day review: Today → date navigation → empty/populated log → edit/delete → totals refresh.
4. Week review: Today → Week → previous/current/next week → complete/partial/empty data.
5. Profile update: Settings → edit display name or target-affecting data → explanation → save → refreshed target history.
6. Recovery: forgot password → email → update password → login.
7. Session/network recovery: expired session, offline, slow request, retry, safe unsaved-input handling.
8. Account deletion: Settings → deliberate confirmation → password/CAPTCHA → deletion → signed-out completion.

## Architecture guardrails

- Preserve all calculator/domain modules and their public behavior.
- Preserve Supabase services, RLS/RPC/Edge Function boundaries, and public-versus-secret configuration.
- Do not call Supabase directly from presentation components when a service/controller boundary exists.
- Preserve null-versus-zero nutrient semantics and captured food-log snapshots.
- Keep target and weekly semantics exactly as accepted.
- Use safe DOM APIs; do not introduce raw HTML injection.
- Do not add runtime external fonts, scripts, images, icon CDNs, or chart CDNs.
- Do not change CSP, auth redirects, Turnstile, or environment conventions merely for styling.
- Keep semantic HTML as the accessibility source of truth.
- Add no framework, router, state library, component library, chart library, or icon package without a concrete approved decision.

## Implementation slicing and commits

After D0 approval, each existing D phase should remain a reviewable pull-request slice. Within a phase, commits should represent coherent verified outcomes rather than every small file edit.

Suggested future commit themes, subject to the finalized plan:

1. `Record approved V2 design references and architecture`
2. `Audit V2 interface traceability`
3. `Add V2 visual foundations and shared components`
4. `Revise V2 mobile shell and navigation`
5. `Revise V2 primary user journeys`
6. `Revise V2 history and data controls`
7. `Record integrated V2 design verification`

This proposal itself should be committed only after user review. No commit or push is part of the current audit task.

## Catalog integration checkpoint

Before D4 changes calculator/search presentation:

1. determine whether the Filipino catalog documentation/runtime PR has merged;
2. update the design branch from the chosen integration base through the user's approved Git workflow;
3. rerun calculator/search regressions;
4. confirm the larger-catalog ambiguity and zero-result contract;
5. implement presentation without changing source data or matching behavior from the design branch.

Core V2 tracker conflicts should be resolved deliberately; neither branch should overwrite the other's accepted history.

## Rejected architecture alternatives

React, Tailwind, React Router, external state management, a component library, an icon package, and a chart library are not part of this redesign. Reconsidering any of them requires a future user-approved architecture change with concrete evidence; they must not enter visual implementation commits incidentally.

## Approval gate

The user approved this finalized proposal on 2026-11-02, authorizing low-fidelity wireframe and D0 planning work—not production UI implementation.

V2-D1 becomes executable only after:

1. the user resolves the remaining visual questions and the behavioral-research timing decision recorded in `V2_DESIGN_REFERENCES.md`;
2. the information architecture, state inventory, journeys, responsive rules, design principles, and preliminary token/component plan are reviewed;
3. the product owner confirms whether Lose/Gain remain a later-version evaluation or authorizes a separate V2 scientific/product phase plan;
4. the user explicitly approves the complete V2-D0 baseline; and
5. the canonical V2 plan, decisions, and status are updated without losing catalog-program history.

# Calorie Calculator — Codex Repository Instructions

## Purpose

This repository contains a mobile-first food calorie and nutrition calculator.

The product is being developed incrementally in clearly defined versions.

Before making meaningful changes, understand the project documentation.

## Required Reading

Read these files before implementing substantial changes:

1. PROJECT.md
2. ROADMAP.md
3. DESIGN.md
4. ARCHITECTURE.md
5. DECISIONS.md
6. TESTING.md
7. README.md

Use PROMPTS.md when continuing the implementation sequence.

Use UI_REFERENCE_PROMPT.md only for understanding how the approved visual reference was intended to be generated.

## Current Scope

CURRENT VERSION: Version 2

Version 1 is complete and frozen. Version 2 is the active roadmap and must extend the frozen Version 1 baseline.

Implement only the active Version 2 phase authorized through `V2_STATUS.md` and `V2_PLAN.md`. Do not implement later phases or post-Version-2 features early.

## Primary User

The primary user accesses the website from a smartphone.

MOBILE-FIRST IS MANDATORY.

Do not create a desktop-first interface and later shrink it for phones.

Start with the mobile layout and progressively enhance it for larger screens.

If mobile and desktop requirements conflict, prioritize the mobile experience unless explicitly instructed otherwise.

## Version 1 Technology

Prefer:

- semantic HTML
- custom CSS
- vanilla JavaScript

Do not add Bootstrap, Tailwind, React, Vue, or another UI framework unless the user explicitly approves the architectural change.

Avoid unnecessary dependencies.

## Coding Principles

Keep responsibilities separated.

Do not place the entire application in one giant file.

Separate:

- food data
- food matching/search
- serving conversion
- nutrition calculation
- UI rendering
- application state

Avoid duplicated logic.

Use clear names.

Preserve working unrelated code when making changes.

## Nutrition Data Rules

Do not use AI to invent nutrition values.

Version 1 uses a clearly identified local DEMO nutrition dataset.

Never present Version 1 demo nutrition values as live API data or guaranteed medical-grade values.

Version 2 retains the curated local demo dataset unless the user explicitly approves a nutrition-source scope change. Production nutrition search is deferred to a future version.

## Serving Rules

Nutrition calculations must scale according to the consumed quantity.

Version 1 distinguishes measurement bases:

- solid foods normalize mass to grams
- liquid foods normalize volume to milliliters
- compatible solid foods may use cups only through a food-specific sourced conversion to grams

Do not force liquid foods through grams unless a specific source-backed cross-basis conversion is explicitly defined.

Conversions such as:

- pieces
- cups
- servings

must be defined per food.

Do not assume that one cup, one piece, or one serving has a universal gram weight.

Pieces and size descriptors are optional Version 1 conveniences. Preserve reliable food-specific support, but prioritize grams, compatible cups, and mL.

## Security

Never expose production API secrets in frontend JavaScript.

Do not commit `.env`.

Use `.env.example` only as documentation until environment variables are actually needed.

## Accessibility

Use semantic HTML.

Provide accessible labels.

Maintain visible keyboard focus.

Use adequate contrast.

Use touch-friendly controls.

Important controls must not depend on hover.

## Responsive Requirements

The application must work at minimum on:

- small smartphones
- standard smartphones
- tablets
- desktop screens

There must be no page-level horizontal overflow.

Touch targets should remain comfortable on phones.

## Documentation Update Rule

For Version 2 phases, `V2_STATUS.md` is the operational tracker and `V2_PLAN.md` is the executable roadmap. Update the applicable V2 documents after each phase. `PROMPTS.md` remains the Version 1 historical prompt tracker unless the user explicitly changes its role.

After completing a planned implementation prompt:

1. Update PROMPTS.md:
   - mark the completed prompt as DONE
   - preserve future prompts as NOT SENT
   - do not mark future work complete

2. Update README.md only if:
   - implemented features changed
   - setup instructions changed
   - project status changed

3. Update ROADMAP.md only when:
   - a milestone changes status
   - Version 1 is formally completed
   - the user explicitly approves movement to a later version

4. Update DECISIONS.md only when:
   - a new architectural/product decision is made
   - an existing accepted decision changes

5. Update TESTING.md only when:
   - acceptance criteria change
   - a newly required test case is introduced

Do not rewrite documentation unnecessarily.
Do not mark work complete unless it was actually implemented and verified.

## Git Workflow

Do not automatically create Git commits after implementation tasks.

After completing a task:

1. make the requested changes
2. run the relevant checks/tests
3. inspect git diff and git status
4. report the changed files
5. stop and wait for user review

Only create a Git commit when the user explicitly asks you to commit.

Do not push to a remote repository unless explicitly instructed.

Do not create branches unless explicitly instructed.

## Important Restrictions

Do not:

- implement future versions without approval
- invent nutritional data dynamically
- add authentication in Version 1
- add meal tracking in Version 1
- add barcode scanning in Version 1
- add photo recognition in Version 1
- add an AI chatbot in Version 1
- expose API secrets
- introduce frameworks unnecessarily
- create nonfunctional buttons that pretend a feature exists

Prioritize:

1. correctness
2. mobile usability
3. clarity
4. maintainability
5. accessibility
6. future extensibility

## VERSION 2 AUTONOMOUS PHASE WORKFLOW

Whenever the user says **“Proceed with the next V2 phase.”** or an equivalent instruction:

1. Read `AGENTS.md`.
2. Read `V2_MASTER_SPEC.md`.
3. Read `V2_PLAN.md`.
4. Read `V2_STATUS.md`.
5. Read `V2_DECISIONS.md`.
6. Read the relevant entries in `V2_RESEARCH.md`.
7. Determine the next unfinished phase from `V2_STATUS.md` and `V2_PLAN.md`.
8. Execute only that phase.
9. Perform required research when the phase calls for it, using current authoritative sources.
10. Implement the phase scope.
11. Run the phase's required tests.
12. Fix failures within phase scope.
13. Update the relevant documentation.
14. Mark the phase `DONE` only after every acceptance criterion passes.
15. Update `V2_STATUS.md` with the completed phase, next phase, blockers, human actions, verified tests, and next intended action.
16. Inspect git status and the relevant diff.
17. Report the phase results and changed files.
18. Recommend one commit message; do not commit, push, tag, merge, or create a branch unless the user explicitly asks.
19. Stop for human review. Do not begin the next phase in the same turn unless the active phase explicitly requires it.

The user does not need to provide the detailed phase prompt again. `V2_PLAN.md` is the executable phase specification.

At the end of a successful phase, state the next planned phase and tell the user they can say **“Proceed with the next V2 phase.”** after review and any desired commit/push.

If a mandatory external action is genuinely required, complete all independent work first, then set the phase to `BLOCKED — USER ACTION REQUIRED` in `V2_STATUS.md`. Provide exact beginner-friendly instructions, including where to click, what non-secret value belongs in each field, what must never be exposed, and what successful completion looks like. Never invent provider IDs, keys, URLs, credentials, or deployment values.

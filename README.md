# Calorie Calculator

A mobile-first food calorie and nutrition calculator.

## Current Version

Version 1 — Core Calorie Calculator

## Current Project Status

Prompt 6 food-specific serving conversion and nutrition calculation completed. The calculated data is not connected to the visible result UI yet.

## Run the current skeleton

Serve this directory with a local static HTTP server and open `index.html` through that server. No build tools or dependencies are required. The current page provides the static mobile UI foundation; calculator actions are not connected yet.

## Product Goal

Allow a user to enter a food and consumed amount and receive a clear calorie and nutrition result.

Example:

150g grilled chicken breast

Result:

- calories
- protein
- carbohydrates
- fat
- fiber
- sugar
- sodium

## Primary Device

Smartphone.

The project follows a mobile-first design strategy.

Tablet and desktop layouts progressively enhance the phone experience.

## Version 1

Version 1 focuses on the core:

food → amount → food match → calculation → nutrition result

workflow.

Version 1 initially uses a small local demo food dataset.

## Version 1 Technology

- HTML
- custom CSS
- vanilla JavaScript
- local demo nutrition data

No frontend framework is required.

Bootstrap is not currently used.

## Nutrition Data

Version 1 nutrition data is for application-development/demo purposes.

Production nutrition information will later be retrieved from trusted nutrition data sources.

AI must not invent nutrition values.

## Documentation

Read:

AGENTS.md
Codex repository instructions.

PROJECT.md
Complete product definition.

ROADMAP.md
Version 1 through future versions.

DESIGN.md
Mobile-first UI requirements.

ARCHITECTURE.md
Technical structure and separation of responsibilities.

DECISIONS.md
Accepted architecture/product decisions.

TESTING.md
Version 1 acceptance and QA requirements.

PROMPTS.md
Codex implementation sequence and status.

UI_REFERENCE_PROMPT.md
Prompt used to create the primary mobile design reference.

## Visual References

The repository currently contains approved visual references under:

assets/reference/

Primary mobile reference:

assets/reference/approved-mobile-ui.png

Secondary desktop reference:

assets/reference/approved-desktop-ui.png

Responsive interpretation notes:

assets/reference/approved-responsive-notes.md

The project is mobile-first.

The approved mobile reference is the primary visual source of truth.

The desktop reference is secondary and must not override Version 1 scope or mobile interaction requirements.

The reference images do not display every functional state.

Additional states such as NEEDS_AMOUNT, INVALID, NOT_FOUND, and ANALYZING are defined in the written project specifications.

## Environment Variables

Version 1 currently requires no API credentials.

See:

.env.example

for future configuration placeholders.

## Future Development

Later versions may introduce:

- real nutrition APIs
- larger food databases
- natural-language parsing
- meal building
- daily nutrition tracking
- barcode scanning
- food image recognition

See ROADMAP.md for version boundaries.

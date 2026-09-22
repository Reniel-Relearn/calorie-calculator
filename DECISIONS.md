# Calorie Calculator — Architecture Decision Record

# ADR-001 — Incremental Version Development

STATUS: ACCEPTED

## Decision

Build the product in defined versions rather than attempting the entire final application immediately.

## Reason

This reduces complexity and lets the core nutrition workflow be validated before advanced functionality is added.

---

# ADR-002 — Mobile-First Product Design

STATUS: ACCEPTED

## Decision

The phone experience is the primary design target.

CSS and UI architecture begin with mobile and progressively enhance for tablet and desktop.

## Reason

The expected primary user accesses the calorie calculator through a smartphone.

## Consequence

Desktop is not the source layout from which mobile is reduced.

When layouts conflict, mobile usability receives priority.

---

# ADR-003 — Vanilla Frontend for Version 1

STATUS: ACCEPTED

## Decision

Use semantic HTML, custom CSS, and vanilla JavaScript for Version 1.

## Reason

The current product does not require the complexity of a frontend framework.

This also keeps the first implementation easier to understand and debug.

## Reconsider When

The application becomes complex enough that a framework provides a clear architectural benefit.

---

# ADR-004 — Do Not Use Bootstrap by Default

STATUS: ACCEPTED

## Decision

Do not introduce Bootstrap for Version 1.

## Reason

Mobile-first responsive design does not require Bootstrap.

The project has a custom visual direction and can implement responsive behavior cleanly using custom CSS and media queries.

## Reconsider When

A future requirement creates a clear benefit that outweighs the additional framework dependency.

---

# ADR-005 — Local Demo Dataset First

STATUS: ACCEPTED

## Decision

Version 1 uses a small local nutrition dataset.

## Reason

This lets us build and verify:

- search
- food matching
- serving conversion
- calculation
- UI states

without coupling development to an external API.

## Consequence

The interface must identify this data as demo/local nutrition data.

---

# ADR-006 — Nutrition Must Be Source-Based

STATUS: ACCEPTED

## Decision

AI must not fabricate nutrition information.

Production nutrition values will come from trusted nutrition data sources.

## Reason

Nutrition values should be traceable to data rather than generated guesses.

---

# ADR-007 — No Backend in Version 1

STATUS: ACCEPTED

## Decision

Version 1 does not require a backend.

## Reason

The local demo dataset can run entirely in the browser.

## Future

A backend is expected when real external nutrition APIs and secret credentials are introduced.

---

# ADR-008 — Food-Specific Serving Conversion

STATUS: ACCEPTED

## Decision

Conversions for pieces, cups, and servings are food-specific.

## Reason

Household units do not correspond to universal gram weights.

## Consequence

Conversion metadata belongs with each food record.

---

# ADR-009 — No Authentication in Version 1

STATUS: ACCEPTED

## Decision

Do not implement Sign In, user accounts, or authentication.

## Reason

Authentication provides no value to the Version 1 core food-analysis workflow.

---

# ADR-010 — No Persistent Tracking in Version 1

STATUS: ACCEPTED

## Decision

Do not implement daily history, meal logging, saved meals, or nutrition goals.

## Reason

These features belong to later versions.

---

# ADR-011 — No Real `.env` Until Needed

STATUS: ACCEPTED

## Decision

Keep `.env.example` for future configuration documentation.

Do not create real secrets for Version 1.

## Reason

Version 1 uses no external private API credentials.

---

# ADR-012 — Honest Result Confidence

STATUS: ACCEPTED

## Decision

The product should communicate ambiguity instead of silently pretending every search has one exact answer.

## Reason

Foods such as:

chicken

burger

rice

can represent many nutritionally different foods.

The user should select a more specific match when necessary.

# ADR-013 — Missing Amount Requires User Input

STATUS: ACCEPTED

## Decision

Do not automatically assign a default serving amount when the user identifies a food without specifying quantity.

Instead transition to:

NEEDS_AMOUNT

## Reason

Food identification and consumed quantity are separate facts.

Automatically assuming 100 g or one serving could produce a misleading calorie result.

---

# ADR-014 — Demo Nutrition Records Require Provenance

STATUS: ACCEPTED

## Decision

Each Version 1 demo food record should contain source metadata describing where its reference nutrition information was curated from.

Suggested metadata:

- sourceType
- sourceName
- sourceReference

## Reason

Nutrition values should remain traceable even while Version 1 uses a small local demo catalog.

## UI Consequence

The application still displays:

Demo nutrition dataset

because it does not yet query a live production nutrition API.

---

# ADR-015 — Food-Specific Serving Descriptors

STATUS: ACCEPTED

## Decision

Descriptors such as:

- medium
- large
- slice

may be supported only when the matched food defines their conversion.

## Reason

These descriptors do not represent universal weights.

Example:

"1 medium banana"

is valid because the banana record may define what "medium" represents.

---

# ADR-016 — Version 1 Quantity Safety Limit

STATUS: ACCEPTED

## Decision

Version 1 limits normalized quantity to:

5,000 g equivalent per individual calculation.

## Reason

This prevents accidental extreme quantities from producing meaningless application output.

## Important

This is an application validation limit.

It is not a dietary, nutritional, or medical recommendation.
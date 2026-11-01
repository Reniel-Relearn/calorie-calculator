# CalorieCheck V2 Filipino-First Food Catalog Expansion Plan

**Status:** PROPOSED - USER REVIEW REQUIRED

**Created:** 2026-11-02

**Planning authorization:** Approved 2026-11-02

**Implementation authorization:** Not granted; stop after the V2-F0 draft pull request

**Branch:** `feature/v2-filipino-catalog-expansion`

**Delivery model:** One branch, one draft pull request, sequential reviewable commits

## 1. Objective

Expand the local CalorieCheck catalog from 11 records to a Filipino-first catalog containing:

- **minimum:** 60 total records;
- **target:** 80 total records;
- **maximum:** 100 total records.

These totals include the existing 11 records. The expansion is intended to make the currently public calculator useful for a wider set of common Filipino food searches while the interface revision is prepared.

The expanded catalog remains a manually curated local subset and must continue to be identified in the interface as:

> Demo nutrition dataset

This program does not claim comprehensive food coverage, medical-grade precision, or live provider data.

## 2. Why This Is a Separate V2 Program

The frozen Version 1 catalog and the original Version 2 roadmap retained 11 records and deferred production nutrition search. The user authorized planning a bounded Version 2 scope amendment on 2026-11-02 so common Filipino foods can be considered before the design implementation phases.

The expansion is inserted before V2-D0 and V2-D1 because a representative catalog affects search ambiguity, result examples, serving choices, not-found behavior, logged-food snapshots, and the content density that the redesign must accommodate.

Production-scale search remains deferred. It still requires separate provider, backend, caching, credential, rate-limit, licensing, and normalization decisions.

## 3. Proposed Defaults for Final Review

- Nationwide common Filipino foods receive priority over regional specialties.
- DOST-FNRI Philippine Food Composition Table is the preferred source for directly matching foods.
- USDA FoodData Central is the fallback for standard foods without a suitable PhilFCT match.
- Another authoritative source requires a documented reason and review.
- Branded products, restaurant-chain items, custom recipes, barcode lookup, and live API search are excluded.
- Composite Filipino dishes are included only when an authoritative source provides a directly usable prepared-food entry.
- Nutrition is never generated, inferred, or averaged by AI.
- Household conversions are added only when the exact food has a reliable source-backed conversion.
- Grams remain the required path for mass-based solids; milliliters remain the required path for volume-based liquids.
- Missing source nutrients remain `null`; reported zero remains numeric zero.
- Existing food-log snapshots remain immutable and continue using their captured dataset version and nutrition reference.

## 4. Catalog Allocation

The exact inventory is determined in V2-F1 after source verification. The target allocation is:

| Category | Target range | Examples for source investigation only |
|---|---:|---|
| Staples, rice, bread, and noodles | 10-15 | rice preparations, pandesal, bread, lugaw, common noodles |
| Proteins, fish, seafood, eggs, and tofu | 15-20 | chicken, pork, beef, bangus, tilapia, galunggong, tuna, tofu |
| Prepared Filipino dishes, soups, and stews | 20-25 | adobo, sinigang, tinola, nilaga, menudo, afritada, munggo, pancit |
| Fruits and vegetables | 10-15 | mango, papaya, pineapple, calamansi, kangkong, squash, eggplant |
| Breakfast foods, snacks, desserts, and drinks | 10-15 | champorado, taho, puto, turon, bibingka, coffee, common beverages |

The examples are candidate search areas, not approved records. A candidate is removed when its identity, preparation, nutrition basis, licensing, or source traceability cannot be established safely.

## 5. Source and Provenance Policy

Every included record must identify enough information to reproduce its curation decision:

- source organization and database;
- source food ID or stable reference;
- exact source description;
- reference amount and unit;
- edible-portion or prepared-state basis where applicable;
- access date;
- relevant serving-conversion source when a conversion is included;
- missing nutrient fields;
- any material limitation in how the source maps to the display food.

Source hierarchy:

1. DOST-FNRI PhilFCT direct match;
2. USDA FoodData Central direct match;
3. another government, academic, or standards-based authoritative source after review.

Not accepted:

- blogs, recipe sites, fitness sites, random calorie pages, or crowdsourced values;
- AI-created nutrition values;
- nutrition copied from a similar food when the exact preparation differs;
- recipe calculations assembled from undocumented ingredient assumptions;
- a conversion such as one piece, cup, bowl, slice, or serving without food-specific evidence;
- treating an unavailable nutrient as zero.

V2-F1 must record blocked candidates rather than filling source gaps with estimates.

## 6. Record Acceptance Contract

Each new food must satisfy the existing catalog schema and validation rules, including:

- stable unique `id` independent of UI wording;
- clear display `name`;
- concise Filipino and English aliases that are actually used;
- explicit preparation and food type;
- mass or volume measurement basis;
- positive finite reference amount;
- matching reference and normalized units;
- required nutrient keys using finite non-negative numbers or `null` where unavailable;
- food-specific supported units and conversions;
- complete source metadata;
- no mutation of existing records during parsing, matching, conversion, calculation, or logging.

Aliases must not create an undocumented exact collision. When common language legitimately maps to several foods, the search result must remain ambiguous and let the user choose.

## 7. Planned Data Architecture

The existing import contract remains stable: application modules continue importing catalog exports from `data/foods.js`.

V2-F2 may turn `data/foods.js` into a compatibility facade and split records into category modules:

```text
data/
|- foods.js
`- foods/
   |- staples.js
   |- proteins.js
   |- filipino-dishes.js
   |- fruits-vegetables.js
   `- snacks-drinks.js
```

The facade remains responsible for the authoritative combined export, nutrient-field constants, dataset version, and public validation entry point. Shared schema helpers may be extracted only when they reduce duplication without changing runtime behavior.

The expanded catalog receives a new dataset version. Previously saved food logs retain their captured food name, source, reference nutrition, conversion metadata, and earlier dataset version. No database migration or historical rewrite is planned.

## 8. Phase Sequence

### V2-F0 - Scope and Catalog Plan

**Current status:** BLOCKED - USER PLAN REVIEW REQUIRED

Deliver this plan, synchronize the V2 roadmap documents, push the planning commit, and open one draft pull request. Add no food records.

Acceptance requires explicit user approval of the total-count interpretation, source policy, category allocation, architecture direction, phase sequence, and exclusions.

### V2-F1 - Candidate Inventory and Source Verification

Build the exact proposed food inventory and a source matrix. Research current authoritative sources and usage terms. Record exact IDs, descriptions, reference bases, nutrient availability, preparation matches, conversion evidence, and blocked candidates.

No candidate becomes application data until its source row passes review. Stop for user review of the verified inventory before V2-F2.

### V2-F2 - Catalog Architecture and Validation Foundation

Modularize the catalog while preserving `data/foods.js` exports and existing behavior. Strengthen invariant checks for unique IDs, aliases, measurement bases, references, nutrients, units, conversions, source metadata, and dataset versioning.

The catalog must still contain only the original 11 records at the start of this phase's behavioral comparison. Existing V1 and V2 tests must pass before new records are introduced.

### V2-F3 - Curated Food Batches

Add only V2-F1-approved records in reviewable category batches:

1. staples and proteins;
2. prepared dishes and produce;
3. breakfast foods, snacks, desserts, and drinks.

Every batch must pass dataset, calculation, conversion, matching, nonmutation, and source-traceability checks before the next batch begins.

### V2-F4 - Matching, Ambiguity, and Serving Verification

Verify Filipino and English aliases, preparation-specific matches, legitimate ambiguous queries, unsupported descriptors, grams/milliliters, and sourced household conversions. Add no AI parsing, multiple-food parsing, fuzzy production search, meal building, or automatic logging.

### V2-F5 - Integrated Verification and Staging Approval

Run the full regression suite, database authorization suite, authenticated browser flow, production build, security checks, responsive smoke tests, and representative staging searches. Verify that logged snapshots preserve the new dataset version without changing older history.

Update the catalog documentation only after the final included records and count are verified. Obtain explicit user staging approval before merging the draft pull request.

## 9. Required Verification

At minimum, the completed program must prove:

1. The final catalog contains 60-100 total records and reports its exact count.
2. Every ID is unique and stable.
3. Every record has a display name, aliases, preparation, measurement basis, positive reference amount, supported units, and source metadata.
4. Every nutrition field is a finite non-negative number or explicit `null`.
5. Missing values never become zero.
6. Mass and volume references remain separate.
7. Cups, pieces, servings, and descriptors are food-specific and sourced.
8. No generic conversion leaks between foods.
9. Filipino and English aliases do not silently select the wrong preparation.
10. Broad terms produce ambiguity where appropriate.
11. Unsupported foods and servings fail safely without fabricated output.
12. Existing 11 foods preserve their tested behavior unless an objective source correction is separately reviewed.
13. Existing logged snapshots remain reproducible after the dataset-version change.
14. The catalog and calculation source objects remain immutable.
15. Node tests, build, dependency audit, secret scan, database tests, and local authenticated browser integration pass.
16. Representative phone and desktop staging searches pass without page-level overflow or inaccessible match controls.

## 10. Git and Pull Request Strategy

Use one branch and one draft pull request for the complete program:

```text
feature/v2-filipino-catalog-expansion -> main
```

Planned commits:

1. `Plan V2 Filipino-first food catalog expansion`
2. `Record verified Filipino food source matrix`
3. `Modularize and validate the demo food catalog`
4. `Add Filipino staples and protein foods`
5. `Add Filipino dishes and produce`
6. `Add Filipino breakfast snacks and drinks`
7. `Expand food matching and catalog regression coverage`
8. `Record Filipino catalog staging verification`

The first commit and draft pull request are the only authorized V2-F0 Git mutations. Each later commit requires its corresponding phase authorization. The pull request remains draft until V2-F5 passes and the user approves staging. It is merged once, after every required check succeeds.

## 11. Explicit Non-Goals

- live nutrition API integration;
- protected provider backend or API proxy;
- branded grocery products or restaurant-chain menus;
- barcode scanning, image recognition, or custom-food creation;
- multiple foods in one sentence or meal construction;
- recipe editor or ingredient-level recipe calculation;
- changing calorie-target methodology;
- changing authentication, RLS, account deletion, or provider configuration;
- redesign implementation from V2-D1 through V2-D6;
- claiming comprehensive Philippine, global, or medical nutrition coverage.

## 12. Stop Conditions

Stop and return for user review when:

- fewer than 60 total records can be sourced safely;
- an essential source has unclear access or reuse terms;
- a candidate requires guessed nutrients, preparation equivalence, or serving weights;
- alias collisions would silently choose the wrong food;
- the existing parser or UI cannot present the approved catalog safely without a larger product change;
- bundle size or mobile performance materially regresses;
- historical log reproduction changes;
- a new backend, secret, paid provider, or live API becomes necessary;
- any security, privacy, accessibility, database, or frozen V1 regression fails.

## 13. Plan Review Checklist

Before V2-F1, the user must confirm:

- 60-100 means total records, including the existing 11;
- target count is 80;
- nationwide common Filipino foods come before regional specialties;
- branded and restaurant items remain excluded;
- composite dishes require direct authoritative prepared-food entries;
- the application continues to say **Demo nutrition dataset**;
- one branch, one draft PR, and the eight planned commits are acceptable;
- source verification happens before any new food record is written.

Approval command after reviewing this plan:

> **Approve the V2 Filipino catalog plan. Proceed with V2-F1 candidate inventory and source verification. Stop for source-matrix review before adding food records.**

# CalorieCheck Version 2 — Data Contracts

This document records implemented persistence contracts that later Version 2 phases consume. Database column constraints remain authoritative.

## Food Log Contract — Version 1.0.0

V2-P6 maps one immutable successful calculator result to one explicit food-log command. An analysis or recalculation does not write data. Persistence begins only when the user activates **Add to Today's Log**.

### Identity and retry

- `requestId` is a browser-generated UUID and becomes the food-log primary key.
- The browser never sends a user ID.
- `create_food_log` derives the owner from `auth.uid()`.
- An identical retry with the same request ID returns the existing row with `idempotent: true`.
- Reusing a request ID with a different payload fails.
- Direct authenticated inserts are revoked; the RPC is the initial-log creation boundary.

### Time fields

- `consumedAt` is the instant when the user first activates the save action.
- `timezoneAtEntry` is copied from the completed profile.
- `localDate` is derived from that instant in `timezoneAtEntry`.
- PostgreSQL validates that the timezone is recognized and that `localDate` matches the instant and timezone.
- A network retry reuses the same instant, timezone, and local date.

### Scalar fields

| Command field | Database column | Meaning |
|---|---|---|
| `requestId` | `id` | Idempotent request and log identifier |
| derived by RPC | `user_id` | Authenticated owner |
| `consumedAt` | `consumed_at` | Unambiguous consumed instant |
| `timezoneAtEntry` | `timezone_at_entry` | Profile IANA timezone captured at entry |
| `localDate` | `local_date` | Stable reporting date |
| `foodId` | `food_id` | Canonical local food ID |
| `foodNameSnapshot` | `food_name_snapshot` | Display name at save time |
| `enteredQuantity` | `entered_quantity` | Quantity shown in the result |
| `enteredUnit` | `entered_unit` | `grams`, `cups`, `milliliters`, or `pieces` |
| `enteredDescriptor` | `entered_descriptor` | Food-specific descriptor or `null` |
| `normalizedAmount` | `normalized_amount` | Calculated mass or volume amount |
| `normalizedUnit` | `normalized_unit` | `g` or `ml` |
| nutrient values | nutrient columns | Unrounded calculation outputs within database precision |
| `nutritionDatasetVersion` | `nutrition_dataset_version` | `v1-demo-2026-09-25` |
| `sourceReference` | `source_reference` | Nutrition source reference captured at save time |
| `calculationSnapshot` | `calculation_snapshot` | Versioned edit and provenance snapshot |

Unavailable nutrients remain `null`. A numeric zero is stored only when the calculation source reports zero.

### Calculation snapshot

The `calculation_snapshot` object uses `schemaVersion: "1.0.0"` and contains:

- `dataset`: display label and immutable dataset version;
- `food`: canonical ID, name, preparation, type, measurement basis, and source metadata;
- `reference`: source reference amount, unit, and nutrition values;
- `serving`: entered and normalized serving values, conversion type, and the specific conversion metadata used;
- `calculation`: scale factor and calculated nutrient values.

The snapshot deliberately omits account data, profile values, aliases, authentication values, and UI state. Its captured reference and conversion metadata allow a later serving edit to recalculate from the saved historical basis without reading current `foods.js` values.

### Save event

After a confirmed save, the private application publishes `caloriecheck:food-log-saved` with only the log ID and stable local date. V2-P7 may use this event to refresh daily aggregates. No nutrient or profile data is placed in the event.

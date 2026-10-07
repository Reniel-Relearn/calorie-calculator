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

## Daily Tracker Contract — Version 1.0.0

V2-P7 queries one owner's food logs for one stored `local_date` and calculates the view on demand. Browser filters reduce the query to the authenticated user and selected date; database grants and Row Level Security remain the authorization boundary.

### Selected date

- The default date is derived from the current instant in the completed profile's IANA timezone.
- Date navigation uses calendar-day arithmetic and does not derive a day from server timezone.
- Previous-day, next-day, direct-date, and Today controls do not navigate later than the user's current local date.
- Existing log `local_date` values remain stable even if a profile timezone changes in a later phase.

### Effective target

- For today, the view selects the latest target whose `effective_from` is no later than the current instant.
- For a completed date, the view selects the latest target that became effective by the end of that calendar date in the profile timezone.
- A missing or null target remains unavailable. The tracker does not substitute maintenance calories or another target.

### Aggregation

- Calories sum every logged `calories_kcal` snapshot for the selected date.
- Each other nutrient is returned as `{ value, availability }`.
- `complete` means every entry has a numeric value, including explicit zero.
- `partial` means the displayed value is the sum of known entries and at least one entry is unavailable. The UI labels it as a known partial total.
- `unavailable` means no entry provides that nutrient; its value remains `null`.
- An empty day has zero logged calories and a separate **No food logged for this day** state. It does not turn absent nutrient evidence into zero.
- Core totals retain calculation precision; display rounding remains in the view layer.

### Refresh and display

- A matching `caloriecheck:food-log-saved` event reloads the selected date after a confirmed write.
- Food rows show the saved name, original serving, normalized serving when useful, local entry time, and calorie snapshot.
- Target comparison uses neutral **remaining** or **above target** wording.
- The target comparison uses a labeled native `meter`; its accessible text states consumed calories and the remaining/above amount.
- Loading, empty, unavailable-target, session-expired, and retryable network states remain distinct.

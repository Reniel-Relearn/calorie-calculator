import assert from "node:assert/strict";
import test from "node:test";

import { createWeeklyService } from "../js/dashboard/weekly-service.js";

function createClient(responses) {
  const calls = [];
  return {
    calls,
    from(table) {
      const query = { table, filters: [], orders: [], range: null };
      calls.push(query);
      const builder = {
        select(columns) {
          query.columns = columns;
          return builder;
        },
        eq(column, value) {
          query.filters.push(["eq", column, value]);
          return builder;
        },
        gte(column, value) {
          query.filters.push(["gte", column, value]);
          return builder;
        },
        lte(column, value) {
          query.filters.push(["lte", column, value]);
          return builder;
        },
        order(column, options) {
          query.orders.push([column, options]);
          return builder;
        },
        range(start, end) {
          query.range = [start, end];
          return Promise.resolve(responses[table]);
        },
      };
      return builder;
    },
  };
}

const LOG_ROW = {
  id: "log-1",
  consumed_at: "2026-10-07T04:00:00Z",
  timezone_at_entry: "Asia/Manila",
  local_date: "2026-10-07",
  food_id: "banana",
  food_name_snapshot: "Banana",
  entered_quantity: "100",
  entered_unit: "grams",
  entered_descriptor: null,
  normalized_amount: "100",
  normalized_unit: "g",
  calories_kcal: "89",
  protein_g: "1.09",
  carbohydrates_g: "22.84",
  fat_g: "0.33",
  fiber_g: "2.6",
  sugar_g: null,
  sodium_mg: "0",
};

const TARGET_ROW = {
  id: "target-1",
  target_kcal: "2100.25",
  maintenance_kcal: "2100.25",
  goal_type: "maintain",
  methodology: "nasem-dri-energy-2023-eer",
  methodology_version: "1.0.0",
  effective_from: "2026-10-06T03:00:00Z",
  effective_to: null,
};

test("queries one owner and the inclusive local-date week", async () => {
  const client = createClient({
    food_logs: { data: [LOG_ROW], error: null },
    calorie_targets: { data: [TARGET_ROW], error: null },
  });
  const result = await createWeeklyService(client).loadWeek({
    userId: "user-a",
    startDate: "2026-10-05",
    endDate: "2026-10-11",
  });

  assert.equal(result.ok, true);
  assert.equal(result.logs[0].sugarG, null);
  assert.equal(result.logs[0].sodiumMg, 0);
  assert.equal(result.targets[0].targetKcal, 2100.25);

  const logQuery = client.calls.find(({ table }) => table === "food_logs");
  assert.deepEqual(logQuery.filters, [
    ["eq", "user_id", "user-a"],
    ["gte", "local_date", "2026-10-05"],
    ["lte", "local_date", "2026-10-11"],
  ]);
  assert.deepEqual(logQuery.orders, [
    ["local_date", { ascending: true }],
    ["consumed_at", { ascending: true }],
  ]);
  assert.deepEqual(logQuery.range, [0, 999]);

  const targetQuery = client.calls.find(
    ({ table }) => table === "calorie_targets",
  );
  assert.deepEqual(targetQuery.filters, [["eq", "user_id", "user-a"]]);
});

test("maps weekly authentication and network failures to safe outcomes", async () => {
  const expired = createClient({
    food_logs: { data: null, error: { status: 401 } },
    calorie_targets: { data: [], error: null },
  });
  assert.equal(
    (
      await createWeeklyService(expired).loadWeek({
        userId: "user-a",
        startDate: "2026-10-05",
        endDate: "2026-10-11",
      })
    ).code,
    "SESSION_REQUIRED",
  );

  const failed = createWeeklyService({
    from() {
      throw new Error("network detail");
    },
  });
  assert.equal(
    (
      await failed.loadWeek({
        userId: "user-a",
        startDate: "2026-10-05",
        endDate: "2026-10-11",
      })
    ).code,
    "WEEKLY_LOAD_FAILED",
  );
});

import assert from "node:assert/strict";
import test from "node:test";

import { fetchDashboardPages } from "../js/dashboard/dashboard-data.js";

test("bounds dashboard pagination to five thousand rows", async () => {
  let calls = 0;
  const result = await fetchDashboardPages(() => ({
    async range() {
      calls += 1;
      return { data: Array.from({ length: 1000 }, () => ({})), error: null };
    },
  }));

  assert.equal(result.ok, false);
  assert.equal(result.error.code, "RESULT_SET_TOO_LARGE");
  assert.equal(calls, 5);
});

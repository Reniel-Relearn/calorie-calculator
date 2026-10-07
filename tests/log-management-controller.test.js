import assert from "node:assert/strict";
import test from "node:test";

import { createLogManagementController } from "../js/logs/log-management-controller.js";

const LOG = Object.freeze({
  id: "log-1",
  consumedAt: "2026-10-07T04:00:00.000Z",
  timezoneAtEntry: "Asia/Manila",
  localDate: "2026-10-07",
  foodId: "banana",
  foodNameSnapshot: "Banana",
  enteredQuantity: 100,
  enteredUnit: "grams",
  enteredDescriptor: null,
  normalizedAmount: 100,
  normalizedUnit: "g",
  calculationSnapshot: {
    schemaVersion: "1.0.0",
    dataset: { version: "1.1.0" },
    food: { id: "banana" },
    reference: {
      amount: 100,
      unit: "g",
      nutrition: {
        caloriesKcal: 89,
        proteinG: 1,
        carbohydratesG: 23,
        fatG: 0,
        fiberG: 2,
        sugarG: null,
        sodiumMg: 0,
      },
    },
    serving: {
      enteredQuantity: 100,
      enteredUnit: "grams",
      enteredDescriptor: null,
      normalizedAmount: 100,
      normalizedUnit: "g",
      conversionType: "direct-grams",
      conversionMetadata: null,
    },
    calculation: { scaleFactor: 1, nutrition: {} },
  },
});

function fakeView() {
  const calls = [];
  return {
    calls,
    clearEditError: () => calls.push(["clearEditError"]),
    closeDelete: () => calls.push(["closeDelete"]),
    closeEdit: () => calls.push(["closeEdit"]),
    openDelete: (log) => calls.push(["openDelete", log]),
    openEdit: (log, fields) => calls.push(["openEdit", log, fields]),
    reset: () => calls.push(["reset"]),
    setDeleteBusy: (busy) => calls.push(["setDeleteBusy", busy]),
    setEditBusy: (busy) => calls.push(["setEditBusy", busy]),
    showDeleteError: (message) => calls.push(["showDeleteError", message]),
    showEditError: (message) => calls.push(["showEditError", message]),
    showPageMessage: (message) => calls.push(["showPageMessage", message]),
  };
}

test("updates and deletes the selected owned log and reports affected dates", async () => {
  const changes = [];
  const view = fakeView();
  const controller = createLogManagementController({
    service: {
      async delete(id) {
        assert.equal(id, "log-1");
        return { ok: true, id, localDate: "2026-10-08" };
      },
      async update(command) {
        return {
          ok: true,
          log: { ...LOG, ...command },
          previousLocalDate: "2026-10-07",
        };
      },
    },
    view,
    onChanged: (change) => changes.push(change),
  });

  controller.edit(LOG);
  await controller.submitEdit({
    quantity: 200,
    localDate: "2026-10-08",
    localTime: "12:00",
  });
  assert.deepEqual(changes[0], {
    type: "updated",
    localDate: "2026-10-08",
    previousLocalDate: "2026-10-07",
  });

  controller.requestDelete({ ...LOG, localDate: "2026-10-08" });
  await controller.confirmDelete();
  assert.deepEqual(changes[1], {
    type: "deleted",
    localDate: "2026-10-08",
    previousLocalDate: "2026-10-08",
  });
});

test("delete cancellation performs no mutation", () => {
  let deleted = false;
  const controller = createLogManagementController({
    service: { delete: () => { deleted = true; } },
    view: fakeView(),
  });
  controller.requestDelete(LOG);
  controller.cancelDelete();
  assert.equal(deleted, false);
});

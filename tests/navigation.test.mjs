import test from "node:test";
import assert from "node:assert/strict";
import { createNavigationController } from "../js/navigation/navigation-controller.js";
import { destinationUrl, readDestination } from "../js/navigation/navigation-routes.js";

function fixture(href = "https://example.test/?view=week") {
  const entries = [];
  const events = new Map();
  const shown = [];
  const readiness = [];
  const browser = {
    location: new URL(href),
    history: Object.fromEntries(["pushState", "replaceState"].map((method) => [method, (state, _title, path) => {
      entries.push({ method, state, path });
      browser.location = new URL(path, browser.location);
    }])),
    addEventListener: (name, fn) => events.set(name, fn),
    removeEventListener: (name, fn) => { if (events.get(name) === fn) events.delete(name); },
  };
  const controller = createNavigationController({ browser, view: {
    setReady: (ready) => readiness.push(ready),
    show: (destination, options) => shown.push({ destination, options }),
  } });
  return { browser, controller, entries, events, shown, readiness };
}

test("allowlists destination hints and writes same-document destination-only URLs", () => {
  for (const value of ["https://evil.test", "constructor", "__proto__", "TODAY", "", "../settings"]) {
    assert.equal(readDestination(`https://example.test/?view=${encodeURIComponent(value)}`), "today");
  }
  assert.equal(destinationUrl("https://example.test/?safe=1#old", "analyze"), "/?safe=1&view=analyze");
  assert.equal(destinationUrl("https://example.test/", "constructor"), null);
});

test("guards hints before completed-profile activation and restores refresh destination", () => {
  const f = fixture();
  assert.equal(f.controller.navigate("analyze"), false);
  f.events.get("popstate")();
  assert.equal(f.shown.length, 0);
  f.controller.activate();
  assert.equal(f.shown.at(-1).destination, "week");
  assert.equal(f.entries.at(-1).method, "replaceState");
  assert.deepEqual(f.entries.at(-1).state, { view: "week" });
  f.controller.suspend();
  assert.equal(f.controller.navigate("settings"), false);
  assert.equal(f.readiness.at(-1), false);
});

test("does not duplicate entries, restores Back/Forward, and returns from Settings safely", () => {
  const f = fixture();
  f.controller.activate();
  f.controller.navigate("analyze");
  const count = f.entries.length;
  f.controller.navigate("analyze");
  assert.equal(f.entries.length, count);
  f.controller.navigate("settings");
  f.controller.returnFromSettings();
  assert.equal(f.shown.at(-1).destination, "analyze");
  f.browser.location = new URL("https://example.test/?view=today");
  const beforePop = f.entries.length;
  f.events.get("popstate")();
  assert.equal(f.entries.length, beforePop);
  assert.equal(f.shown.at(-1).destination, "today");
  f.controller.returnFromSettings();
  assert.equal(f.shown.at(-1).destination, "today");
});

test("removes callback credentials before destination history and clears owner state on reset", () => {
  const f = fixture("https://example.test/?auth=confirm&code=sensitive&view=settings#access_token=secret");
  f.controller.activate({ focus: false });
  assert.deepEqual(f.entries.at(-1).state, { view: "settings" });
  assert.equal(f.browser.location.href, "https://example.test/?view=settings");
  assert.equal(f.shown.at(-1).options.focus, false);
  f.controller.reset();
  assert.equal(f.browser.location.href, "https://example.test/");
  f.controller.activate();
  assert.equal(f.shown.at(-1).destination, "today");
  f.controller.destroy();
  assert.equal(f.events.has("popstate"), false);
});

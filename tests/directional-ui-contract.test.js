import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("onboarding and Settings expose all supported calorie goals", () => {
  for (const prefix of ["profile", "settings"]) {
    for (const goal of ["maintain", "lose", "gain"]) {
      assert.match(html, new RegExp(`id="${prefix}-goal-${goal}"`));
    }
  }
});

test("the calorie-estimate disclaimer is the bottommost Settings section", () => {
  const settingsStart = html.indexOf('<section class="settings-panel"');
  const disclaimer = html.indexOf(
    '<section class="settings-estimate-disclaimer"',
    settingsStart,
  );
  const settingsEnd = html.indexOf("</section>", disclaimer) + "</section>".length;
  const nextSection = html.indexOf("<section", disclaimer + 1);

  assert.ok(settingsStart >= 0);
  assert.ok(disclaimer > settingsStart);
  assert.ok(settingsEnd > disclaimer);
  assert.ok(nextSection === -1 || nextSection > settingsEnd);
  assert.match(
    html.slice(disclaimer, settingsEnd),
    /About calorie estimates[\s\S]*10\.17226\/26818/,
  );
});

test("nonpersistent directional safety confirmations are present in both forms", () => {
  assert.match(html, /id="profile-directional-safety-confirmation"/);
  assert.match(html, /id="settings-directional-safety-confirmation"/);
});

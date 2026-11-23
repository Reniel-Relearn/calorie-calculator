import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createTestBrowser } from "../helpers/browser.mjs";

const base = new URL(process.env.DESIGN_TEST_APP_URL ?? "http://127.0.0.1:5173/");
assert.ok(["127.0.0.1", "localhost"].includes(base.hostname), "Design checks must target a local server.");
const url = new URL("prototypes/v2-foundations/", base).href;
const page = await createTestBrowser();
const checks = [];
const screenshotDirectory = new URL("../../.vercel/design-review/", import.meta.url);

function luminance([r, g, b]) {
  const linear = (value) => value / 255 <= 0.04045 ? value / 255 / 12.92 : ((value / 255 + 0.055) / 1.055) ** 2.4;
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function ratio(a, b) {
  const rgb = (value) => {
    if (!value.startsWith("#")) return value.match(/[\d.]+/g).slice(0, 3).map(Number);
    const hex = value.length === 4 ? [...value.slice(1)].map((digit) => digit + digit).join("") : value.slice(1);
    return hex.match(/../g).map((part) => parseInt(part, 16));
  };
  const [x, y] = [luminance(rgb(a)), luminance(rgb(b))].sort((a, b) => b - a);
  return (x + 0.05) / (y + 0.05);
}

async function dimensions() {
  return page.call(() => ({ width: innerWidth, content: document.documentElement.scrollWidth }));
}

async function capture(name) {
  const screenshot = await page.send("Page.captureScreenshot", { format: "png" });
  await writeFile(new URL(name, screenshotDirectory), Buffer.from(screenshot.data, "base64"));
}

try {
  await mkdir(screenshotDirectory, { recursive: true });
  await page.resize(390, 844);
  await page.navigate(url);
  await page.waitFor(() => document.getElementById("sample-dialog-open") && document.styleSheets.length > 0);
  const assetFailures = page.events.filter((event) => event.method === "Network.responseReceived" && event.params.response.status >= 400);
  assert.deepEqual(assetFailures, [], "Specimen assets failed to load.");
  const external = page.events.filter((event) => event.method === "Network.requestWillBeSent")
    .map((event) => event.params.request.url)
    .filter((value) => /^https?:/.test(value) && new URL(value).origin !== base.origin);
  assert.deepEqual(external, [], "Specimen must not request external assets or services.");
  const exceptions = page.events.filter((event) => event.method === "Runtime.exceptionThrown");
  assert.deepEqual(exceptions, [], "Browser JavaScript exception.");

  for (const [width, height] of [[320, 568], [360, 800], [390, 844], [430, 932], [768, 1024], [820, 1180], [1024, 768], [1280, 800], [1440, 900], [1920, 1080], [1280, 600]]) {
    await page.resize(width, height);
    const bounds = await dimensions();
    assert.ok(bounds.content <= bounds.width, `Page overflow at ${width}×${height}: ${bounds.content}`);
    const smallTargets = await page.call(() => [...document.querySelectorAll("button, summary, input, select, .specimen-jump")]
      .filter((el) => !el.disabled && el.getClientRects().length && !["radio", "checkbox"].includes(el.type))
      .filter((el) => { const box = el.getBoundingClientRect(); return box.width < 44 || box.height < 44; })
      .map((el) => el.id || el.textContent.trim()));
    assert.deepEqual(smallTargets, [], `Small important control at ${width}`);
    const stepper = await page.call(() => ["sample-decrease", "sample-amount", "sample-increase"].map((id) => {
      const box = document.getElementById(id).getBoundingClientRect();
      return { height: box.height, center: box.top + box.height / 2 };
    }));
    assert.ok(stepper.every((box) => Math.abs(box.center - stepper[1].center) < 1 && Math.abs(box.height - stepper[1].height) < 1), `Amount controls misaligned at ${width}`);
    checks.push(`Reflow and touch areas: ${width}×${height}`);
  }

  const semantics = await page.call(() => {
    const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);
    return {
      duplicateIds: ids.filter((id, i) => ids.indexOf(id) !== i),
      brokenLabels: [...document.querySelectorAll("label[for]")].filter((el) => !document.getElementById(el.htmlFor)).map((el) => el.htmlFor),
      unnamedInputs: [...document.querySelectorAll("input, select")].filter((el) => !el.labels?.length && !el.getAttribute("aria-label")).map((el) => el.id),
      unnamedButtons: [...document.querySelectorAll("button")].filter((el) => !el.textContent.trim() && !el.getAttribute("aria-label")).length,
      uses: [...document.querySelectorAll("use")].map((el) => el.getAttribute("href")),
    };
  });
  assert.deepEqual(semantics.duplicateIds, []);
  assert.deepEqual(semantics.brokenLabels, []);
  assert.deepEqual(semantics.unnamedInputs, []);
  assert.equal(semantics.unnamedButtons, 0);
  for (const value of semantics.uses) {
    const asset = new URL(value, url);
    const id = asset.hash.slice(1);
    asset.hash = "";
    const response = await fetch(asset);
    assert.equal(response.status, 200);
    assert.ok((await response.text()).includes(`id="${id}"`), `Missing SVG symbol: ${id}`);
  }
  checks.push("Labels, names, unique IDs, and local SVG references");

  const tokens = await page.call(() => {
    const css = getComputedStyle(document.documentElement);
    return Object.fromEntries(["text", "text-muted", "label", "placeholder", "surface", "background", "primary", "primary-dark", "primary-soft", "success", "success-soft", "warning", "warning-soft", "danger", "danger-soft", "focus", "border-strong", "on-primary"]
      .map((name) => [name, css.getPropertyValue(`--color-${name}`).trim()]));
  });
  const textPairs = [["text", "surface"], ["text-muted", "surface"], ["text-muted", "background"], ["text-muted", "primary-soft"], ["label", "surface"], ["placeholder", "surface"], ["on-primary", "primary"], ["on-primary", "danger"], ["primary-dark", "primary-soft"], ["success", "success-soft"], ["warning", "warning-soft"], ["danger", "danger-soft"]];
  for (const [a, b] of textPairs) assert.ok(ratio(tokens[a], tokens[b]) >= 4.5, `${a}/${b} contrast below 4.5:1`);
  for (const [a, b] of [["focus", "surface"], ["focus", "background"], ["border-strong", "surface"]]) {
    assert.ok(ratio(tokens[a], tokens[b]) >= 3, `${a}/${b} non-text contrast below 3:1`);
  }
  checks.push(`Contrast: ${textPairs.length} normal-text pairs ≥4.5:1; focus/control-boundary pairs ≥3:1`);

  await page.resize(390, 844);
  await page.call(() => window.scrollTo(0, 0));
  await capture("phone-top.png");
  await page.call(() => document.getElementById("controls-heading").scrollIntoView());
  await capture("phone-controls.png");
  for (const name of ["success", "warning", "error", "info"]) {
    await page.call((kind) => document.querySelector(`[data-feedback="${kind}"]`).click(), [name]);
    assert.equal(await page.call(() => document.getElementById("feedback-title").textContent.toLowerCase().split(" ")[0]), name === "info" ? "information" : name);
  }
  await page.call(() => document.getElementById("specimen-form").requestSubmit());
  assert.equal(await page.call(() => document.activeElement.id), "sample-name");
  assert.equal(await page.call(() => document.getElementById("sample-name").getAttribute("aria-invalid")), "true");
  assert.equal(await page.call(() => getComputedStyle(document.activeElement).outlineStyle), "solid");
  await page.call(() => {
    const name = document.getElementById("sample-name"); name.value = "Alex"; name.dispatchEvent(new Event("input", { bubbles: true }));
    document.getElementById("specimen-form").requestSubmit();
  });
  assert.equal(await page.call(() => document.getElementById("sample-name-error").hidden), true);
  await page.call(() => document.getElementById("sample-increase").click());
  assert.equal(await page.call(() => document.getElementById("sample-amount").value), "1.25");
  await page.call(() => document.getElementById("sample-amount").focus());
  for (const [key, code] of [["ArrowUp", 38], ["ArrowDown", 40]]) {
    await page.send("Input.dispatchKeyEvent", { type: "keyDown", key, code: key, windowsVirtualKeyCode: code });
    await page.send("Input.dispatchKeyEvent", { type: "keyUp", key, code: key, windowsVirtualKeyCode: code });
    assert.equal(await page.call(() => document.getElementById("sample-amount").value), key === "ArrowUp" ? "1.5" : "1.25");
  }
  await page.call(() => { for (let i = 0; i < 4; i++) document.getElementById("sample-decrease").click(); });
  assert.equal(await page.call(() => document.getElementById("sample-amount").value), "0.25");
  assert.equal(await page.call(() => document.getElementById("sample-decrease").disabled), true);
  await page.call(() => document.querySelector(".specimen-details summary").focus());
  await page.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r" });
  await page.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
  await page.waitFor(() => document.querySelector("details").open);
  await page.call(() => document.getElementById("sample-dialog-open").click());
  assert.equal(await page.call(() => document.getElementById("sample-dialog").open), true);
  await page.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await page.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await page.waitFor(() => !document.getElementById("sample-dialog").open);
  await page.waitFor(() => document.activeElement.id === "sample-dialog-open");
  assert.equal(await page.call(() => document.activeElement.id), "sample-dialog-open");
  await page.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  await page.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  const focused = await page.call(() => ({ tag: document.activeElement.tagName, outline: getComputedStyle(document.activeElement).outlineWidth }));
  assert.notEqual(focused.tag, "BODY");
  assert.notEqual(focused.outline, "0px");
  checks.push("Interactive feedback, validation, amount controls, native disclosure, dialog Escape/focus return, keyboard Tab/focus");

  await page.call(() => { document.documentElement.style.fontSize = "32px"; });
  assert.ok((await dimensions()).content <= 390, "Overflow at 200% text scaling");
  await page.call(() => { document.documentElement.style.fontSize = ""; });
  await page.resize(320, 568); // 1280 CSS px at 400% zoom has a 320 CSS px layout viewport.
  assert.ok((await dimensions()).content <= 320, "Overflow at 400%-equivalent reflow");
  checks.push("200% root text scaling and 400%-equivalent 320px layout reflow");
  await page.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const reduced = await page.call(() => ({ spinner: getComputedStyle(document.querySelector(".spinner")).animationName, skeleton: getComputedStyle(document.querySelector(".skeleton")).animationName, transition: getComputedStyle(document.querySelector(".button")).transitionDuration }));
  assert.equal(reduced.spinner, "none");
  assert.equal(reduced.skeleton, "none");
  assert.ok(reduced.transition.split(",").every((part) => parseFloat(part) === 0));
  checks.push("Reduced motion removes spinner/skeleton animation and control transitions");
  await page.send("Emulation.setEmulatedMedia", { features: [] });
  await page.resize(1280, 800);
  await page.call(() => window.scrollTo(0, 0));
  await capture("desktop-top.png");
  await page.call(() => document.getElementById("controls-heading").scrollIntoView());
  await capture("desktop-controls.png");
  assert.deepEqual(page.events.filter((event) => event.method === "Runtime.exceptionThrown"), []);
  await writeFile(new URL("checks.json", screenshotDirectory), JSON.stringify({ url, checks, minimumTextContrast: Math.min(...textPairs.map(([a, b]) => ratio(tokens[a], tokens[b]))) }, null, 2));
  console.log(`Design foundations passed: ${checks.length} grouped checks. Screenshots and checks: .vercel/design-review/`);
} finally {
  await page.close();
}

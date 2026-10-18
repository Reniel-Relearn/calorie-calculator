import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const vercelConfig = JSON.parse(
  await readFile(new URL("../vercel.json", import.meta.url), "utf8"),
);

function globalHeaders() {
  const rule = vercelConfig.headers.find(({ source }) => source === "/(.*)");
  return Object.fromEntries(rule.headers.map(({ key, value }) => [key, value]));
}

test("sets the required browser security headers", () => {
  const headers = globalHeaders();
  for (const name of [
    "Content-Security-Policy",
    "Strict-Transport-Security",
    "X-Content-Type-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "X-Frame-Options",
    "Cross-Origin-Opener-Policy",
  ]) {
    assert.equal(typeof headers[name], "string", `${name} is configured`);
  }
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headers["X-Frame-Options"], "DENY");
});

test("enforces a narrow CSP without unsafe script directives or broad Supabase origins", () => {
  const csp = globalHeaders()["Content-Security-Policy"];
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /https:\/\/challenges\.cloudflare\.com/);
  assert.match(csp, /https:\/\/refqjrqxtgwfgxdbbcgw\.supabase\.co/);
  assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval|\*\.supabase\.co/);
});

test("keeps HTML revalidated and hashed assets immutable", () => {
  const rules = Object.fromEntries(
    vercelConfig.headers.map((rule) => [rule.source, rule.headers]),
  );
  assert.match(JSON.stringify(rules["/"]), /must-revalidate/);
  assert.match(JSON.stringify(rules["/assets\/(.*)"]), /immutable/);
});

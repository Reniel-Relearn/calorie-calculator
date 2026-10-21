import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

async function sourceFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await sourceFiles(path)));
    else if (entry.name.endsWith(".js")) files.push(path);
  }
  return files;
}

test("frontend source contains no executable HTML or dynamic-code sinks", async () => {
  const root = fileURLToPath(new URL("../js/", import.meta.url));
  const files = await sourceFiles(root);
  const forbidden = [
    /\.innerHTML\s*=/,
    /\.outerHTML\s*=/,
    /insertAdjacentHTML\s*\(/,
    /document\.write\s*\(/,
    /\beval\s*\(/,
    /new\s+Function\s*\(/,
    /javascript:/i,
  ];

  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const pattern of forbidden) {
      assert.doesNotMatch(source, pattern, `${file} avoids ${pattern}`);
    }
  }
});

test("production frontend source has no console logging", async () => {
  const files = await sourceFiles(
    fileURLToPath(new URL("../js/", import.meta.url)),
  );
  for (const file of files) {
    assert.doesNotMatch(
      await readFile(file, "utf8"),
      /console\.(?:log|debug|info|warn|error)\s*\(/,
      `${file} does not emit private data to the console`,
    );
  }
});

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const root = process.cwd();
const textExtensions = new Set([
  "",
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".sql",
  ".svg",
  ".toml",
  ".ts",
  ".txt",
  ".yml",
  ".yaml",
]);

const secretPatterns = Object.freeze([
  ["Supabase secret key", /sb_secret_[A-Za-z0-9_-]{20,}/g],
  ["legacy service-role JWT", /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g],
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  ["credentialed PostgreSQL URL", /postgres(?:ql)?:\/\/[^\s:@/]+:[^\s@/]+@[^\s/]+/gi],
  ["Vercel access token", /(?:VERCEL_TOKEN\s*=\s*|vercel_[A-Za-z0-9_-]{20,})/g],
]);

function trackedFiles() {
  return execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { cwd: root },
  )
    .toString("utf8")
    .split("\0")
    .filter(Boolean);
}

function filesUnder(directory) {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) files.push(...filesUnder(path));
    else files.push(relative(root, path));
  }
  return files;
}

const files = new Set([...trackedFiles(), ...filesUnder(join(root, "dist"))]);
const findings = [];

for (const file of files) {
  if (!textExtensions.has(extname(file).toLowerCase())) continue;
  let content;
  try {
    content = readFileSync(join(root, file), "utf8");
  } catch {
    continue;
  }

  for (const [name, pattern] of secretPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) findings.push(`${file}: ${name}`);
  }
}

if (findings.length > 0) {
  console.error("Potential privileged credential material found:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exitCode = 1;
} else {
  console.log(`Security scan passed for ${files.size} tracked/build files.`);
}

import { spawn } from "node:child_process";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";

const delay = (ms) => new Promise((done) => setTimeout(done, ms));

// An isolated headless browser; this never attaches to the user's open session.
export async function createTestBrowser() {
  let executable;
  for (const path of [
    process.env.DESIGN_TEST_CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome", "/usr/bin/chromium",
  ].filter(Boolean)) {
    try { await access(path); executable = path; break; } catch { /* Try next. */ }
  }
  if (!executable) throw new Error("Set DESIGN_TEST_CHROME_PATH to an installed Chrome/Chromium executable.");
  const profile = await mkdtemp(join(tmpdir(), "caloriecheck-visual-"));
  const processHandle = spawn(executable, [
    "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`,
    "--disable-gpu", "--no-first-run", "about:blank",
  ], { stdio: "ignore", windowsHide: true });
  let socket;
  let endpoint;
  let nextId = 0;
  const pending = new Map();
  const events = [];

  async function close() {
    if (socket?.readyState === WebSocket.OPEN) {
      try { await send("Browser.close"); } catch { /* Browser may close first. */ }
      socket.close();
    }
    if (processHandle.exitCode === null) processHandle.kill();
    // Only the exact temporary profile created by this helper may be removed.
    if (dirname(resolve(profile)) !== resolve(tmpdir()) || !basename(profile).startsWith("caloriecheck-visual-")) {
      throw new Error("Refusing to remove an unexpected browser profile path.");
    }
    for (let attempt = 0; attempt < 20; attempt++) {
      try { await rm(profile, { recursive: true, force: true }); return; }
      catch (error) {
        if (!["EPERM", "EBUSY", "ENOTEMPTY"].includes(error.code) || attempt === 19) throw error;
        await delay(250);
      }
    }
  }

  function send(method, params = {}) {
    const id = ++nextId;
    return new Promise((accept, reject) => {
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}`)); }, 15000);
      pending.set(id, {
        accept: (value) => { clearTimeout(timer); accept(value); },
        reject: (error) => { clearTimeout(timer); reject(error); },
      });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async function call(fn, args = []) {
    const global = await send("Runtime.evaluate", { expression: "globalThis" });
    const objectId = global.result.objectId;
    if (!objectId) throw new Error("Browser page context unavailable.");
    try {
      const result = await send("Runtime.callFunctionOn", {
        objectId, functionDeclaration: fn.toString(),
        arguments: args.map((value) => ({ value })), awaitPromise: true, returnByValue: true,
      });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? "Browser assertion failed.");
      return result.result.value;
    } finally { await send("Runtime.releaseObject", { objectId }); }
  }

  async function waitFor(fn, args = []) {
    const until = Date.now() + 10000;
    while (Date.now() < until) { if (await call(fn, args)) return; await delay(50); }
    throw new Error("Timed out waiting for the browser state.");
  }

  try {
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      try {
        const port = (await readFile(join(profile, "DevToolsActivePort"), "utf8")).split("\n")[0];
        endpoint = `http://127.0.0.1:${Number(port)}`;
        if ((await fetch(`${endpoint}/json/version`)).ok) break;
      } catch { /* Browser startup is asynchronous. */ }
      await delay(100);
    }
    if (!endpoint) throw new Error("Headless browser did not start.");
    const target = await (await fetch(`${endpoint}/json/new?about:blank`, { method: "PUT" })).json();
    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((done, fail) => { socket.addEventListener("open", done, { once: true }); socket.addEventListener("error", fail, { once: true }); });
    socket.addEventListener("message", ({ data }) => {
      const message = JSON.parse(data);
      if (!message.id) { events.push(message); return; }
      const request = pending.get(message.id);
      if (!request) return;
      pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message));
      else request.accept(message.result);
    });
    await send("Page.enable");
    await send("Page.bringToFront");
    await send("Runtime.enable");
    await send("Network.enable");
    await send("Emulation.setFocusEmulationEnabled", { enabled: true });
    return {
      send, call, waitFor, close, events,
      async navigate(url) {
        await send("Page.navigate", { url });
        await waitFor((expected) => location.href === expected && document.readyState === "complete", [url]);
      },
      resize: (width, height) => send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false }),
    };
  } catch (error) { await close(); throw error; }
}

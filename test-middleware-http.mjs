// One-shot, foreground verification of middleware auth behavior on the
// Next 15 standalone build. Starts the server with child_process.spawn,
// waits for its own readiness log line (bounded deadline), issues requests
// with Node's fetch, and always kills the server in `finally`.
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const PORT = 41835;
const BASE = `http://127.0.0.1:${PORT}`;
const ROUTES = [
  "/dashboard",
  "/nueva-venta",
  "/habitaciones",
  "/ventas",
  "/usuarios",
  "/reservas",
  "/clientes",
  "/configuracion",
];

function waitForReady(child, deadlineMs) {
  return new Promise((resolve, reject) => {
    let out = "";
    const timer = setTimeout(() => {
      reject(new Error(`Timed out waiting for server readiness after ${deadlineMs}ms. Output so far:\n${out}`));
    }, deadlineMs);
    const onData = (buf) => {
      out += buf.toString();
      if (/Ready in/i.test(out) || /started server/i.test(out)) {
        clearTimeout(timer);
        child.stdout.off("data", onData);
        resolve(out);
      }
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", (buf) => { out += buf.toString(); });
    child.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Server process exited early with code ${code}. Output:\n${out}`));
    });
  });
}

async function checkRoute(path, extraHeaders = {}) {
  const res = await fetch(`${BASE}${path}`, {
    signal: AbortSignal.timeout(10000),
    redirect: "manual",
    headers: extraHeaders,
  });
  const location = res.headers.get("location") || null;
  let bodySnippet = "";
  if (res.status === 200) {
    const text = await res.text();
    bodySnippet = text.slice(0, 300);
  }
  return { path, status: res.status, location, bodySnippet, headers: Object.fromEntries(extraHeaders ? Object.entries(extraHeaders) : []) };
}

let child;
const results = { normal: [], subrequestBypass: [], loginPage: null, error: null };

try {
  child = spawn(process.execPath, ["server.js"], {
    cwd: fileURLToPath(new URL("./.next/standalone/", import.meta.url)),
    env: {
      ...process.env,
      PORT: String(PORT),
      HOSTNAME: "127.0.0.1",
      NODE_ENV: "production",
      NEXTAUTH_SECRET: "test-fake-secret-do-not-use-in-prod-0000000000000000",
      NEXTAUTH_URL: BASE,
      NEXT_PUBLIC_BACKEND_URL: "http://127.0.0.1:0",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  await waitForReady(child, 15000);

  // 1) Unauthenticated, normal request to each protected matcher route.
  for (const route of ROUTES) {
    results.normal.push(await checkRoute(route));
  }

  // 2) Same routes but with the x-middleware-subrequest bypass header
  //    (GHSA-f82v-jwr5-mffw exploit vector) — must still be blocked.
  for (const route of ROUTES) {
    results.subrequestBypass.push(
      await checkRoute(route, { "x-middleware-subrequest": "middleware:middleware:middleware:middleware:middleware" })
    );
  }

  // 3) /login must remain reachable (200, not redirected away).
  results.loginPage = await checkRoute("/login");
  for (const result of [...results.normal, ...results.subrequestBypass]) {
    assert.equal(result.status, 307, `${result.path} must redirect without a session`);
    assert.equal(new URL(result.location, BASE).pathname, "/api/auth/signin");
  }
  assert.equal(results.loginPage.status, 200, "login must remain accessible");
} catch (err) {
  results.error = err.message;
  process.exitCode = 1;
} finally {
  if (child && !child.killed) {
    child.kill("SIGTERM");
  }
}

console.log(JSON.stringify(results, null, 2));

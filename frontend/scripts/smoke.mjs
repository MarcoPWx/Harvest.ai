#!/usr/bin/env node
// Post-deploy smoke script
// Usage: SMOKE_BASE_URL=https://your-app.example.com node scripts/smoke.mjs

const base = process.env.SMOKE_BASE_URL || "http://localhost:3002";
const tryGenerate = process.env.SMOKE_TRY_GENERATE === "1";

async function check(path, expectJson = false) {
  const url = base + path;
  const t0 = Date.now();
  let res;
  try {
    res = await fetch(url);
  } catch (e) {
    return { ok: false, url, error: e.message };
  }
  const ms = Date.now() - t0;
  if (!res.ok) return { ok: false, url, status: res.status, ms };
  if (expectJson) {
    try {
      await res.json();
    } catch (e) {
      return { ok: false, url, status: res.status, ms, error: "Invalid JSON" };
    }
  }
  return { ok: true, url, status: res.status, ms };
}

async function postGenerate() {
  const url = base + "/api/generate";
  const t0 = Date.now();
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: "Smoke test", format: "blog" }),
    });
  } catch (e) {
    return { ok: false, url, error: e.message };
  }
  const ms = Date.now() - t0;
  // Accept 200 or a reasonable 4xx depending on prod auth/policy
  const ok = res.status >= 200 && res.status < 300;
  try {
    await res.json();
  } catch {}
  return { ok, url, status: res.status, ms };
}

(async () => {
  const results = [];
  results.push(await check("/", false));
  results.push(await check("/docs/api", false));
  results.push(await check("/api/openapi.json", true));
  if (tryGenerate) results.push(await postGenerate());

  const failed = results.filter((r) => !r.ok);
  for (const r of results) {
    const status = r.ok ? "OK " : "ERR";
    console.log(`${status} ${r.url} ${r.status || ""} ${r.ms || ""}ms ${r.error || ""}`);
  }
  if (failed.length) {
    console.error("Smoke failed:", failed);
    process.exit(1);
  }
  console.log("Smoke passed");
  process.exit(0);
})();

import { test, expect } from "@playwright/test";

// S2S API behavior checks (triggers and caching) via JSON

test.describe.configure({ timeout: 40000 });

test("TRIGGER_RATE_LIMIT returns 429", async ({ page }) => {
  const res = await page.request.post("/api/generate", {
    data: { input: "please TRIGGER_RATE_LIMIT now", format: "blog" },
    headers: { "Content-Type": "application/json" },
  });
  expect(res.status()).toBe(429);
  const json = await res.json();
  expect(String(json.error || json.message)).toMatch(/rate limit/i);
});

test("TRIGGER_ERROR returns 500", async ({ page }) => {
  const res = await page.request.post("/api/generate", {
    data: { input: "please TRIGGER_ERROR now", format: "blog" },
    headers: { "Content-Type": "application/json" },
  });
  expect(res.status()).toBe(500);
});

test("Cached result on repeated input shows cached=true and processing_time=0", async ({ page }) => {
  const input = "This should be cached";
  const r1 = await page.request.post("/api/generate", {
    data: { input, format: "blog" },
    headers: { "Content-Type": "application/json" },
  });
  expect(r1.ok()).toBeTruthy();
  const j1 = await r1.json();
  expect(j1?.metadata?.cached || false).toBeFalsy();

  const r2 = await page.request.post("/api/generate", {
    data: { input, format: "blog" },
    headers: { "Content-Type": "application/json" },
  });
  expect(r2.ok()).toBeTruthy();
  const j2 = await r2.json();
  expect(j2?.metadata?.cached).toBeTruthy();
  expect(j2?.processing_time).toBe(0);
});


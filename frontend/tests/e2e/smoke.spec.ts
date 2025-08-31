import { test, expect } from "@playwright/test";

// Ultra-fast smoke covering health of core S2S endpoints (JSON mode) and homepage

test.describe.configure({ timeout: 30000 });

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation")).toBeVisible();
});

test("/api/generate returns JSON with core fields", async ({ page }) => {
  const res = await page.request.post("/api/generate", {
    data: { input: "smoke test input", format: "blog" },
    headers: { "Content-Type": "application/json" },
  });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toHaveProperty("result");
  expect(json).toHaveProperty("cost.tokens_used");
  expect(json).toHaveProperty("quality_score");
});

test("/api/format returns JSON with formatted output", async ({ page }) => {
  const res = await page.request.post("/api/format", {
    data: { content: "smoke test input", outputFormat: "summary" },
    headers: { "Content-Type": "application/json" },
  });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toHaveProperty("formatted");
  expect(json).toHaveProperty("cost");
  expect(json).toHaveProperty("quality");
});


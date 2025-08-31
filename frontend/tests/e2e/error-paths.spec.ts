import { test, expect } from "@playwright/test";

// Error path tests for generate playground in JSON mode

test.describe.skip("Generate Playground - error paths", () => {
  test("simulates 429 rate limit in JSON mode", async ({ page }) => {
    await page.goto("/playground/generate");

    // Toggle 429 simulation
    await page.getByLabel("simulate 429").check();

    await page.getByLabel("Input").fill("Trigger rate-limit please");
    await page.getByRole("button", { name: "Call JSON" }).click();

    const jsonPre = page.locator("pre", { hasText: "RATE_LIMIT_EXCEEDED" });
    await expect(jsonPre).toBeVisible({ timeout: 10000 });
  });

  test("simulates 500 server error in JSON mode", async ({ page }) => {
    await page.goto("/playground/generate");

    // Toggle 500 simulation
    await page.getByLabel("simulate 500").check();

    await page.getByLabel("Input").fill("Trigger server error please");
    await page.getByRole("button", { name: "Call JSON" }).click();

    const jsonPre = page.locator("pre", { hasText: "GENERATION_ERROR" });
    await expect(jsonPre).toBeVisible({ timeout: 10000 });
  });
});

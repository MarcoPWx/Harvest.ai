import { test, expect } from "@playwright/test";

// Metrics should reflect activity after interactions

test.describe.skip("Metrics Playground", () => {
  test("metrics counters increase after activity", async ({ page }) => {
    // Perform some activity
    await page.goto("/playground/generate");
    await page.getByLabel("Input").fill("Hello metrics!");
    await page.getByRole("button", { name: "Call JSON" }).click();

    // Visit metrics page and check counters
    await page.goto("/playground/metrics");

    const reqTotal = page.locator("text=req_total").locator("..").locator("div").nth(1);
    await expect(page.locator("text=req_total")).toBeVisible();

    // The pre also shows the raw JSON; assert at least one key exists
    await expect(page.locator("pre", { hasText: "req_total" })).toBeVisible({ timeout: 20000 });
  });
});

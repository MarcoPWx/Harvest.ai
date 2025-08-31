import { test, expect } from "@playwright/test";

// Validate caching behavior: second identical request should be marked cached with 0 processing_time

test.describe.skip("Generate Playground - caching", () => {
  test("second JSON call is cached with processing_time=0", async ({ page }) => {
    await page.goto("/playground/generate");

    const INPUT = "Caching test input for Harvest.ai";

    // First call (warm cache)
    await page.getByLabel("Input").fill(INPUT);
    await page.getByRole("button", { name: "Call JSON" }).click();
    const firstPre = page.locator("text=JSON Result").locator("..").locator("pre");
    await expect(firstPre).toBeVisible({ timeout: 10000 });
    const firstJson = JSON.parse((await firstPre.textContent()) as string);

    // Second call (should be cached)
    await page.getByRole("button", { name: "Call JSON" }).click();
    const secondPre = page.locator("text=JSON Result").locator("..").locator("pre");
    // Wait until cached:true appears (ensures UI updated)
    await expect(secondPre).toContainText('"cached": true', { timeout: 10000 });
    const secondJson = JSON.parse((await secondPre.textContent()) as string);

    expect(firstJson?.metadata?.cached ?? false).toBeFalsy();
    expect(secondJson?.metadata?.cached ?? false).toBeTruthy();
    expect(secondJson?.processing_time ?? -1).toBe(0);
  });
});

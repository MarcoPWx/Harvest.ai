import { test, expect } from "@playwright/test";

// Visual regression snapshots for stable pages
// First run will create snapshots; CI will compare on subsequent runs.

test.describe.skip("Visual snapshots", () => {
  test("Home page (desktop)", async ({ page }) => {
    await page.goto("/");
    // Wait for hero/particles to settle a bit
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot("home-desktop.png", { fullPage: true });
  });

  test("Docs index (desktop)", async ({ page }) => {
    await page.goto("/docs");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("docs-index-desktop.png", { fullPage: true });
  });
});

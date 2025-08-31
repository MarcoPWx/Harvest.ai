import { test, expect } from "@playwright/test";

// Minimal check for system status page

test.describe("Status Page", () => {
  test("renders heading and content", async ({ page }) => {
    await page.goto("/status");
    await expect(page.getByRole("heading", { name: /System Status/i })).toBeVisible();
    await expect(page.locator("pre", { hasText: "STATUS_PAGE.md" })).toBeVisible();
  });
});

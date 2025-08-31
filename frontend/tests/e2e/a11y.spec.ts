import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Basic a11y scans for key pages

test.describe("Accessibility", () => {
  test("Home page is accessible", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    const severe = results.violations.filter((v) => ["critical"].includes(v.impact || ""));
    expect(severe).toEqual([]);
  });

  test("Docs index is accessible", async ({ page }) => {
    await page.goto("/docs");
    const results = await new AxeBuilder({ page }).analyze();
    const severe = results.violations.filter((v) => ["critical"].includes(v.impact || ""));
    expect(severe).toEqual([]);
  });
});

import { test, expect } from "@playwright/test";

// Generate streaming should emit meta and done events and show JSON fallback working

test.describe.skip("Generate Playground - streaming", () => {
  test("streams SSE and completes", async ({ page }) => {
    await page.goto("/playground/generate");

    // Ensure a clean input
    await page
      .getByLabel("Input")
      .fill("Write a short note about Harvest.ai streaming and threads.");

    // Start streaming
    await page.getByRole("button", { name: "Stream SSE" }).click();

    // Wait for some SSE events to show up
    await expect(page.locator("text=SSE Events")).toBeVisible({ timeout: 20000 });
    await expect(page.locator("pre", { hasText: "[meta]" })).toBeVisible({ timeout: 20000 });

    // We expect the stream to finish (done event recorded)
    await expect(page.locator("pre", { hasText: "[done]" })).toBeVisible({ timeout: 10000 });
  });

  test("JSON call returns payload", async ({ page }) => {
    await page.goto("/playground/generate");

    await page.getByLabel("Input").fill("Summarize why streaming helps UX.");
    await page.getByRole("button", { name: "Call JSON" }).click();

    // Validate JSON panel shows metadata
    await expect(page.locator("pre", { hasText: "metadata" })).toBeVisible({ timeout: 20000 });
  });
});

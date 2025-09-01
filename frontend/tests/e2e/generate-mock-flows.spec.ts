import { test, expect } from "@playwright/test";

// These tests rely on MSW handlers with special triggers in dev:mock mode
// See src/mocks/handlers/generation.ts for TRIGGER_* behavior

test.describe("Generate API - Mock flows", () => {
  test.setTimeout(40000);
  test("should show rate limit error (429) when TRIGGER_RATE_LIMIT is in input", async ({
    page,
  }) => {
    await page.goto("/demo");

    // Ensure demo input is present and MSW is ready
    await page.waitForSelector("#demo-input-content", { state: "visible", timeout: 10000 });
    await page
      .waitForFunction(() => !!navigator.serviceWorker && !!navigator.serviceWorker.controller)
      .catch(() => {});

    await page.fill("#demo-input-content", "please TRIGGER_RATE_LIMIT now");
    const genBtn1 = page.getByRole("button", { name: "Generate content" });
    await expect(genBtn1).toBeEnabled();
    await genBtn1.click();

    // Expect an error message to surface in UI
    await expect(page.getByText(/rate limit|try again|Too many requests/i)).toBeVisible({
      timeout: 20000,
    });
  });

  test("should indicate cached result when TRIGGER_CACHED is in input", async ({ page }) => {
    await page.goto("/demo");

    // Ensure demo input is present and MSW is ready
    await page.waitForSelector("#demo-input-content", { state: "visible", timeout: 10000 });
    await page
      .waitForFunction(() => !!navigator.serviceWorker && !!navigator.serviceWorker.controller)
      .catch(() => {});

    await page.fill("#demo-input-content", "make this a TRIGGER_CACHED response");
    const genBtn2 = page.getByRole("button", { name: "Generate content" });
    await expect(genBtn2).toBeEnabled();
    await genBtn2.click();

    // Wait for result
    await expect(page.getByText("Your Generated Content")).toBeVisible({ timeout: 15000 });

    // Cached badge should appear
    await expect(page.getByText(/Instant Result/i)).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";

test.describe.skip("Content Generation Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock login or use test account
    await page.goto("/dashboard/generate");

    // If redirected to login, handle auth
    if (page.url().includes("login")) {
      await page.fill('input[name="email"]', "demo@harvest.ai");
      await page.fill('input[name="password"]', "DemoPass123!");
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*\/dashboard/);
      await page.goto("/dashboard/generate");
    }
  });

  test("should generate blog post content", async ({ page }) => {
    // Select blog format
    await page.selectOption('[data-testid="format-selector"]', "blog");

    // Enter content
    await page.fill(
      '[data-testid="content-input"]',
      "The future of renewable energy and sustainable technology",
    );

    // Select model
    await page.selectOption('[data-testid="model-selector"]', "gpt-4");

    // Select tone
    await page.selectOption('[data-testid="tone-selector"]', "professional");

    // Set length
    await page.locator('[data-testid="length-slider"]').fill("1500");

    // Click generate
    await page.click('[data-testid="generate-button"]');

    // Wait for generation to complete (with loading state)
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    await expect(page.locator('[data-testid="generated-content"]')).toBeVisible({ timeout: 30000 });

    // Verify content is generated
    const content = await page.locator('[data-testid="generated-content"]').textContent();
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(100);

    // Verify it contains relevant content
    expect(content!.toLowerCase()).toContain("renewable");
  });

  test("should generate email content", async ({ page }) => {
    await page.selectOption('[data-testid="format-selector"]', "email");
    await page.fill('[data-testid="content-input"]', "Follow-up after product demo meeting");
    await page.selectOption('[data-testid="tone-selector"]', "professional");

    await page.click('[data-testid="generate-button"]');

    await expect(page.locator('[data-testid="generated-content"]')).toBeVisible({ timeout: 30000 });

    const content = await page.locator('[data-testid="generated-content"]').textContent();
    expect(content!.toLowerCase()).toContain("subject");
    expect(content!.toLowerCase()).toContain("dear");
  });

  test("should generate summary", async ({ page }) => {
    const longText = `
      Artificial intelligence has revolutionized numerous industries over the past decade. 
      From healthcare to finance, AI systems are now capable of performing complex tasks 
      that were once thought to be exclusively human domains. Machine learning algorithms 
      can diagnose diseases, predict market trends, and even create art. However, with 
      these advancements come important ethical considerations about privacy, bias, and 
      the future of human employment.
    `;

    await page.selectOption('[data-testid="format-selector"]', "summary");
    await page.fill('[data-testid="content-input"]', longText);
    await page.locator('[data-testid="length-slider"]').fill("200");

    await page.click('[data-testid="generate-button"]');

    await expect(page.locator('[data-testid="generated-content"]')).toBeVisible({ timeout: 30000 });

    const summary = await page.locator('[data-testid="generated-content"]').textContent();
    expect(summary!.length).toBeLessThan(longText.length);
    expect(summary!.toLowerCase()).toContain("ai");
  });

  test("should handle multiple format generations", async ({ page }) => {
    const formats = ["blog", "email", "summary"];

    for (const format of formats) {
      await page.selectOption('[data-testid="format-selector"]', format);
      await page.fill('[data-testid="content-input"]', `Test content for ${format}`);
      await page.click('[data-testid="generate-button"]');

      await expect(page.locator('[data-testid="generated-content"]')).toBeVisible({
        timeout: 30000,
      });

      // Clear for next iteration
      await page.click('[data-testid="clear-button"]');
    }
  });

  test("should copy generated content", async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.selectOption('[data-testid="format-selector"]', "blog");
    await page.fill('[data-testid="content-input"]', "Test content for copying");
    await page.click('[data-testid="generate-button"]');

    await expect(page.locator('[data-testid="generated-content"]')).toBeVisible({ timeout: 30000 });

    // Click copy button
    await page.click('[data-testid="copy-button"]');

    // Verify success message
    await expect(page.locator("text=/copied|clipboard/i")).toBeVisible();

    // Verify clipboard content (if supported)
    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardContent).toBeTruthy();
  });

  test("should download generated content", async ({ page }) => {
    await page.selectOption('[data-testid="format-selector"]', "blog");
    await page.fill('[data-testid="content-input"]', "Content for download test");
    await page.click('[data-testid="generate-button"]');

    await expect(page.locator('[data-testid="generated-content"]')).toBeVisible({ timeout: 30000 });

    // Start waiting for download
    const downloadPromise = page.waitForEvent("download");

    // Click download button
    await page.click('[data-testid="download-button"]');

    // Wait for download
    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toContain("harvest-ai");
    expect(download.suggestedFilename()).toEndWith(".txt");
  });

  test("should regenerate content", async ({ page }) => {
    await page.selectOption('[data-testid="format-selector"]', "blog");
    await page.fill('[data-testid="content-input"]', "Content for regeneration");
    await page.click('[data-testid="generate-button"]');

    await expect(page.locator('[data-testid="generated-content"]')).toBeVisible({ timeout: 30000 });

    const firstContent = await page.locator('[data-testid="generated-content"]').textContent();

    // Click regenerate
    await page.click('[data-testid="regenerate-button"]');

    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    await expect(page.locator('[data-testid="generated-content"]')).toBeVisible({ timeout: 30000 });

    const secondContent = await page.locator('[data-testid="generated-content"]').textContent();

    // Content should be different
    expect(secondContent).not.toBe(firstContent);
  });

  test("should show error for empty input", async ({ page }) => {
    // Try to generate without content
    await page.click('[data-testid="generate-button"]');

    // Should show error
    await expect(page.locator("text=/enter|provide|required/i")).toBeVisible();
  });

  test("should handle API errors gracefully", async ({ page }) => {
    // Simulate API error by using invalid settings
    await page.selectOption('[data-testid="format-selector"]', "blog");
    await page.fill('[data-testid="content-input"]', "TRIGGER_ERROR_TEST");

    await page.click('[data-testid="generate-button"]');

    // Should show error message
    await expect(page.locator("text=/error|failed|try again/i")).toBeVisible({ timeout: 10000 });

    // Should allow retry
    await expect(page.locator('[data-testid="generate-button"]')).toBeEnabled();
  });

  test("should save generation to history", async ({ page }) => {
    await page.selectOption('[data-testid="format-selector"]', "blog");
    await page.fill('[data-testid="content-input"]', "Content to save in history");
    await page.click('[data-testid="generate-button"]');

    await expect(page.locator('[data-testid="generated-content"]')).toBeVisible({ timeout: 30000 });

    // Navigate to history
    await page.click('[data-testid="history-link"]');

    // Should see the recent generation
    await expect(page.locator("text=/Content to save in history/i")).toBeVisible();
  });

  test("should apply Pro features when available", async ({ page }) => {
    // Check if Pro features are visible
    const proIndicator = page.locator('[data-testid="pro-features"]');

    if (await proIndicator.isVisible()) {
      // Test advanced models
      await page.selectOption('[data-testid="model-selector"]', "gpt-4");

      // Test higher length limits
      await page.locator('[data-testid="length-slider"]').fill("5000");

      // Test temperature control
      const temperatureSlider = page.locator('[data-testid="temperature-slider"]');
      if (await temperatureSlider.isVisible()) {
        await temperatureSlider.fill("0.9");
      }

      // Test keyword inclusion
      const keywordsToggle = page.locator('[data-testid="keywords-toggle"]');
      if (await keywordsToggle.isVisible()) {
        await keywordsToggle.check();
        await page.fill('[data-testid="keywords-input"]', "innovation, sustainability, future");
      }

      await page.fill('[data-testid="content-input"]', "Test Pro features");
      await page.click('[data-testid="generate-button"]');

      await expect(page.locator('[data-testid="generated-content"]')).toBeVisible({
        timeout: 30000,
      });
    }
  });

  test("should work on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.selectOption('[data-testid="format-selector"]', "blog");
    await page.fill('[data-testid="content-input"]', "Mobile test content");
    await page.click('[data-testid="generate-button"]');

    await expect(page.locator('[data-testid="generated-content"]')).toBeVisible({ timeout: 30000 });

    // Verify mobile-specific UI elements
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });

  test("should handle concurrent generations", async ({ page }) => {
    // Start first generation
    await page.selectOption('[data-testid="format-selector"]', "blog");
    await page.fill('[data-testid="content-input"]', "First generation");
    await page.click('[data-testid="generate-button"]');

    // Try to start another generation while first is running
    await page.click('[data-testid="generate-button"]');

    // Should either queue or show appropriate message
    const queueMessage = page.locator("text=/queue|wait|processing/i");
    const cancelButton = page.locator('[data-testid="cancel-button"]');

    expect((await queueMessage.isVisible()) || (await cancelButton.isVisible())).toBeTruthy();
  });
});

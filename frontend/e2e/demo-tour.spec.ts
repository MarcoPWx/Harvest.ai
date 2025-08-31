import { test, expect, Page } from "@playwright/test";

// Helper function to clear localStorage
async function clearTourData(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem("harvest_tour_completed");
    localStorage.removeItem("harvest_visited");
  });
}

// Helper function to set tour as completed
async function setTourCompleted(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem("harvest_tour_completed", "true");
    localStorage.setItem("harvest_visited", "true");
  });
}

test.describe("BYOK Demo Tour - E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the demo page
    await page.goto("/demo/byok");
    // Wait for page to fully load
    await page.waitForLoadState("networkidle");
  });

  test.describe("First Time Visitor Flow", () => {
    test.beforeEach(async ({ page }) => {
      // Clear any existing tour data
      await clearTourData(page);
      await page.reload();
    });

    test("should show floating tour button after 2 seconds", async ({ page }) => {
      // Initially button should not be visible
      await expect(page.locator('[aria-label="Launch BYOK Demo Tour"]')).not.toBeVisible();

      // Wait for button to appear (2 seconds delay)
      await page.waitForTimeout(2100);
      await expect(page.locator('[aria-label="Launch BYOK Demo Tour"]')).toBeVisible();
    });

    test("should show notification dot for first-time visitors", async ({ page }) => {
      // Wait for button to appear
      await page.waitForTimeout(2100);

      // Check for notification dot
      const notificationDot = page.locator(".animate-ping").first();
      await expect(notificationDot).toBeVisible();
    });

    test("should auto-start tour after 3 seconds for first-time visitors", async ({ page }) => {
      // Wait for auto-start (2s for button + 3s for auto-start)
      await page.waitForTimeout(5100);

      // Tour overlay should be visible
      await expect(page.locator('text="Welcome to Harvest.ai!"')).toBeVisible();

      // Check localStorage was updated
      const visited = await page.evaluate(() => localStorage.getItem("harvest_visited"));
      expect(visited).toBe("true");
    });

    test("should complete full tour navigation", async ({ page }) => {
      // Wait for tour to auto-start
      await page.waitForTimeout(5100);

      // Step 1: Welcome
      await expect(page.locator('text="Welcome to Harvest.ai!"')).toBeVisible();
      await page.click('button:has-text("Next")');

      // Step 2: Key Management
      await expect(page.locator('text="Secure API Key Management"')).toBeVisible();
      await page.click('button:has-text("Next")');

      // Step 3: AI Providers
      await expect(page.locator('text="Multiple AI Providers"')).toBeVisible();
      await page.click('button:has-text("Next")');

      // Step 4: Analytics
      await expect(page.locator('text="Real-time Analytics"')).toBeVisible();
      await page.click('button:has-text("Next")');

      // Step 5: Cost Tracking
      await expect(page.locator('text="Cost Tracking"')).toBeVisible();
      await page.click('button:has-text("Next")');

      // Step 6: Security
      await expect(page.locator('text="Enterprise Security"')).toBeVisible();
      await page.click('button:has-text("Next")');

      // Step 7: Get Started
      await expect(page.locator('text="Ready to Get Started?"')).toBeVisible();
      await page.click('button:has-text("Get Started")');

      // Tour should be completed
      const completed = await page.evaluate(() => localStorage.getItem("harvest_tour_completed"));
      expect(completed).toBe("true");

      // Tour overlay should be hidden
      await expect(page.locator('text="Welcome to Harvest.ai!"')).not.toBeVisible();
    });
  });

  test.describe("Returning Visitor Flow", () => {
    test.beforeEach(async ({ page }) => {
      // Set as returning visitor
      await setTourCompleted(page);
      await page.reload();
    });

    test("should not show notification dot for returning visitors", async ({ page }) => {
      // Wait for button to appear
      await page.waitForTimeout(2100);

      // Button should be visible but no notification dot
      await expect(page.locator('[aria-label="Launch BYOK Demo Tour"]')).toBeVisible();
      await expect(page.locator(".animate-ping")).not.toBeVisible();
    });

    test("should not auto-start tour for returning visitors", async ({ page }) => {
      // Wait past auto-start time
      await page.waitForTimeout(5100);

      // Tour should not be visible
      await expect(page.locator('text="Welcome to Harvest.ai!"')).not.toBeVisible();

      // Button should still be visible
      await expect(page.locator('[aria-label="Launch BYOK Demo Tour"]')).toBeVisible();
    });

    test("should allow manual tour launch for returning visitors", async ({ page }) => {
      // Wait for button to appear
      await page.waitForTimeout(2100);

      // Click the tour button
      await page.click('[aria-label="Launch BYOK Demo Tour"]');

      // Tour should start
      await expect(page.locator('text="Welcome to Harvest.ai!"')).toBeVisible();
    });
  });

  test.describe("Tour Interactions", () => {
    test("should navigate with keyboard shortcuts", async ({ page }) => {
      await clearTourData(page);
      await page.reload();

      // Wait for tour to auto-start
      await page.waitForTimeout(5100);

      // Navigate forward with arrow key
      await page.keyboard.press("ArrowRight");
      await expect(page.locator('text="Secure API Key Management"')).toBeVisible();

      // Navigate backward with arrow key
      await page.keyboard.press("ArrowLeft");
      await expect(page.locator('text="Welcome to Harvest.ai!"')).toBeVisible();

      // Jump to specific step with number key
      await page.keyboard.press("4");
      await expect(page.locator('text="Real-time Analytics"')).toBeVisible();

      // Exit with ESC key
      await page.keyboard.press("Escape");
      await expect(page.locator('text="Welcome to Harvest.ai!"')).not.toBeVisible();
    });

    test("should exit tour when clicking backdrop", async ({ page }) => {
      await clearTourData(page);
      await page.reload();

      // Wait for tour to auto-start
      await page.waitForTimeout(5100);

      // Click backdrop to exit
      await page.click(".fixed.inset-0.bg-black");

      // Tour should be hidden
      await expect(page.locator('text="Welcome to Harvest.ai!"')).not.toBeVisible();
    });

    test("should show progress indicators", async ({ page }) => {
      await clearTourData(page);
      await page.reload();

      // Wait for tour to auto-start
      await page.waitForTimeout(5100);

      // Check progress dots
      const progressDots = page.locator('[aria-label*="Step"]');
      await expect(progressDots).toHaveCount(7);

      // First dot should be active
      await expect(progressDots.nth(0)).toHaveClass(/bg-green-600/);

      // Navigate to next step
      await page.click('button:has-text("Next")');

      // Second dot should now be active
      await expect(progressDots.nth(1)).toHaveClass(/bg-green-600/);
    });
  });

  test.describe("Tour Button Interactions", () => {
    test.beforeEach(async ({ page }) => {
      await setTourCompleted(page);
      await page.reload();
      await page.waitForTimeout(2100);
    });

    test("should show tooltip on hover", async ({ page }) => {
      // Hover over the button
      await page.hover('[aria-label="Launch BYOK Demo Tour"]');

      // Tooltip should appear
      await expect(page.locator('text="Launch BYOK Demo Tour"')).toBeVisible();
      await expect(page.locator('text="Interactive walkthrough with mock data"')).toBeVisible();

      // Move mouse away
      await page.mouse.move(0, 0);

      // Tooltip should disappear
      await expect(page.locator('text="Interactive walkthrough with mock data"')).not.toBeVisible();
    });

    test("should show sparkle animations on hover", async ({ page }) => {
      // Hover over the button
      await page.hover('[aria-label="Launch BYOK Demo Tour"]');

      // Check for sparkle SVGs
      const sparkles = page.locator("svg.lucide-sparkles");
      const sparkleCount = await sparkles.count();
      expect(sparkleCount).toBeGreaterThan(0);
    });

    test("should hide button after tour completion", async ({ page }) => {
      // Clear and reload to get fresh state
      await clearTourData(page);
      await page.reload();

      // Wait for tour to auto-start
      await page.waitForTimeout(5100);

      // Complete the tour quickly
      for (let i = 0; i < 6; i++) {
        await page.click('button:has-text("Next")');
        await page.waitForTimeout(100);
      }
      await page.click('button:has-text("Get Started")');

      // Wait for hide delay (5 seconds)
      await page.waitForTimeout(5100);

      // Button should be hidden
      await expect(page.locator('[aria-label="Launch BYOK Demo Tour"]')).not.toBeVisible();
    });
  });

  test.describe("Mobile Responsiveness", () => {
    test.beforeEach(async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await clearTourData(page);
      await page.reload();
    });

    test("should display tour correctly on mobile", async ({ page }) => {
      // Wait for tour to auto-start
      await page.waitForTimeout(5100);

      // Tour should be visible and properly sized
      const tourCard = page.locator(".bg-white.rounded-xl.shadow-xl");
      await expect(tourCard).toBeVisible();

      // Check that content fits in viewport
      const boundingBox = await tourCard.boundingBox();
      expect(boundingBox?.width).toBeLessThanOrEqual(375);
    });

    test("should position button correctly on mobile", async ({ page }) => {
      // Set as returning visitor to prevent auto-start
      await setTourCompleted(page);
      await page.reload();
      await page.waitForTimeout(2100);

      // Button should be visible
      const button = page.locator('[aria-label="Launch BYOK Demo Tour"]');
      await expect(button).toBeVisible();

      // Check positioning
      const boundingBox = await button.boundingBox();
      expect(boundingBox?.x).toBeGreaterThan(300); // Near right edge
      expect(boundingBox?.y).toBeGreaterThan(550); // Near bottom
    });
  });

  test.describe("Accessibility", () => {
    test("should be keyboard navigable", async ({ page }) => {
      await setTourCompleted(page);
      await page.reload();
      await page.waitForTimeout(2100);

      // Tab to focus the button
      await page.keyboard.press("Tab");

      // Button should be focused
      const button = page.locator('[aria-label="Launch BYOK Demo Tour"]');
      await expect(button).toBeFocused();

      // Press Enter to launch tour
      await page.keyboard.press("Enter");

      // Tour should be visible
      await expect(page.locator('text="Welcome to Harvest.ai!"')).toBeVisible();
    });

    test("should have proper ARIA labels", async ({ page }) => {
      await clearTourData(page);
      await page.reload();
      await page.waitForTimeout(5100);

      // Check ARIA labels
      await expect(page.locator('[aria-label="Close tour"]')).toBeVisible();
      await expect(page.locator('[aria-label="Previous step"]')).toBeVisible();
      await expect(page.locator('[aria-label="Next step"]')).toBeVisible();

      // Progress dots should have labels
      const progressDots = page.locator('[aria-label*="Step"]');
      const dotCount = await progressDots.count();
      expect(dotCount).toBe(7);
    });

    test("should announce tour state to screen readers", async ({ page }) => {
      await clearTourData(page);
      await page.reload();
      await page.waitForTimeout(5100);

      // Check for live region
      const liveRegion = page.locator('[aria-live="polite"]');
      await expect(liveRegion).toHaveText(/Step 1 of 7/);

      // Navigate to next step
      await page.click('button:has-text("Next")');

      // Live region should update
      await expect(liveRegion).toHaveText(/Step 2 of 7/);
    });
  });

  test.describe("Performance", () => {
    test("should load tour quickly", async ({ page }) => {
      const startTime = Date.now();

      await clearTourData(page);
      await page.reload();

      // Wait for tour to be visible
      await page.waitForSelector('text="Welcome to Harvest.ai!"', { timeout: 6000 });

      const loadTime = Date.now() - startTime;

      // Tour should load within 6 seconds (including delays)
      expect(loadTime).toBeLessThan(6000);
    });

    test("should animate smoothly", async ({ page }) => {
      await clearTourData(page);
      await page.reload();
      await page.waitForTimeout(5100);

      // Check for animation classes
      const tourCard = page.locator(".bg-white.rounded-xl.shadow-xl");
      const classes = await tourCard.getAttribute("class");

      // Should have transition classes
      expect(classes).toContain("transition");
    });
  });
});

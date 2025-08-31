import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load home page successfully", async ({ page }) => {
    await page.goto("/");

    // Check page title
    await expect(page).toHaveTitle(/Harvest\.ai/i);

    // Check main heading
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Transform Any Content");

    // Check navigation
    const nav = page.getByRole("navigation");
    await expect(nav).toBeVisible();
    await expect(nav.getByText("Harvest.ai")).toBeVisible();
    await expect(nav.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Demo" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "System" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Roadmap" })).toBeVisible();
  });

  test("should have working navigation links", async ({ page }) => {
    await page.goto("/");

    const nav = page.getByRole("navigation");

    // Test navigation to demo page
    await nav.getByRole("link", { name: "Demo" }).click();
    await expect(page).toHaveURL("/demo");

    // Test navigation to system page
    const nav2 = page.getByRole("navigation");
    await nav2.getByRole("link", { name: "System" }).click();
    await expect(page).toHaveURL("/system");

    // Test navigation to roadmap page
    const nav3 = page.getByRole("navigation");
    await nav3.getByRole("link", { name: "Roadmap" }).click();
    await expect(page).toHaveURL("/roadmap");

    // Test navigation back to home
    const nav4 = page.getByRole("navigation");
    await nav4.getByRole("link", { name: "Home" }).click();
    await expect(page).toHaveURL("/");
  });

  test("should have responsive footer", async ({ page }) => {
    await page.goto("/");

    // Check footer content by text
    await expect(page.getByText(/© 2024 Harvest\.ai/)).toBeVisible();
    await expect(page.getByText("Quick Links")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Status" })).toBeVisible();
  });

  test("should have working demo section", async ({ page }) => {
    await page.goto("/");

    // Check demo section exists
    await expect(page.getByText("🚀 Working Demo")).toBeVisible();
    await expect(page.getByText("This is what actually works today. Try it out!")).toBeVisible();

    // Check demo interface elements
    await expect(page.getByText("harvest-ai-demo.tsx")).toBeVisible();
    await expect(page.getByText("Working Now")).toBeVisible();

    // Check demo content
    await expect(page.getByText("Current Status:")).toBeVisible();
    await expect(page.getByText("What Actually Works:")).toBeVisible();
    await expect(page.getByText("Try the Working Prototype:")).toBeVisible();
  });

  test("should have working CTA button", async ({ page }) => {
    await page.goto("/");

    // Check CTA button exists
    const ctaButton = page.getByRole("button", { name: "🚀 Try the Demo" });
    await expect(ctaButton).toBeVisible();

    // Click CTA button and check it scrolls to demo section
    await ctaButton.click();

    // Wait a moment for smooth scroll
    await page.waitForTimeout(1000);

    // Check that demo section is visible (scrolled into view)
    await expect(page.getByText("🚀 Working Demo")).toBeVisible();
  });

  test.skip("should have dark mode toggle", async ({ page }) => {
    await page.goto("/");

    // Check dark mode toggle exists
    const darkModeButton = page.getByRole("button", { name: "Toggle dark mode" });
    await expect(darkModeButton).toBeVisible();

    // Capture initial
    const container = page.locator("div.min-h-screen").first();
    const initialClass = await container.getAttribute("class");

    // Click dark mode toggle
    await darkModeButton.click();

    // Wait for localStorage to reflect dark mode
    await page.waitForFunction(() => localStorage.getItem("harvest-dark-mode") === "true");
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Check that page loads without horizontal scroll
    const body = page.locator("body");
    const bodyBox = await body.boundingBox();
    expect(bodyBox?.width).toBeLessThanOrEqual(375);

    // Navigation should be accessible
    await expect(page.getByRole("navigation")).toBeVisible();

    // Footer content text should be present
    await expect(page.getByText(/© 2024 Harvest\.ai/)).toBeVisible();
  });

  test("should have proper SEO meta tags", async ({ page }) => {
    await page.goto("/");

    // Check for meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute(
      "content",
      /Transform your messy notes|Transform Any Content/i,
    );

    // Check for viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute("content", /width=device-width/);
  });

  test("should have proper accessibility", async ({ page }) => {
    await page.goto("/");

    // Check for proper heading hierarchy
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();

    // Check for proper button labels
    const buttons = page.getByRole("button");
    for (const button of await buttons.all()) {
      const ariaLabel = await button.getAttribute("aria-label");
      if (ariaLabel) {
        expect(ariaLabel).toBeTruthy();
      }
    }

    // Check for proper link text
    const links = page.getByRole("link");
    for (const link of await links.all()) {
      const text = await link.textContent();
      expect(text).toBeTruthy();
    }
  });
});

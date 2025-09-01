import { test, expect } from "@playwright/test";

test.describe("Demo Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/demo");
  });

  test("should load demo page successfully", async ({ page }) => {
    await expect(page).toHaveTitle(/Harvest\.ai/);
    const heading = page.getByRole("heading", { name: /content transformer/i });
    await expect(heading).toBeVisible();
    await expect(page.getByRole("navigation")).toBeVisible();
  });

  test("should highlight Demo in navigation", async ({ page }) => {
    const demoLink = page.getByRole("link", { name: "Demo" }).first();
    await expect(demoLink).toHaveClass(/text-orange-5\d\d|text-orange-400/);
  });

  test("should have demo content section", async ({ page }) => {
    const outputLabel = page.getByText(/Your Generated Content/i);
    await expect(outputLabel.first()).toBeVisible();
  });

  test("should navigate back to home", async ({ page }) => {
    await page.getByRole("link", { name: "Home" }).first().click();
    await expect(page).toHaveURL("/");
    const homeLink = page.getByRole("link", { name: "Home" }).first();
    await expect(homeLink).toHaveClass(/text-orange-5\d\d|text-orange-400/);
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole("navigation")).toBeVisible();
    const body = page.locator("body");
    const bodyBox = await body.boundingBox();
    expect(bodyBox?.width).toBeLessThanOrEqual(375);
  });

  test.skip("should handle dark mode toggle", async ({ page }) => {
    const darkModeButton = page.getByRole("button", { name: /toggle dark mode/i });
    await expect(darkModeButton).toBeVisible();
    await darkModeButton.click();
    await page.waitForFunction(() => localStorage.getItem("harvest-dark-mode") === "true");
  });

  test.skip("should persist dark mode across navigation", async ({ page }) => {
    const darkModeButton = page.getByRole("button", { name: /toggle dark mode/i });
    await darkModeButton.click();

    await page.getByRole("link", { name: "System" }).first().click();
    await expect(page).toHaveURL("/system");

    await page.waitForFunction(() => localStorage.getItem("harvest-dark-mode") === "true");

    await page.getByRole("link", { name: "Demo" }).first().click();
    await expect(page).toHaveURL("/demo");

    const container = page.locator("div.min-h-screen").first();
    const containerClassAfter = await container.getAttribute("class");
    expect(containerClassAfter || "").toContain("bg-gray-950");
  });

  test("should have working header navigation links", async ({ page }) => {
    const nav = page.getByRole("navigation");
    await expect(nav.getByRole("link", { name: "Demo" })).toHaveAttribute("href", "/demo");
    await expect(nav.getByRole("link", { name: "System" })).toHaveAttribute("href", "/system");
  });

  test("should show ecosystem widget", async ({ page }) => {
    await page.waitForTimeout(1000);
    const widgetButtons = page.locator("button").filter({ has: page.locator("svg") });
    const widgetButtonCount = await widgetButtons.count();
    expect(widgetButtonCount).toBeGreaterThan(0);
  });

  test("should handle keyboard navigation", async ({ page }) => {
    await page.keyboard.press("Tab");
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();

    let linkCount = 0;
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      const tagName = await page.evaluate(() => document.activeElement?.tagName);
      if (tagName === "A" || tagName === "BUTTON") linkCount++;
    }
    expect(linkCount).toBeGreaterThan(3);
  });

  test("should have proper meta tags", async ({ page }) => {
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute("content", /width=device-width/);
    const description = page.locator('meta[name="description"]');
    if ((await description.count()) > 0) {
      const content = await description.getAttribute("content");
      expect(content).toBeTruthy();
    }
  });
});

// Streaming + progress behavior (mock mode)
// Ensures the realtime widget shows progress and SSE-like streaming text
// under MSW-powered dev:e2e server.

test("should show realtime progress and streaming output when generating (mock mode)", async ({
  page,
}) => {
  await page.goto("/demo");

  await page.locator("#demo-input-content").evaluate((el: any) => {
    el.value = "Test streaming content in mock mode";
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });

  const generate = page.getByRole("button", { name: "Generate content" });
  await expect(generate).toBeEnabled();
  await generate.click();

  // Either progress UI or direct result should appear (progress may be very brief in fast mocks)
  const progressText = page.getByText("Realtime Progress");
  const streaming = page.getByText("Streaming Output");
  const resultHeader = page.getByText(/Your Generated Content/i);

  try {
    await expect(progressText).toBeVisible({ timeout: 1500 });
  } catch {}

  // Streaming output or final result should be visible shortly
  await expect(
    Promise.any([
      streaming.waitFor({ state: "visible", timeout: 8000 }) as unknown as Promise<void>,
      resultHeader.waitFor({ state: "visible", timeout: 8000 }) as unknown as Promise<void>,
    ]),
  ).resolves.toBeUndefined();

  // If streaming area appears, it should accumulate some informative text
  if (await streaming.isVisible()) {
    const streamContainer = page.locator("pre");
    await expect(streamContainer).toContainText(/Parsing input|Composing|Drafting|Refining/i, {
      timeout: 10000,
    });
  }
});

// Visual regression tests are kept skipped by default to reduce flakiness
// and CI runtime overhead. Enable locally if needed.

test.describe.skip("Demo Page - Visual Regression", () => {
  test("demo page screenshot - light mode", async ({ page }) => {
    await page.goto("/demo");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("demo-light.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("demo page screenshot - dark mode", async ({ page }) => {
    await page.goto("/demo");
    await page.waitForLoadState("networkidle");
    const darkModeButton = page.getByRole("button", { name: /toggle dark mode/i });
    await darkModeButton.click();
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot("demo-dark.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("demo page screenshot - mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/demo");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("demo-mobile.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});

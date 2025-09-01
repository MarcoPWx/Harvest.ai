import { test, expect } from "@playwright/test";

// E2E for the working Format page
// This aligns with the current mock-first implementation (no auth, no dashboard routes)

test.describe("Format Page", () => {
  test.setTimeout(40000);
  test.beforeEach(async ({ page }) => {
    await page.goto("/format");
  });

  test("should load and display headings and controls", async ({ page }) => {
    await expect(page).toHaveTitle(/Harvest\.ai/i);
    await expect(page.getByRole("heading", { name: /format your content/i })).toBeVisible();
    await expect(page.locator("select").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /format as/i })).toBeVisible();
  });

  test("should format content as email", async ({ page }) => {
    // Select email format
    await page.locator("select").first().selectOption("email");

    // Fill content
    await page.fill(
      "#format-content-input",
      "Team meeting update: Discussed Q4 roadmap and priorities.",
    );

    // Click format button
    const btnEmail = page.getByRole("button", { name: /format as/i });
    await expect(btnEmail).toBeEnabled({ timeout: 20000 });
    await btnEmail.click();

    // Expect formatted output to appear
    const output = page.locator('[data-testid="formatted-output"]').first();
    await expect(output).toBeVisible({ timeout: 20000 });
    await expect(output).toContainText(/Subject:/i);
    await expect(output).toContainText(/Dear/i);
  });

  test("should format content as blog", async ({ page }) => {
    await page.locator("select").first().selectOption("blog");
    await page.fill(
      "#format-content-input",
      "Harvest.ai transforms content into professional formats.",
    );
    const btnBlog = page.getByRole("button", { name: /format as/i });
    await expect(btnBlog).toBeEnabled({ timeout: 20000 });
    await btnBlog.click();

    const output = page.locator('[data-testid="formatted-output"]').first();
    await expect(output).toBeVisible({ timeout: 20000 });
    await expect(output).toContainText(/# /);
    await expect(output).toContainText(/Introduction/);
    await expect(output).toContainText(/Conclusion/);
  });

  test("should show cost and quality metrics after formatting", async ({ page }) => {
    await page.locator("select").first().selectOption("summary");
    await page.fill(
      "#format-content-input",
      "This is a long note to be summarized for an executive overview.",
    );
    const btnSummary1 = page.getByRole("button", { name: /format as/i });
    await expect(btnSummary1).toBeEnabled({ timeout: 20000 });
    await btnSummary1.click();

    await expect(page.getByText(/Cost:/)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Quality:/)).toBeVisible({ timeout: 15000 });
  });

  test("should copy formatted content", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.locator("select").first().selectOption("summary");
    await page.fill(
      "#format-content-input",
      "Please summarize this content into key points and takeaways.",
    );
    const btnSummary2 = page.getByRole("button", { name: /format as/i });
    await expect(btnSummary2).toBeEnabled({ timeout: 20000 });
    await btnSummary2.click();

    const copyButton = page.locator('[data-testid="copy-formatted"]').first();
    await expect(copyButton).toBeVisible({ timeout: 10000 });
    await copyButton.click();

    // Clipboard should contain some text
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text.length).toBeGreaterThan(0);
  });

  test("should show an error when trying to format empty content", async ({ page }) => {
    // Ensure content is empty in E2E mode (prefill may be on)
    await page.fill("#format-content-input", "");
    const button = page.getByRole("button", { name: /format as/i });
    await expect(button).toBeDisabled();
  });
});

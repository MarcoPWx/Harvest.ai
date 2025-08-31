import { test, expect } from "@playwright/test";

// Verifies that Swagger UI loads and renders the API documentation
// Uses the in-app Docs route at /docs/api which points to /api/openapi.json

test.describe.skip("Docs - Swagger UI", () => {
  test("loads Swagger UI at /docs/api", async ({ page }) => {
    await page.goto("/docs");
    await page.getByRole("link", { name: /API Documentation \(Swagger UI\)/i }).click();
    await expect(page).toHaveURL(/\/docs\/api$/);

    // The swagger-ui-react root renders a .swagger-ui container
    const root = page.locator(".swagger-ui");
    await expect(root).toBeVisible({ timeout: 30000 });

    // Basic sanity: the page should contain some common UI labels
    await expect(page.getByText(/Authorize|Schemas|Servers|Paths/i).first()).toBeVisible({
      timeout: 30000,
    });
  });
});

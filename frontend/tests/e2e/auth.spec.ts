import { test, expect } from "@playwright/test";

test.describe.skip("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should complete signup flow", async ({ page }) => {
    // Navigate to signup
    await page.click("text=Sign Up");
    await expect(page).toHaveURL(/.*\/signup/);

    // Fill signup form
    await page.fill('input[name="email"]', "test@harvest.ai");
    await page.fill('input[name="password"]', "SecurePass123!");
    await page.fill('input[name="confirmPassword"]', "SecurePass123!");
    await page.fill('input[name="name"]', "Test User");

    // Accept terms
    await page.check('input[name="terms"]');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard or verification page
    await expect(page).toHaveURL(/.*\/(dashboard|verify)/);

    // Check for success message
    await expect(page.locator("text=/success|verify|welcome/i")).toBeVisible({ timeout: 10000 });
  });

  test("should complete login flow", async ({ page }) => {
    // Navigate to login
    await page.click("text=Login");
    await expect(page).toHaveURL(/.*\/login/);

    // Fill login form
    await page.fill('input[name="email"]', "demo@harvest.ai");
    await page.fill('input[name="password"]', "DemoPass123!");

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });

    // Check user is logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test("should handle login errors", async ({ page }) => {
    await page.click("text=Login");

    // Try invalid credentials
    await page.fill('input[name="email"]', "invalid@harvest.ai");
    await page.fill('input[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator("text=/invalid|incorrect|error/i")).toBeVisible({ timeout: 5000 });

    // Should remain on login page
    await expect(page).toHaveURL(/.*\/login/);
  });

  test("should complete password reset flow", async ({ page }) => {
    await page.click("text=Login");
    await page.click("text=Forgot Password");

    await expect(page).toHaveURL(/.*\/forgot-password/);

    // Enter email
    await page.fill('input[name="email"]', "test@harvest.ai");
    await page.click('button[type="submit"]');

    // Should show success message
    await expect(page.locator("text=/sent|check|email/i")).toBeVisible({ timeout: 5000 });
  });

  test("should complete logout flow", async ({ page }) => {
    // First login
    await page.click("text=Login");
    await page.fill('input[name="email"]', "demo@harvest.ai");
    await page.fill('input[name="password"]', "DemoPass123!");
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });

    // Click user menu and logout
    await page.click('[data-testid="user-menu"]');
    await page.click("text=Logout");

    // Should redirect to home
    await expect(page).toHaveURL("/");

    // User menu should not be visible
    await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
  });

  test("should validate email format", async ({ page }) => {
    await page.click("text=Sign Up");

    // Enter invalid email
    await page.fill('input[name="email"]', "notanemail");
    await page.fill('input[name="password"]', "SecurePass123!");

    // Try to submit
    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.locator("text=/valid email|email format/i")).toBeVisible();
  });

  test("should validate password strength", async ({ page }) => {
    await page.click("text=Sign Up");

    await page.fill('input[name="email"]', "test@harvest.ai");

    // Test weak password
    await page.fill('input[name="password"]', "123");

    // Should show password requirements
    await expect(page.locator("text=/weak|minimum|characters/i")).toBeVisible();

    // Test strong password
    await page.fill('input[name="password"]', "SecurePass123!");

    // Should show strong indicator
    await expect(page.locator("text=/strong|good/i")).toBeVisible();
  });

  test("should handle OAuth login", async ({ page }) => {
    await page.click("text=Login");

    // Test Google OAuth
    const googleButton = page.locator('button:has-text("Google")');
    if (await googleButton.isVisible()) {
      await googleButton.click();
      // Would redirect to Google OAuth in real scenario
      // For now, just check the button works
      await expect(page).toHaveURL(/.*\/(auth|oauth|google)/);
    }

    // Test GitHub OAuth
    const githubButton = page.locator('button:has-text("GitHub")');
    if (await githubButton.isVisible()) {
      await githubButton.click();
      // Would redirect to GitHub OAuth in real scenario
      await expect(page).toHaveURL(/.*\/(auth|oauth|github)/);
    }
  });

  test("should persist session on refresh", async ({ page, context }) => {
    // Login
    await page.click("text=Login");
    await page.fill('input[name="email"]', "demo@harvest.ai");
    await page.fill('input[name="password"]', "DemoPass123!");
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });

    // Save cookies
    const cookies = await context.cookies();

    // Refresh page
    await page.reload();

    // Should still be logged in
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // Verify cookies persist
    const newCookies = await context.cookies();
    expect(newCookies.length).toBeGreaterThanOrEqual(cookies.length);
  });

  test("should redirect to intended page after login", async ({ page }) => {
    // Try to access protected page
    await page.goto("/dashboard/generate");

    // Should redirect to login with return URL
    await expect(page).toHaveURL(/.*\/login\?.*return/);

    // Login
    await page.fill('input[name="email"]', "demo@harvest.ai");
    await page.fill('input[name="password"]', "DemoPass123!");
    await page.click('button[type="submit"]');

    // Should redirect to originally requested page
    await expect(page).toHaveURL(/.*\/dashboard\/generate/, { timeout: 10000 });
  });
});

import { test, expect } from "@playwright/test";

// Threads streaming should create a thread and stream assistant reply

test.describe.skip("Threads Playground - streaming", () => {
  test("create → send & stream → transcript shows assistant", async ({ page }) => {
    await page.goto("/playground/threads");

    // Create a thread
    const createBtn = page.getByRole("button", { name: "Create thread" });
    await createBtn.click();
    await expect(createBtn).toBeDisabled({ timeout: 5000 });

    // Send message & stream
    await page.getByLabel("Message").fill("Refine this to be more concise and action-oriented.");
    await page.getByRole("button", { name: "Send & Stream" }).click();

    // Expect transcript to include an assistant message
    await expect(page.locator("text=Transcript")).toBeVisible();
    await expect(page.locator("text=assistant")).toBeVisible({ timeout: 10000 });
  });
});

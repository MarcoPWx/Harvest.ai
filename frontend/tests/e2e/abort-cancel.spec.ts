import { test, expect } from "@playwright/test";

// Verify cancel button aborts streaming and UI reflects end of streaming state

test.describe.skip("Generate Playground - abort/cancel", () => {
  test("cancel stops streaming and disables Cancel button", async ({ page }) => {
    await page.goto("/playground/generate");

    await page.getByLabel("Input").fill("Abort streaming test for Harvest.ai");

    // Start streaming
    await page.getByRole("button", { name: "Stream SSE" }).click();

    // Wait for Cancel to become enabled (streaming=true)
    const cancelBtn = page.getByRole("button", { name: "Cancel" });
    await expect(cancelBtn).toBeEnabled({ timeout: 10000 });

    // Cancel
    await cancelBtn.click();

    // After a brief moment, button should be disabled since streaming=false
    await expect(cancelBtn).toBeDisabled({ timeout: 5000 });
  });
});

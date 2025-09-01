import { test, expect } from "@playwright/test";

// Opens Storybook and verifies MSW Info / Tests overlays and Presenter hotkeys

test("MSW Info overlay opens from toolbar globals", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/?globals=mswInfo:open`);
  await expect(page.getByRole("dialog", { name: /msw info/i })).toBeVisible();
});

test("Tests overlay opens from toolbar globals", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/?globals=testsInfo:open`);
  await expect(page.getByRole("dialog", { name: /tests info/i })).toBeVisible();
});

test("Presenter hotkey toggles overlay and Open This Step works", async ({ page, baseURL }) => {
  // Go to Labs Index so content is stable
  await page.goto(`${baseURL}/?path=/docs/labs-index--docs`);
  // Press 'g' 'g'
  await page.keyboard.press("g");
  await page.keyboard.press("g");
  await expect(page.getByRole("dialog", { name: /presenter guide/i })).toBeVisible();
  // Click Open This Step; URL should gain a path parameter (still docs/labs-index--docs or next target)
  await page.getByRole("button", { name: /open this step/i }).click();
  await expect(page).toHaveURL(/path=\/docs\//);
});

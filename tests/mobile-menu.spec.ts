import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test.beforeEach(async ({ page }) => {
  await page.route("**/api/character-progress/**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ status: 404, body: "null" });
      return;
    }

    await route.fulfill({ status: 204 });
  });
});

test("mobile header does not render the old navigation drawer menu", async ({ page }) => {
  await page.goto("/enemy_within/karl_muller/characteristics");

  await expect(page.getByRole("button", { name: "Open navigation drawer" })).toHaveCount(0);
  await expect(page.locator('aside[role="dialog"]')).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Characteristics" })).toBeVisible();
});

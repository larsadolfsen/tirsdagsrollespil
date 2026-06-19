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

test("mobile navigation uses the standard sidebar with named icon badges", async ({ page }) => {
  await page.goto("/enemy_within/karl_muller/characteristics");

  await page.getByRole("button", { name: "Open navigation drawer" }).click();

  const sidebar = page.locator('aside[role="dialog"]').first();
  await expect(sidebar).toBeVisible();
  await expect
    .poll(async () => (await sidebar.boundingBox())?.x ?? -999)
    .toBeGreaterThanOrEqual(0);
  await expect(sidebar.getByRole("heading", { name: /Karl M.ller/ })).toBeVisible();

  for (const iconName of ["CHAR", "SKIL", "ACT", "INV", "MAG", "TAL", "JRN", "DICE"]) {
    await expect(sidebar.getByText(iconName, { exact: true })).toBeVisible();
  }

  await expect(sidebar.getByRole("button", { name: "Skills" })).toBeVisible();
  await expect(sidebar.getByRole("button", { name: "Dice" })).toBeVisible();

  const sidebarBox = await sidebar.boundingBox();
  const firstMenuButtonBox = await sidebar.getByRole("button", { name: "Characteristics" }).boundingBox();

  expect(sidebarBox).not.toBeNull();
  expect(firstMenuButtonBox).not.toBeNull();
  expect(firstMenuButtonBox!.x).toBeGreaterThanOrEqual(sidebarBox!.x);
  expect(firstMenuButtonBox!.x + firstMenuButtonBox!.width).toBeLessThanOrEqual(
    sidebarBox!.x + sidebarBox!.width + 1,
  );
});

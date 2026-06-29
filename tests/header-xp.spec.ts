import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/character-progress/**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ status: 404, body: "null" });
      return;
    }

    await route.fulfill({ status: 204 });
  });
});

test("header XP button awards gained XP from a dialog", async ({ page }) => {
  await page.goto("/enemy_within/thano_voss");

  const headerXp = page.getByText("XP 1050/1050");
  await expect(headerXp).toBeVisible();

  const upgradeButton = page.getByRole("button", { name: "Gain Experience" });
  await upgradeButton.click();

  await expect(page.getByRole("dialog", { name: "Gain XP" })).toBeVisible();
  await page.getByLabel("XP gained").fill("25");
  await page.getByRole("button", { name: "Add XP" }).click();

  await expect(page.getByText("XP 1075/1075")).toBeVisible();
});

test("character identity header shows XP instead of alias", async ({ page }) => {
  await page.goto("/enemy_within/gerhard_lehrmann");

  const header = page.locator("section").filter({ hasText: "Gerhard Lehrmann" }).first();
  await expect(header).toContainText("XP 1050/1050");
  await expect(page.locator("body")).not.toContainText("aka Gerlardo");
});

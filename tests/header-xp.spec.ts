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

  await expect(page.getByRole("button", { name: "Add gained XP" })).toContainText("XP 1050/1050");
  await page.getByRole("button", { name: "Add gained XP" }).click();

  await expect(page.getByRole("dialog", { name: "Gain XP" })).toBeVisible();
  await page.getByLabel("XP gained").fill("25");
  await page.getByRole("button", { name: "Add XP" }).click();

  await expect(page.getByRole("button", { name: "Add gained XP" })).toContainText("XP 1075/1075");
});

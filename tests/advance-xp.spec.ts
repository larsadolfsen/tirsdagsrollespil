import { expect, type Page, test } from "@playwright/test";

async function openAdvanceTab(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Open sheet" }).first().click();
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByRole("menuitem", { name: "Edit Character" }).click();
}

test("advance XP controls use table layout and keep removal buttons active", async ({ page }) => {
  await openAdvanceTab(page);
  await page.getByRole("button", { name: "Experience" }).click();

  await expect(page.getByText("Current Experience", { exact: true })).toBeVisible();
  await expect(page.getByText("Total Experience", { exact: true })).toBeVisible();
  await expect(page.getByText("Value", { exact: true })).toBeVisible();
  await expect(page.getByText("Adjust", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Experience", { exact: true }).first()).toBeVisible();

  await expect(page.getByRole("button", { name: "Add 10 current XP" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add 100 current XP" })).toBeVisible();

  const remove100 = page.getByRole("button", { name: "Remove 100 pending XP" });
  await expect(remove100).toBeEnabled();
  for (let index = 0; index < 50; index += 1) {
    await remove100.click();
  }
  await expect(remove100).toBeVisible();
  await expect(remove100).toBeEnabled();

  const remove10 = page.getByRole("button", { name: "Remove 10 pending XP" });
  await expect(remove10).toBeEnabled();
  for (let index = 0; index < 10; index += 1) {
    await remove10.click();
  }
  await expect(remove10).toBeVisible();
  await expect(remove10).toBeEnabled();

  await expect(page.getByRole("button", { name: "Add 10 current XP" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add 100 current XP" })).toBeVisible();
});

test("advance careers tab lists the full career catalog", async ({ page }) => {
  await openAdvanceTab(page);
  await page.getByRole("button", { name: "Careers" }).click();

  await expect(page.getByRole("button", { name: "Apothecary" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Warrior Priest" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Apothecary I" })).toHaveCount(0);
});

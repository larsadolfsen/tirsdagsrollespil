import { expect, test } from "@playwright/test";

test("advance XP controls use table layout and keep removal buttons active", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open Advance tab" }).click();

  await expect(page.getByText("XP", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Current", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Total", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Adjust", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Experience", { exact: true }).first()).toBeVisible();

  await expect(page.getByRole("button", { name: "Add 10 current and total XP" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add 100 current and total XP" })).toBeVisible();

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

  await expect(page.getByRole("button", { name: "Add 10 current and total XP" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add 100 current and total XP" })).toBeVisible();
});

test("advance careers tab lists the full career catalog", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open Advance tab" }).click();
  await page.getByRole("button", { name: "Careers" }).click();

  await expect(page.getByRole("button", { name: "Apothecary I" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Warrior Priest I" })).toBeVisible();
});

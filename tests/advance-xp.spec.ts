import { expect, test } from "@playwright/test";

test("advance XP controls use table layout and hide unavailable removals", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open Advance tab" }).click();

  await expect(page.getByText("XP", { exact: true })).toBeVisible();
  await expect(page.getByText("Current", { exact: true })).toBeVisible();
  await expect(page.getByText("Total", { exact: true })).toBeVisible();
  await expect(page.getByText("Adjust", { exact: true })).toBeVisible();
  await expect(page.getByText("Experience", { exact: true })).toBeVisible();

  await expect(page.getByRole("button", { name: "Add 10 current and total XP" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add 100 current and total XP" })).toBeVisible();

  const remove100 = page.getByRole("button", { name: "Remove 100 current and total XP" });
  for (let index = 0; index < 50 && (await remove100.count()) > 0; index += 1) {
    await remove100.click();
  }
  await expect(remove100).toHaveCount(0);

  const remove10 = page.getByRole("button", { name: "Remove 10 current and total XP" });
  for (let index = 0; index < 10 && (await remove10.count()) > 0; index += 1) {
    await remove10.click();
  }
  await expect(remove10).toHaveCount(0);

  await expect(page.getByRole("button", { name: "Add 10 current and total XP" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add 100 current and total XP" })).toBeVisible();
});

import { expect, test } from "@playwright/test";

test("dice roller starts close to the Dice Log header", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Roll for/ }).first().click();

  const sidebar = page.locator('aside[role="dialog"]').first();
  await expect(sidebar.getByRole("heading", { name: "Dice Log" })).toBeVisible();

  const titles = sidebar.locator(".wfrp-sidebar-title");
  await expect(titles.nth(1)).toBeVisible();

  const headerBox = await titles.first().boundingBox();
  const rollerTitleBox = await titles.nth(1).boundingBox();

  expect(headerBox).not.toBeNull();
  expect(rollerTitleBox).not.toBeNull();

  const gap = rollerTitleBox!.y - (headerBox!.y + headerBox!.height);
  expect(gap).toBeGreaterThanOrEqual(44);
  expect(gap).toBeLessThanOrEqual(52);
});

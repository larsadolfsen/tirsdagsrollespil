import { expect, test } from "@playwright/test";

test("dice roller starts close to the Dice Roller header", async ({ page }) => {
  await page.goto("/enemy_within/karl_muller/skills");

  await page.getByRole("button", { name: /Roll for/ }).first().click();

  const sidebar = page.locator('aside[role="dialog"]').first();
  await expect(sidebar.getByRole("heading", { name: "Dice Roller" })).toBeVisible();

  const header = sidebar.locator("header");
  const rollerTitle = sidebar.locator(".wfrp-sidebar-title").first();
  await expect(rollerTitle).toBeVisible();

  const headerBox = await header.boundingBox();
  const rollerTitleBox = await rollerTitle.boundingBox();

  expect(headerBox).not.toBeNull();
  expect(rollerTitleBox).not.toBeNull();

  const gap = rollerTitleBox!.y - (headerBox!.y + headerBox!.height);
  expect(gap).toBeGreaterThanOrEqual(28);
  expect(gap).toBeLessThanOrEqual(36);

  const rollButtonBox = await sidebar.getByRole("button", { name: "Roll" }).boundingBox();
  const sidebarBox = await sidebar.boundingBox();

  expect(rollButtonBox).not.toBeNull();
  expect(sidebarBox).not.toBeNull();
  expect(rollButtonBox!.width).toBeLessThan(sidebarBox!.width / 2);
});

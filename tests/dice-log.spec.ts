import { expect, test } from "@playwright/test";

test("dice roller sidebar shows its header and a Roll button sized within the panel", async ({ page }) => {
  await page.goto("/enemy_within/karl-muller/skills");

  await page.getByRole("button", { name: /Roll for/ }).first().click();

  const sidebar = page.locator('aside[role="dialog"]').first();
  await expect(sidebar.getByRole("heading", { name: "Dice Roller" })).toBeVisible();

  const rollButtonBox = await sidebar.getByRole("button", { name: "Roll", exact: true }).boundingBox();
  const sidebarBox = await sidebar.boundingBox();

  expect(rollButtonBox).not.toBeNull();
  expect(sidebarBox).not.toBeNull();
  expect(rollButtonBox!.width).toBeLessThan(sidebarBox!.width / 2);
});

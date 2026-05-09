import { expect, test } from "@playwright/test";

test("shop includes complete equipment and filterable weapon rarities", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Inventory" }).click();
  await page.getByRole("button", { name: "Add item" }).click();

  await expect(page.getByRole("heading", { name: "Shop" })).toBeVisible();

  const search = page.getByLabel("Search shop goods");
  await search.fill("Repeater Handgun");
  await expect(page.getByRole("button", { name: /Repeater Handgun/ })).toBeVisible();
  await expect(page.getByText("10gc")).toBeVisible();

  await search.fill("Military Flail");
  await expect(page.getByRole("button", { name: /Military Flail/ })).toBeVisible();

  await search.fill("");
  await page.getByRole("button", { name: "Filter shop goods by item type" }).click();
  await page.getByRole("button", { name: "Filter by type Ranged Weapon" }).click();
  await expect(page.getByRole("button", { name: /Repeater Pistol/ })).toBeVisible();

  await page.getByRole("button", { name: "Filter by rarity Average" }).click();
  await expect(page.getByRole("button", { name: /Throwing Axe/ })).toBeVisible();
});

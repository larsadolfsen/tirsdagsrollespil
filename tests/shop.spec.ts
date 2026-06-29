import { expect, test } from "@playwright/test";

test("shop includes complete equipment and filterable weapon rarities", async ({ page }) => {
  await page.goto("/enemy_within/thano_voss");

  await page.getByRole("button", { name: "Inventory" }).click();
  await page.getByRole("button", { name: "Add Inventory" }).click();

  await expect(page.getByRole("heading", { name: "Add Inventory" })).toBeVisible();

  const search = page.getByRole("searchbox", { name: "Search inventory" });
  await search.fill("Repeater Handgun");
  const repeaterHandgun = page.getByRole("button", { name: /Repeater Handgun/ });
  await repeaterHandgun.click();
  await expect(page.getByText("10gc")).toBeVisible();

  await search.fill("Military Flail");
  await expect(page.getByRole("button", { name: /Military Flail/ })).toBeVisible();

  await search.fill("");
  await page.getByRole("group", { name: "Inventory type filters" }).getByText("Ranged Weapons", { exact: true }).click();
  await expect(page.getByRole("button", { name: /Repeater Pistol/ })).toBeVisible();

  await page.getByRole("group", { name: "Inventory rarity filters" }).getByText("Average", { exact: true }).click();
  await expect(page.getByRole("button", { name: /Throwing Axe/ })).toBeVisible();
});

test("coins can be moved into a newly added pouch", async ({ page }) => {
  await page.route("**/api/character-progress/thano_voss", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ status: 404, body: "null" });
      return;
    }

    await route.fulfill({ status: 204 });
  });
  await page.goto("/enemy_within/thano_voss");

  await page.getByRole("button", { name: "Inventory" }).click();
  await page.getByRole("button", { name: "Add Inventory" }).click();

  const search = page.getByRole("searchbox", { name: "Search inventory" });
  await search.fill("Pouch");
  await page.getByRole("button", { name: /^Pouch/ }).click();
  await page.getByRole("button", { name: "Add", exact: true }).click();

  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Move coins" }).click();
  await page.getByRole("button", { name: "Pouch", exact: true }).click();

  await expect(page.getByText("1 / 1 enc").first()).toBeVisible();
});

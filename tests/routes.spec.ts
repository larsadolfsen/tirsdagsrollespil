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

test("landing character cards open the selected sheet", async ({ page }) => {
  await page.goto("/");

  const karlCard = page.locator(".wfrp-landing-character-card").filter({ hasText: "Karl Müller" });
  await karlCard.click();

  await expect(page).toHaveURL(/\/enemy_within\/karl-muller$/);
  await expect(page.getByText("Karl Müller").first()).toBeVisible();
});

test("readable character urls resolve to the matching canonical sheet", async ({ page }) => {
  await page.goto("/enemy_within/karl-muller/skills");

  await expect(page).toHaveURL(/\/enemy_within\/karl-muller\/skills$/);
  await expect(page.getByText("Karl Müller").first()).toBeVisible();
});

test("dice log has its own character page", async ({ page }) => {
  await page.goto("/enemy_within/gerhard-lehrmann/dice-log");

  await expect(page).toHaveURL(/\/enemy_within\/gerhard-lehrmann\/dice-log$/);
  await expect(page.getByRole("heading", { name: "Dice Log", level: 1 })).toBeVisible();
});

test("breadcrumbs reflect the current sheet section and navigate up the hierarchy", async ({ page }) => {
  await page.goto("/enemy_within/gerhard-lehrmann/skills");

  const breadcrumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumbs).toContainText("Enemy Within");
  await expect(breadcrumbs).toContainText("Gerhard Lehrmann");
  await expect(breadcrumbs.getByText("Skills", { exact: true })).toHaveAttribute("aria-current", "page");

  await breadcrumbs.getByRole("link", { name: "Gerhard Lehrmann" }).click();
  await expect(page).toHaveURL(/\/enemy_within\/gerhard-lehrmann\/characteristics$/);
  await expect(breadcrumbs.getByText("Characteristics", { exact: true })).toHaveAttribute("aria-current", "page");

  await breadcrumbs.getByRole("link", { name: "Enemy Within" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.locator(".wfrp-landing-character-card")).toHaveCount(4);
});

test("unknown character urls show the character picker instead of the default sheet", async ({ page }) => {
  await page.goto("/enemy_within/not_a_character/skills");

  await expect(page.locator(".wfrp-landing-character-card")).toHaveCount(4);
  await expect(page).toHaveTitle("Enemy Within WFRP 4E");
});

test("renaming a character updates the URL and updates the landing page/GM page name", async ({ page }) => {
  await page.goto("/enemy_within/thano-voss");

  // Rename character
  await page.getByRole("button", { name: "Edit character name" }).click();
  const nameInput = page.getByLabel("Edit character name");
  await nameInput.fill("Thano Voss The Cool");
  await nameInput.press("Enter");

  // The URL should update to /enemy_within/thano-voss-the-cool
  await expect(page).toHaveURL(/\/enemy_within\/thano-voss-the-cool$/);

  // Navigate back to Enemy Within (Landing Page) using breadcrumbs
  const breadcrumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  await breadcrumbs.getByRole("link", { name: "Enemy Within" }).click();

  // The character card should now say "Thano Voss The Cool"
  await expect(page.locator(".wfrp-landing-character-card").filter({ hasText: "Thano Voss The Cool" })).toBeVisible();

  // Go to Game Master page
  await page.getByRole("button", { name: "Game Master" }).click();

  // The player card on the GM page should also say "Thano Voss The Cool"
  await expect(page.locator(".wfrp-landing-character-card").filter({ hasText: "Thano Voss The Cool" })).toBeVisible();
});

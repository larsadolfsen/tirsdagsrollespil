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

  await expect(page).toHaveURL(/\/enemy_within\/karl_muller$/);
  await expect(page.getByText("Karl Müller").first()).toBeVisible();
});

test("readable character urls resolve to the matching canonical sheet", async ({ page }) => {
  await page.goto("/enemy_within/karl-muller/skills");

  await expect(page).toHaveURL(/\/enemy_within\/karl_muller\/skills$/);
  await expect(page.getByText("Karl Müller").first()).toBeVisible();
});

test("dice log has its own character page", async ({ page }) => {
  await page.goto("/enemy_within/gerhard_lehrmann/dice-log");

  await expect(page).toHaveURL(/\/enemy_within\/gerhard_lehrmann\/dice-log$/);
  await expect(page.getByRole("heading", { name: "Dice Log", level: 1 })).toBeVisible();
});

test("breadcrumbs reflect the current sheet section and navigate up the hierarchy", async ({ page }) => {
  await page.goto("/enemy_within/gerhard_lehrmann/skills");

  const breadcrumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumbs).toContainText("Enemy Within");
  await expect(breadcrumbs).toContainText("Gerhard Lehrmann");
  await expect(breadcrumbs.getByText("Skills", { exact: true })).toHaveAttribute("aria-current", "page");

  await breadcrumbs.getByRole("link", { name: "Gerhard Lehrmann" }).click();
  await expect(page).toHaveURL(/\/enemy_within\/gerhard_lehrmann\/characteristics$/);
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

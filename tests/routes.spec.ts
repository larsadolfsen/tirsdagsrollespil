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
  await karlCard.getByRole("button", { name: "Open sheet" }).click();

  await expect(page).toHaveURL(/\/enemy_within\/karl_muller$/);
  await expect(page.getByText("Karl Müller").first()).toBeVisible();
});

test("readable character urls resolve to the matching canonical sheet", async ({ page }) => {
  await page.goto("/enemy_within/karl-muller/skills");

  await expect(page).toHaveURL(/\/enemy_within\/karl_muller\/skills$/);
  await expect(page.getByText("Karl Müller").first()).toBeVisible();
});

test("unknown character urls show the character picker instead of the default sheet", async ({ page }) => {
  await page.goto("/enemy_within/not_a_character/skills");

  await expect(page.locator(".wfrp-landing-character-card")).toHaveCount(3);
  await expect(page).toHaveTitle("Enemy Within WFRP 4E");
});

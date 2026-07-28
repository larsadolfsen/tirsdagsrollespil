import { expect, test } from "@playwright/test";

// A skill's detail cross-links only to the character's own talents that reference it
// (not every catalog talent), and shows each talent's rule text — symmetric with
// Plan 11's talent -> related skills links.

test.beforeEach(async ({ page }) => {
  // Isolate from the shared character-progress backend so the characters load
  // with their pristine, source-defined skill lists.
  await page.route("**/api/character-progress/**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ status: 404, body: "null" });
      return;
    }
    await route.fulfill({ status: 204 });
  });
});

test("skill detail shows only the character's own affecting talents, with rule text, and navigates to the Talents section", async ({ page }) => {
  await page.goto("/enemy_within/karl-muller");
  await page.getByRole("button", { name: "Skills", exact: true }).click();

  // Karl has Pray (Sigmar) trained and owns the Bless talent, which references skill_pray.
  const prayRow = page.locator(".wfrp-data-accordion-row").filter({ hasText: "Pray" }).first();
  await prayRow.locator(".wfrp-data-accordion-summary").click();

  const talentLink = prayRow.getByRole("button", { name: "View Bless talent" });
  await expect(talentLink).toBeVisible();
  await expect(prayRow.getByText("Allows the character to learn and invoke Blessings appropriate to their cult.")).toBeVisible();

  await talentLink.click();
  await expect(page.locator(".wfrp-subpanel-header").filter({ hasText: "Talent" })).toBeVisible();
});

test("a skill affected only by talents the character doesn't have shows no affecting talents row", async ({ page }) => {
  await page.goto("/enemy_within/karl-muller");
  await page.getByRole("button", { name: "Skills", exact: true }).click();

  // Karl has Endurance trained, but doesn't own Resistance (Corruption) or Iron Jaw,
  // the only catalog talents that reference skill_endurance.
  const enduranceRow = page.locator(".wfrp-data-accordion-row").filter({ hasText: "Endurance" }).first();
  await enduranceRow.locator(".wfrp-data-accordion-summary").click();

  await expect(enduranceRow.getByText("Affecting Talents")).toHaveCount(0);
});

test("a skill with no affecting talents shows no affecting talents row", async ({ page }) => {
  await page.goto("/enemy_within/thano-voss");
  await page.getByRole("button", { name: "Skills", exact: true }).click();

  // No talent in the catalog references Psychometry.
  const psychometryRow = page.locator(".wfrp-data-accordion-row").filter({ hasText: "Psychometry" }).first();
  await psychometryRow.locator(".wfrp-data-accordion-summary").click();

  await expect(psychometryRow.getByText("Affecting Talents")).toHaveCount(0);
});

import { expect, test } from "@playwright/test";

// Plan 12: a skill's detail cross-links to every catalog talent that references it
// (catalog-wide, not filtered to the character's own talents), symmetric with
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

test("skill detail shows affecting talents and navigates to the Talents section", async ({ page }) => {
  await page.goto("/enemy_within/karl-muller");
  await page.getByRole("button", { name: "Skills", exact: true }).click();

  // Karl has Endurance trained; Resistance (Corruption) references skill_endurance
  // in the catalog even though Karl himself doesn't have that talent.
  const enduranceRow = page.locator(".wfrp-data-accordion-row").filter({ hasText: "Endurance" }).first();
  await enduranceRow.locator(".wfrp-data-accordion-summary").click();

  const talentLink = enduranceRow.getByRole("button", { name: "View Resistance (Corruption) talent" });
  await expect(talentLink).toBeVisible();

  await talentLink.click();
  await expect(page.locator(".wfrp-subpanel-header").filter({ hasText: "Talent" })).toBeVisible();
});

test("a skill with no affecting talents shows no affecting talents row", async ({ page }) => {
  await page.goto("/enemy_within/thano-voss");
  await page.getByRole("button", { name: "Skills", exact: true }).click();

  // No talent in the catalog references Psychometry.
  const psychometryRow = page.locator(".wfrp-data-accordion-row").filter({ hasText: "Psychometry" }).first();
  await psychometryRow.locator(".wfrp-data-accordion-summary").click();

  await expect(psychometryRow.getByText("Affecting Talents")).toHaveCount(0);
});

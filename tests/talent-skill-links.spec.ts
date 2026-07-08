import { expect, test } from "@playwright/test";
import { getTalentSkillLinks } from "../src/tabs/talents/talentUtils";

// Plan 11: talent detail cross-links to the skills it touches (relatedSkillIds
// + effect-level skillIds), deduping base vs. specialisation refs.

test("getTalentSkillLinks resolves relatedSkillIds and effect skillIds, deduping base vs specialisation", () => {
  const relatedOnly = getTalentSkillLinks({ relatedSkillIds: ["skill_endurance"] });
  expect(relatedOnly).toEqual([{ id: "skill_endurance", displayName: "Endurance" }]);

  const effectOnly = getTalentSkillLinks({
    effects: [{ type: "test_sl_bonus", test: "Charm Tests", valuePerLevel: 1, skillIds: ["skill_charm"] }],
  });
  expect(effectOnly).toEqual([{ id: "skill_charm", displayName: "Charm" }]);

  // A specialisation ref should suppress a redundant base-skill ref for the same skill.
  const deduped = getTalentSkillLinks({
    relatedSkillIds: ["skill_stealth"],
    effects: [{ type: "test_reverse_failed_roll", test: "Stealth (Urban)", skillIds: ["skill_stealth_urban"] }],
  });
  expect(deduped).toEqual([{ id: "skill_stealth", displayName: "Stealth (Urban)" }]);

  // No refs at all → no links.
  expect(getTalentSkillLinks({})).toEqual([]);
});

test.beforeEach(async ({ page }) => {
  // Isolate from the shared character-progress backend so Thano Voss loads
  // with his pristine, source-defined talent list.
  await page.route("**/api/character-progress/**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ status: 404, body: "null" });
      return;
    }
    await route.fulfill({ status: 204 });
  });
});

test("talent detail shows related skill links and navigates to the Skills tab", async ({ page }) => {
  await page.goto("/enemy_within/karl-muller");
  await page.getByRole("button", { name: "Talents", exact: true }).click();

  // Bless carries a relatedSkillIds ref to Pray.
  const blessRow = page.locator(".wfrp-data-accordion-row").filter({ hasText: "Bless" });
  await blessRow.locator(".wfrp-data-accordion-summary").click();

  const skillLink = blessRow.getByRole("button", { name: "View Pray skill" });
  await expect(skillLink).toBeVisible();

  await skillLink.click();
  await expect(page.locator(".wfrp-subpanel-header").filter({ hasText: "Skill" })).toBeVisible();
});

test("a talent with no skill refs shows no related skills row", async ({ page }) => {
  await page.goto("/enemy_within/karl-muller");
  await page.getByRole("button", { name: "Talents", exact: true }).click();

  const doomedRow = page.locator(".wfrp-data-accordion-row").filter({ hasText: "Doomed" });
  await doomedRow.locator(".wfrp-data-accordion-summary").click();

  await expect(doomedRow.getByText("Related Skills")).toHaveCount(0);
});

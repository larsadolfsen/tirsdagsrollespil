import { expect, test } from "@playwright/test";

test("skills rows expand with accessible detail controls", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Skills" }).click();

  const firstSkillRow = page.locator(".wfrp-data-accordion-row").first();
  const firstSkillSummary = firstSkillRow.locator(".wfrp-data-accordion-summary");
  const rollHeader = page.locator(".wfrp-subpanel-header .wfrp-table-label").filter({ hasText: "Roll" });
  const firstSkillRollButton = firstSkillSummary.getByRole("button", { name: /Roll for/ });
  const rollHeaderBox = await rollHeader.boundingBox();
  const firstSkillRollButtonBox = await firstSkillRollButton.boundingBox();

  expect(rollHeaderBox).not.toBeNull();
  expect(firstSkillRollButtonBox).not.toBeNull();

  const headerCenter = rollHeaderBox!.x + rollHeaderBox!.width / 2;
  const buttonCenter = firstSkillRollButtonBox!.x + firstSkillRollButtonBox!.width / 2;
  expect(Math.abs(headerCenter - buttonCenter)).toBeLessThanOrEqual(2);

  const disclosureTarget = firstSkillSummary.locator('span[aria-hidden="true"]').first();
  const disclosureBox = await disclosureTarget.boundingBox();

  expect(disclosureBox?.width).toBeGreaterThanOrEqual(48);
  expect(disclosureBox?.height).toBeGreaterThanOrEqual(48);

  await disclosureTarget.click();

  const firstSkillDetails = firstSkillRow.locator(".wfrp-data-accordion-summary + div");
  await expect(firstSkillDetails).not.toContainText("Description");
  await expect(firstSkillDetails).toContainText(/The ability to|Used to|Your ability to/);
  await expect(firstSkillDetails).toContainText("Characteristic");
  await expect(firstSkillDetails).toContainText("Score");
  await expect(firstSkillDetails).toContainText("Advances");
  await expect(firstSkillDetails).toContainText("Total");
});

import { expect, test } from "@playwright/test";

test("skills rows expand with accessible detail controls", async ({ page }) => {
  await page.goto("/enemy_within/thano_voss");
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
  await expect(firstSkillDetails).not.toContainText("Short");
  await expect(firstSkillSummary).toContainText(/Care for|Train and|Create|Run|Judge|Control|Influence|Befriend|Ascend|Resist|Evade|Withstand|Perform|Determine|Calculate|Gather|Negotiate|Diagnose|Coerce|Read|Speak|Command|Recall|Attack|Orient|Forage|Notice|Bypass|Invoke|Extract|Ride|Move|Operate|Deploy|Follow|Manufacture/);
  await expect(firstSkillDetails).toContainText("Characteristic");
  await expect(firstSkillDetails).toContainText("Score");
  await expect(firstSkillDetails).toContainText("Advances");
  await expect(firstSkillDetails).not.toContainText("Total");
});

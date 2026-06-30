import { expect, type Page, test } from "@playwright/test";
import { talentDefinitions } from "../src/data/rules/wfrp4e/talents";

// Isolate every test from the shared, persistent character-progress backend.
// GET → 404/null makes the app fall back to pristine source-defined characters
// (e.g. Thano Voss at 550 Current XP); PUT/DELETE → 204 lets saves "succeed"
// in-session without writing through, so tests never contend on shared state.
test.beforeEach(async ({ page }) => {
  await page.route("**/api/character-progress/**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ status: 404, body: "null" });
      return;
    }
    await route.fulfill({ status: 204 });
  });
});

async function openAdvanceTab(page: Page) {
  await page.goto("/");
  await page.locator(".wfrp-landing-character-card").filter({ hasNotText: "Game Master" }).first().click();
  await page.getByRole("button", { name: "Edit Character", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Edit Character" })).toBeVisible();
}

async function swipeMobileEditCharacterPage(page: Page, direction: "left" | "right") {
  const startX = direction === "left" ? 340 : 40;
  const endX = direction === "left" ? 40 : 340;
  const mobileTitle = page.getByRole("heading", { name: "Edit Character" });

  await mobileTitle.evaluate((element, swipe) => {
    const createTouch = (clientX: number, clientY: number) =>
      new Touch({ identifier: 1, target: element, clientX, clientY });

    const startTouch = createTouch(swipe.startX, 280);
    element.dispatchEvent(new TouchEvent("touchstart", {
      bubbles: true,
      cancelable: true,
      changedTouches: [startTouch],
      targetTouches: [startTouch],
      touches: [startTouch],
    }));

    element.dispatchEvent(new TouchEvent("touchend", {
      bubbles: true,
      cancelable: true,
      changedTouches: [createTouch(swipe.endX, 284)],
      targetTouches: [],
      touches: [],
    }));
  }, {
    endX,
    startX,
  });
}

async function getAdvanceTalentNames(page: Page) {
  return page.locator(".wfrp-data-accordion-row button.wfrp-skill-link span").evaluateAll((items) =>
    items
      .map((item) => item.textContent?.trim() ?? "")
      .filter(Boolean),
  );
}

test("advance XP controls use table layout and keep removal buttons active", async ({ page }) => {
  await openAdvanceTab(page);
  await page.getByRole("button", { name: "Experience", exact: true }).click();
  await expect(page.locator(".wfrp-subpanel-header").filter({ hasText: "Experience" })).toBeVisible();

  await expect(page.getByText("Current Experience", { exact: true })).toBeVisible();
  await expect(page.getByText("Total Experience", { exact: true })).toBeVisible();
  await expect(page.getByText("Value", { exact: true })).toBeVisible();
  await expect(page.getByText("Adjust", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Experience", { exact: true }).first()).toBeVisible();

  await expect(page.getByRole("button", { name: "Add 10 current XP" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add 100 current XP" })).toBeVisible();

  const remove100 = page.getByRole("button", { name: "Remove 100 pending XP" });
  await expect(remove100).toBeEnabled();
  for (let index = 0; index < 50; index += 1) {
    await remove100.click();
  }
  await expect(remove100).toBeVisible();
  await expect(remove100).toBeEnabled();

  const remove10 = page.getByRole("button", { name: "Remove 10 pending XP" });
  await expect(remove10).toBeEnabled();
  for (let index = 0; index < 10; index += 1) {
    await remove10.click();
  }
  await expect(remove10).toBeVisible();
  await expect(remove10).toBeEnabled();

  await expect(page.getByRole("button", { name: "Add 10 current XP" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add 100 current XP" })).toBeVisible();
});

test("advance careers tab lists the full career catalog", async ({ page }) => {
  await openAdvanceTab(page);
  await page.getByRole("button", { name: "Careers", exact: true }).click();

  await expect(page.getByRole("tab", { name: "All" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Taken" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Apothecary" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Warrior Priest" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Apothecary I" })).toHaveCount(0);

  await page.getByRole("tab", { name: "Taken" }).click();
  await expect(page.getByRole("button", { name: "Wizard", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Apothecary" })).toHaveCount(0);
});

test("mobile swipe changes edit character tabs", async ({ page, browserName }) => {
  // WebKit does not expose the synthetic Touch/TouchEvent constructors this
  // gesture simulation relies on; the swipe handler itself is browser-agnostic
  // and stays covered on chromium + firefox.
  test.skip(browserName === "webkit", "WebKit lacks the Touch/TouchEvent constructors");
  await openAdvanceTab(page);
  await page.setViewportSize({ width: 390, height: 844 });

  await swipeMobileEditCharacterPage(page, "left");

  await expect(page.getByRole("button", { name: "Apothecary" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Careers", exact: true })).toHaveAttribute("aria-current", "page");
});

test("advance skills filters render one alphabetical list", async ({ page }) => {
  await openAdvanceTab(page);
  await page.getByRole("button", { name: "Skills", exact: true }).click();

  async function expectSingleAlphabeticalSkillList(title: string) {
    await expect(page.locator(".wfrp-subpanel-header")).toHaveCount(1);
    await expect(page.locator(".wfrp-subpanel-header").filter({ hasText: title })).toHaveCount(1);

    const skillNames = await page.locator(".wfrp-data-accordion-row button.wfrp-skill-link span").evaluateAll((items) =>
      items
        .map((item) => item.textContent?.replace(/\s+\([^)]*\)\s*$/, "").trim() ?? "")
        .filter(Boolean),
    );

    expect(skillNames.length).toBeGreaterThan(0);
    expect(skillNames).toEqual([...skillNames].sort((first, second) => first.localeCompare(second)));
  }

  await expectSingleAlphabeticalSkillList("All");
  await expect(page.getByRole("tab", { name: "Untrained" })).toHaveCount(0);
  await page.getByRole("tab", { name: "Career" }).click();
  await expectSingleAlphabeticalSkillList("Career");
  await expect(page.getByRole("button", { name: "Dodge (Ag)" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Charm (Fel)" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Animal Care (Int)" })).toHaveCount(0);
  await page.getByRole("tab", { name: "Basic" }).click();
  await expectSingleAlphabeticalSkillList("Basic");
  await page.getByRole("tab", { name: "Advanced" }).click();
  await expectSingleAlphabeticalSkillList("Advanced");
  await expect(page.getByRole("button", { name: "Animal Care (Int)" })).toBeVisible();
  await page.getByRole("tab", { name: "Trained" }).click();
  await expectSingleAlphabeticalSkillList("Trained");
});

test("advance talents all filter lists every system talent", async ({ page }) => {
  await openAdvanceTab(page);
  await page.getByRole("button", { name: "Talents", exact: true }).click();
  await expect(page.locator(".wfrp-subpanel-header").filter({ hasText: "Talents" })).toBeVisible();

  const talentNames = await getAdvanceTalentNames(page);

  expect(talentNames).toHaveLength(talentDefinitions.length);
  expect(talentNames).toEqual([...talentNames].sort((first, second) => first.localeCompare(second)));
});

test("advance talents submenu filters bought talents", async ({ page }) => {
  await openAdvanceTab(page);
  await page.getByRole("button", { name: "Talents", exact: true }).click();

  await expect(page.getByRole("tab", { name: "All" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Bought" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Current" })).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "Former" })).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "Career" })).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "Taken" })).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "Other" })).toHaveCount(0);

  await page.getByRole("tab", { name: "Bought" }).click();
  const boughtTalentNames = await getAdvanceTalentNames(page);
  expect(boughtTalentNames).toEqual([
    "Aethyric Attunement",
    "Doomed",
    "Instinctive Diction",
    "Perfect Pitch",
    "Petty Magic",
    "Read/Write",
    "Resistance (Corruption)",
    "Second Sight",
    "Suave",
  ]);
});

test("purchasing a talent spends its XP cost and keeps it spent after save", async ({ page }) => {
  await openAdvanceTab(page);

  // Starting current XP from the Experience subtab.
  await page.getByRole("button", { name: "Experience", exact: true }).click();
  const currentXpField = page.getByRole("spinbutton", { name: "Current XP" });
  const startXp = Number(await currentXpField.inputValue());
  expect(startXp).toBeGreaterThan(0);

  // Buy a talent the character does not yet have. Talent cost is (timesTaken + 1) * 100.
  await page.getByRole("button", { name: "Talents", exact: true }).click();
  const talentName = "Strike Mighty Blow";
  const takenBefore = Number(
    await page.getByRole("spinbutton", { name: `Taken count for ${talentName}` }).inputValue(),
  );
  const expectedCost = (takenBefore + 1) * 100;
  await page.getByRole("button", { name: `Purchase talent ${talentName}` }).click();

  // The purchase is pending: available current XP drops by the talent's cost.
  await page.getByRole("button", { name: "Experience", exact: true }).click();
  await expect(currentXpField).toHaveValue(String(startXp - expectedCost));

  // Saving commits the spend; the reduced XP must persist (pending is cleared on save,
  // so an un-deducted bug would revert the field back to startXp here).
  await page.getByRole("button", { name: "Save edit character changes" }).first().click();
  await page.getByRole("button", { name: "Talents", exact: true }).click();
  await page.getByRole("button", { name: "Experience", exact: true }).click();
  await expect(currentXpField).toHaveValue(String(startXp - expectedCost));
});

test("cancel edit character discards pending XP changes", async ({ page }) => {
  await openAdvanceTab(page);
  await page.getByRole("button", { name: "Experience", exact: true }).click();

  const currentXpField = page.getByRole("spinbutton", { name: "Current XP" });
  const startXp = Number(await currentXpField.inputValue());
  expect(startXp).toBeGreaterThan(0);

  // Queue a pending current-XP change; the field moves off its starting value.
  await page.getByRole("button", { name: "Add 10 current XP" }).click();
  await expect(currentXpField).not.toHaveValue(String(startXp));

  // Cancel discards pending changes in place and keeps the editor open by
  // design (it does not navigate away), so the reverted value is visible here.
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("heading", { name: "Edit Character" })).toBeVisible();
  await expect(currentXpField).toHaveValue(String(startXp));
});

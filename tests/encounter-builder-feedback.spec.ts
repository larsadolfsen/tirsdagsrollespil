import { expect, test } from "@playwright/test";

test("encounter builder keeps sidebar open, shows add feedback, and disables unique NPCs", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open Game Master" }).click();
  await page.getByRole("button", { name: "Open", exact: true }).first().click();

  // Expand Scene 7 (index 6) to make components visible
  const sceneToggles = page.getByRole("button", { name: "Expand scene" });
  await expect(sceneToggles).toHaveCount(14);
  await sceneToggles.nth(6).click();

  // Open Add Adversary Sidebar
  await page.getByRole("button", { name: "Add adversary", exact: true }).click();
  
  // Verify Sidebar is Open
  const sidebar = page.locator("aside");
  const sidebarTitle = sidebar.locator("#adversary-sidebar-title");
  await expect(sidebarTitle).toHaveText("Add Adversary");

  // 1. Add Creature: Clanrat (defaultCount is 1)
  const clanratRow = sidebar.getByRole("button", { name: "Clanrat Creature - Skaven", exact: true });
  await clanratRow.click();
  const clanratAddButton = sidebar.getByRole("button", { name: "Add", exact: true });
  await clanratAddButton.click();

  // Verify sidebar is still open and feedback text "1 Clanrat added" is shown
  await expect(sidebarTitle).toHaveText("Add Adversary");
  await expect(sidebar.getByText("1 Clanrat added")).toBeVisible();

  // 2. Add Creature: Stormvermin (defaultCount is 4)
  const stormverminRow = sidebar.getByRole("button", { name: "Stormvermin Creature - Skaven", exact: true });
  await stormverminRow.click();
  const stormverminAddButton = sidebar.getByRole("button", { name: "Add ×4", exact: true });
  await stormverminAddButton.click();

  // Verify sidebar is still open and feedback text "4 Stormvermins added" is shown
  await expect(sidebarTitle).toHaveText("Add Adversary");
  await expect(sidebar.getByText("4 Stormvermins added")).toBeVisible();

  // 3. Add Generic: Hired Thug (requires instance name)
  const hiredThugRow = sidebar.getByRole("button", { name: "Hired Thug Generic - Human", exact: true });
  await hiredThugRow.click();
  // Click Add to trigger the naming dialog
  await sidebar.getByRole("button", { name: "Add", exact: true }).click();

  const nameDialog = page.getByRole("dialog", { name: "Name this character" });
  await expect(nameDialog).toBeVisible();
  const addCharacterButton = nameDialog.getByRole("button", { name: "Add character" });
  
  const instanceName = "Thug Bob";
  await nameDialog.getByRole("textbox", { name: "Name" }).fill(instanceName);
  await addCharacterButton.click();

  // Verify sidebar is still open and feedback text "1 Thug Bob added" is shown
  await expect(sidebarTitle).toHaveText("Add Adversary");
  await expect(sidebar.getByText("1 Thug Bob added")).toBeVisible();

  // 4. Add unique NPC: Bruno Franke
  const brunoRow = sidebar.getByRole("button", { name: "Bruno Franke NPC - Human", exact: true });
  await brunoRow.click();
  const brunoAddButton = sidebar.getByRole("button", { name: "Add", exact: true });
  await expect(brunoAddButton).toBeEnabled();
  await brunoAddButton.click();

  // Verify sidebar is still open and the button for Bruno Franke is now disabled with label "Added"
  await expect(sidebarTitle).toHaveText("Add Adversary");
  const disabledBrunoButton = sidebar.getByRole("button", { name: "Added", exact: true });
  await expect(disabledBrunoButton).toBeVisible();
  await expect(disabledBrunoButton).toBeDisabled();

  // 5. Close and reopen sidebar, verify NPC remains disabled
  await sidebar.getByRole("button", { name: "Close adversary sidebar" }).click();
  await expect(sidebarTitle).not.toBeVisible();

  await page.getByRole("button", { name: "Add adversary", exact: true }).click();
  await expect(sidebarTitle).toBeVisible();

  // Expand Bruno Franke again
  await brunoRow.click();
  await expect(sidebar.getByRole("button", { name: "Added", exact: true })).toBeDisabled();
});

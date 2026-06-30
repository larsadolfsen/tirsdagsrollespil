import { expect, test } from "@playwright/test";

test("adding a Generic adversary requires and keeps an instance name", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open Game Master" }).click();
  await page.getByRole("button", { name: "Open", exact: true }).first().click();

  const sceneToggles = page.getByRole("button", { name: "Expand scene" });
  await expect(sceneToggles).toHaveCount(14);
  await sceneToggles.nth(6).click();

  await page.getByRole("button", { name: "Add adversary", exact: true }).click();
  await page.getByRole("button", { name: "Hired Thug Generic - Human", exact: true }).click();
  await page.getByRole("button", { name: "Add", exact: true }).click();

  const nameDialog = page.getByRole("dialog", { name: "Name this character" });
  await expect(nameDialog).toBeVisible();
  const addCharacterButton = nameDialog.getByRole("button", { name: "Add character" });
  await expect(addCharacterButton).toBeDisabled();

  const instanceName = `Kurt ${Date.now()}`;
  await nameDialog.getByRole("textbox", { name: "Name" }).fill(instanceName);
  await expect(addCharacterButton).toBeEnabled();
  await addCharacterButton.click();

  await expect(page).toHaveURL(/session-/);
  await expect(page.getByText(instanceName, { exact: true })).toBeVisible();
});

test("adding an NPC adversary keeps the selected template", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open Game Master" }).click();
  await page.getByRole("button", { name: "Open", exact: true }).first().click();
  await page.getByRole("button", { name: "Expand scene" }).nth(6).click();
  await page.getByRole("button", { name: "Add adversary", exact: true }).click();
  await page.getByRole("button", { name: "Bruno Franke NPC - Human", exact: true }).click();
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByText("Bruno Franke", { exact: true })).toBeVisible();
});

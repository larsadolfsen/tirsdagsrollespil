import { expect, test } from "@playwright/test";

test("GM pages use the top content heading as the only h1", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open Game Master" }).click();

  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Campaign Sessions");

  await page.getByRole("button", { name: "Open", exact: true }).first().click();

  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/.+/);
  await expect(page.getByRole("heading", { name: "Enemy Within" })).toHaveCount(0);

  const campaignHeader = page.getByRole("region", { name: "Campaign header" });
  const campaignIdentity = campaignHeader.getByRole("group", { name: "Campaign identity" });
  await expect(campaignIdentity.locator("span").nth(0)).toHaveText("Enemy Within");
  await expect(campaignIdentity.locator("span").nth(1)).toHaveText("Campaign View");
});

test("Game Master page scene components workflow", async ({ page }) => {
  // 1. Visit landing page and navigate to GM page
  await page.goto("/");
  await page.getByRole("button", { name: "Open Game Master" }).click();
  await expect(page).toHaveTitle(/Campaign -/);
  await page.getByRole("button", { name: "Open", exact: true }).first().click();

  // Expand Scene 1 to make components visible
  await page.getByRole("button", { name: "Expand scene" }).first().click();

  // 2. Add a new Text Field component to the scene
  await page.getByRole("button", { name: "Scene 1 menu" }).click();
  await page.getByRole("menuitem", { name: "Add description" }).click();

  // 3. Verify placeholder is shown (since text fields default to saved and closed mode)
  const placeholderText = page.getByText("Write the scene description here…").last();
  await expect(placeholderText).toBeVisible();

  // Click the placeholder to enter edit mode
  await placeholderText.click();

  // Verify editor is shown
  const editor = page.getByRole("textbox", { name: /description/i });
  await expect(editor).toBeVisible();

  // 4. Fill text in the contentEditable editor and click Save
  await editor.fill("This is my custom scene text.");
  await page.getByRole("button", { name: "Save" }).click();

  // 5. Verify custom text is displayed
  const savedText = page.getByText("This is my custom scene text.").last();
  await expect(savedText).toBeVisible();

  // 6. Click the saved text to open the editor again
  await savedText.click();
  await expect(editor).toBeVisible();

  // 7. Clear the text and click Save to test placeholder in read mode
  await editor.fill("");
  await page.getByRole("button", { name: "Save" }).click();

  // 8. Verify placeholder is shown in read mode when empty
  await expect(placeholderText).toBeVisible();

  // 9. Rename the component title from "Text field" to a unique "Introduction Text [timestamp]"
  const uniqueTitle = `Introduction Text ${Date.now()}`;
  const titleSpan = page.getByTitle("Click to rename").filter({ hasText: "Description" }).last();
  await expect(titleSpan).toBeVisible();
  await expect(titleSpan).toHaveText("Description");
  await titleSpan.click();

  const titleInput = page.locator("input[type='text']");
  await expect(titleInput).toBeVisible();
  await titleInput.fill(uniqueTitle);
  await titleInput.press("Enter");

  // 10. Verify the title has updated
  await expect(page.getByText(uniqueTitle, { exact: true })).toBeVisible();

  // 11. Open the dropdown menu and delete the component
  await page.getByRole("button", { name: `${uniqueTitle} actions` }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();

  // 12. Verify the component is deleted
  await expect(page.getByRole("button", { name: `${uniqueTitle} actions` })).not.toBeVisible();
});

test("Dropdown menus close other open menus when opened", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open Game Master" }).click();
  await page.getByRole("button", { name: "Open", exact: true }).first().click();

  // Expand Scene 1 to make components visible
  await page.getByRole("button", { name: "Expand scene" }).first().click();

  // 1. Add a component so we have both the scene menu and the component menu
  await page.getByRole("button", { name: "Scene 1 menu" }).click();
  await page.getByRole("menuitem", { name: "Add description" }).click();

  // 2. Click the Scene 1 menu trigger
  const sceneMenuTrigger = page.getByRole("button", { name: "Scene 1 menu" });
  await sceneMenuTrigger.click();

  // Verify Scene 1 menu content is visible
  const sceneMenuItem = page.getByRole("menuitem", { name: "Add scene before" });
  await expect(sceneMenuItem).toBeVisible();

  // 3. Click the Component actions menu trigger
  const componentMenuTrigger = page.getByRole("button", { name: "Description actions" }).first();
  await componentMenuTrigger.click();

  // Verify Scene 1 menu content is now hidden
  await expect(sceneMenuItem).not.toBeVisible();

  // Verify Component menu content is visible
  const componentMenuItem = page.getByRole("menuitem", { name: "Delete" });
  await expect(componentMenuItem).toBeVisible();

  // 4. Click outside (e.g., somewhere in the heading or main area)
  await page.getByRole("heading", { name: "Scenes" }).click();

  // Verify Component menu content is now hidden
  await expect(componentMenuItem).not.toBeVisible();
});

test("Game Master page automatically opens a scene when a block is added", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open Game Master" }).click();
  await page.getByRole("button", { name: "Open", exact: true }).first().click();

  await page.getByRole("heading", { name: "Scenes" }).scrollIntoViewIfNeeded();

  // Add a new scene (which will start collapsed by default)
  await page.getByRole("button", { name: "Scene 1 menu" }).last().click();
  await page.getByRole("menuitem", { name: "Add scene after" }).click();

  // Find the new scene (which is now the last scene card)
  const sceneHeader = page.locator("section.group\\/scene").last();
  await expect(sceneHeader.getByText(/Scene \d+/)).toBeVisible();

  // Verify the expand button is visible and shows it's collapsed (aria-expanded is not true/false but button name is Expand scene)
  const expandButton = sceneHeader.getByRole("button", { name: "Expand scene" });
  await expect(expandButton).toBeVisible();

  // Add a description block to this new scene
  await sceneHeader.getByRole("button", { name: /Scene \d+ menu/ }).click();
  await page.getByRole("menuitem", { name: "Add description" }).click();

  // Verify the scene is now expanded automatically, so the placeholder is visible
  const placeholder = page.getByText("Write the scene description here…").last();
  await expect(placeholder).toBeVisible();
});


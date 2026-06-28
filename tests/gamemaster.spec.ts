import { expect, test } from "@playwright/test";

test("Game Master page scene components workflow", async ({ page }) => {
  // 1. Visit landing page and navigate to GM page
  await page.goto("/");
  await page.getByRole("button", { name: "Open Game Master" }).click();
  await expect(page).toHaveTitle(/Game Master -/);

  // 2. Add a new Text Field component to the scene
  await page.getByRole("button", { name: "Text field", exact: true }).click();

  // 3. Verify editor is shown (since empty fields default to editing mode)
  const editor = page.getByRole("textbox", { name: /text field/i });
  await expect(editor).toBeVisible();

  // 4. Fill text in the contentEditable editor and click Save
  await editor.fill("This is my custom scene text.");
  await page.getByRole("button", { name: "Save" }).click();

  // 5. Verify custom text is displayed
  const savedText = page.getByText("This is my custom scene text.");
  await expect(savedText).toBeVisible();

  // 6. Click the saved text to open the editor again
  await savedText.click();
  await expect(editor).toBeVisible();

  // 7. Clear the text and click Save to test placeholder in read mode
  await editor.fill("");
  await page.getByRole("button", { name: "Save" }).click();

  // 8. Verify placeholder is shown in read mode when empty
  const placeholderText = page.getByText("Write the scene text here…");
  await expect(placeholderText).toBeVisible();

  // 9. Rename the component title from "Text field" to "Introduction Text"
  const titleSpan = page.getByTitle("Click to rename");
  await expect(titleSpan).toBeVisible();
  await expect(titleSpan).toHaveText("Text field");
  await titleSpan.click();

  const titleInput = page.locator("input[type='text']");
  await expect(titleInput).toBeVisible();
  await titleInput.fill("Introduction Text");
  await titleInput.press("Enter");

  // 10. Verify the title has updated
  await expect(page.getByText("Introduction Text", { exact: true })).toBeVisible();

  // 11. Open the dropdown menu and delete the component
  await page.getByRole("button", { name: "Introduction Text actions" }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();

  // 12. Verify the component is deleted
  await expect(page.getByText("Introduction Text")).not.toBeVisible();
});

test("Dropdown menus close other open menus when opened", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open Game Master" }).click();

  // 1. Add a component so we have both the scene menu and the component menu
  await page.getByRole("button", { name: "Text field", exact: true }).click();

  // 2. Click the Scene 1 menu trigger
  const sceneMenuTrigger = page.getByRole("button", { name: "Scene 1 menu" });
  await sceneMenuTrigger.click();

  // Verify Scene 1 menu content is visible
  const sceneMenuItem = page.getByRole("menuitem", { name: "Add scene before" });
  await expect(sceneMenuItem).toBeVisible();

  // 3. Click the Component actions menu trigger
  const componentMenuTrigger = page.getByRole("button", { name: "Text field actions" });
  await componentMenuTrigger.click();

  // Verify Scene 1 menu content is now hidden
  await expect(sceneMenuItem).not.toBeVisible();

  // Verify Component menu content is visible
  const componentMenuItem = page.getByRole("menuitem", { name: "Delete" });
  await expect(componentMenuItem).toBeVisible();

  // 4. Click outside (e.g., somewhere in the heading or main area)
  await page.getByRole("heading", { name: "Scene 1", exact: true }).click();

  // Verify Component menu content is now hidden
  await expect(componentMenuItem).not.toBeVisible();
});


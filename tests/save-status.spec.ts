import { expect, test } from "@playwright/test";

// Drives the real save path: "Gain Experience" changes character progress, which
// triggers a durable PUT. The mock decides whether that PUT succeeds or fails.
async function gainXp(page: import("@playwright/test").Page) {
  await page.goto("/enemy_within/thano_voss");
  await page.getByRole("button", { name: "Gain Experience" }).click();
  await page.getByLabel("XP gained").fill("25");
  await page.getByRole("button", { name: "Add XP" }).click();
}

test("a failed durable save surfaces an error banner", async ({ page }) => {
  await page.route("**/api/character-progress/**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ status: 404, body: "null" });
      return;
    }
    // Server rejects the save — previously swallowed and treated as success.
    await route.fulfill({ status: 500, body: "boom" });
  });

  await gainXp(page);

  await expect(page.getByRole("alert")).toContainText("save your latest changes");
});

test("a successful save shows no error banner", async ({ page }) => {
  await page.route("**/api/character-progress/**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ status: 404, body: "null" });
      return;
    }
    await route.fulfill({ status: 204 });
  });

  await gainXp(page);

  await expect(page.getByText("XP 1075/1075")).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
});

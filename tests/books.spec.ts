import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/character-progress/**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ status: 404, body: "null" });
      return;
    }

    await route.fulfill({ status: 204 });
  });
});

test("player can open the Books page from the character menu and browse into a chapter and back, with URLs reflecting book and chapter", async ({ page }) => {
  await page.goto("/enemy_within/karl-muller/skills");

  const characterMenu = page.getByRole("navigation", { name: "Character menu" });
  await characterMenu.getByRole("button", { name: "Books" }).click();
  await expect(page).toHaveURL(/\/enemy_within\/karl-muller\/books$/);

  await page.getByRole("button", { name: "WFRP 4E Core Rulebook" }).click();
  await expect(page).toHaveURL(/\/enemy_within\/karl-muller\/books\/core-rulebook$/);
  await expect(page.getByRole("heading", { name: "WFRP 4E Core Rulebook" })).toBeVisible();

  await page.getByRole("button", { name: "Throwing Bones" }).click();
  await expect(page).toHaveURL(/\/enemy_within\/karl-muller\/books\/core-rulebook\/throwing-bones$/);
  await expect(page.getByRole("heading", { name: "Throwing Bones" })).toBeVisible();
  await expect(page.getByText(/ten-sided dice/).first()).toBeVisible();

  await page.getByRole("button", { name: "Back to chapters" }).click();
  await expect(page).toHaveURL(/\/enemy_within\/karl-muller\/books\/core-rulebook$/);
  await expect(page.getByRole("heading", { name: "WFRP 4E Core Rulebook" })).toBeVisible();

  await page.getByRole("button", { name: "Back to books" }).click();
  await expect(page).toHaveURL(/\/enemy_within\/karl-muller\/books$/);
  await expect(page.getByRole("button", { name: "WFRP 4E Core Rulebook" })).toBeVisible();
});

test("a chapter URL can be opened directly (deep link)", async ({ page }) => {
  await page.goto("/enemy_within/karl-muller/books/core-rulebook/throwing-bones");

  await expect(page.getByRole("heading", { name: "Throwing Bones" })).toBeVisible();
  await expect(page.getByText(/ten-sided dice/).first()).toBeVisible();
});

test("browser back/forward moves between book and chapter views", async ({ page }) => {
  await page.goto("/enemy_within/karl-muller/books");
  await page.getByRole("button", { name: "WFRP 4E Core Rulebook" }).click();
  await page.getByRole("button", { name: "Throwing Bones" }).click();
  await expect(page).toHaveURL(/\/books\/core-rulebook\/throwing-bones$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/books\/core-rulebook$/);
  await expect(page.getByRole("heading", { name: "WFRP 4E Core Rulebook" })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/books$/);

  await page.goForward();
  await expect(page).toHaveURL(/\/books\/core-rulebook$/);
});

test("an unknown chapter slug falls back to the book's chapter list", async ({ page }) => {
  await page.goto("/enemy_within/karl-muller/books/core-rulebook/not-a-real-chapter");

  await expect(page.getByRole("heading", { name: "WFRP 4E Core Rulebook" })).toBeVisible();
});

test("an unknown book slug falls back to the book catalog", async ({ page }) => {
  await page.goto("/enemy_within/karl-muller/books/not-a-real-book");

  await expect(page.getByRole("button", { name: "WFRP 4E Core Rulebook" })).toBeVisible();
});

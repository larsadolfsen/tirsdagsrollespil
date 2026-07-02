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

test("player can open the Library from the landing page and browse into a chapter and back, with URLs reflecting book and chapter", async ({ page }) => {
  await page.goto("/enemy_within");

  await page.getByRole("button", { name: "Open Library" }).click();
  await expect(page).toHaveURL(/\/enemy_within\/library$/);

  await page.getByRole("button", { name: "WFRP 4E Core Rulebook" }).click();
  await expect(page).toHaveURL(/\/enemy_within\/library\/core-rulebook$/);
  await expect(page.getByRole("heading", { name: "WFRP 4E Core Rulebook" })).toBeVisible();

  await page.getByRole("button", { name: "Throwing Bones" }).click();
  await expect(page).toHaveURL(/\/enemy_within\/library\/core-rulebook\/throwing-bones$/);
  await expect(page.getByRole("heading", { name: "Throwing Bones" })).toBeVisible();
  await expect(page.getByText(/ten-sided dice/).first()).toBeVisible();

  await page.getByRole("button", { name: "Back to chapters" }).click();
  await expect(page).toHaveURL(/\/enemy_within\/library\/core-rulebook$/);
  await expect(page.getByRole("heading", { name: "WFRP 4E Core Rulebook" })).toBeVisible();

  await page.getByRole("button", { name: "Back to books" }).click();
  await expect(page).toHaveURL(/\/enemy_within\/library$/);
  await expect(page.getByRole("button", { name: "WFRP 4E Core Rulebook" })).toBeVisible();
});

test("a chapter URL can be opened directly (deep link)", async ({ page }) => {
  await page.goto("/enemy_within/library/core-rulebook/throwing-bones");

  await expect(page.getByRole("heading", { name: "Throwing Bones" })).toBeVisible();
  await expect(page.getByText(/ten-sided dice/).first()).toBeVisible();
});

test("browser back/forward moves between book and chapter views", async ({ page }) => {
  await page.goto("/enemy_within/library");
  await page.getByRole("button", { name: "WFRP 4E Core Rulebook" }).click();
  await page.getByRole("button", { name: "Throwing Bones" }).click();
  await expect(page).toHaveURL(/\/library\/core-rulebook\/throwing-bones$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/library\/core-rulebook$/);
  await expect(page.getByRole("heading", { name: "WFRP 4E Core Rulebook" })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/library$/);

  await page.goForward();
  await expect(page).toHaveURL(/\/library\/core-rulebook$/);
});

test("an unknown chapter slug falls back to the book's chapter list", async ({ page }) => {
  await page.goto("/enemy_within/library/core-rulebook/not-a-real-chapter");

  await expect(page.getByRole("heading", { name: "WFRP 4E Core Rulebook" })).toBeVisible();
});

test("an unknown book slug falls back to the book catalog", async ({ page }) => {
  await page.goto("/enemy_within/library/not-a-real-book");

  await expect(page.getByRole("button", { name: "WFRP 4E Core Rulebook" })).toBeVisible();
});

test("chapter heading levels form a correct outline (H1 chapter title, H2 major sections, H3 subsections)", async ({ page }) => {
  await page.goto("/enemy_within/library/core-rulebook/rules");

  await expect(page.getByRole("heading", { level: 1, name: "Rules" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Combat" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Timing Structure" })).toBeVisible();
});

test("chapter table of contents lists H2 sections and scrolls to them (desktop)", async ({ page }) => {
  await page.goto("/enemy_within/library/core-rulebook/rules");

  const toc = page.getByRole("navigation", { name: "Chapter contents" });
  await expect(toc.getByRole("link", { name: "Combat" })).toBeVisible();

  await toc.getByRole("link", { name: "Combat" }).click();
  await expect(page.locator("#combat")).toBeInViewport();
});

test("chapter table of contents opens as a bottom sheet on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/enemy_within/library/core-rulebook/rules");

  await expect(page.getByRole("navigation", { name: "Chapter contents" })).toBeHidden();
  await page.getByRole("button", { name: "Contents" }).click();

  const sheet = page.locator('[data-bottom-sheet-paper="true"]');
  await expect(sheet.getByRole("link", { name: "Combat" })).toBeVisible();

  await sheet.getByRole("link", { name: "Combat" }).click();
  await expect(sheet).toBeHidden();
  await expect(page.locator("#combat")).toBeInViewport();
});

test("a chapter with fewer than 2 major sections has no table of contents", async ({ page }) => {
  await page.goto("/enemy_within/library/core-rulebook/throwing-bones");

  await expect(page.getByRole("navigation", { name: "Chapter contents" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Contents" })).toHaveCount(0);
});

test("tables have alternating row background colors", async ({ page }) => {
  await page.goto("/enemy_within/library/core-rulebook/rules");

  const table = page.locator("table").filter({ hasText: "Astounding Success" });
  const rows = table.locator("tbody tr");

  const firstColor = await rows.nth(0).evaluate((el) => getComputedStyle(el).backgroundColor);
  const secondColor = await rows.nth(1).evaluate((el) => getComputedStyle(el).backgroundColor);

  expect(firstColor).not.toBe(secondColor);
});

test("desktop character header Library dropdown opens the overview and a specific book in new tabs", async ({ page, context }) => {
  await page.goto("/enemy_within/karl-muller/skills");

  const characterMenu = page.getByRole("navigation", { name: "Character menu" });
  await expect(characterMenu.getByRole("button", { name: "Books" })).toHaveCount(0);

  const [overviewTab] = await Promise.all([
    context.waitForEvent("page"),
    page.getByRole("button", { name: "Library" }).click().then(() =>
      page.getByRole("menuitem", { name: "Library overview" }).click(),
    ),
  ]);
  await overviewTab.waitForLoadState();
  await expect(overviewTab).toHaveURL(/\/enemy_within\/library$/);
  await expect(page).toHaveURL(/\/enemy_within\/karl-muller\/skills$/);

  const [bookTab] = await Promise.all([
    context.waitForEvent("page"),
    page.getByRole("button", { name: "Library" }).click().then(() =>
      page.getByRole("menuitem", { name: "WFRP 4E Core Rulebook" }).click(),
    ),
  ]);
  await bookTab.waitForLoadState();
  await expect(bookTab).toHaveURL(/\/enemy_within\/library\/core-rulebook$/);
});

test("mobile menu Library accordion expands and opens a book in a new tab", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/enemy_within/karl-muller/skills");

  await page.getByRole("button", { name: "Open menu" }).click();
  const mobileMenu = page.getByRole("navigation", { name: "Mobile menu" });
  await mobileMenu.getByRole("button", { name: "Library" }).click();

  const [bookTab] = await Promise.all([
    context.waitForEvent("page"),
    mobileMenu.getByRole("button", { name: "WFRP 4E Core Rulebook" }).click(),
  ]);
  await bookTab.waitForLoadState();
  await expect(bookTab).toHaveURL(/\/enemy_within\/library\/core-rulebook$/);
});

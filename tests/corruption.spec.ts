import { expect, test } from "@playwright/test";

test("corruption checks open as corruption tests", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Open Cool corruption check" }).click();

  await expect(page.getByRole("heading", { name: "Corruption Test" })).toBeVisible();
  await expect(page.getByText("Cool:")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dramatic Test" })).not.toBeVisible();
});

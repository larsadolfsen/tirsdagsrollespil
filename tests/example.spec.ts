import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/enemy_within\/[^/]+\/characteristics$/);
  await expect(page).toHaveTitle(/WFRP 4E/);
  await expect(page.locator('#root')).not.toBeEmpty();
});

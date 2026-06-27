import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL('/');
  await expect(page).toHaveTitle(/Enemy Within WFRP 4E/);
  await expect(page.locator('#root')).not.toBeEmpty();
});


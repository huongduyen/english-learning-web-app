import { test, expect } from '@playwright/test';

test('has title and renders header', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/English Learning/i);
});

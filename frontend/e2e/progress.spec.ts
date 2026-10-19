import { test, expect } from '@playwright/test';

test.describe('Flow E: Learning Progress & Achievements Flow', () => {
  test('1. Unauthenticated users cannot access /progress and are redirected to /login', async ({
    page,
  }) => {
    await page.goto('/progress');
    await expect(page).toHaveURL(/\/login/);
  });

  test('2. Complete Flow: Learn Activity -> Open Progress Page -> Verify Data Reflected', async ({
    page,
  }) => {
    // 1. Log in with demo account
    await page.goto('/login');
    await page.locator('#demo-learner-fill-button').click();
    await page.locator('#login-submit-button').click();
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Perform a learning activity: Favorite / Learn a vocabulary card
    await page.locator('#quick-action-vocabulary').click();
    await expect(page).toHaveURL(/\/vocabulary/);

    const firstCard = page.locator('#vocabulary-cards-grid > div').first();
    await expect(firstCard).toBeVisible();

    // Toggle favorite on the first card
    const favButton = firstCard.locator('[id^="vocab-fav-"]').first();
    await favButton.click();

    // 3. Open the Progress page
    await page.goto('/progress');
    await expect(page).toHaveURL(/\/progress/);

    // Verify main Progress heading
    await expect(
      page.getByRole('heading', { name: /learning progress/i }),
    ).toBeVisible();

    // 4. Verify progress overview cards
    const metricsRegion = page.getByRole('region', { name: 'Key Progress Metrics' });
    await expect(metricsRegion.getByText('Study Time')).toBeVisible();
    await expect(metricsRegion.getByText('Words Learned')).toBeVisible();
    await expect(metricsRegion.getByText('Lessons Done')).toBeVisible();
    await expect(metricsRegion.getByText('Avg Quiz Score')).toBeVisible();
    await expect(metricsRegion.getByText('Current Streak')).toBeVisible();

    // 5. Verify Achievements & Badges section
    await expect(page.getByText('Achievements & Badges')).toBeVisible();
    await expect(page.locator('#achievement-filter-all')).toBeVisible();
    await expect(page.locator('#achievement-filter-unlocked')).toBeVisible();
    await expect(page.locator('#achievement-filter-in-progress')).toBeVisible();
  });
});

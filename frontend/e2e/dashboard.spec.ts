import { test, expect } from '@playwright/test';

test.describe('Phase 5 — Simple Dashboard Flow', () => {
  test('1. Unauthenticated users cannot access /dashboard and are redirected to /login', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  });

  test('2. Authenticated user can view Dashboard with real profile data, goal, streak, and activities', async ({
    page,
  }) => {
    // Login with seeded demo account
    await page.goto('/login');
    await page.locator('#demo-learner-fill-button').click();
    await page.locator('#login-submit-button').click();

    // Verify redirected to /dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify Welcome section shows authenticated user's name
    const welcomeHeading = page.locator('#dashboard-welcome-heading');
    await expect(welcomeHeading).toBeVisible();
    await expect(welcomeHeading).toContainText('Nguyễn Văn Nam');

    // Verify English level badge
    await expect(page.locator('#user-level-badge')).toContainText(/intermediate/i);

    // Verify Today's Goal card is rendered
    const goalCard = page.locator('#daily-goal-card');
    await expect(goalCard).toBeVisible();
    await expect(page.locator('#actual-minutes-value')).toBeVisible();
    await expect(page.locator('#target-minutes-value')).toBeVisible();

    // Verify Streak indicator displays streak
    const streakBadge = page.locator('#daily-streak-badge');
    await expect(streakBadge).toBeVisible();
    await expect(streakBadge).toContainText(/streak/i);

    // Verify Accessible Progress Bar
    const progressContainer = page.locator('#daily-goal-card [role="progressbar"]');
    await expect(progressContainer).toBeVisible();
    const valuenow = await progressContainer.getAttribute('aria-valuenow');
    expect(Number(valuenow)).toBeGreaterThanOrEqual(0);

    // Verify Quick Actions section
    await expect(page.locator('#quick-actions-section')).toBeVisible();
    await expect(page.locator('#quick-action-vocabulary')).toBeVisible();
    await expect(page.locator('#quick-action-grammar')).toBeVisible();
    await expect(page.locator('#quick-action-listening')).toBeVisible();
    await expect(page.locator('#quick-action-reading')).toBeVisible();

    // Verify Continue Learning section
    await expect(page.locator('#continue-learning-section')).toBeVisible();

    // Verify Recent Activity section
    await expect(page.locator('#recent-activity-section')).toBeVisible();
    // Demo learner has seeded activities
    await expect(page.locator('#recent-activity-item-0')).toBeVisible();
  });

  test('3. Quick Actions navigate to their respective modules and return to Dashboard', async ({
    page,
  }) => {
    // Login with demo account
    await page.goto('/login');
    await page.locator('#demo-learner-fill-button').click();
    await page.locator('#login-submit-button').click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Test Vocabulary Navigation
    await page.locator('#quick-action-vocabulary').click();
    await expect(page).toHaveURL(/\/vocabulary/);
    await expect(page.getByRole('heading', { name: /vocabulary/i })).toBeVisible();
    await page.locator('#back-to-dashboard-link').click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Test Grammar Navigation
    await page.locator('#quick-action-grammar').click();
    await expect(page).toHaveURL(/\/grammar/);
    await expect(page.getByRole('heading', { name: /grammar/i })).toBeVisible();
    await page.locator('#back-to-dashboard-link').click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Test Listening Navigation
    await page.locator('#quick-action-listening').click();
    await expect(page).toHaveURL(/\/listening/);
    await expect(page.getByRole('heading', { name: /listening/i })).toBeVisible();
    await page.locator('#back-to-dashboard-link').click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Test Reading Navigation
    await page.locator('#quick-action-reading').click();
    await expect(page).toHaveURL(/\/reading/);
    await expect(page.getByRole('heading', { name: /reading/i })).toBeVisible();
    await page.locator('#back-to-dashboard-link').click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('4. Empty states are displayed for a brand new user with no previous activities', async ({
    page,
  }) => {
    const newEmail = `newlearner_${Date.now()}@example.com`;
    const newName = 'Newbie Learner';

    // Register a brand new user
    await page.goto('/register');
    await page.locator('#register-name-input').fill(newName);
    await page.locator('#register-email-input').fill(newEmail);
    await page.locator('#register-password-input').fill('Password123!');
    await page.locator('#register-confirm-password-input').fill('Password123!');
    await page.locator('#register-submit-button').click();

    // Verify redirected to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('#dashboard-welcome-heading')).toContainText(newName);

    // Verify Continue Learning empty state
    const continueEmptyState = page.locator('#continue-learning-empty-state');
    await expect(continueEmptyState).toBeVisible();
    await expect(page.locator('#continue-learning-empty-message')).toContainText(
      "You haven't started any lessons yet."
    );
    await expect(page.locator('#start-learning-button')).toBeVisible();

    // Verify Recent Activity empty state
    const recentEmptyState = page.locator('#recent-activity-empty-state');
    await expect(recentEmptyState).toBeVisible();
    await expect(page.locator('#recent-activity-empty-message')).toContainText(
      'No learning activity yet.'
    );
    await expect(page.locator('#activity-start-learning-button')).toBeVisible();
  });

  test('5. Error states and retry functionality handle failed API requests gracefully', async ({
    page,
  }) => {
    let failGoalRequest = true;

    // Intercept /daily-goals endpoint
    await page.route('**/api/v1/daily-goals', async (route) => {
      if (failGoalRequest) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal server error' }),
        });
      } else {
        await route.continue();
      }
    });

    // Login with demo account
    await page.goto('/login');
    await page.locator('#demo-learner-fill-button').click();
    await page.locator('#login-submit-button').click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify error state appears on daily goal card without crashing the rest of Dashboard
    await expect(page.locator('#daily-goal-error-state')).toBeVisible();
    await expect(page.locator('#daily-goal-error-state')).toContainText(
      'Unable to load your learning data.'
    );

    // Rest of dashboard remains functional
    await expect(page.locator('#dashboard-welcome-heading')).toBeVisible();
    await expect(page.locator('#quick-actions-section')).toBeVisible();

    // Stop failing the route and click retry
    failGoalRequest = false;
    await page.locator('#retry-daily-goal-button').click();

    // Verify recovered
    await expect(page.locator('#daily-goal-card')).toBeVisible();
    await expect(page.locator('#actual-minutes-value')).toBeVisible();
  });

  test('6. Responsive layout works comfortably on mobile viewport without horizontal overflow', async ({
    page,
  }) => {
    // Set viewport to mobile phone (iPhone SE / small mobile)
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/login');
    await page.locator('#demo-learner-fill-button').click();
    await page.locator('#login-submit-button').click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify Welcome heading visible and fits
    await expect(page.locator('#dashboard-welcome-heading')).toBeVisible();

    // Verify no horizontal overflow on mobile
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Verify all primary cards are visible
    await expect(page.locator('#daily-goal-card')).toBeVisible();
    await expect(page.locator('#quick-actions-section')).toBeVisible();
    await expect(page.locator('#continue-learning-section')).toBeVisible();
    await expect(page.locator('#recent-activity-section')).toBeVisible();
  });
});

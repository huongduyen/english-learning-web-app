import { test, expect } from '@playwright/test';

test.describe('Authentication & Session Lifecycle Flow', () => {
  const testEmail = `playwright_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Playwright Student';

  test('Complete flow: Register -> Dashboard -> Refresh -> Logout -> Login -> Persistent reload -> Logout', async ({
    page,
  }) => {
    // 1. Visit Register Page
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();

    // 2. Fill registration form
    await page.locator('#register-name-input').fill(testName);
    await page.locator('#register-email-input').fill(testEmail);
    await page.locator('#register-password-input').fill(testPassword);
    await page.locator('#register-confirm-password-input').fill(testPassword);

    // Select Intermediate level
    await page.getByRole('button', { name: /intermediate/i }).first().click();

    // Submit registration
    await page.locator('#register-submit-button').click();

    // 3. Verify redirected to protected dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: testName })).toBeVisible();

    // 4. Test Session Refresh & Profile Settings on /profile
    await page.goto('/profile');
    await expect(page.getByText('Session Active (JWT)')).toBeVisible();
    const refreshButton = page.locator('#refresh-session-button');
    await expect(refreshButton).toBeVisible();
    await refreshButton.click();

    await expect(page.locator('#refresh-session-status')).toContainText(
      'Session refreshed successfully',
      { timeout: 10000 },
    );

    // 5. Update Profile via PATCH /api/users/me
    const nameInput = page.locator('#profile-name-input');
    await nameInput.fill('Playwright Student Updated');
    await page.locator('#profile-daily-goal-minutes').fill('35');

    const saveButton = page.locator('#save-profile-button');
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    await expect(page.locator('#profile-update-success')).toBeVisible({ timeout: 10000 });

    // 6. Test Logout
    const logoutBtn = page.locator('#dashboard-logout-button');
    await logoutBtn.click();

    // 7. Verify redirected to login page
    await expect(page).toHaveURL(/\/login/);

    // Try accessing protected dashboard when unauthenticated -> should redirect to login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);

    // 8. Test Login with newly registered credentials
    await page.locator('#login-email-input').fill(testEmail);
    await page.locator('#login-password-input').fill(testPassword);
    await page.locator('#login-submit-button').click();

    // 9. Verify login successful and redirected to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /Playwright Student Updated/i })).toBeVisible();

    // 10. Test Persistent Login (Page Reload)
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /Playwright Student Updated/i })).toBeVisible();

    // Final logout via navbar
    await page.locator('#logout-button').click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('Demo Account quick-fill and authentication validation errors', async ({ page }) => {
    await page.goto('/login');

    // Test validation error on empty submit
    await page.locator('#login-submit-button').click();
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();

    // Test invalid credentials
    await page.locator('#login-email-input').fill('nonexistent@example.com');
    await page.locator('#login-password-input').fill('WrongPassword!');
    await page.locator('#login-submit-button').click();

    await expect(page.locator('#login-error-alert')).toContainText(/invalid email or password/i, {
      timeout: 10000,
    });

    // Test Demo credentials quick-fill button
    await page.locator('#demo-learner-fill-button').click();
    await expect(page.locator('#login-email-input')).toHaveValue('learner@example.com');
    await expect(page.locator('#login-password-input')).toHaveValue('Learner123!');

    // Submit demo credentials
    await page.locator('#login-submit-button').click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /nguyễn văn nam/i })).toBeVisible();
  });
});

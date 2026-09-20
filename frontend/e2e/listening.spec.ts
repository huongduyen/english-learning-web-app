import { test, expect } from '@playwright/test';

test.describe('Listening Learning Module & Comprehension Flow', () => {
  test('1. Unauthenticated users cannot access /listening or /listening/:id and are redirected to /login', async ({
    page,
  }) => {
    await page.goto('/listening');
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/listening/00000000-0000-0000-0000-000000000001');
    await expect(page).toHaveURL(/\/login/);
  });

  test('2. Authenticated user can view Listening Lessons list with filters and card details', async ({
    page,
  }) => {
    // 1. Login with demo account
    await page.goto('/login');
    await page.locator('#demo-learner-fill-button').click();
    await page.locator('#login-submit-button').click();
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Navigate to Listening page via Quick Action
    await page.locator('#quick-action-listening').click();
    await expect(page).toHaveURL(/\/listening/);

    // Verify main heading
    const heading = page.getByRole('heading', { name: /listening comprehension/i });
    await expect(heading).toBeVisible();

    // Verify filter controls
    await expect(page.locator('#listening-search-input')).toBeVisible();
    await expect(page.locator('#listening-difficulty-filter')).toBeVisible();
    await expect(page.locator('#listening-level-filter')).toBeVisible();

    // Verify lessons grid is populated with seeded data
    const grid = page.locator('#listening-lessons-grid');
    await expect(grid).toBeVisible();

    const firstCard = grid.locator('> div').first();
    await expect(firstCard).toBeVisible();

    // Card should have title and start/continue button
    await expect(firstCard.locator('[id^="listening-title-"]')).toBeVisible();
    await expect(firstCard.locator('[id^="listening-card-btn-"]')).toBeVisible();
  });

  test('3. Search and difficulty filter update listening lesson list', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#demo-learner-fill-button').click();
    await page.locator('#login-submit-button').click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/listening');
    await expect(page.locator('#listening-lessons-grid')).toBeVisible();

    // Test Search input
    await page.locator('#listening-search-input').fill('Hotel');
    await expect(page.locator('#listening-lessons-grid')).toBeVisible();

    // Verify at least one card matching "Hotel" is present
    await expect(page.locator('#listening-lessons-grid').getByText(/hotel/i).first()).toBeVisible();

    // Clear search
    await page.locator('#listening-search-input').fill('');

    // Test Difficulty filter
    await page.locator('#listening-difficulty-filter').selectOption('EASY');
    await expect(page.locator('#listening-lessons-grid')).toBeVisible();
    await expect(page.locator('#listening-lessons-grid').getByText('Easy').first()).toBeVisible();
  });

  test('4. Complete Flow: Open Lesson -> Player -> Transcript toggle -> Answer validation -> Submit -> Results', async ({
    page,
  }) => {
    // 1. Login
    await page.goto('/login');
    await page.locator('#demo-learner-fill-button').click();
    await page.locator('#login-submit-button').click();
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Go to Listening page
    await page.goto('/listening');
    await expect(page.locator('#listening-lessons-grid')).toBeVisible();

    // 3. Click the first lesson's start button
    const firstCardBtn = page.locator('#listening-lessons-grid [id^="listening-card-btn-"]').first();
    await firstCardBtn.click();
    await expect(page).toHaveURL(/\/listening\/[a-zA-Z0-9-]+/);

    // 4. Verify Lesson details header
    await expect(page.locator('#listening-lesson-header')).toBeVisible();
    await expect(page.locator('#lesson-title')).toBeVisible();

    // 5. Verify Audio Player
    await expect(page.locator('#standard-audio-player')).toBeVisible();

    // 6. Test Transcript Accordion Toggle (default hidden)
    await expect(page.locator('#transcript-content')).not.toBeVisible();
    const toggleBtn = page.locator('#transcript-toggle-button');
    await expect(toggleBtn).toContainText('Show Transcript');

    // Click to show transcript
    await toggleBtn.click();
    await expect(page.locator('#transcript-content')).toBeVisible();
    await expect(toggleBtn).toContainText('Hide Transcript');

    // Click again to hide transcript
    await toggleBtn.click();
    await expect(page.locator('#transcript-content')).not.toBeVisible();

    // 7. Verify Comprehension Questions
    await expect(page.locator('#listening-questions-container')).toBeVisible();

    // Try submitting without answering -> validation message appears
    const submitBtn = page.locator('#submit-listening-answers-button');
    await submitBtn.click();
    await expect(page.locator('#questions-validation-alert')).toBeVisible();

    // Answer each question by selecting the first option in each question block
    const questionBlocks = page.locator('[id^="question-block-"]');
    const questionCount = await questionBlocks.count();
    expect(questionCount).toBeGreaterThan(0);

    for (let i = 0; i < questionCount; i++) {
      const qBlock = questionBlocks.nth(i);
      const firstOption = qBlock.locator('input[type="radio"]').first();
      await firstOption.check();
    }

    // Submit answered questions
    await submitBtn.click();

    // 8. Verify Result Card is displayed
    await expect(page.locator('#listening-result-card')).toBeVisible();
    await expect(page.locator('#listening-result-card')).toContainText(/points|correct/i);

    // Verify explanation section is now shown in question blocks
    const explanation = page.locator('[id^="question-block-"]').first().getByText(/explanation:/i);
    await expect(explanation).toBeVisible();

    // 9. Back to Listening lessons list
    await page.locator('#back-to-listening-list').click();
    await expect(page).toHaveURL(/\/listening$/);
  });
});

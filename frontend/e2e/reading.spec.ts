import { test, expect } from '@playwright/test';

test.describe('Reading Learning Module & Comprehension Flow', () => {
  test('1. Unauthenticated users cannot access /reading or /reading/:id and are redirected to /login', async ({
    page,
  }) => {
    await page.goto('/reading');
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/reading/00000000-0000-0000-0000-000000000001');
    await expect(page).toHaveURL(/\/login/);
  });

  test('2. Authenticated user can view Reading Articles list with filters and card details', async ({
    page,
  }) => {
    // 1. Login with demo account
    await page.goto('/login');
    await page.locator('#demo-learner-fill-button').click();
    await page.locator('#login-submit-button').click();
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Navigate to Reading page via Quick Action
    await page.locator('#quick-action-reading').click();
    await expect(page).toHaveURL(/\/reading/);

    // Verify main heading
    const heading = page.getByRole('heading', { name: /reading comprehension/i });
    await expect(heading).toBeVisible();

    // Verify filter controls
    await expect(page.locator('#reading-search-input')).toBeVisible();
    await expect(page.locator('#reading-difficulty-filter')).toBeVisible();
    await expect(page.locator('#reading-level-filter')).toBeVisible();

    // Verify articles grid is populated with seeded data
    const grid = page.locator('#reading-articles-grid');
    await expect(grid).toBeVisible();

    const firstCard = grid.locator('> div').first();
    await expect(firstCard).toBeVisible();

    // Card should have title and read/continue button
    await expect(firstCard.locator('[id^="reading-title-"]')).toBeVisible();
    await expect(firstCard.locator('[id^="reading-card-btn-"]')).toBeVisible();
  });

  test('3. Search and difficulty filter update reading article list', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#demo-learner-fill-button').click();
    await page.locator('#login-submit-button').click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/reading');
    await expect(page.locator('#reading-articles-grid')).toBeVisible();

    // Test Search input
    await page.locator('#reading-search-input').fill('Coffee');
    await expect(page.locator('#reading-articles-grid')).toBeVisible();

    // Verify at least one card matching "Coffee" is present
    await expect(page.locator('#reading-articles-grid').getByText(/coffee/i).first()).toBeVisible();

    // Clear search
    await page.locator('#reading-search-input').fill('');

    // Test Difficulty filter
    await page.locator('#reading-difficulty-filter').selectOption('EASY');
    await expect(page.locator('#reading-articles-grid')).toBeVisible();
    await expect(page.locator('#reading-articles-grid').getByText('Easy').first()).toBeVisible();
  });

  test('4. Complete Flow: Open Article -> Read Content -> Answer validation -> Submit -> Results', async ({
    page,
  }) => {
    // 1. Login
    await page.goto('/login');
    await page.locator('#demo-learner-fill-button').click();
    await page.locator('#login-submit-button').click();
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Go to Reading page
    await page.goto('/reading');
    await expect(page.locator('#reading-articles-grid')).toBeVisible();

    // 3. Click the first article's read button
    const firstCardBtn = page.locator('#reading-articles-grid [id^="reading-card-btn-"]').first();
    await firstCardBtn.click();
    await expect(page).toHaveURL(/\/reading\/[a-zA-Z0-9-]+/);

    // 4. Verify Article details header
    await expect(page.locator('#reading-article-header')).toBeVisible();
    await expect(page.locator('#article-title')).toBeVisible();

    // 5. Verify Article Content Reader typography
    const contentContainer = page.locator('#reading-article-content-container');
    await expect(contentContainer).toBeVisible();
    await expect(contentContainer.locator('p').first()).toBeVisible();

    // Test language toggle if present
    const langToggle = page.locator('#article-language-toggle');
    if (await langToggle.isVisible()) {
      await langToggle.click();
      await expect(langToggle).toContainText('Tiếng Việt');
      await langToggle.click();
      await expect(langToggle).toContainText('English');
    }

    // 6. Verify Comprehension Questions
    await expect(page.locator('#reading-questions-container')).toBeVisible();

    // Try submitting without answering -> validation message appears
    const submitBtn = page.locator('#submit-reading-answers-button');
    await submitBtn.click();
    await expect(page.locator('#reading-questions-validation-alert')).toBeVisible();

    // Answer each question by selecting the first option in each question block
    const questionBlocks = page.locator('[id^="reading-question-block-"]');
    const questionCount = await questionBlocks.count();
    expect(questionCount).toBeGreaterThan(0);

    for (let i = 0; i < questionCount; i++) {
      const qBlock = questionBlocks.nth(i);
      const firstOption = qBlock.locator('input[type="radio"]').first();
      await firstOption.check();
    }

    // Submit answered questions
    await submitBtn.click();

    // 7. Verify Result Card is displayed
    await expect(page.locator('#reading-result-card')).toBeVisible();
    await expect(page.locator('#reading-result-card')).toContainText(/points|correct/i);

    // Verify explanation section is now shown in question blocks
    const explanation = page.locator('[id^="reading-question-block-"]').first().getByText(/explanation:/i);
    await expect(explanation).toBeVisible();

    // 8. Back to Reading articles list
    await page.locator('#back-to-reading-list').click();
    await expect(page).toHaveURL(/\/reading$/);
  });
});

import { test, expect } from '@playwright/test';

test.describe('Flow C: Quiz & Assessment Flow', () => {
  test('1. Unauthenticated users cannot access /quizzes and are redirected to /login', async ({
    page,
  }) => {
    await page.goto('/quizzes');
    await expect(page).toHaveURL(/\/login/);
  });

  test('2. Complete Quiz Flow: Login -> Open Quizzes -> Select Quiz -> Answer -> Submit -> Verify Score', async ({
    page,
  }) => {
    // 1. Log in with demo learner
    await page.goto('/login');
    await page.locator('#demo-learner-fill-button').click();
    await page.locator('#login-submit-button').click();
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Open Quizzes list page via Quick Action or navigation
    await page.locator('#quick-action-quizzes').click();
    await expect(page).toHaveURL(/\/quizzes/);

    // Verify main heading
    await expect(
      page.getByRole('heading', { name: /quizzes & proficiency tests/i }),
    ).toBeVisible();

    // Verify search and filter controls
    await expect(page.locator('#quiz-search-input')).toBeVisible();

    // 3. Select the first available quiz and start it
    const firstQuizCard = page.locator('main .grid > div').first();
    await expect(firstQuizCard).toBeVisible();

    const startQuizButton = firstQuizCard.locator('a[id^="quiz-start-"]').first();
    await expect(startQuizButton).toBeVisible();
    await startQuizButton.click();

    // Verify arrived at /quiz/:id
    await expect(page).toHaveURL(/\/quiz\//);

    // 4. Answer the questions through QuizRunner
    // Loop through questions, clicking first available option on each and then clicking Next or Submit
    let isLastQuestion = false;
    let questionsAnswered = 0;

    while (!isLastQuestion && questionsAnswered < 15) {
      questionsAnswered++;

      // Check if multiple choice or true/false options exist on page
      const optionButtons = page.locator(
        '[data-testid="quiz-option"], button[id^="quiz-option-"], button[id^="quiz-tf-option-"]'
      );
      const optionCount = await optionButtons.count();

      if (optionCount > 0) {
        // Click the first answer option
        await optionButtons.first().click();
      } else {
        // If it's a fill-in-the-blank input, fill text
        const fillInput = page.locator('#fill-blank-input, input[id^="fill-blank-"]');
        if ((await fillInput.count()) > 0) {
          await fillInput.first().fill('test answer');
        }
      }

      // Check if Next button exists, else check for Submit Quiz button
      const nextBtn = page.locator('#quiz-next-button');
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
      } else {
        isLastQuestion = true;
      }
    }

    // 5. Submit the Quiz
    const submitBtn = page.locator('#quiz-submit-button');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // 6. Verify result card and score displayed
    // Result card contains score display, percentage, and action buttons
    const reviewBtn = page.locator('#quiz-review-answers-button');
    await expect(reviewBtn).toBeVisible({ timeout: 15000 });

    const retryBtn = page.locator('#quiz-retry-button');
    await expect(retryBtn).toBeVisible();

    // Verify score element is displayed
    await expect(page.getByText(/score/i).first()).toBeVisible();
    await expect(page.getByText(/correct/i).first()).toBeVisible();
    await expect(page.getByText(/time/i).first()).toBeVisible();
  });
});

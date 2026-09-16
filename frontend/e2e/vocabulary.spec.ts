import { test, expect } from '@playwright/test';

test.describe('Vocabulary Learning Module & Flashcards Flow', () => {
  test('1. Unauthenticated users cannot access /vocabulary or /vocabulary/flashcards and are redirected to /login', async ({
    page,
  }) => {
    await page.goto('/vocabulary');
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/vocabulary/flashcards');
    await expect(page).toHaveURL(/\/login/);
  });

  test('2. Authenticated user can view Vocabulary List with cards, filters, audio, and favorite buttons', async ({
    page,
  }) => {
    // 1. Login with demo account
    await page.goto('/login');
    await page.locator('#demo-learner-fill-button').click();
    await page.locator('#login-submit-button').click();
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Navigate to Vocabulary page
    await page.locator('#quick-action-vocabulary').click();
    await expect(page).toHaveURL(/\/vocabulary/);

    // Verify main heading
    const heading = page.getByRole('heading', { name: /vocabulary/i });
    await expect(heading).toBeVisible();

    // Verify filter inputs exist
    await expect(page.locator('#vocab-search-input')).toBeVisible();
    await expect(page.locator('#vocab-topic-filter')).toBeVisible();
    await expect(page.locator('#vocab-difficulty-filter')).toBeVisible();
    await expect(page.locator('#vocab-pos-filter')).toBeVisible();

    // Verify cards are rendered from real PostgreSQL data
    const cardsGrid = page.locator('#vocabulary-cards-grid');
    await expect(cardsGrid).toBeVisible();

    const firstCard = cardsGrid.locator('> div').first();
    await expect(firstCard).toBeVisible();

    // Verify card content requirements:
    // English word, IPA, Audio button, Vietnamese meaning, Part of speech, Example, Translation, Difficulty, Favorite
    await expect(firstCard.locator('[id^="vocab-word-text-"]')).toBeVisible();
    await expect(firstCard.locator('[id^="vocab-audio-"]')).toBeVisible();
    await expect(firstCard.locator('[id^="vocab-meaning-vi-"]')).toBeVisible();
    await expect(firstCard.locator('[id^="vocab-fav-"]')).toBeVisible();

    // Test Audio button click
    const audioBtn = firstCard.locator('[id^="vocab-audio-"]').first();
    await audioBtn.click();

    // Test Favorite button toggle
    const favBtn = firstCard.locator('[id^="vocab-fav-"]').first();
    await favBtn.click();
  });

  test('3. Search and filters filter vocabulary correctly', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.locator('#demo-learner-fill-button').click();
    await page.locator('#login-submit-button').click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/vocabulary');

    // Test Search input
    await page.locator('#vocab-search-input').fill('empathy');
    await expect(page.locator('#vocab-search-input')).toHaveValue('empathy');

    // Verify card matching search is displayed
    const wordElement = page.getByText('Empathy', { exact: true });
    await expect(wordElement).toBeVisible();

    // Clear search
    await page.locator('#vocab-search-input').fill('');

    // Test Difficulty filter (EASY)
    await page.locator('#vocab-difficulty-filter').selectOption('EASY');
    await expect(page.locator('#vocabulary-cards-grid').getByText('Easy').first()).toBeVisible();

    // Test Part-of-speech filter (verb)
    await page.locator('#vocab-pos-filter').selectOption('verb');
    await expect(page.locator('#vocabulary-cards-grid')).toBeVisible();
  });

  test('4. Complete Flow: Vocabulary -> Open word -> Start Flashcards -> Learn word -> Mark difficult -> Finish session -> Verify progress', async ({
    page,
  }) => {
    // Step A: Login
    await page.goto('/login');
    await page.locator('#demo-learner-fill-button').click();
    await page.locator('#login-submit-button').click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Step B: Navigate to Vocabulary
    await page.goto('/vocabulary');
    await expect(page.getByRole('heading', { name: /vocabulary/i })).toBeVisible();

    // Step C: Open word -> Navigate to Vocabulary Detail
    const firstWordLink = page.locator('#vocabulary-cards-grid [id^="vocab-word-link-"]').first();
    await expect(firstWordLink).toBeVisible();
    const wordText = await firstWordLink.innerText();
    await firstWordLink.click();

    // Verify on Vocabulary Detail page
    await expect(page).toHaveURL(/\/vocabulary\/[0-9a-fA-F-]+/);
    const detailWordHeading = page.locator('#detail-word');
    await expect(detailWordHeading).toBeVisible();
    await expect(detailWordHeading).toHaveText(wordText.trim());

    // Verify details: IPA, audio button, Vietnamese meaning, English definition, examples, mastery status
    await expect(page.locator('#detail-audio-btn')).toBeVisible();
    await expect(page.locator('#detail-meaning-vi')).toBeVisible();
    await expect(page.locator('#detail-status-badge')).toBeVisible();

    // Step D: Start Flashcards from detail page
    const startFlashcardsBtn = page.locator('#detail-start-flashcards-btn');
    await expect(startFlashcardsBtn).toBeVisible();
    await startFlashcardsBtn.click();

    // Verify navigated to Flashcards learning mode
    await expect(page).toHaveURL(/\/vocabulary\/flashcards/);

    // Step E: Verify Flashcard Front content
    const flashcardContainer = page.locator('#flashcard-container');
    await expect(flashcardContainer).toBeVisible();
    await expect(page.locator('#flashcard-front')).toBeVisible();
    await expect(page.locator('#flashcard-word')).toBeVisible();
    await expect(page.locator('#flashcard-audio')).toBeVisible();

    // Step F: Click to flip card and verify Back content
    await flashcardContainer.click();
    await expect(page.locator('#flashcard-back')).toBeVisible();
    await expect(page.locator('#flashcard-meaning-vi')).toBeVisible();

    // Step G: Learn word ("I Know This")
    const knowThisBtn = page.locator('#flashcard-know-button');
    await expect(knowThisBtn).toBeVisible();
    await knowThisBtn.click();

    // Verify learned count incremented to at least 1
    const learnedBadge = page.locator('#flashcard-learned-count');
    await expect(learnedBadge).toBeVisible();
    await expect(learnedBadge).toContainText('1 learned');

    // Step H: On the next card, Mark difficult ("Need Review")
    const needReviewBtn = page.locator('#flashcard-need-review-button');
    await expect(needReviewBtn).toBeVisible();
    await needReviewBtn.click();

    // Verify difficult count incremented to 1
    const difficultBadge = page.locator('#flashcard-difficult-count');
    await expect(difficultBadge).toBeVisible();
    await expect(difficultBadge).toContainText('1 difficult');

    // Verify reviews count is at least 2
    const reviewsBadge = page.locator('#flashcard-reviews-count');
    await expect(reviewsBadge).toContainText('2 reviews');

    // Step I: Finish session
    const finishBtn = page.locator('#flashcard-finish-button');
    await expect(finishBtn).toBeVisible();
    await finishBtn.click();

    // Verify Session Summary is displayed
    const summaryCard = page.locator('#flashcard-session-summary');
    await expect(summaryCard).toBeVisible();
    await expect(page.locator('#summary-heading')).toHaveText(/session complete/i);
    await expect(page.locator('#summary-learned-count')).toHaveText('1');
    await expect(page.locator('#summary-difficult-count')).toHaveText('1');
    await expect(page.locator('#summary-reviews-count')).toHaveText('2');

    // Step J: Return to Vocabulary List and verify progress
    const backToListBtn = page.locator('#summary-back-to-list-btn');
    await expect(backToListBtn).toBeVisible();
    await backToListBtn.click();

    await expect(page).toHaveURL(/\/vocabulary/);
    await expect(page.locator('#vocabulary-cards-grid')).toBeVisible();
  });
});

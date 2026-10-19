import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { GrammarCard } from '../components/grammar/GrammarCard';
import { QuizResultCard } from '../components/quiz/QuizResultCard';
import { GrammarLessonListItem } from '../types/grammar';
import { QuizResultData } from '../types/quiz';

describe('Grammar & Quiz Component Tests', () => {
  const mockGrammarLesson: GrammarLessonListItem = {
    id: 'grammar-1',
    slug: 'present-simple-tense',
    title: 'Present Simple Tense',
    titleVi: 'Thì Hiện Tại Đơn',
    category: 'Tenses',
    categoryVi: 'Các Thì',
    summary: 'Master habits and universal truths in English.',
    level: 'BEGINNER',
    order: 1,
    exerciseCount: 5,
    quiz: {
      id: 'quiz-1',
      title: 'Present Simple Mastery Quiz',
      timeLimit: 10,
      passingScore: 70,
    },
    createdAt: '2026-10-10',
    updatedAt: '2026-10-10',
  };

  const mockPassedQuizResult: QuizResultData = {
    attemptId: 'att-1',
    quizId: 'quiz-1',
    quizTitle: 'Present Simple Quiz',
    score: 80,
    maxScore: 100,
    percentage: 80,
    passed: true,
    passingScore: 70,
    correctCount: 4,
    incorrectCount: 1,
    timeSpentSeconds: 150,
    xpAwarded: 30,
    completedAt: '2026-10-10T00:00:00.000Z',
    breakdown: [],
  };

  const mockFailedQuizResult: QuizResultData = {
    ...mockPassedQuizResult,
    score: 50,
    percentage: 50,
    passed: false,
    correctCount: 2,
    incorrectCount: 3,
    xpAwarded: 10,
  };

  describe('GrammarCard', () => {
    it('renders grammar lesson details, badges, and exercise count', () => {
      render(
        <MemoryRouter>
          <GrammarCard lesson={mockGrammarLesson} />
        </MemoryRouter>,
      );

      expect(screen.getByText('Present Simple Tense')).toBeInTheDocument();
      expect(screen.getByText('Thì Hiện Tại Đơn')).toBeInTheDocument();
      expect(screen.getByText('Tenses')).toBeInTheDocument();
      expect(screen.getByText('BEGINNER')).toBeInTheDocument();
      expect(screen.getByText('5 Exercises')).toBeInTheDocument();
      expect(screen.getByText('Quiz Available')).toBeInTheDocument();

      const link = screen.getByRole('link', { name: /start lesson/i });
      expect(link).toHaveAttribute('href', '/grammar/present-simple-tense');
    });
  });

  describe('QuizResultCard', () => {
    it('renders congratulations, score, percentage, correct/incorrect metrics for passed quiz', () => {
      render(
        <QuizResultCard
          result={mockPassedQuizResult}
          onRetry={() => {}}
          onReview={() => {}}
          onBack={() => {}}
        />,
      );

      expect(screen.getByText('Outstanding Work!')).toBeInTheDocument();
      expect(screen.getByText('+30 XP Earned')).toBeInTheDocument();
      expect(screen.getByText('80/100')).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument(); // correct count
      expect(screen.getByText('1')).toBeInTheDocument(); // incorrect count
      expect(screen.getByText('2m 30s')).toBeInTheDocument(); // 150 seconds formatted
    });

    it('renders encouragement header for failed quiz below passingScore', () => {
      render(
        <QuizResultCard
          result={mockFailedQuizResult}
          onRetry={() => {}}
          onReview={() => {}}
        />,
      );

      expect(screen.getByText('Good Effort! Keep Practicing')).toBeInTheDocument();
      expect(screen.getByText(/You achieved 50%/i)).toBeInTheDocument();
      expect(screen.getByText('50/100')).toBeInTheDocument();
      expect(screen.getByText('+10 XP Earned')).toBeInTheDocument();
    });

    it('invokes callbacks when Review, Retry, and Continue buttons are clicked', async () => {
      const user = userEvent.setup();
      const retryMock = vi.fn();
      const reviewMock = vi.fn();
      const backMock = vi.fn();

      render(
        <QuizResultCard
          result={mockPassedQuizResult}
          onRetry={retryMock}
          onReview={reviewMock}
          onBack={backMock}
        />,
      );

      await user.click(screen.getByRole('button', { name: /review answers/i }));
      expect(reviewMock).toHaveBeenCalledTimes(1);

      await user.click(screen.getByRole('button', { name: /retry quiz/i }));
      expect(retryMock).toHaveBeenCalledTimes(1);

      await user.click(screen.getByRole('button', { name: /continue/i }));
      expect(backMock).toHaveBeenCalledTimes(1);
    });
  });
});

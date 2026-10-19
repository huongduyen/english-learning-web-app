import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { WelcomeSection } from '../components/dashboard/WelcomeSection';
import { DailyGoalCard } from '../components/dashboard/DailyGoalCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { User } from '../types/auth';

describe('Dashboard Component Tests', () => {
  const mockUser: User = {
    id: 'user-1',
    email: 'learner@example.com',
    name: 'Nguyễn Văn Nam',
    role: 'LEARNER',
    level: 'INTERMEDIATE',
    avatar: 'https://example.com/avatar.png',
  };

  describe('WelcomeSection', () => {
    it('renders user display name, avatar, and level badge', () => {
      render(<WelcomeSection user={mockUser} />);

      expect(
        screen.getByRole('heading', { name: /welcome back, nguyễn văn nam!/i }),
      ).toBeInTheDocument();
      expect(screen.getByText('INTERMEDIATE')).toBeInTheDocument();
      const avatar = screen.getByAltText('Nguyễn Văn Nam');
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.png');
    });

    it('falls back to email prefix when name is missing', () => {
      const userWithoutName: User = {
        ...mockUser,
        name: null as unknown as string,
        avatar: null as unknown as string,
      };

      render(<WelcomeSection user={userWithoutName} />);
      expect(
        screen.getByRole('heading', { name: /welcome back, learner!/i }),
      ).toBeInTheDocument();
    });

    it('renders loading skeleton when loading without user', () => {
      render(<WelcomeSection user={null} isLoading={true} />);
      expect(screen.getByLabelText(/welcome banner/i)).toBeInTheDocument();
    });
  });

  describe('DailyGoalCard', () => {
    const mockGoal = {
      id: 'goal-1',
      userId: 'user-1',
      date: '2026-10-10',
      targetMinutes: 20,
      actualMinutes: 10,
      targetWords: 5,
      actualWords: 2,
      completed: false,
      createdAt: '2026-10-10',
      updatedAt: '2026-10-10',
    };

    it('renders progress, target, actual minutes, and streak badge', () => {
      render(
        <DailyGoalCard
          goal={mockGoal}
          streakDays={5}
          isLoading={false}
          isError={false}
          onRetry={() => {}}
        />,
      );

      expect(screen.getByText("Today's Goal")).toBeInTheDocument();
      expect(screen.getByText('5 day streak')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    });

    it('displays celebration text when goal is completed (100% or more)', () => {
      render(
        <DailyGoalCard
          goal={{ ...mockGoal, actualMinutes: 25 }}
          streakDays={5}
          isLoading={false}
          isError={false}
          onRetry={() => {}}
        />,
      );

      expect(screen.getByText(/goal achieved for today!/i)).toBeInTheDocument();
    });

    it('renders loading placeholder during fetch', () => {
      render(
        <DailyGoalCard
          goal={null}
          streakDays={0}
          isLoading={true}
          isError={false}
          onRetry={() => {}}
        />,
      );

      expect(screen.getByLabelText(/today's goal loading/i)).toBeInTheDocument();
    });

    it('renders error state and invokes onRetry callback', async () => {
      const user = userEvent.setup();
      const retryMock = vi.fn();

      render(
        <DailyGoalCard
          goal={null}
          streakDays={0}
          isLoading={false}
          isError={true}
          onRetry={retryMock}
        />,
      );

      expect(
        screen.getByText(/unable to load your learning data/i),
      ).toBeInTheDocument();
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      expect(retryMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('QuickActions Navigation', () => {
    it('renders navigation links to all key learning modules', () => {
      const { container } = render(
        <MemoryRouter>
          <QuickActions />
        </MemoryRouter>,
      );

      expect(screen.getByRole('heading', { name: /start learning/i })).toBeInTheDocument();

      expect(container.querySelector('#quick-action-vocabulary')).toHaveAttribute('href', '/vocabulary');
      expect(container.querySelector('#quick-action-grammar')).toHaveAttribute('href', '/grammar');
      expect(container.querySelector('#quick-action-listening')).toHaveAttribute('href', '/listening');
      expect(container.querySelector('#quick-action-reading')).toHaveAttribute('href', '/reading');
      expect(container.querySelector('#quick-action-quizzes')).toHaveAttribute('href', '/quizzes');
      expect(container.querySelector('#quick-action-progress')).toHaveAttribute('href', '/progress');
    });
  });
});

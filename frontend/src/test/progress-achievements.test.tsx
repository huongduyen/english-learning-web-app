import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressOverviewCards } from '../components/progress/ProgressOverviewCards';
import { AchievementsSection } from '../components/progress/AchievementsSection';
import { ProgressOverview } from '../types/progress';
import { AchievementItem } from '../types/achievements';

describe('Progress & Achievements Component Tests', () => {
  const mockOverview: ProgressOverview = {
    totalLearningTimeFormatted: '1h 45m',
    totalLearningTimeMinutes: 105,
    wordsLearned: 42,
    wordsMastered: 18,
    lessonsCompleted: 8,
    averageQuizScore: 88,
    currentStreak: 4,
    longestStreak: 7,
  };

  const mockAchievements: AchievementItem[] = [
    {
      id: 'ach-1',
      code: 'FIRST_LESSON',
      title: 'First Lesson',
      titleVi: 'Bài Học Đầu Tiên',
      description: 'Complete your first lesson.',
      descriptionVi: 'Hoàn thành bài học đầu tiên.',
      icon: 'sparkles',
      points: 25,
      unlocked: true,
      progress: 100,
      unlockedAt: '2026-10-09T00:00:00.000Z',
    },
    {
      id: 'ach-2',
      code: 'VOCAB_50_WORDS',
      title: 'Word Explorer (50 Words)',
      titleVi: 'Nhà Thám Hiểm Từ Vựng',
      description: 'Learn 50 vocabulary words.',
      descriptionVi: 'Học 50 từ vựng.',
      icon: 'book-open',
      points: 50,
      unlocked: false,
      progress: 84, // 42/50 = 84%
      unlockedAt: null,
    },
  ];

  describe('ProgressOverviewCards', () => {
    it('renders all 6 metric cards with correct data', () => {
      render(<ProgressOverviewCards overview={mockOverview} />);

      expect(screen.getByText('Study Time')).toBeInTheDocument();
      expect(screen.getByText('1h 45m')).toBeInTheDocument();
      expect(screen.getByText('105 total mins')).toBeInTheDocument();

      expect(screen.getByText('Words Learned')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('18 mastered')).toBeInTheDocument();

      expect(screen.getByText('Lessons Done')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();

      expect(screen.getByText('Avg Quiz Score')).toBeInTheDocument();
      expect(screen.getByText('88%')).toBeInTheDocument();

      expect(screen.getByText('Current Streak')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();

      expect(screen.getByText('Longest Streak')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
    });
  });

  describe('AchievementsSection', () => {
    it('renders header, unlocked count, points, and achievement items', () => {
      render(<AchievementsSection achievements={mockAchievements} />);

      expect(screen.getByText('Achievements & Badges')).toBeInTheDocument();
      expect(screen.getByText(/1 \/ 2 Unlocked/i)).toBeInTheDocument();
      expect(screen.getByText(/25 \/ 75 XP/i)).toBeInTheDocument();

      expect(screen.getByText('First Lesson')).toBeInTheDocument();
      expect(screen.getByText('Word Explorer (50 Words)')).toBeInTheDocument();
    });

    it('filters achievements by unlocked status', async () => {
      const user = userEvent.setup();
      render(<AchievementsSection achievements={mockAchievements} />);

      // Filter by Unlocked
      const unlockedFilterBtn = screen.getByRole('button', { name: /unlocked \(1\)/i });
      await user.click(unlockedFilterBtn);

      expect(screen.getByText('First Lesson')).toBeInTheDocument();
      expect(screen.queryByText('Word Explorer (50 Words)')).not.toBeInTheDocument();

      // Filter by In Progress
      const inProgressFilterBtn = screen.getByRole('button', { name: /in progress \(1\)/i });
      await user.click(inProgressFilterBtn);

      expect(screen.queryByText('First Lesson')).not.toBeInTheDocument();
      expect(screen.getByText('Word Explorer (50 Words)')).toBeInTheDocument();
    });
  });
});

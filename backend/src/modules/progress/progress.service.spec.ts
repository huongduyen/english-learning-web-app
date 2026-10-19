import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AchievementsService } from '../achievements/achievements.service';
import { DailyGoalsService } from '../daily-goals/daily-goals.service';
import { ActivityType, VocabularyStatus } from '@prisma/client';

describe('ProgressService', () => {
  let service: ProgressService;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'learner@example.com',
    name: 'Learner',
    profile: {
      id: 'profile-uuid-1',
      userId: 'user-uuid-1',
      totalXp: 120,
      streakDays: 3,
      longestStreakDays: 5,
      dailyGoalMinutes: 15,
    },
  };

  const mockPrismaService = {
    learningActivity: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      count: jest.fn().mockResolvedValue(10),
      aggregate: jest.fn().mockResolvedValue({ _sum: { durationMinutes: 60 } }),
    },
    dailyGoal: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    userProfile: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    vocabulary: {
      count: jest.fn().mockResolvedValue(100),
    },
    userVocabulary: {
      groupBy: jest.fn(),
      count: jest.fn().mockResolvedValue(5),
    },
    quizAttempt: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(3),
      aggregate: jest
        .fn()
        .mockResolvedValue({ _avg: { percentage: 85 }, _max: { percentage: 100 } }),
    },
    grammarLesson: {
      count: jest.fn().mockResolvedValue(10),
      findMany: jest.fn().mockResolvedValue([]),
    },
    listeningLesson: {
      count: jest.fn().mockResolvedValue(10),
      findMany: jest.fn().mockResolvedValue([]),
    },
    readingArticle: {
      count: jest.fn().mockResolvedValue(10),
      findMany: jest.fn().mockResolvedValue([]),
    },
    conversation: {
      count: jest.fn().mockResolvedValue(0),
    },
    achievement: {
      count: jest.fn().mockResolvedValue(10),
    },
    userAchievement: {
      count: jest.fn().mockResolvedValue(2),
    },
  };

  const mockAchievementsService = {
    checkAndUnlockAchievements: jest.fn().mockResolvedValue([]),
  };

  const mockDailyGoalsService = {
    recordActivity: jest.fn().mockResolvedValue({}),
    getTodayGoal: jest.fn().mockResolvedValue({
      id: 'goal-1',
      targetMinutes: 15,
      actualMinutes: 5,
      targetWords: 5,
      actualWords: 2,
      completed: false,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AchievementsService, useValue: mockAchievementsService },
        { provide: DailyGoalsService, useValue: mockDailyGoalsService },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateStreak', () => {
    it('should return stored streaks when user has no logged activities or goals', async () => {
      mockPrismaService.learningActivity.findMany.mockResolvedValue([]);
      mockPrismaService.dailyGoal.findMany.mockResolvedValue([]);
      mockPrismaService.userProfile.findUnique.mockResolvedValue(mockUser.profile);

      const result = await service.calculateStreak('user-uuid-1');

      expect(result.currentStreak).toBe(3);
      expect(result.longestStreak).toBe(5);
    });

    it('should compute streak based on consecutive dates', async () => {
      mockPrismaService.learningActivity.findMany.mockResolvedValue([
        { createdAt: new Date() },
      ]);
      mockPrismaService.dailyGoal.findMany.mockResolvedValue([
        { date: new Date(), createdAt: new Date() },
      ]);
      mockPrismaService.userProfile.findUnique.mockResolvedValue({
        streakDays: 0,
        longestStreakDays: 0,
      });
      mockPrismaService.userProfile.update.mockResolvedValue({});

      const result = await service.calculateStreak('user-uuid-1');

      expect(result.currentStreak).toBeGreaterThanOrEqual(1);
    });
  });

  describe('logActivity', () => {
    it('should create activity, update daily goal, award XP, and evaluate achievements', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.learningActivity.create.mockResolvedValue({
        id: 'activity-1',
        type: ActivityType.VOCABULARY,
        durationMinutes: 5,
      });
      mockPrismaService.userProfile.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.learningActivity.findMany.mockResolvedValue([]);
      mockPrismaService.dailyGoal.findMany.mockResolvedValue([]);
      mockPrismaService.userProfile.findUnique.mockResolvedValue(mockUser.profile);

      const result = await service.logActivity('user-uuid-1', {
        type: ActivityType.VOCABULARY,
        durationMinutes: 5,
        wordsLearned: 3,
      });

      expect(result.activity).toBeDefined();
      expect(mockPrismaService.learningActivity.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-uuid-1',
          type: ActivityType.VOCABULARY,
          durationMinutes: 5,
        }),
      });
      expect(mockDailyGoalsService.recordActivity).toHaveBeenCalledWith('user-uuid-1', {
        minutes: 5,
        words: 3,
      });
      expect(mockPrismaService.userProfile.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1' },
        data: { totalXp: { increment: 10 } },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.logActivity('invalid-id', {
          type: ActivityType.GRAMMAR,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getWeeklyActivity', () => {
    it('should return 7 days breakdown ending today', async () => {
      mockPrismaService.learningActivity.findMany.mockResolvedValue([]);
      mockPrismaService.dailyGoal.findMany.mockResolvedValue([]);
      mockPrismaService.userProfile.findUnique.mockResolvedValue(mockUser.profile);

      const weekly = await service.getWeeklyActivity('user-uuid-1');

      expect(Array.isArray(weekly)).toBe(true);
      expect(weekly.length).toBe(7);
      expect(weekly[weekly.length - 1].isToday).toBe(true);
      expect(weekly[0]).toHaveProperty('minutes');
      expect(weekly[0]).toHaveProperty('goalMinutes', 15);
    });
  });

  describe('getUserProgress', () => {
    it('should return complete user progress overview', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.learningActivity.findMany.mockResolvedValue([]);
      mockPrismaService.dailyGoal.findMany.mockResolvedValue([]);
      mockPrismaService.userProfile.findUnique.mockResolvedValue(mockUser.profile);
      mockPrismaService.vocabulary.count.mockResolvedValue(100);
      mockPrismaService.userVocabulary.groupBy.mockResolvedValue([
        { status: VocabularyStatus.LEARNING, _count: { status: 10 } },
        { status: VocabularyStatus.MASTERED, _count: { status: 5 } },
      ]);
      mockPrismaService.userVocabulary.count.mockResolvedValue(5);
      mockPrismaService.quizAttempt.count.mockResolvedValue(3);
      mockPrismaService.quizAttempt.findMany.mockResolvedValue([
        { percentage: 80, passed: true },
      ]);
      mockPrismaService.grammarLesson.count.mockResolvedValue(10);
      mockPrismaService.listeningLesson.count.mockResolvedValue(10);
      mockPrismaService.readingArticle.count.mockResolvedValue(10);

      const progress = await service.getUserProgress('user-uuid-1');

      expect(progress).toHaveProperty('user');
      expect(progress).toHaveProperty('vocabulary');
      expect(progress.user.id).toBe('user-uuid-1');
      expect(progress.vocabulary.mastered).toBe(5);
      expect(progress.vocabulary.totalAvailable).toBe(100);
    });
  });
});

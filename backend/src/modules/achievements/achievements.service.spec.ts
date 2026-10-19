import { Test, TestingModule } from '@nestjs/testing';
import { AchievementsService } from './achievements.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AchievementsService', () => {
  let service: AchievementsService;

  const mockAchievement = {
    id: 'ach-1',
    code: 'FIRST_LESSON',
    title: 'First Lesson',
    titleVi: 'Bài Học Đầu Tiên',
    description: 'Complete your first lesson',
    descriptionVi: 'Hoàn thành bài học đầu tiên',
    icon: 'sparkles',
    points: 25,
  };

  const mockPrismaService = {
    achievement: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    userAchievement: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    userVocabulary: {
      count: jest.fn(),
    },
    quizAttempt: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    learningActivity: {
      count: jest.fn(),
      findMany: jest.fn().mockResolvedValue([{ referenceId: 'lesson-1' }]),
    },
    conversation: {
      count: jest.fn().mockResolvedValue(0),
    },
    userProfile: {
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AchievementsService>(AchievementsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return achievements with user progress and unlocked status', async () => {
      mockPrismaService.achievement.findMany.mockResolvedValue([mockAchievement]);
      mockPrismaService.userAchievement.findMany.mockResolvedValue([
        {
          achievementId: 'ach-1',
          progress: 100,
          unlockedAt: new Date(),
        },
      ]);
      // Mock for checkAndUnlockAchievements call inside findAll
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        profile: { streakDays: 2 },
      });
      mockPrismaService.learningActivity.count.mockResolvedValue(1);
      mockPrismaService.userVocabulary.count.mockResolvedValue(5);
      mockPrismaService.quizAttempt.count.mockResolvedValue(1);
      mockPrismaService.quizAttempt.findMany.mockResolvedValue([]);
      mockPrismaService.conversation.count.mockResolvedValue(0);

      const result = await service.findAll('user-uuid-1');

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].code).toBe('FIRST_LESSON');
      expect(result[0].unlocked).toBe(true);
      expect(result[0].progress).toBe(100);
    });
  });

  describe('checkAndUnlockAchievements', () => {
    it('should evaluate user activity and unlock FIRST_LESSON achievement', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        profile: { streakDays: 1 },
      });
      mockPrismaService.userVocabulary.count.mockResolvedValue(10);
      mockPrismaService.quizAttempt.count.mockResolvedValue(1);
      mockPrismaService.quizAttempt.findMany.mockResolvedValue([]);
      mockPrismaService.learningActivity.count.mockResolvedValue(1);
      mockPrismaService.conversation.count.mockResolvedValue(0);

      mockPrismaService.achievement.findMany.mockResolvedValue([mockAchievement]);
      mockPrismaService.userAchievement.findMany.mockResolvedValue([]); // not unlocked yet
      mockPrismaService.userAchievement.upsert.mockResolvedValue({});
      mockPrismaService.userProfile.updateMany.mockResolvedValue({ count: 1 });

      const unlocked = await service.checkAndUnlockAchievements('user-uuid-1');

      expect(Array.isArray(unlocked)).toBe(true);
      const firstLesson = unlocked.find((u) => u.code === 'FIRST_LESSON');
      expect(firstLesson).toBeDefined();
      expect(firstLesson?.newlyUnlocked).toBe(true);
      expect(mockPrismaService.userProfile.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1' },
        data: { totalXp: { increment: mockAchievement.points } },
      });
    });
  });
});

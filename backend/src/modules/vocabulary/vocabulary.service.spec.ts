import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AchievementsService } from '../achievements/achievements.service';
import { DailyGoalsService } from '../daily-goals/daily-goals.service';
import { VocabularyStatus, Difficulty, EnglishLevel } from '@prisma/client';

describe('VocabularyService', () => {
  let service: VocabularyService;

  const mockVocab = {
    id: 'vocab-uuid-1',
    word: 'resilient',
    meaning: 'able to withstand or recover quickly from difficult conditions',
    meaningVi: 'kiên cường, có khả năng phục hồi nhanh',
    phonetic: '/rɪˈzɪl.jənt/',
    partOfSpeech: 'adjective',
    difficulty: Difficulty.MEDIUM,
    topicId: 'topic-uuid-1',
    topic: {
      id: 'topic-uuid-1',
      slug: 'personality',
      title: 'Personality & Traits',
      titleVi: 'Tính cách & Phẩm chất',
      level: EnglishLevel.INTERMEDIATE,
    },
  };

  const mockUserVocab = {
    userId: 'user-uuid-1',
    vocabularyId: 'vocab-uuid-1',
    status: VocabularyStatus.LEARNING,
    reviewCount: 2,
    masteryScore: 40,
    isFavorite: false,
    lastReviewedAt: new Date(),
    nextReviewAt: new Date(),
  };

  const mockPrismaService = {
    vocabulary: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    vocabularyTopic: {
      findMany: jest.fn(),
    },
    userVocabulary: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    learningActivity: {
      create: jest.fn(),
    },
    userProfile: {
      updateMany: jest.fn(),
    },
  };

  const mockAchievementsService = {
    checkAndUnlockAchievements: jest.fn().mockResolvedValue([]),
  };

  const mockDailyGoalsService = {
    recordActivity: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VocabularyService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AchievementsService, useValue: mockAchievementsService },
        { provide: DailyGoalsService, useValue: mockDailyGoalsService },
      ],
    }).compile();

    service = module.get<VocabularyService>(VocabularyService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated vocabulary with user progress when userId is provided', async () => {
      mockPrismaService.vocabulary.count.mockResolvedValue(1);
      mockPrismaService.vocabulary.findMany.mockResolvedValue([mockVocab]);
      mockPrismaService.userVocabulary.findMany.mockResolvedValue([mockUserVocab]);

      const result = await service.findAll({ page: 1, limit: 10 }, 'user-uuid-1');

      expect(result.data.length).toBe(1);
      expect(result.data[0].word).toBe('resilient');
      expect(result.data[0].userProgress).toBeDefined();
      expect(result.data[0].userProgress.status).toBe(VocabularyStatus.LEARNING);
      expect(result.pagination.total).toBe(1);
    });

    it('should return vocabulary with null userProgress when userId is not provided', async () => {
      mockPrismaService.vocabulary.count.mockResolvedValue(1);
      mockPrismaService.vocabulary.findMany.mockResolvedValue([mockVocab]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data[0].userProgress).toBeNull();
      expect(mockPrismaService.userVocabulary.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findTopics', () => {
    it('should return topics list with vocabulary count', async () => {
      mockPrismaService.vocabularyTopic.findMany.mockResolvedValue([
        {
          id: 'topic-uuid-1',
          slug: 'personality',
          title: 'Personality',
          titleVi: 'Tính cách',
          description: 'Personality vocab',
          thumbnail: 'thumb.jpg',
          level: EnglishLevel.INTERMEDIATE,
          order: 1,
          _count: { vocabularies: 15 },
        },
      ]);

      const result = await service.findTopics();

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].vocabularyCount).toBe(15);
      expect(result[0].slug).toBe('personality');
    });
  });

  describe('findOne', () => {
    it('should return vocabulary details and attach user progress', async () => {
      mockPrismaService.vocabulary.findUnique.mockResolvedValue(mockVocab);
      mockPrismaService.userVocabulary.findUnique.mockResolvedValue(mockUserVocab);

      const result = await service.findOne('vocab-uuid-1', 'user-uuid-1');

      expect(result.id).toBe('vocab-uuid-1');
      expect(result.userProgress?.status).toBe(VocabularyStatus.LEARNING);
    });

    it('should throw NotFoundException if vocabulary does not exist', async () => {
      mockPrismaService.vocabulary.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('learn', () => {
    it('should mark vocabulary as learning, award XP, and trigger goal/achievements', async () => {
      mockPrismaService.vocabulary.findUnique.mockResolvedValue(mockVocab);
      mockPrismaService.userVocabulary.upsert.mockResolvedValue({
        ...mockUserVocab,
        status: VocabularyStatus.LEARNING,
      });

      const result = await service.learn('vocab-uuid-1', 'user-uuid-1');

      expect(result.status).toBe(VocabularyStatus.LEARNING);
      expect(mockPrismaService.learningActivity.create).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.userProfile.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1' },
        data: { totalXp: { increment: 5 } },
      });
      expect(mockDailyGoalsService.recordActivity).toHaveBeenCalledWith('user-uuid-1', {
        minutes: 2,
        words: 1,
      });
      expect(mockAchievementsService.checkAndUnlockAchievements).toHaveBeenCalledWith(
        'user-uuid-1',
      );
    });

    it('should throw NotFoundException if learning non-existent vocabulary', async () => {
      mockPrismaService.vocabulary.findUnique.mockResolvedValue(null);

      await expect(service.learn('invalid-id', 'user-uuid-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('review', () => {
    it('should increase masteryScore and set MASTERED when score reaches 80', async () => {
      mockPrismaService.vocabulary.findUnique.mockResolvedValue(mockVocab);
      mockPrismaService.userVocabulary.findUnique.mockResolvedValue({
        ...mockUserVocab,
        masteryScore: 70,
        reviewCount: 3,
      });
      mockPrismaService.userVocabulary.upsert.mockResolvedValue({
        ...mockUserVocab,
        masteryScore: 85,
        status: VocabularyStatus.MASTERED,
      });

      const result = await service.review('vocab-uuid-1', 'user-uuid-1', {
        isCorrect: true,
        rating: 3,
      });

      expect(result.status).toBe(VocabularyStatus.MASTERED);
      expect(mockPrismaService.userVocabulary.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            status: VocabularyStatus.MASTERED,
            masteryScore: 85,
          }),
        }),
      );
      expect(mockPrismaService.userProfile.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1' },
        data: { totalXp: { increment: 10 } },
      });
    });

    it('should decrease masteryScore when answer is incorrect and not award XP', async () => {
      mockPrismaService.vocabulary.findUnique.mockResolvedValue(mockVocab);
      mockPrismaService.userVocabulary.findUnique.mockResolvedValue({
        ...mockUserVocab,
        masteryScore: 40,
      });
      mockPrismaService.userVocabulary.upsert.mockResolvedValue({
        ...mockUserVocab,
        masteryScore: 30,
        status: VocabularyStatus.REVIEWING,
      });

      await service.review('vocab-uuid-1', 'user-uuid-1', {
        isCorrect: false,
      });

      expect(mockPrismaService.userVocabulary.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            masteryScore: 30,
            status: VocabularyStatus.REVIEWING,
          }),
        }),
      );
      expect(mockPrismaService.userProfile.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite status from false to true', async () => {
      mockPrismaService.vocabulary.findUnique.mockResolvedValue(mockVocab);
      mockPrismaService.userVocabulary.findUnique.mockResolvedValue({
        ...mockUserVocab,
        isFavorite: false,
      });
      mockPrismaService.userVocabulary.upsert.mockResolvedValue({
        ...mockUserVocab,
        isFavorite: true,
      });

      const result = await service.toggleFavorite('vocab-uuid-1', 'user-uuid-1');

      expect(result.isFavorite).toBe(true);
      expect(mockPrismaService.userVocabulary.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: { isFavorite: true },
        }),
      );
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GrammarService } from './grammar.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AchievementsService } from '../achievements/achievements.service';
import { DailyGoalsService } from '../daily-goals/daily-goals.service';
import { EnglishLevel, QuestionType } from '@prisma/client';

describe('GrammarService', () => {
  let service: GrammarService;

  const mockLesson = {
    id: 'b8c8d8e8-0001-4000-8000-000000000001',
    slug: 'present-simple-tense',
    title: 'Present Simple Tense',
    titleVi: 'Thì Hiện Tại Đơn',
    category: 'Tenses',
    categoryVi: 'Các Thì Trong Tiếng Anh',
    summary: 'Master habits, routines, and universal truths.',
    level: EnglishLevel.BEGINNER,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { exercises: 2 },
    quiz: { id: 'quiz-1', title: 'Quiz 1', timeLimit: 10, passingScore: 70 },
    exercises: [
      {
        id: 'ex-1',
        lessonId: 'b8c8d8e8-0001-4000-8000-000000000001',
        instruction: 'Choose the correct form',
        question: 'He (play / plays) soccer every Sunday.',
        questionType: QuestionType.MULTIPLE_CHOICE,
        correctAnswer: 'plays',
        explanation: 'Third person singular takes -s.',
        explanationVi: 'Ngôi thứ 3 số ít thêm -s.',
        order: 1,
      },
      {
        id: 'ex-2',
        lessonId: 'b8c8d8e8-0001-4000-8000-000000000001',
        instruction: 'Fill in the blank',
        question: 'Water ___ at 100 degrees Celsius.',
        questionType: QuestionType.FILL_BLANK,
        correctAnswer: 'boils | is boiling',
        explanation: 'Universal truth uses present simple.',
        explanationVi: 'Sự thật hiển nhiên dùng hiện tại đơn.',
        order: 2,
      },
    ],
  };

  const mockPrismaService = {
    grammarLesson: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      groupBy: jest.fn(),
    },
    grammarExercise: {
      findMany: jest.fn(),
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
        GrammarService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AchievementsService, useValue: mockAchievementsService },
        { provide: DailyGoalsService, useValue: mockDailyGoalsService },
      ],
    }).compile();

    service = module.get<GrammarService>(GrammarService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated grammar lessons with exerciseCount', async () => {
      mockPrismaService.grammarLesson.count.mockResolvedValue(1);
      mockPrismaService.grammarLesson.findMany.mockResolvedValue([mockLesson]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data.length).toBe(1);
      expect(result.data[0].slug).toBe('present-simple-tense');
      expect(result.data[0].exerciseCount).toBe(2);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getCategories', () => {
    it('should aggregate lesson counts across standard grammar categories', async () => {
      mockPrismaService.grammarLesson.groupBy.mockResolvedValue([
        { category: 'Tenses', _count: { id: 3 } },
      ]);

      const categories = await service.getCategories();

      expect(Array.isArray(categories)).toBe(true);
      const tenses = categories.find((c) => c.slug === 'tenses');
      expect(tenses).toBeDefined();
      expect(tenses?.lessonCount).toBe(3);
    });
  });

  describe('findOne', () => {
    it('should find grammar lesson by UUID or slug', async () => {
      mockPrismaService.grammarLesson.findFirst.mockResolvedValue(mockLesson);

      const result = await service.findOne('present-simple-tense');

      expect(result.slug).toBe('present-simple-tense');
      expect(result.exercises.length).toBe(2);
    });

    it('should throw NotFoundException if lesson does not exist', async () => {
      mockPrismaService.grammarLesson.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent-slug')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('submitExercises', () => {
    it('should grade answers, handle pipe alternatives, award XP, and record learning activity', async () => {
      mockPrismaService.grammarLesson.findFirst.mockResolvedValue(mockLesson);
      mockPrismaService.grammarExercise.findMany.mockResolvedValue(mockLesson.exercises);
      mockPrismaService.learningActivity.create.mockResolvedValue({});
      mockPrismaService.userProfile.updateMany.mockResolvedValue({ count: 1 });

      const dto = {
        answers: [
          { exerciseId: 'ex-1', answer: 'plays' },
          { exerciseId: 'ex-2', answer: 'boils' },
        ],
      };

      const result = await service.submitExercises(mockLesson.id, 'user-uuid-1', dto);

      expect(result.correctCount).toBe(2);
      expect(result.percentage).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.xpAwarded).toBe(25);
      expect(mockPrismaService.learningActivity.create).toHaveBeenCalledTimes(1);
      expect(mockDailyGoalsService.recordActivity).toHaveBeenCalledWith('user-uuid-1', {
        minutes: 5,
      });
      expect(mockAchievementsService.checkAndUnlockAchievements).toHaveBeenCalledWith(
        'user-uuid-1',
      );
    });

    it('should throw NotFoundException if lesson has no exercises', async () => {
      mockPrismaService.grammarLesson.findFirst.mockResolvedValue(mockLesson);
      mockPrismaService.grammarExercise.findMany.mockResolvedValue([]);

      await expect(
        service.submitExercises(mockLesson.id, 'user-uuid-1', { answers: [] }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AchievementsService } from '../achievements/achievements.service';
import { DailyGoalsService } from '../daily-goals/daily-goals.service';
import { EnglishLevel, Difficulty, QuestionType } from '@prisma/client';

describe('QuizService', () => {
  let service: QuizService;

  const mockQuiz = {
    id: 'quiz-uuid-1',
    title: 'Comprehensive English Quiz',
    description: 'Testing grammar and vocabulary',
    level: EnglishLevel.INTERMEDIATE,
    difficulty: Difficulty.MEDIUM,
    timeLimit: 10,
    passingScore: 70,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { questions: 4, attempts: 2 },
    listeningLesson: null,
    readingArticle: null,
    grammarLesson: null,
    questions: [
      {
        id: 'q1',
        prompt: 'Choose the correct synonym for "rapid"',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { id: 'opt_a', text: 'Quick' },
          { id: 'opt_b', text: 'Slow' },
        ],
        correctAnswer: 'opt_a',
        order: 1,
        points: 25,
        explanation: 'Quick is synonymous with rapid.',
        explanationVi: 'Quick đồng nghĩa với rapid.',
      },
      {
        id: 'q2',
        prompt: 'Fill in the blank: She ___ to school yesterday.',
        questionType: QuestionType.FILL_BLANK,
        options: null,
        correctAnswer: 'went | has walked',
        order: 2,
        points: 25,
        explanation: 'Past simple is required.',
        explanationVi: 'Cần thì quá khứ đơn.',
      },
      {
        id: 'q3',
        prompt: 'Reorder words: is / she / doctor / a',
        questionType: QuestionType.SENTENCE_ORDERING,
        options: null,
        correctAnswer: 'she is a doctor.',
        order: 3,
        points: 25,
        explanation: 'Subject + Verb + Object',
        explanationVi: 'Chủ ngữ + Động từ + Vị ngữ',
      },
      {
        id: 'q4',
        prompt: 'Match words: 1:big, 2:small with a:large, b:tiny',
        questionType: QuestionType.MATCHING,
        options: null,
        correctAnswer: '1:a, 2:b',
        order: 4,
        points: 25,
        explanation: 'Big matches large, small matches tiny.',
        explanationVi: 'Big đi với large, small đi với tiny.',
      },
    ],
  };

  const mockPrismaService = {
    quiz: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    quizAttempt: {
      create: jest.fn(),
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
        QuizService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AchievementsService, useValue: mockAchievementsService },
        { provide: DailyGoalsService, useValue: mockDailyGoalsService },
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated quizzes list with metadata', async () => {
      mockPrismaService.quiz.count.mockResolvedValue(1);
      mockPrismaService.quiz.findMany.mockResolvedValue([mockQuiz]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe('quiz-uuid-1');
      expect(result.data[0].questionCount).toBe(4);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return quiz with questions', async () => {
      mockPrismaService.quiz.findUnique.mockResolvedValue(mockQuiz);

      const result = await service.findOne('quiz-uuid-1');

      expect(result.id).toBe('quiz-uuid-1');
      expect(result.questions.length).toBe(4);
    });

    it('should throw NotFoundException if quiz does not exist', async () => {
      mockPrismaService.quiz.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-quiz-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('submit', () => {
    it('should accurately grade multiple choice, fill in the blank alternatives, sentence ordering, and matching', async () => {
      mockPrismaService.quiz.findUnique.mockResolvedValue(mockQuiz);
      mockPrismaService.quizAttempt.create.mockResolvedValue({
        id: 'attempt-uuid-1',
        completedAt: new Date(),
      });
      mockPrismaService.learningActivity.create.mockResolvedValue({});
      mockPrismaService.userProfile.updateMany.mockResolvedValue({ count: 1 });

      const submission = {
        answers: [
          // 1. Multiple choice matched by option text or ID
          { questionId: 'q1', answer: 'Quick' },
          // 2. Fill in the blank alternative
          { questionId: 'q2', answer: 'went' },
          // 3. Sentence ordering with different casing and punctuation
          { questionId: 'q3', answer: 'She is a doctor' },
          // 4. Matching with reverse order of pairs
          { questionId: 'q4', answer: '2:b, 1:a' },
        ],
      };

      const result = await service.submit('quiz-uuid-1', 'user-uuid-1', submission);

      expect(result.score).toBe(100);
      expect(result.percentage).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.correctCount).toBe(4);
      expect(result.incorrectCount).toBe(0);
      expect(result.xpAwarded).toBe(30); // Passed award is 30 XP

      expect(mockPrismaService.quizAttempt.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            score: 100,
            percentage: 100,
            passed: true,
          }),
        }),
      );
      expect(mockDailyGoalsService.recordActivity).toHaveBeenCalledWith('user-uuid-1', {
        minutes: 10,
      });
      expect(mockAchievementsService.checkAndUnlockAchievements).toHaveBeenCalledWith(
        'user-uuid-1',
      );
    });

    it('should mark failed when score is below passingScore and award partial XP', async () => {
      mockPrismaService.quiz.findUnique.mockResolvedValue(mockQuiz);
      mockPrismaService.quizAttempt.create.mockResolvedValue({
        id: 'attempt-uuid-2',
        completedAt: new Date(),
      });
      mockPrismaService.learningActivity.create.mockResolvedValue({});
      mockPrismaService.userProfile.updateMany.mockResolvedValue({ count: 1 });

      const submission = {
        answers: [
          { questionId: 'q1', answer: 'Wrong' },
          { questionId: 'q2', answer: 'Wrong' },
          { questionId: 'q3', answer: 'Wrong' },
          { questionId: 'q4', answer: 'Wrong' },
        ],
      };

      const result = await service.submit('quiz-uuid-1', 'user-uuid-1', submission);

      expect(result.score).toBe(0);
      expect(result.percentage).toBe(0);
      expect(result.passed).toBe(false);
      expect(result.correctCount).toBe(0);
      expect(result.incorrectCount).toBe(4);
      expect(result.xpAwarded).toBe(10); // Failed attempt award is 10 XP
    });

    it('should throw NotFoundException if submitting to non-existent quiz', async () => {
      mockPrismaService.quiz.findUnique.mockResolvedValue(null);

      await expect(
        service.submit('invalid-id', 'user-uuid-1', { answers: [] }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

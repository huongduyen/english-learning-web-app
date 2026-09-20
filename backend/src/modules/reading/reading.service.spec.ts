import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ReadingService } from './reading.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EnglishLevel, Difficulty, QuestionType } from '@prisma/client';

describe('ReadingService', () => {
  let service: ReadingService;

  const mockArticle = {
    id: '22222222-2222-2222-2222-222222222222',
    slug: 'benefits-of-bilingualism',
    title: 'The Cognitive Benefits of Learning a Second Language',
    titleVi: 'Lợi ích nhận thức khi học ngôn ngữ thứ hai',
    summary: 'Exploring how mastering an additional language boosts memory.',
    topic: 'Health & Brain',
    difficulty: Difficulty.MEDIUM,
    readingTime: 6,
    level: EnglishLevel.INTERMEDIATE,
    content: '# Cognitive Benefits\n\nLearning a second language rewires the brain.',
    contentVi: '# Lợi ích nhận thức\n\nHọc ngôn ngữ thứ hai giúp tái cấu trúc bộ não.',
    createdAt: new Date(),
    updatedAt: new Date(),
    quiz: {
      id: 'quiz-uuid-2',
      title: 'Reading Comprehension: Bilingual Brain',
      passingScore: 70,
      timeLimit: 12,
      difficulty: Difficulty.MEDIUM,
      _count: { questions: 2 },
      questions: [
        {
          id: 'rq1',
          prompt: 'What cognitive skill is strengthened by managing two languages?',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: [
            { id: 'a', text: 'Executive function' },
            { id: 'b', text: 'Peripheral vision' },
          ],
          correctAnswer: 'a',
          order: 1,
          points: 50,
          explanation: 'Bilingualism strengthens executive function.',
          explanationVi: 'Song ngữ tăng cường chức năng điều hành.',
        },
        {
          id: 'rq2',
          prompt: 'Bilingual individuals delay Alzheimer symptoms by 4 to 5 years.',
          questionType: QuestionType.TRUE_FALSE,
          options: [
            { id: 'true', text: 'True' },
            { id: 'false', text: 'False' },
          ],
          correctAnswer: 'true',
          order: 2,
          points: 50,
          explanation: 'Studies showed symptoms appeared 4-5 years later.',
          explanationVi:
            'Các nghiên cứu cho thấy triệu chứng xuất hiện muộn hơn 4-5 năm.',
        },
      ],
      attempts: [],
    },
  };

  const mockPrismaService = {
    readingArticle: {
      count: jest.fn().mockResolvedValue(1),
      findMany: jest.fn().mockResolvedValue([mockArticle]),
      findFirst: jest.fn(),
    },
    quizAttempt: {
      create: jest.fn().mockResolvedValue({
        id: 'attempt-uuid-2',
        completedAt: new Date(),
      }),
    },
    learningActivity: {
      create: jest.fn().mockResolvedValue({ id: 'activity-uuid-2' }),
    },
    userProfile: {
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadingService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ReadingService>(ReadingService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated reading articles with estimatedReadingTime', async () => {
      mockPrismaService.readingArticle.count.mockResolvedValue(1);
      mockPrismaService.readingArticle.findMany.mockResolvedValue([mockArticle]);

      const result = await service.findAll({ page: 1, limit: 10 }, 'user-uuid-123');

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data.length).toBe(1);
      expect(result.data[0].title).toBe(mockArticle.title);
      expect(result.data[0].topic).toBe('Health & Brain');
      expect(result.data[0].difficulty).toBe(Difficulty.MEDIUM);
      expect(result.data[0].readingTime).toBe(6);
      expect(result.data[0].estimatedReadingTime).toBe(6);
      expect(result.data[0].isCompleted).toBe(false);
    });
  });

  describe('findOne', () => {
    it('should return article content and sanitized questions without exposing correctAnswer', async () => {
      mockPrismaService.readingArticle.findFirst.mockResolvedValue(mockArticle);

      const result = await service.findOne(mockArticle.id, 'user-uuid-123');

      expect(result.id).toBe(mockArticle.id);
      expect(result.content).toBe(mockArticle.content);
      expect(Array.isArray(result.questions)).toBe(true);
      expect(result.questions.length).toBe(2);

      const q = result.questions[0] as any;
      expect(q.prompt).toBe(
        'What cognitive skill is strengthened by managing two languages?',
      );
      expect(q.correctAnswer).toBeUndefined();
      expect(q.explanation).toBeUndefined();
    });

    it('should throw NotFoundException if article does not exist', async () => {
      mockPrismaService.readingArticle.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent-article')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('submit', () => {
    it('should accurately grade reading comprehension questions and record progress', async () => {
      mockPrismaService.readingArticle.findFirst.mockResolvedValue(mockArticle);

      const submissionDto = {
        answers: [
          { questionId: 'rq1', answer: 'a' },
          { questionId: 'rq2', answer: 'true' },
        ],
        durationSeconds: 180,
      };

      const result = await service.submit(mockArticle.id, 'user-uuid-123', submissionDto);

      expect(result.score).toBe(100);
      expect(result.percentage).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.correctCount).toBe(2);
      expect(result.incorrectCount).toBe(0);
      expect(result.breakdown[0].isCorrect).toBe(true);
      expect(result.breakdown[0].correctAnswer).toBe('a');

      expect(mockPrismaService.quizAttempt.create).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.learningActivity.create).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException if article has no quiz questions', async () => {
      mockPrismaService.readingArticle.findFirst.mockResolvedValue({
        ...mockArticle,
        quiz: null,
      });

      await expect(
        service.submit(mockArticle.id, 'user-uuid-123', {
          answers: [{ questionId: 'rq1', answer: 'a' }],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

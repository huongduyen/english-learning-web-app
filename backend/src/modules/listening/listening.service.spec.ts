import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ListeningService } from './listening.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EnglishLevel, Difficulty, QuestionType } from '@prisma/client';

describe('ListeningService', () => {
  let service: ListeningService;

  const mockLesson = {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'ordering-coffee-in-london',
    title: 'Ordering Coffee at a Busy Cafe',
    titleVi: 'Gọi cà phê tại quán nước London',
    description: 'Conversation at a cafe',
    topic: 'Daily Conversation',
    difficulty: Difficulty.EASY,
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
    duration: 145,
    level: EnglishLevel.BEGINNER,
    transcript: 'Barista: Hello! Customer: Large latte please.',
    transcriptVi: 'Nhân viên: Xin chào! Khách hàng: Cho 1 ly latte lớn.',
    createdAt: new Date(),
    updatedAt: new Date(),
    quiz: {
      id: 'quiz-uuid-1',
      title: 'Listening Check: At the London Cafe',
      passingScore: 70,
      timeLimit: 10,
      difficulty: Difficulty.EASY,
      _count: { questions: 2 },
      questions: [
        {
          id: 'q1',
          prompt: 'What drink did the customer order?',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: [
            { id: 'a', text: 'Tea' },
            { id: 'b', text: 'Latte' },
          ],
          correctAnswer: 'b',
          order: 1,
          points: 50,
          explanation: 'Customer asked for a large latte.',
          explanationVi: 'Khách hàng đã gọi latte.',
        },
        {
          prompt: 'The customer paid in cash.',
          id: 'q2',
          questionType: QuestionType.TRUE_FALSE,
          options: [
            { id: 'true', text: 'True' },
            { id: 'false', text: 'False' },
          ],
          correctAnswer: 'false',
          order: 2,
          points: 50,
          explanation: 'Customer paid by card.',
          explanationVi: 'Khách hàng thanh toán bằng thẻ.',
        },
      ],
      attempts: [],
    },
  };

  const mockPrismaService = {
    listeningLesson: {
      count: jest.fn().mockResolvedValue(1),
      findMany: jest.fn().mockResolvedValue([mockLesson]),
      findFirst: jest.fn(),
    },
    quizAttempt: {
      create: jest.fn().mockResolvedValue({
        id: 'attempt-uuid-1',
        completedAt: new Date(),
      }),
    },
    learningActivity: {
      create: jest.fn().mockResolvedValue({ id: 'activity-uuid-1' }),
    },
    userProfile: {
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListeningService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ListeningService>(ListeningService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated listening lessons with completion flags', async () => {
      mockPrismaService.listeningLesson.count.mockResolvedValue(1);
      mockPrismaService.listeningLesson.findMany.mockResolvedValue([mockLesson]);

      const result = await service.findAll({ page: 1, limit: 10 }, 'user-uuid-123');

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data.length).toBe(1);
      expect(result.data[0].title).toBe('Ordering Coffee at a Busy Cafe');
      expect(result.data[0].topic).toBe('Daily Conversation');
      expect(result.data[0].difficulty).toBe(Difficulty.EASY);
      expect(result.data[0].isCompleted).toBe(false);
    });
  });

  describe('findOne', () => {
    it('should return lesson details and sanitized questions without leaking correctAnswer', async () => {
      mockPrismaService.listeningLesson.findFirst.mockResolvedValue(mockLesson);

      const result = await service.findOne(mockLesson.id, 'user-uuid-123');

      expect(result.id).toBe(mockLesson.id);
      expect(result.audioUrl).toBe(mockLesson.audioUrl);
      expect(result.transcript).toBe(mockLesson.transcript);
      expect(Array.isArray(result.questions)).toBe(true);
      expect(result.questions.length).toBe(2);

      // Verify sanitized questions do NOT expose correctAnswer or explanation
      const firstQ = result.questions[0] as any;
      expect(firstQ.prompt).toBe('What drink did the customer order?');
      expect(firstQ.correctAnswer).toBeUndefined();
      expect(firstQ.explanation).toBeUndefined();
    });

    it('should throw NotFoundException if lesson does not exist', async () => {
      mockPrismaService.listeningLesson.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('submit', () => {
    it('should accurately grade answers, award XP, record attempt, and return breakdown with explanations', async () => {
      mockPrismaService.listeningLesson.findFirst.mockResolvedValue(mockLesson);

      const submissionDto = {
        answers: [
          { questionId: 'q1', answer: 'b' },
          { questionId: 'q2', answer: 'false' },
        ],
        durationSeconds: 90,
      };

      const result = await service.submit(mockLesson.id, 'user-uuid-123', submissionDto);

      expect(result.score).toBe(100);
      expect(result.maxScore).toBe(100);
      expect(result.percentage).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.correctCount).toBe(2);
      expect(result.incorrectCount).toBe(0);
      expect(result.breakdown[0].isCorrect).toBe(true);
      expect(result.breakdown[0].correctAnswer).toBe('b');
      expect(result.breakdown[0].explanation).toBe('Customer asked for a large latte.');

      expect(mockPrismaService.quizAttempt.create).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.learningActivity.create).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.userProfile.updateMany).toHaveBeenCalledTimes(1);
    });

    it('should handle partial or incorrect answers properly', async () => {
      mockPrismaService.listeningLesson.findFirst.mockResolvedValue(mockLesson);

      const submissionDto = {
        answers: [
          { questionId: 'q1', answer: 'a' }, // incorrect
          { questionId: 'q2', answer: 'false' }, // correct
        ],
      };

      const result = await service.submit(mockLesson.id, 'user-uuid-123', submissionDto);

      expect(result.score).toBe(50);
      expect(result.maxScore).toBe(100);
      expect(result.percentage).toBe(50);
      expect(result.passed).toBe(false); // passing score is 70
      expect(result.correctCount).toBe(1);
      expect(result.incorrectCount).toBe(1);
    });

    it('should throw BadRequestException if lesson has no questions to grade', async () => {
      mockPrismaService.listeningLesson.findFirst.mockResolvedValue({
        ...mockLesson,
        quiz: null,
      });

      await expect(
        service.submit(mockLesson.id, 'user-uuid-123', {
          answers: [{ questionId: 'q1', answer: 'a' }],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

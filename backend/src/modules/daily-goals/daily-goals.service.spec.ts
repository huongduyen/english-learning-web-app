import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DailyGoalsService } from './daily-goals.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('DailyGoalsService', () => {
  let service: DailyGoalsService;

  const mockGoal = {
    id: 'goal-uuid-1',
    userId: 'user-uuid-1',
    date: new Date('2026-10-10T00:00:00.000Z'),
    targetMinutes: 15,
    actualMinutes: 5,
    targetWords: 5,
    actualWords: 2,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    dailyGoal: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userProfile: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyGoalsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DailyGoalsService>(DailyGoalsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTodayGoal', () => {
    it('should return existing daily goal if found', async () => {
      mockPrismaService.dailyGoal.findUnique.mockResolvedValue(mockGoal);

      const result = await service.getTodayGoal('user-uuid-1');

      expect(result).toEqual(mockGoal);
      expect(mockPrismaService.dailyGoal.create).not.toHaveBeenCalled();
    });

    it('should create new daily goal with user profile defaults if not found', async () => {
      mockPrismaService.dailyGoal.findUnique.mockResolvedValue(null);
      mockPrismaService.userProfile.findUnique.mockResolvedValue({
        dailyGoalMinutes: 20,
      });
      mockPrismaService.dailyGoal.create.mockResolvedValue({
        ...mockGoal,
        targetMinutes: 20,
      });

      const result = await service.getTodayGoal('user-uuid-1');

      expect(result.targetMinutes).toBe(20);
      expect(mockPrismaService.dailyGoal.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-uuid-1',
            targetMinutes: 20,
            actualMinutes: 0,
            targetWords: 5,
            completed: false,
          }),
        }),
      );
    });
  });

  describe('updateGoal', () => {
    it('should update goal and award bonus XP and streak increment when newly completed', async () => {
      mockPrismaService.dailyGoal.findUnique.mockResolvedValue(mockGoal);
      mockPrismaService.dailyGoal.update.mockResolvedValue({
        ...mockGoal,
        actualMinutes: 20,
        actualWords: 6,
        completed: true,
      });
      mockPrismaService.userProfile.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.updateGoal('goal-uuid-1', 'user-uuid-1', {
        actualMinutes: 20,
        actualWords: 6,
      });

      expect(result.completed).toBe(true);
      expect(mockPrismaService.userProfile.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1' },
        data: {
          totalXp: { increment: 25 },
          streakDays: { increment: 1 },
        },
      });
    });

    it('should throw NotFoundException if goal does not belong to user', async () => {
      mockPrismaService.dailyGoal.findUnique.mockResolvedValue({
        ...mockGoal,
        userId: 'other-user-uuid',
      });

      await expect(
        service.updateGoal('goal-uuid-1', 'user-uuid-1', { actualMinutes: 20 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('recordActivity', () => {
    it('should accumulate minutes and words and detect newly completed goal', async () => {
      mockPrismaService.dailyGoal.findUnique.mockResolvedValue(mockGoal);
      mockPrismaService.dailyGoal.update.mockResolvedValue({
        ...mockGoal,
        actualMinutes: 15,
        actualWords: 5,
        completed: true,
      });
      mockPrismaService.userProfile.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.recordActivity('user-uuid-1', {
        minutes: 10,
        words: 3,
      });

      expect(mockPrismaService.dailyGoal.update).toHaveBeenCalledWith({
        where: { id: mockGoal.id },
        data: {
          actualMinutes: 15,
          actualWords: 5,
          completed: true,
        },
      });
      expect(mockPrismaService.userProfile.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1' },
        data: { totalXp: { increment: 25 } },
      });
      expect(result.completed).toBe(true);
    });
  });
});

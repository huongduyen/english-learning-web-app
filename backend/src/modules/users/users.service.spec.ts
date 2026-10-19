import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'learner@example.com',
    name: 'Test Learner',
    avatar: 'https://example.com/avatar.jpg',
    role: 'LEARNER',
    level: 'BEGINNER',
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: {
      id: 'profile-uuid-1',
      userId: 'user-uuid-1',
      dailyGoalMinutes: 15,
      targetLevel: 'INTERMEDIATE',
      nativeLanguage: 'vi',
    },
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userProfile: {
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return sanitized user profile with profile details', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-uuid-1');

      expect(result.id).toBe('user-uuid-1');
      expect(result.email).toBe('learner@example.com');
      expect(result.profile.dailyGoalMinutes).toBe(15);
      expect((result as any).password).toBeUndefined();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update user and profile fields and return updated profile', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        name: 'Updated Name',
      });
      mockPrismaService.userProfile.upsert.mockResolvedValue({
        ...mockUser.profile,
        dailyGoalMinutes: 30,
        targetLevel: 'ADVANCED',
      });

      const result = await service.updateProfile('user-uuid-1', {
        name: 'Updated Name',
        dailyGoalMinutes: 30,
        targetLevel: 'ADVANCED',
      });

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        data: { name: 'Updated Name' },
      });
      expect(mockPrismaService.userProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-uuid-1' },
          update: expect.objectContaining({
            dailyGoalMinutes: 30,
            targetLevel: 'ADVANCED',
          }),
        }),
      );
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile('non-existent-id', { name: 'Any Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById and findByEmail', () => {
    it('should find user by id', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const res = await service.findById('user-uuid-1');
      expect(res).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        include: { profile: true },
      });
    });

    it('should find user by email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const res = await service.findByEmail('learner@example.com');
      expect(res).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'learner@example.com' },
        include: { profile: true },
      });
    });
  });
});

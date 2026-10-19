import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'learner@example.com',
    password: 'hashed-password-123',
    name: 'Test Learner',
    role: 'LEARNER',
    level: 'BEGINNER',
    hashedRefreshToken: 'hashed-refresh-token-123',
    profile: {
      id: 'profile-uuid-1',
      dailyGoalMinutes: 15,
      targetLevel: 'INTERMEDIATE',
    },
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => defaultValue || 'mock-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sanitizeUser', () => {
    it('should strip password and hashedRefreshToken from user object', () => {
      const sanitized = service.sanitizeUser(mockUser);
      expect(sanitized).toBeDefined();
      expect(sanitized.id).toBe(mockUser.id);
      expect(sanitized.email).toBe(mockUser.email);
      expect(sanitized.password).toBeUndefined();
      expect(sanitized.hashedRefreshToken).toBeUndefined();
    });

    it('should return null if user is null or undefined', () => {
      expect(service.sanitizeUser(null)).toBeNull();
      expect(service.sanitizeUser(undefined)).toBeNull();
    });
  });

  describe('generateTokens', () => {
    it('should generate accessToken and refreshToken for a given user', async () => {
      mockJwtService.signAsync
        .mockResolvedValueOnce('signed-access-token')
        .mockResolvedValueOnce('signed-refresh-token');

      const tokens = await service.generateTokens({
        id: 'user-uuid-1',
        email: 'learner@example.com',
        role: 'LEARNER',
      });

      expect(tokens).toEqual({
        accessToken: 'signed-access-token',
        refreshToken: 'signed-refresh-token',
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('login', () => {
    it('should successfully authenticate user with valid credentials and return tokens', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-refresh-token');
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token-123')
        .mockResolvedValueOnce('refresh-token-123');
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser });

      const result = await service.login({
        email: 'Learner@Example.com', // test case normalization
        password: 'Password123!',
      });

      expect(result).toHaveProperty('accessToken', 'access-token-123');
      expect(result).toHaveProperty('refreshToken', 'refresh-token-123');
      expect(result).toHaveProperty('user');
      expect(result.user.password).toBeUndefined();
      expect(result.user.hashedRefreshToken).toBeUndefined();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'learner@example.com' },
        include: { profile: true },
      });
    });

    it('should throw UnauthorizedException if email does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nonexistent@example.com', password: 'Password123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'learner@example.com', password: 'WrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create new user, hash password, create profile, and return tokens', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock)
        .mockResolvedValueOnce('hashed-new-password')
        .mockResolvedValueOnce('hashed-new-refresh-token');
      mockPrismaService.user.create.mockResolvedValue({
        id: 'new-user-uuid',
        email: 'newuser@example.com',
        name: 'New User',
        level: 'BEGINNER',
        profile: {
          targetLevel: 'INTERMEDIATE',
          nativeLanguage: 'vi',
          dailyGoalMinutes: 15,
        },
      });
      mockJwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.register({
        email: 'NewUser@example.com',
        password: 'Password123!',
        name: 'New User',
        level: 'BEGINNER',
        targetLevel: 'INTERMEDIATE',
      });

      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('refreshToken', 'new-refresh-token');
      expect(result.user.email).toBe('newuser@example.com');
      expect(mockPrismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'newuser@example.com',
            password: 'hashed-new-password',
            name: 'New User',
          }),
        }),
      );
    });

    it('should throw ConflictException if user email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'learner@example.com',
          password: 'Password123!',
          name: 'Learner',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('refresh', () => {
    it('should throw UnauthorizedException if refreshToken is missing', async () => {
      await expect(service.refresh('')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if refreshToken signature is invalid or expired', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(service.refresh('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user does not exist or has no hashedRefreshToken', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: 'user-uuid-1',
        email: 'test@example.com',
      });
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.refresh('valid-jwt-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if stored hashedRefreshToken does not match token', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: 'user-uuid-1',
        email: 'test@example.com',
      });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.refresh('valid-jwt-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should rotate tokens and return safe user on valid refresh token', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: 'user-uuid-1',
        email: 'test@example.com',
      });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('rotated-hashed-refresh');
      mockJwtService.signAsync
        .mockResolvedValueOnce('rotated-access-token')
        .mockResolvedValueOnce('rotated-refresh-token');
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.refresh('valid-jwt-token');

      expect(result.accessToken).toBe('rotated-access-token');
      expect(result.refreshToken).toBe('rotated-refresh-token');
      expect(result.user.email).toBe(mockUser.email);
    });
  });

  describe('logout', () => {
    it('should nullify hashedRefreshToken in database and return success message', async () => {
      mockPrismaService.user.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.logout('user-uuid-1');

      expect(result).toEqual({
        success: true,
        message: 'Logged out successfully',
      });
      expect(mockPrismaService.user.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'user-uuid-1',
          hashedRefreshToken: { not: null },
        },
        data: {
          hashedRefreshToken: null,
        },
      });
    });
  });
});

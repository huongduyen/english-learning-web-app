import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface TokenPayload {
  sub: string;
  email: string;
  role?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Sanitizes a user object so sensitive hashes (password, refresh token) are never returned.
   */
  sanitizeUser(user: any) {
    if (!user) return null;
    const { password, hashedRefreshToken, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Generates both access token and refresh token for a user.
   */
  async generateTokens(user: { id: string; email: string; role?: string }) {
    const accessSecret = this.configService.get<string>(
      'JWT_SECRET',
      'super-secret-jwt-access-key-2026-english-learning',
    );
    const accessExpiration = this.configService.get<string>('JWT_EXPIRATION', '15m');

    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'super-secret-jwt-refresh-key-2026-english-learning',
    );
    const refreshExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d');

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiration,
      }),
      this.jwtService.signAsync(
        { sub: user.id, email: user.email },
        {
          secret: refreshSecret,
          expiresIn: refreshExpiration,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Securely hashes and persists the active refresh token hash for a user.
   */
  async updateHashedRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken },
    });
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);
    await this.updateHashedRefreshToken(user.id, tokens.refreshToken);

    const safeUser = this.sanitizeUser(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      token: tokens.accessToken, // Backward-compatibility alias
      user: safeUser,
    };
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();

    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException(`An account with email ${email} already exists`);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: dto.name || email.split('@')[0],
        level: dto.level || 'BEGINNER',
        profile: {
          create: {
            targetLevel: dto.targetLevel || 'INTERMEDIATE',
            nativeLanguage: 'vi',
            dailyGoalMinutes: 15,
          },
        },
      },
      include: { profile: true },
    });

    const tokens = await this.generateTokens(user);
    await this.updateHashedRefreshToken(user.id, tokens.refreshToken);

    const safeUser = this.sanitizeUser(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      token: tokens.accessToken, // Backward-compatibility alias
      user: safeUser,
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'super-secret-jwt-refresh-key-2026-english-learning',
    );

    let payload: TokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<TokenPayload>(refreshToken, {
        secret: refreshSecret,
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { profile: true },
    });

    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Access denied or session revoked');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid or revoked refresh token');
    }

    // Rotate tokens upon successful refresh
    const tokens = await this.generateTokens(user);
    await this.updateHashedRefreshToken(user.id, tokens.refreshToken);

    const safeUser = this.sanitizeUser(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      token: tokens.accessToken,
      user: safeUser,
    };
  }

  async logout(userId: string) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRefreshToken: { not: null },
      },
      data: {
        hashedRefreshToken: null,
      },
    });

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}

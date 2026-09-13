import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException(`Invalid credentials or user not found`);
    }

    const token = `token_${user.id}`;

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        level: user.level,
        profile: user.profile,
      },
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

    const user = await this.prisma.user.create({
      data: {
        email,
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

    const token = `token_${user.id}`;

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        level: user.level,
        profile: user.profile,
      },
    };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      level: user.level,
      profile: user.profile,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const { name, avatar, targetLevel, nativeLanguage, dailyGoalMinutes } = dto;

    if (name !== undefined || avatar !== undefined) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(name !== undefined && { name }),
          ...(avatar !== undefined && { avatar }),
        },
      });
    }

    if (
      targetLevel !== undefined ||
      nativeLanguage !== undefined ||
      dailyGoalMinutes !== undefined
    ) {
      await this.prisma.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          targetLevel: targetLevel || 'INTERMEDIATE',
          nativeLanguage: nativeLanguage || 'vi',
          dailyGoalMinutes: dailyGoalMinutes || 15,
        },
        update: {
          ...(targetLevel !== undefined && { targetLevel }),
          ...(nativeLanguage !== undefined && { nativeLanguage }),
          ...(dailyGoalMinutes !== undefined && { dailyGoalMinutes }),
        },
      });
    }

    return this.getProfile(userId);
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
  }
}

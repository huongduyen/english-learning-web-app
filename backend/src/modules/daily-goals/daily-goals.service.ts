import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateDailyGoalDto } from './dto/update-daily-goal.dto';

@Injectable()
export class DailyGoalsService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeDate(dateStr?: string): Date {
    const d = dateStr ? new Date(dateStr) : new Date();
    // Return Date at midnight UTC for PostgreSQL date type
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }

  async getTodayGoal(userId: string, dateStr?: string) {
    const targetDate = this.normalizeDate(dateStr);

    let goal = await this.prisma.dailyGoal.findUnique({
      where: {
        userId_date: {
          userId,
          date: targetDate,
        },
      },
    });

    if (!goal) {
      const profile = await this.prisma.userProfile.findUnique({
        where: { userId },
      });

      goal = await this.prisma.dailyGoal.create({
        data: {
          userId,
          date: targetDate,
          targetMinutes: profile?.dailyGoalMinutes || 15,
          actualMinutes: 0,
          targetWords: 5,
          actualWords: 0,
          completed: false,
        },
      });
    }

    return goal;
  }

  async updateGoal(id: string, userId: string, dto: UpdateDailyGoalDto) {
    const goal = await this.prisma.dailyGoal.findUnique({
      where: { id },
    });

    if (!goal || goal.userId !== userId) {
      throw new NotFoundException(`Daily goal with ID ${id} not found`);
    }

    const targetMinutes = dto.targetMinutes ?? goal.targetMinutes;
    const actualMinutes = dto.actualMinutes ?? goal.actualMinutes;
    const targetWords = dto.targetWords ?? goal.targetWords;
    const actualWords = dto.actualWords ?? goal.actualWords;

    const isNewlyCompleted =
      !goal.completed &&
      (dto.completed === true ||
        (dto.completed === undefined &&
          actualMinutes >= targetMinutes &&
          actualWords >= targetWords));

    const completed =
      dto.completed !== undefined
        ? dto.completed
        : actualMinutes >= targetMinutes && actualWords >= targetWords;

    const updated = await this.prisma.dailyGoal.update({
      where: { id },
      data: {
        targetMinutes,
        actualMinutes,
        targetWords,
        actualWords,
        completed,
      },
    });

    if (isNewlyCompleted) {
      await this.prisma.userProfile.updateMany({
        where: { userId },
        data: {
          totalXp: { increment: 25 },
          streakDays: { increment: 1 },
        },
      });
    }

    return updated;
  }
}

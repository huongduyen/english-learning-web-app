import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityQueryDto } from './dto/activity-query.dto';
import { Prisma, VocabularyStatus } from '@prisma/client';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserProgress(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // 1. Vocabulary statistics
    const [totalVocabularies, vocabStats] = await Promise.all([
      this.prisma.vocabulary.count(),
      this.prisma.userVocabulary.groupBy({
        by: ['status'],
        where: { userId },
        _count: { status: true },
      }),
    ]);

    const vocabStatusCounts = {
      learning: 0,
      reviewing: 0,
      mastered: 0,
    };

    vocabStats.forEach((stat) => {
      if (stat.status === VocabularyStatus.LEARNING) {
        vocabStatusCounts.learning = stat._count.status;
      } else if (stat.status === VocabularyStatus.REVIEWING) {
        vocabStatusCounts.reviewing = stat._count.status;
      } else if (stat.status === VocabularyStatus.MASTERED) {
        vocabStatusCounts.mastered = stat._count.status;
      }
    });

    // 2. Quiz statistics
    const [totalAttempts, passedAttempts, attemptsAgg] = await Promise.all([
      this.prisma.quizAttempt.count({ where: { userId } }),
      this.prisma.quizAttempt.count({ where: { userId, passed: true } }),
      this.prisma.quizAttempt.aggregate({
        where: { userId },
        _avg: { percentage: true },
      }),
    ]);

    // 3. Activity statistics
    const [totalActivities, activitiesAgg] = await Promise.all([
      this.prisma.learningActivity.count({ where: { userId } }),
      this.prisma.learningActivity.aggregate({
        where: { userId },
        _sum: { durationMinutes: true },
      }),
    ]);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        level: user.level,
        targetLevel: user.profile?.targetLevel || 'INTERMEDIATE',
        totalXp: user.profile?.totalXp || 0,
        streakDays: user.profile?.streakDays || 0,
        dailyGoalMinutes: user.profile?.dailyGoalMinutes || 15,
      },
      vocabulary: {
        totalAvailable: totalVocabularies,
        totalEnrolled:
          vocabStatusCounts.learning +
          vocabStatusCounts.reviewing +
          vocabStatusCounts.mastered,
        ...vocabStatusCounts,
      },
      quizzes: {
        totalAttempts,
        passedAttempts,
        passRate:
          totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0,
        averageScore: Math.round(attemptsAgg._avg.percentage || 0),
      },
      learning: {
        totalActivities,
        totalStudyMinutes: activitiesAgg._sum.durationMinutes || 0,
      },
    };
  }

  async getUserActivities(userId: string, query: ActivityQueryDto) {
    const { page = 1, limit = 20, type } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.LearningActivityWhereInput = {
      userId,
      ...(type && { type }),
    };

    const [total, data] = await Promise.all([
      this.prisma.learningActivity.count({ where }),
      this.prisma.learningActivity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId?: string) {
    const [achievements, userAchievements] = await Promise.all([
      this.prisma.achievement.findMany({
        orderBy: { points: 'asc' },
      }),
      userId
        ? this.prisma.userAchievement.findMany({
            where: { userId },
          })
        : Promise.resolve([]),
    ]);

    const userMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua]));

    return achievements.map((ach) => {
      const userStatus = userMap.get(ach.id);
      return {
        id: ach.id,
        code: ach.code,
        title: ach.title,
        titleVi: ach.titleVi,
        description: ach.description,
        descriptionVi: ach.descriptionVi,
        icon: ach.icon,
        points: ach.points,
        unlocked: !!userStatus && userStatus.progress >= 100,
        progress: userStatus ? userStatus.progress : 0,
        unlockedAt: userStatus?.unlockedAt || null,
      };
    });
  }
}

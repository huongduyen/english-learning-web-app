import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityType, VocabularyStatus } from '@prisma/client';

export interface StandardAchievementDef {
  code: string;
  title: string;
  titleVi: string;
  description: string;
  descriptionVi: string;
  icon: string;
  points: number;
}

export const STANDARD_ACHIEVEMENTS: StandardAchievementDef[] = [
  {
    code: 'FIRST_LESSON',
    title: 'First Lesson',
    titleVi: 'Bài Học Đầu Tiên',
    description: 'Complete your very first lesson on the platform.',
    descriptionVi: 'Hoàn thành bài học đầu tiên trên ứng dụng.',
    icon: 'sparkles',
    points: 25,
  },
  {
    code: 'FIRST_QUIZ',
    title: 'First Quiz',
    titleVi: 'Bài Kiểm Tra Đầu Tiên',
    description: 'Take and submit your first comprehension quiz.',
    descriptionVi: 'Làm và nộp bài kiểm tra trắc nghiệm đầu tiên.',
    icon: 'help-circle',
    points: 25,
  },
  {
    code: 'VOCAB_50_WORDS',
    title: 'Word Explorer (50 Words)',
    titleVi: 'Nhà Thám Hiểm Từ Vựng (50 Từ)',
    description: 'Learn and review 50 vocabulary words.',
    descriptionVi: 'Ghi nhớ và hoàn thành luyện tập 50 từ vựng tiếng Anh.',
    icon: 'book-open',
    points: 50,
  },
  {
    code: 'WORDS_100',
    title: '100 Words Learned',
    titleVi: '100 Từ Vựng Đã Học',
    description: 'Reach 100 learned or mastered vocabulary words.',
    descriptionVi: 'Đạt mốc 100 từ vựng tiếng Anh đã học hoặc thông thạo.',
    icon: 'book-open-check',
    points: 100,
  },
  {
    code: 'WORDS_500',
    title: '500 Words Learned',
    titleVi: '500 Từ Vựng Đã Học',
    description: 'Master a rich lexicon of 500 English vocabulary words.',
    descriptionVi: 'Làm chủ vốn từ vựng phong phú với 500 từ tiếng Anh.',
    icon: 'trophy',
    points: 250,
  },
  {
    code: 'SEVEN_DAY_STREAK',
    title: '7 Day Streak',
    titleVi: 'Chuỗi 7 Ngày Học',
    description: 'Maintain an unbroken daily learning streak for 7 days.',
    descriptionVi: 'Duy trì chuỗi ngày học tập liên tục trong 7 ngày.',
    icon: 'flame',
    points: 100,
  },
  {
    code: 'STREAK_30',
    title: '30 Day Streak',
    titleVi: 'Chuỗi 30 Ngày Học',
    description: 'Reach an incredible 30-day continuous study habit.',
    descriptionVi: 'Đạt thói quen học tập kiên trì với chuỗi 30 ngày liên tục.',
    icon: 'zap',
    points: 300,
  },
  {
    code: 'GRAMMAR_BEGINNER',
    title: 'Grammar Beginner',
    titleVi: 'Nhập Môn Ngữ Pháp',
    description: 'Successfully complete 3 grammar lessons.',
    descriptionVi: 'Hoàn thành xuất sắc 3 bài học ngữ pháp.',
    icon: 'check-circle-2',
    points: 50,
  },
  {
    code: 'GRAMMAR_CHAMPION',
    title: 'Grammar Champion',
    titleVi: 'Quán Quân Ngữ Pháp',
    description: 'Successfully finish 10 grammar lessons and their exercises.',
    descriptionVi: 'Hoàn thành 10 bài học ngữ pháp cùng toàn bộ bài tập.',
    icon: 'award',
    points: 80,
  },
  {
    code: 'LISTENING_BEGINNER',
    title: 'Listening Beginner',
    titleVi: 'Nhập Môn Luyện Nghe',
    description: 'Successfully complete 3 listening lessons and audio practices.',
    descriptionVi: 'Hoàn thành xuất sắc 3 bài luyện nghe tiếng Anh.',
    icon: 'headphones',
    points: 50,
  },
  {
    code: 'QUIZ_MASTER',
    title: 'Quiz Master',
    titleVi: 'Bậc Thầy Trắc Nghiệm',
    description: 'Pass 5 comprehension quizzes with passing scores.',
    descriptionVi: 'Vượt qua 5 bài kiểm tra trắc nghiệm với điểm đạt trở lên.',
    icon: 'crown',
    points: 150,
  },
  {
    code: 'PERFECT_QUIZ_SCORE',
    title: 'Perfectionist',
    titleVi: 'Điểm Tuyệt Đối',
    description: 'Score 100% on any comprehension quiz.',
    descriptionVi: 'Đạt điểm tuyệt đối 100% trong một bài kiểm tra bất kỳ.',
    icon: 'star',
    points: 60,
  },
  {
    code: 'AI_CONVERSATION_EXPLORER',
    title: 'Fluent Talker',
    titleVi: 'Nhà Giao Tiếp Tự Tin',
    description: 'Complete 3 interactive conversations with the AI tutor.',
    descriptionVi: 'Hoàn thành 3 cuộc đối thoại luyện nói cùng trợ lý ảo AI.',
    icon: 'message-square',
    points: 50,
  },
];

@Injectable()
export class AchievementsService implements OnModuleInit {
  private readonly logger = new Logger(AchievementsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedStandardAchievements();
  }

  /**
   * Ensure all standard achievements exist in PostgreSQL database.
   */
  async seedStandardAchievements() {
    try {
      for (const def of STANDARD_ACHIEVEMENTS) {
        await this.prisma.achievement.upsert({
          where: { code: def.code },
          update: {
            title: def.title,
            titleVi: def.titleVi,
            description: def.description,
            descriptionVi: def.descriptionVi,
            icon: def.icon,
            points: def.points,
          },
          create: {
            code: def.code,
            title: def.title,
            titleVi: def.titleVi,
            description: def.description,
            descriptionVi: def.descriptionVi,
            icon: def.icon,
            points: def.points,
          },
        });
      }
      this.logger.log(
        'Standard achievements verified and seeded successfully in PostgreSQL.',
      );
    } catch (error) {
      this.logger.error('Failed to seed standard achievements:', error);
    }
  }

  /**
   * Retrieve all achievements with the user's current progress and unlock status.
   */
  async findAll(userId?: string) {
    if (userId) {
      // Auto-evaluate achievements before returning
      await this.checkAndUnlockAchievements(userId);
    }

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
      const isUnlocked = !!userStatus && userStatus.progress >= 100;
      return {
        id: ach.id,
        code: ach.code,
        title: ach.title,
        titleVi: ach.titleVi,
        description: ach.description,
        descriptionVi: ach.descriptionVi,
        icon: ach.icon,
        points: ach.points,
        unlocked: isUnlocked,
        progress: userStatus ? Math.min(100, Math.round(userStatus.progress)) : 0,
        unlockedAt: isUnlocked ? userStatus.unlockedAt : null,
      };
    });
  }

  /**
   * Automatic Achievement Evaluation Engine.
   * Evaluates user's real activities in PostgreSQL and unlocks badges automatically.
   */
  async checkAndUnlockAchievements(userId: string): Promise<
    Array<{
      achievementId: string;
      code: string;
      title: string;
      points: number;
      newlyUnlocked: boolean;
    }>
  > {
    if (!userId) return [];

    // 1. Gather all real data from PostgreSQL
    const [
      user,
      wordsLearnedCount,
      quizAttemptsCount,
      passedQuizCount,
      perfectQuizCount,
      grammarActivities,
      listeningActivities,
      readingActivities,
      conversationCount,
    ] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      }),
      this.prisma.userVocabulary.count({
        where: {
          userId,
          status: {
            in: [
              VocabularyStatus.LEARNING,
              VocabularyStatus.REVIEWING,
              VocabularyStatus.MASTERED,
            ],
          },
        },
      }),
      this.prisma.quizAttempt.count({ where: { userId } }),
      this.prisma.quizAttempt.count({ where: { userId, passed: true } }),
      this.prisma.quizAttempt.count({ where: { userId, percentage: 100 } }),
      this.prisma.learningActivity.findMany({
        where: { userId, type: ActivityType.GRAMMAR },
        select: { referenceId: true },
      }),
      this.prisma.learningActivity.findMany({
        where: { userId, type: ActivityType.LISTENING },
        select: { referenceId: true },
      }),
      this.prisma.learningActivity.findMany({
        where: { userId, type: ActivityType.READING },
        select: { referenceId: true },
      }),
      this.prisma.conversation.count({ where: { userId } }),
    ]);

    if (!user) return [];

    // Distinct completed lessons
    const uniqueGrammarLessons = new Set(
      grammarActivities.map((a) => a.referenceId).filter(Boolean),
    ).size;
    const uniqueListeningLessons = new Set(
      listeningActivities.map((a) => a.referenceId).filter(Boolean),
    ).size;
    const uniqueReadingArticles = new Set(
      readingActivities.map((a) => a.referenceId).filter(Boolean),
    ).size;

    const totalLessonsCompleted =
      uniqueGrammarLessons + uniqueListeningLessons + uniqueReadingArticles;

    const currentStreak = user.profile?.streakDays || 0;
    const longestStreak = user.profile?.longestStreakDays || currentStreak;
    const bestStreak = Math.max(currentStreak, longestStreak);

    // Fetch existing achievements and user status
    const [allAchievements, existingUserAchievements] = await Promise.all([
      this.prisma.achievement.findMany(),
      this.prisma.userAchievement.findMany({ where: { userId } }),
    ]);

    const userAchMap = new Map(
      existingUserAchievements.map((ua) => [ua.achievementId, ua]),
    );
    const results: Array<{
      achievementId: string;
      code: string;
      title: string;
      points: number;
      newlyUnlocked: boolean;
    }> = [];

    // Progress evaluator function per code
    const evaluateProgress = (code: string): number => {
      switch (code) {
        case 'FIRST_LESSON':
        case 'FIRST_STEP':
          return totalLessonsCompleted >= 1 ? 100 : 0;

        case 'FIRST_QUIZ':
          return quizAttemptsCount >= 1 ? 100 : 0;

        case 'VOCAB_50_WORDS':
          return Math.min(100, Math.round((wordsLearnedCount / 50) * 100));

        case 'WORDS_100':
          return Math.min(100, Math.round((wordsLearnedCount / 100) * 100));

        case 'WORDS_500':
          return Math.min(100, Math.round((wordsLearnedCount / 500) * 100));

        case 'SEVEN_DAY_STREAK':
          return Math.min(100, Math.round((bestStreak / 7) * 100));

        case 'STREAK_30':
          return Math.min(100, Math.round((bestStreak / 30) * 100));

        case 'GRAMMAR_BEGINNER':
          return Math.min(100, Math.round((uniqueGrammarLessons / 3) * 100));

        case 'GRAMMAR_CHAMPION':
          return Math.min(100, Math.round((uniqueGrammarLessons / 10) * 100));

        case 'LISTENING_BEGINNER':
          return Math.min(100, Math.round((uniqueListeningLessons / 3) * 100));

        case 'QUIZ_MASTER':
          return Math.min(100, Math.round((passedQuizCount / 5) * 100));

        case 'PERFECT_QUIZ_SCORE':
          return perfectQuizCount >= 1 ? 100 : 0;

        case 'AI_CONVERSATION_EXPLORER':
          return Math.min(100, Math.round((conversationCount / 3) * 100));

        default:
          return 0;
      }
    };

    let xpToAward = 0;

    for (const ach of allAchievements) {
      const calculatedProgress = evaluateProgress(ach.code);
      const existing = userAchMap.get(ach.id);
      const wasUnlocked = existing && existing.progress >= 100;

      if (calculatedProgress >= 100) {
        if (!wasUnlocked) {
          // Newly unlocked achievement!
          await this.prisma.userAchievement.upsert({
            where: {
              userId_achievementId: {
                userId,
                achievementId: ach.id,
              },
            },
            create: {
              userId,
              achievementId: ach.id,
              progress: 100,
              unlockedAt: new Date(),
            },
            update: {
              progress: 100,
              unlockedAt: existing?.unlockedAt || new Date(),
            },
          });

          xpToAward += ach.points;
          results.push({
            achievementId: ach.id,
            code: ach.code,
            title: ach.title,
            points: ach.points,
            newlyUnlocked: true,
          });
        }
      } else if (calculatedProgress > 0) {
        // In-progress update
        if (!existing || existing.progress !== calculatedProgress) {
          await this.prisma.userAchievement.upsert({
            where: {
              userId_achievementId: {
                userId,
                achievementId: ach.id,
              },
            },
            create: {
              userId,
              achievementId: ach.id,
              progress: calculatedProgress,
            },
            update: {
              progress: calculatedProgress,
            },
          });
        }
      }
    }

    if (xpToAward > 0) {
      await this.prisma.userProfile.updateMany({
        where: { userId },
        data: {
          totalXp: { increment: xpToAward },
        },
      });
      this.logger.log(`Awarded ${xpToAward} XP to user ${userId} for new achievements!`);
    }

    return results;
  }
}

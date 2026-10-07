import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityQueryDto } from './dto/activity-query.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { AchievementsService } from '../achievements/achievements.service';
import { DailyGoalsService } from '../daily-goals/daily-goals.service';
import { ActivityType, Prisma, VocabularyStatus } from '@prisma/client';

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly achievementsService: AchievementsService,
    private readonly dailyGoalsService: DailyGoalsService,
  ) {}

  /**
   * Calculate current streak and longest streak accurately from real database dates.
   */
  async calculateStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
    const [activities, goals, userProfile] = await Promise.all([
      this.prisma.learningActivity.findMany({
        where: { userId },
        select: { createdAt: true },
      }),
      this.prisma.dailyGoal.findMany({
        where: {
          userId,
          OR: [{ actualMinutes: { gt: 0 } }, { actualWords: { gt: 0 } }],
        },
        select: { date: true, createdAt: true },
      }),
      this.prisma.userProfile.findUnique({
        where: { userId },
      }),
    ]);

    const dateSet = new Set<string>();

    activities.forEach((act) => {
      const d = new Date(act.createdAt);
      dateSet.add(d.toISOString().split('T')[0]);
    });

    goals.forEach((g) => {
      const d = new Date(g.date);
      dateSet.add(d.toISOString().split('T')[0]);
    });

    if (dateSet.size === 0) {
      const storedStreak = userProfile?.streakDays || 0;
      const storedLongest = userProfile?.longestStreakDays || storedStreak;
      return { currentStreak: storedStreak, longestStreak: storedLongest };
    }

    // Sort dates ascending
    const sortedDates = Array.from(dateSet).sort();

    // 1. Calculate historical longest streak
    let maxStreak = 0;
    let currentRun = 0;
    let prevDateEpochDay: number | null = null;

    for (const dStr of sortedDates) {
      const dateParts = dStr.split('-').map(Number);
      const epochDay = Math.floor(
        Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]) / (24 * 60 * 60 * 1000),
      );

      if (prevDateEpochDay === null) {
        currentRun = 1;
      } else if (epochDay === prevDateEpochDay + 1) {
        currentRun += 1;
      } else if (epochDay > prevDateEpochDay + 1) {
        currentRun = 1;
      }

      prevDateEpochDay = epochDay;
      if (currentRun > maxStreak) {
        maxStreak = currentRun;
      }
    }

    // 2. Calculate current streak (ending today or yesterday)
    const now = new Date();
    const todayEpochDay = Math.floor(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / (24 * 60 * 60 * 1000),
    );

    const todayStr = now.toISOString().split('T')[0];
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let currentStreak = 0;
    const hasToday = dateSet.has(todayStr);
    const hasYesterday = dateSet.has(yesterdayStr);

    if (hasToday || hasYesterday) {
      // Walk backwards from reference day
      let checkEpochDay = hasToday ? todayEpochDay : todayEpochDay - 1;
      while (true) {
        const checkDate = new Date(checkEpochDay * 24 * 60 * 60 * 1000);
        const checkStr = checkDate.toISOString().split('T')[0];
        if (dateSet.has(checkStr)) {
          currentStreak += 1;
          checkEpochDay -= 1;
        } else {
          break;
        }
      }
    }

    const longestStreak = Math.max(
      maxStreak,
      currentStreak,
      userProfile?.longestStreakDays || 0,
    );

    // Persist calculated streaks to user profile if changed
    if (
      userProfile &&
      (userProfile.streakDays !== currentStreak ||
        userProfile.longestStreakDays !== longestStreak)
    ) {
      await this.prisma.userProfile.update({
        where: { userId },
        data: {
          streakDays: currentStreak,
          longestStreakDays: longestStreak,
          lastActiveDate: new Date(),
        },
      });
    }

    return { currentStreak, longestStreak };
  }

  /**
   * Log an activity and automatically update daily goals, streaks, and achievements.
   */
  async logActivity(userId: string, dto: CreateActivityDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const durationMinutes = dto.durationMinutes ?? 1;
    const wordsLearned = dto.wordsLearned ?? (dto.type === ActivityType.VOCABULARY ? 1 : 0);

    // 1. Create Learning Activity record in PostgreSQL
    const activity = await this.prisma.learningActivity.create({
      data: {
        userId,
        type: dto.type,
        referenceId: dto.referenceId,
        durationMinutes,
        score: dto.score,
        metadata: (dto.metadata as any) ?? {},
      },
    });

    // 2. Automatically update Daily Goal in PostgreSQL
    await this.dailyGoalsService.recordActivity(userId, {
      minutes: durationMinutes,
      words: wordsLearned,
    });

    // 3. Award XP
    const xpReward = Math.max(5, Math.round(durationMinutes * 2));
    await this.prisma.userProfile.updateMany({
      where: { userId },
      data: { totalXp: { increment: xpReward } },
    });

    // 4. Update streaks
    await this.calculateStreak(userId);

    // 5. Automatically check and unlock achievements in PostgreSQL
    const newlyUnlocked = await this.achievementsService.checkAndUnlockAchievements(userId);

    return {
      activity,
      newlyUnlockedAchievements: newlyUnlocked,
    };
  }

  /**
   * Get weekly activity breakdown (last 7 days) from real PostgreSQL activity records.
   */
  async getWeeklyActivity(userId: string) {
    const now = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const fullDayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    const todayDateStr = now.toISOString().split('T')[0];

    // Determine 7-day range
    const days: Array<{
      date: string;
      day: string;
      fullDay: string;
      minutes: number;
      activitiesCount: number;
      wordsCount: number;
      goalMinutes: number;
      isGoalReached: boolean;
      isToday: boolean;
    }> = [];

    // 7 days ending today
    const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6));
    startDate.setUTCHours(0, 0, 0, 0);

    const [activities, goals, profile] = await Promise.all([
      this.prisma.learningActivity.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.dailyGoal.findMany({
        where: {
          userId,
          date: { gte: startDate },
        },
      }),
      this.prisma.userProfile.findUnique({
        where: { userId },
      }),
    ]);

    const targetMinutes = profile?.dailyGoalMinutes || 15;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getUTCDay();

      // Find activities for this day
      const dayActivities = activities.filter((act) => {
        return new Date(act.createdAt).toISOString().split('T')[0] === dateStr;
      });

      const dayGoal = goals.find((g) => {
        return new Date(g.date).toISOString().split('T')[0] === dateStr;
      });

      const minutesFromActivities = dayActivities.reduce(
        (sum, a) => sum + (a.durationMinutes || 0),
        0,
      );
      const minutes = Math.max(minutesFromActivities, dayGoal?.actualMinutes || 0);

      // Estimate words learned
      let wordsCount = dayGoal?.actualWords || 0;
      if (wordsCount === 0) {
        wordsCount = dayActivities.filter((a) => a.type === ActivityType.VOCABULARY).length;
      }

      const isToday = dateStr === todayDateStr;
      const isGoalReached = dayGoal?.completed ?? minutes >= targetMinutes;

      days.push({
        date: dateStr,
        day: dayNames[dayOfWeek],
        fullDay: fullDayNames[dayOfWeek],
        minutes,
        activitiesCount: dayActivities.length,
        wordsCount,
        goalMinutes: targetMinutes,
        isGoalReached,
        isToday,
      });
    }

    return days;
  }

  /**
   * Main Progress endpoint: returns comprehensive statistics and skill progress using real PostgreSQL data.
   */
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

    // 1. Synchronize and calculate streak & achievements
    const [streakData] = await Promise.all([
      this.calculateStreak(userId),
      this.achievementsService.checkAndUnlockAchievements(userId),
    ]);

    // 2. Vocabulary statistics
    const [totalVocabularies, vocabStats, totalMastered] = await Promise.all([
      this.prisma.vocabulary.count(),
      this.prisma.userVocabulary.groupBy({
        by: ['status'],
        where: { userId },
        _count: { status: true },
      }),
      this.prisma.userVocabulary.count({
        where: { userId, status: VocabularyStatus.MASTERED },
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

    const totalWordsLearned =
      vocabStatusCounts.learning +
      vocabStatusCounts.reviewing +
      vocabStatusCounts.mastered;

    // 3. Quiz statistics
    const [totalAttempts, passedAttempts, attemptsAgg, highestScoreAgg] =
      await Promise.all([
        this.prisma.quizAttempt.count({ where: { userId } }),
        this.prisma.quizAttempt.count({ where: { userId, passed: true } }),
        this.prisma.quizAttempt.aggregate({
          where: { userId },
          _avg: { percentage: true },
        }),
        this.prisma.quizAttempt.aggregate({
          where: { userId },
          _max: { percentage: true },
        }),
      ]);

    // 4. Learning Activity totals
    const [totalActivities, activitiesAgg] = await Promise.all([
      this.prisma.learningActivity.count({ where: { userId } }),
      this.prisma.learningActivity.aggregate({
        where: { userId },
        _sum: { durationMinutes: true },
      }),
    ]);

    const totalStudyMinutes = activitiesAgg._sum.durationMinutes || 0;
    const hours = Math.floor(totalStudyMinutes / 60);
    const mins = totalStudyMinutes % 60;
    const totalLearningTimeFormatted =
      hours > 0 ? `${hours}h ${mins}m` : `${mins} mins`;

    // 5. Skill lessons & progress
    const [
      totalGrammarLessons,
      totalListeningLessons,
      totalReadingArticles,
      totalConversations,
      userGrammarActivities,
      userListeningActivities,
      userReadingActivities,
      userConversationsCount,
    ] = await Promise.all([
      this.prisma.grammarLesson.count(),
      this.prisma.listeningLesson.count(),
      this.prisma.readingArticle.count(),
      this.prisma.conversation.count(),
      this.prisma.learningActivity.findMany({
        where: { userId, type: ActivityType.GRAMMAR },
        select: { referenceId: true, score: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.learningActivity.findMany({
        where: { userId, type: ActivityType.LISTENING },
        select: { referenceId: true, score: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.learningActivity.findMany({
        where: { userId, type: ActivityType.READING },
        select: { referenceId: true, score: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.conversation.count({ where: { userId } }),
    ]);

    // Distinct completed lesson reference IDs
    const completedGrammarIds = Array.from(
      new Set(userGrammarActivities.map((a) => a.referenceId).filter(Boolean)),
    );
    const completedListeningIds = Array.from(
      new Set(userListeningActivities.map((a) => a.referenceId).filter(Boolean)),
    );
    const completedReadingIds = Array.from(
      new Set(userReadingActivities.map((a) => a.referenceId).filter(Boolean)),
    );

    const completedGrammarCount = completedGrammarIds.length;
    const completedListeningCount = completedListeningIds.length;
    const completedReadingCount = completedReadingIds.length;
    const totalLessonsCompleted =
      completedGrammarCount + completedListeningCount + completedReadingCount;

    // Fetch lesson titles for completed lessons list (up to 15 items)
    const [grammarDetails, listeningDetails, readingDetails] = await Promise.all([
      this.prisma.grammarLesson.findMany({
        where: { id: { in: completedGrammarIds } },
        select: { id: true, title: true },
      }),
      this.prisma.listeningLesson.findMany({
        where: { id: { in: completedListeningIds } },
        select: { id: true, title: true },
      }),
      this.prisma.readingArticle.findMany({
        where: { id: { in: completedReadingIds } },
        select: { id: true, title: true },
      }),
    ]);

    const completedLessonsList: Array<{
      id: string;
      title: string;
      type: 'GRAMMAR' | 'LISTENING' | 'READING';
      completedAt: Date;
      score?: number;
    }> = [];

    grammarDetails.forEach((g) => {
      const act = userGrammarActivities.find((a) => a.referenceId === g.id);
      completedLessonsList.push({
        id: g.id,
        title: g.title,
        type: 'GRAMMAR',
        completedAt: act?.createdAt || new Date(),
        score: act?.score ?? undefined,
      });
    });

    listeningDetails.forEach((l) => {
      const act = userListeningActivities.find((a) => a.referenceId === l.id);
      completedLessonsList.push({
        id: l.id,
        title: l.title,
        type: 'LISTENING',
        completedAt: act?.createdAt || new Date(),
        score: act?.score ?? undefined,
      });
    });

    readingDetails.forEach((r) => {
      const act = userReadingActivities.find((a) => a.referenceId === r.id);
      completedLessonsList.push({
        id: r.id,
        title: r.title,
        type: 'READING',
        completedAt: act?.createdAt || new Date(),
        score: act?.score ?? undefined,
      });
    });

    // Sort completed lessons by completedAt desc
    completedLessonsList.sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );

    // Calculate Skill Progress Percentages
    const vocabProgressPct =
      totalVocabularies > 0
        ? Math.min(100, Math.round((totalWordsLearned / totalVocabularies) * 100))
        : 0;
    const grammarProgressPct =
      totalGrammarLessons > 0
        ? Math.min(100, Math.round((completedGrammarCount / totalGrammarLessons) * 100))
        : 0;
    const listeningProgressPct =
      totalListeningLessons > 0
        ? Math.min(
            100,
            Math.round((completedListeningCount / totalListeningLessons) * 100),
          )
        : 0;
    const readingProgressPct =
      totalReadingArticles > 0
        ? Math.min(100, Math.round((completedReadingCount / totalReadingArticles) * 100))
        : 0;
    const speakingTarget = Math.max(5, totalConversations);
    const speakingProgressPct = Math.min(
      100,
      Math.round((userConversationsCount / speakingTarget) * 100),
    );

    // 6. Weekly activity data
    const weeklyActivity = await this.getWeeklyActivity(userId);

    // 7. Today's goal
    const todayGoal = await this.dailyGoalsService.getTodayGoal(userId);

    // 8. Achievements count
    const [totalAchievementsCount, unlockedAchievementsCount] = await Promise.all([
      this.prisma.achievement.count(),
      this.prisma.userAchievement.count({
        where: { userId, progress: { gte: 100 } },
      }),
    ]);

    const averageQuizScore = Math.round(attemptsAgg._avg.percentage || 0);
    const highestQuizScore = Math.round(highestScoreAgg._max.percentage || 0);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        level: user.level,
        targetLevel: user.profile?.targetLevel || 'INTERMEDIATE',
        totalXp: user.profile?.totalXp || 0,
        streakDays: streakData.currentStreak,
        longestStreakDays: streakData.longestStreak,
        dailyGoalMinutes: user.profile?.dailyGoalMinutes || 15,
      },
      overview: {
        totalLearningTimeMinutes: totalStudyMinutes,
        totalLearningTimeFormatted,
        wordsLearned: totalWordsLearned,
        wordsMastered: totalMastered,
        lessonsCompleted: totalLessonsCompleted,
        averageQuizScore,
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
      },
      skills: {
        vocabulary: {
          percentage: vocabProgressPct,
          totalAvailable: totalVocabularies,
          wordsLearned: totalWordsLearned,
          learning: vocabStatusCounts.learning,
          reviewing: vocabStatusCounts.reviewing,
          mastered: vocabStatusCounts.mastered,
        },
        grammar: {
          percentage: grammarProgressPct,
          totalLessons: totalGrammarLessons,
          completedLessons: completedGrammarCount,
        },
        listening: {
          percentage: listeningProgressPct,
          totalLessons: totalListeningLessons,
          completedLessons: completedListeningCount,
        },
        reading: {
          percentage: readingProgressPct,
          totalArticles: totalReadingArticles,
          completedArticles: completedReadingCount,
        },
        speaking: {
          percentage: speakingProgressPct,
          totalConversations: speakingTarget,
          completedConversations: userConversationsCount,
        },
      },
      weeklyActivity,
      quizzes: {
        totalAttempts,
        passedAttempts,
        passRate:
          totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0,
        averageScore: averageQuizScore,
        highestScore: highestQuizScore,
      },
      vocabulary: {
        totalAvailable: totalVocabularies,
        totalEnrolled: totalWordsLearned,
        retentionRate:
          totalWordsLearned > 0
            ? Math.round((totalMastered / totalWordsLearned) * 100)
            : 0,
        ...vocabStatusCounts,
      },
      completedLessonsList,
      dailyGoal: {
        id: todayGoal.id,
        targetMinutes: todayGoal.targetMinutes,
        actualMinutes: todayGoal.actualMinutes,
        targetWords: todayGoal.targetWords,
        actualWords: todayGoal.actualWords,
        completed: todayGoal.completed,
        percentage: Math.min(
          100,
          Math.round(
            ((todayGoal.actualMinutes / Math.max(1, todayGoal.targetMinutes)) * 0.5 +
              (todayGoal.actualWords / Math.max(1, todayGoal.targetWords)) * 0.5) *
              100,
          ),
        ),
      },
      achievementsSummary: {
        totalUnlocked: unlockedAchievementsCount,
        totalAvailable: totalAchievementsCount,
      },
      learning: {
        totalActivities,
        totalStudyMinutes,
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

  async getContinueLearning(userId: string) {
    const items: Array<{
      id: string;
      type: string;
      category: string;
      title: string;
      progress: number;
      path: string;
    }> = [];

    // 1. Check user vocabularies with LEARNING or REVIEWING status
    const inProgressVocabs = await this.prisma.userVocabulary.findMany({
      where: {
        userId,
        status: { in: [VocabularyStatus.LEARNING, VocabularyStatus.REVIEWING] },
      },
      include: {
        vocabulary: {
          include: { topic: true },
        },
      },
      take: 10,
    });

    if (inProgressVocabs.length > 0) {
      // Find the topic with the most active words
      const topicCounts = new Map<
        string,
        { topic: { id: string; title: string }; count: number }
      >();
      for (const uv of inProgressVocabs) {
        const topic = uv.vocabulary?.topic;
        if (topic) {
          const current = topicCounts.get(topic.id) || { topic, count: 0 };
          current.count += 1;
          topicCounts.set(topic.id, current);
        }
      }

      const sortedTopics = Array.from(topicCounts.values()).sort(
        (a, b) => b.count - a.count,
      );
      if (sortedTopics.length > 0) {
        const topTopic = sortedTopics[0].topic;
        const totalWords = await this.prisma.vocabulary.count({
          where: { topicId: topTopic.id },
        });
        const userWordsInTopic = await this.prisma.userVocabulary.count({
          where: {
            userId,
            vocabulary: { topicId: topTopic.id },
            status: {
              in: [
                VocabularyStatus.LEARNING,
                VocabularyStatus.REVIEWING,
                VocabularyStatus.MASTERED,
              ],
            },
          },
        });
        const progressPct =
          totalWords > 0
            ? Math.min(100, Math.round((userWordsInTopic / totalWords) * 100))
            : 0;
        items.push({
          id: topTopic.id,
          type: 'vocabulary',
          category: 'Vocabulary',
          title: topTopic.title,
          progress: progressPct,
          path: '/vocabulary',
        });
      }
    }

    // 2. Check recent learning activities for grammar, listening, reading, or vocabulary
    const recentActivities = await this.prisma.learningActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    for (const act of recentActivities) {
      if (items.length >= 3) break;

      if (act.type === ActivityType.GRAMMAR && act.referenceId) {
        const alreadyHasGrammar = items.some((i) => i.category === 'Grammar');
        if (!alreadyHasGrammar) {
          const lesson = await this.prisma.grammarLesson.findFirst({
            where: {
              OR: [{ id: act.referenceId }, { slug: act.referenceId }],
            },
          });
          if (lesson) {
            items.push({
              id: lesson.id,
              type: 'grammar',
              category: 'Grammar',
              title: lesson.title,
              progress: 30,
              path: '/grammar',
            });
          }
        }
      } else if (act.type === ActivityType.LISTENING && act.referenceId) {
        const alreadyHasListening = items.some((i) => i.category === 'Listening');
        if (!alreadyHasListening) {
          const lesson = await this.prisma.listeningLesson.findFirst({
            where: {
              OR: [{ id: act.referenceId }, { slug: act.referenceId }],
            },
          });
          if (lesson) {
            items.push({
              id: lesson.id,
              type: 'listening',
              category: 'Listening',
              title: lesson.title,
              progress: 0,
              path: '/listening',
            });
          }
        }
      } else if (act.type === ActivityType.READING && act.referenceId) {
        const alreadyHasReading = items.some((i) => i.category === 'Reading');
        if (!alreadyHasReading) {
          const article = await this.prisma.readingArticle.findFirst({
            where: {
              OR: [{ id: act.referenceId }, { slug: act.referenceId }],
            },
          });
          if (article) {
            items.push({
              id: article.id,
              type: 'reading',
              category: 'Reading',
              title: article.title,
              progress: 0,
              path: '/reading',
            });
          }
        }
      } else if (act.type === ActivityType.VOCABULARY && act.referenceId) {
        const alreadyHasVocab = items.some((i) => i.category === 'Vocabulary');
        if (!alreadyHasVocab) {
          const topic = await this.prisma.vocabularyTopic.findFirst({
            where: {
              OR: [{ id: act.referenceId }, { slug: act.referenceId }],
            },
          });
          if (topic) {
            items.push({
              id: topic.id,
              type: 'vocabulary',
              category: 'Vocabulary',
              title: topic.title,
              progress: 60,
              path: '/vocabulary',
            });
          }
        }
      }
    }

    return items.slice(0, 3);
  }
}

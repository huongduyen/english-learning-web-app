import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityQueryDto } from './dto/activity-query.dto';
import { ActivityType, Prisma, VocabularyStatus } from '@prisma/client';

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

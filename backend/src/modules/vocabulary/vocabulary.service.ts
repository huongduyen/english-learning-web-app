import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VocabularyQueryDto } from './dto/vocabulary-query.dto';
import { ReviewVocabularyDto } from './dto/review-vocabulary.dto';
import { ActivityType, Prisma, VocabularyStatus } from '@prisma/client';

@Injectable()
export class VocabularyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: VocabularyQueryDto, userId?: string) {
    const {
      page = 1,
      limit = 20,
      search,
      topicId,
      level,
      difficulty,
      partOfSpeech,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.VocabularyWhereInput = {
      ...(topicId && { topicId }),
      ...(difficulty && { difficulty }),
      ...(level && { topic: { level } }),
      ...(partOfSpeech && {
        partOfSpeech: { contains: partOfSpeech, mode: 'insensitive' },
      }),
      ...(search && {
        OR: [
          { word: { contains: search, mode: 'insensitive' } },
          { meaning: { contains: search, mode: 'insensitive' } },
          { meaningVi: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, vocabularies] = await Promise.all([
      this.prisma.vocabulary.count({ where }),
      this.prisma.vocabulary.findMany({
        where,
        skip,
        take: limit,
        orderBy: { word: 'asc' },
        include: {
          topic: {
            select: {
              id: true,
              slug: true,
              title: true,
              titleVi: true,
              level: true,
            },
          },
        },
      }),
    ]);

    const progressMap = new Map<
      string,
      {
        status: VocabularyStatus;
        reviewCount: number;
        masteryScore: number;
        isFavorite: boolean;
        lastReviewedAt: Date | null;
        nextReviewAt: Date | null;
      }
    >();

    if (userId && vocabularies.length > 0) {
      const userVocabularies = await this.prisma.userVocabulary.findMany({
        where: {
          userId,
          vocabularyId: { in: vocabularies.map((v) => v.id) },
        },
        select: {
          vocabularyId: true,
          status: true,
          reviewCount: true,
          masteryScore: true,
          isFavorite: true,
          lastReviewedAt: true,
          nextReviewAt: true,
        },
      });

      for (const uv of userVocabularies) {
        progressMap.set(uv.vocabularyId, {
          status: uv.status,
          reviewCount: uv.reviewCount,
          masteryScore: uv.masteryScore,
          isFavorite: uv.isFavorite,
          lastReviewedAt: uv.lastReviewedAt,
          nextReviewAt: uv.nextReviewAt,
        });
      }
    }

    const formattedData = vocabularies.map((item) => ({
      ...item,
      userProgress: progressMap.get(item.id) || null,
    }));

    return {
      data: formattedData,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findTopics() {
    const topics = await this.prisma.vocabularyTopic.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { vocabularies: true },
        },
      },
    });

    return topics.map((t) => ({
      id: t.id,
      slug: t.slug,
      title: t.title,
      titleVi: t.titleVi,
      description: t.description,
      thumbnail: t.thumbnail,
      level: t.level,
      order: t.order,
      vocabularyCount: t._count.vocabularies,
    }));
  }

  async findOne(id: string, userId?: string) {
    const [vocabulary, userProgress] = await Promise.all([
      this.prisma.vocabulary.findUnique({
        where: { id },
        include: { topic: true },
      }),
      userId
        ? this.prisma.userVocabulary.findUnique({
            where: {
              userId_vocabularyId: {
                userId,
                vocabularyId: id,
              },
            },
          })
        : null,
    ]);

    if (!vocabulary) {
      throw new NotFoundException(`Vocabulary with ID ${id} not found`);
    }

    return {
      ...vocabulary,
      userProgress: userProgress
        ? {
            status: userProgress.status,
            reviewCount: userProgress.reviewCount,
            masteryScore: userProgress.masteryScore,
            isFavorite: userProgress.isFavorite,
            lastReviewedAt: userProgress.lastReviewedAt,
            nextReviewAt: userProgress.nextReviewAt,
          }
        : null,
    };
  }

  async learn(id: string, userId: string) {
    // 1. Check vocabulary exists
    const vocabulary = await this.prisma.vocabulary.findUnique({ where: { id } });
    if (!vocabulary) {
      throw new NotFoundException(`Vocabulary with ID ${id} not found`);
    }

    // 2. Ensure user profile exists or create activity
    const userVocabulary = await this.prisma.userVocabulary.upsert({
      where: {
        userId_vocabularyId: {
          userId,
          vocabularyId: id,
        },
      },
      create: {
        userId,
        vocabularyId: id,
        status: VocabularyStatus.LEARNING,
        reviewCount: 1,
        masteryScore: 20,
        lastReviewedAt: new Date(),
        nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next review in 1 day
      },
      update: {
        status: VocabularyStatus.LEARNING,
        lastReviewedAt: new Date(),
      },
    });

    // 3. Log learning activity
    await this.prisma.learningActivity.create({
      data: {
        userId,
        type: ActivityType.VOCABULARY,
        referenceId: id,
        durationMinutes: 2,
        metadata: { action: 'learn', word: vocabulary.word },
      },
    });

    // 4. Update profile XP
    await this.prisma.userProfile.updateMany({
      where: { userId },
      data: { totalXp: { increment: 5 } },
    });

    return userVocabulary;
  }

  async review(id: string, userId: string, dto: ReviewVocabularyDto) {
    const vocabulary = await this.prisma.vocabulary.findUnique({ where: { id } });
    if (!vocabulary) {
      throw new NotFoundException(`Vocabulary with ID ${id} not found`);
    }

    const existing = await this.prisma.userVocabulary.findUnique({
      where: {
        userId_vocabularyId: {
          userId,
          vocabularyId: id,
        },
      },
    });

    const isCorrect =
      dto.isCorrect !== false && (dto.rating === undefined || dto.rating >= 3);
    const scoreDelta = isCorrect ? (dto.rating ? dto.rating * 5 : 15) : -10;
    const currentScore = existing ? existing.masteryScore : 20;
    const newMasteryScore = Math.max(0, Math.min(100, currentScore + scoreDelta));
    const newReviewCount = (existing?.reviewCount || 0) + 1;

    // Spaced repetition interval: 1d, 3d, 7d, 14d, 30d
    const daysInterval = Math.min(30, Math.pow(2, Math.min(newReviewCount, 5)));
    const nextReviewAt = new Date(Date.now() + daysInterval * 24 * 60 * 60 * 1000);

    const status =
      newMasteryScore >= 80 ? VocabularyStatus.MASTERED : VocabularyStatus.REVIEWING;

    const userVocabulary = await this.prisma.userVocabulary.upsert({
      where: {
        userId_vocabularyId: {
          userId,
          vocabularyId: id,
        },
      },
      create: {
        userId,
        vocabularyId: id,
        status,
        reviewCount: 1,
        masteryScore: newMasteryScore,
        lastReviewedAt: new Date(),
        nextReviewAt,
      },
      update: {
        status,
        reviewCount: newReviewCount,
        masteryScore: newMasteryScore,
        lastReviewedAt: new Date(),
        nextReviewAt,
      },
    });

    await this.prisma.learningActivity.create({
      data: {
        userId,
        type: ActivityType.VOCABULARY,
        referenceId: id,
        durationMinutes: 1,
        score: newMasteryScore,
        metadata: { action: 'review', isCorrect, rating: dto.rating },
      },
    });

    if (isCorrect) {
      await this.prisma.userProfile.updateMany({
        where: { userId },
        data: { totalXp: { increment: 10 } },
      });
    }

    return userVocabulary;
  }

  async toggleFavorite(id: string, userId: string) {
    const vocabulary = await this.prisma.vocabulary.findUnique({ where: { id } });
    if (!vocabulary) {
      throw new NotFoundException(`Vocabulary with ID ${id} not found`);
    }

    const existing = await this.prisma.userVocabulary.findUnique({
      where: {
        userId_vocabularyId: {
          userId,
          vocabularyId: id,
        },
      },
    });

    const newFavorite = !existing?.isFavorite;

    const userVocabulary = await this.prisma.userVocabulary.upsert({
      where: {
        userId_vocabularyId: {
          userId,
          vocabularyId: id,
        },
      },
      create: {
        userId,
        vocabularyId: id,
        status: VocabularyStatus.NEW,
        isFavorite: true,
      },
      update: {
        isFavorite: newFavorite,
      },
    });

    return {
      vocabularyId: id,
      isFavorite: userVocabulary.isFavorite,
      status: userVocabulary.status,
    };
  }
}

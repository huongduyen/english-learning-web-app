import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReadingQueryDto } from './dto/reading-query.dto';
import { SubmitReadingDto } from './dto/submit-reading.dto';
import { ActivityType, Prisma } from '@prisma/client';

@Injectable()
export class ReadingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ReadingQueryDto, userId?: string) {
    const { page = 1, limit = 20, search, level, difficulty, topic } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ReadingArticleWhereInput = {
      ...(level && { level }),
      ...(difficulty && { difficulty }),
      ...(topic && { topic: { equals: topic, mode: 'insensitive' } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { titleVi: { contains: search, mode: 'insensitive' } },
          { summary: { contains: search, mode: 'insensitive' } },
          { topic: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, data] = await Promise.all([
      this.prisma.readingArticle.count({ where }),
      this.prisma.readingArticle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          quiz: {
            select: {
              id: true,
              title: true,
              passingScore: true,
              timeLimit: true,
              difficulty: true,
              _count: { select: { questions: true } },
              ...(userId && {
                attempts: {
                  where: { userId },
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                  select: {
                    id: true,
                    passed: true,
                    percentage: true,
                    score: true,
                    completedAt: true,
                  },
                },
              }),
            },
          },
        },
      }),
    ]);

    const formatted = data.map((item) => {
      const latestAttempt = (item.quiz as any)?.attempts?.[0];
      const isCompleted = Boolean(latestAttempt?.passed || latestAttempt?.completedAt);
      const lastScore = latestAttempt ? latestAttempt.percentage : null;

      return {
        id: item.id,
        slug: item.slug,
        title: item.title,
        titleVi: item.titleVi,
        summary: item.summary,
        description: item.summary,
        topic: item.topic || 'General',
        difficulty: item.difficulty,
        readingTime: item.readingTime,
        estimatedReadingTime: item.readingTime,
        level: item.level,
        isCompleted,
        lastScore,
        quiz: item.quiz
          ? {
              id: item.quiz.id,
              title: item.quiz.title,
              questionCount: item.quiz._count.questions,
              passingScore: item.quiz.passingScore,
              timeLimit: item.quiz.timeLimit,
            }
          : null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    return {
      data: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId?: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id,
    );

    const article = await this.prisma.readingArticle.findFirst({
      where: isUuid ? { OR: [{ id }, { slug: id }] } : { slug: id },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            passingScore: true,
            timeLimit: true,
            difficulty: true,
            questions: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                prompt: true,
                questionType: true,
                options: true,
                order: true,
                points: true,
              },
            },
            ...(userId && {
              attempts: {
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: {
                  id: true,
                  passed: true,
                  percentage: true,
                  score: true,
                  completedAt: true,
                },
              },
            }),
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException(`Reading article with identifier ${id} not found`);
    }

    const latestAttempt = (article.quiz as any)?.attempts?.[0];
    const isCompleted = Boolean(latestAttempt?.passed || latestAttempt?.completedAt);
    const lastScore = latestAttempt ? latestAttempt.percentage : null;
    const lastAttemptDate = latestAttempt ? latestAttempt.completedAt : null;
    const questions = (article.quiz?.questions || []).map((q) => ({
      id: q.id,
      prompt: q.prompt,
      questionType: q.questionType,
      options: q.options,
      order: q.order,
      points: q.points,
    }));

    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      titleVi: article.titleVi,
      summary: article.summary,
      description: article.summary,
      topic: article.topic || 'General',
      difficulty: article.difficulty,
      content: article.content,
      contentVi: article.contentVi,
      readingTime: article.readingTime,
      estimatedReadingTime: article.readingTime,
      level: article.level,
      isCompleted,
      lastScore,
      lastAttemptDate,
      quiz: article.quiz
        ? {
            id: article.quiz.id,
            title: article.quiz.title,
            questionCount: questions.length,
            passingScore: article.quiz.passingScore,
            timeLimit: article.quiz.timeLimit,
          }
        : null,
      questions,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  }

  async submit(id: string, userId: string, dto: SubmitReadingDto) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id,
    );

    const article = await this.prisma.readingArticle.findFirst({
      where: isUuid ? { OR: [{ id }, { slug: id }] } : { slug: id },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException(`Reading article with identifier ${id} not found`);
    }

    if (!article.quiz || article.quiz.questions.length === 0) {
      throw new BadRequestException(
        `No comprehension questions available for this article`,
      );
    }

    let earnedPoints = 0;
    let maxPoints = 0;
    const answerMap = new Map(dto.answers.map((a) => [a.questionId, a.answer.trim()]));

    const breakdown = article.quiz.questions.map((q) => {
      maxPoints += q.points;
      const submittedAnswer = answerMap.get(q.id);
      let isCorrect = false;

      if (
        submittedAnswer !== undefined &&
        submittedAnswer !== null &&
        submittedAnswer !== ''
      ) {
        const cleanSubmitted = submittedAnswer.trim().toLowerCase();
        const cleanCorrect = q.correctAnswer.trim().toLowerCase();

        if (q.questionType === 'MULTIPLE_CHOICE') {
          if (cleanSubmitted === cleanCorrect) {
            isCorrect = true;
          } else if (Array.isArray(q.options)) {
            const matchedOption = (q.options as any[]).find(
              (opt) =>
                (opt.id &&
                  opt.id.toLowerCase() === cleanSubmitted &&
                  opt.id.toLowerCase() === cleanCorrect) ||
                (opt.text &&
                  opt.text.toLowerCase() === cleanSubmitted &&
                  opt.id &&
                  opt.id.toLowerCase() === cleanCorrect) ||
                (opt.id &&
                  opt.id.toLowerCase() === cleanSubmitted &&
                  opt.text &&
                  opt.text.toLowerCase() === cleanCorrect),
            );
            isCorrect = !!matchedOption;
          }
        } else {
          isCorrect = cleanSubmitted === cleanCorrect;
        }
      }

      const pointsEarned = isCorrect ? q.points : 0;
      earnedPoints += pointsEarned;

      return {
        questionId: q.id,
        prompt: q.prompt,
        questionType: q.questionType,
        options: q.options,
        submittedAnswer: submittedAnswer || null,
        correctAnswer: q.correctAnswer,
        isCorrect,
        points: q.points,
        pointsEarned,
        explanation: q.explanation,
        explanationVi: q.explanationVi,
      };
    });

    const percentage =
      maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 1000) / 10 : 0;
    const passed = percentage >= article.quiz.passingScore;
    const correctCount = breakdown.filter((b) => b.isCorrect).length;
    const incorrectCount = breakdown.length - correctCount;

    // 1. Record Quiz Attempt
    const attempt = await this.prisma.quizAttempt.create({
      data: {
        userId,
        quizId: article.quiz.id,
        score: earnedPoints,
        maxScore: maxPoints,
        percentage,
        passed,
        answers: dto.answers as any,
        completedAt: new Date(),
      },
    });

    // 2. Log Learning Activity
    await this.prisma.learningActivity.create({
      data: {
        userId,
        type: ActivityType.READING,
        referenceId: article.id,
        durationMinutes: Math.max(
          1,
          Math.round(
            (dto.durationSeconds ||
              (article.readingTime ? article.readingTime * 60 : 300)) / 60,
          ),
        ),
        score: percentage,
        metadata: {
          articleTitle: article.title,
          passed,
          attemptId: attempt.id,
        },
      },
    });

    // 3. Award XP
    const xpReward = passed ? 30 : 10;
    await this.prisma.userProfile.updateMany({
      where: { userId },
      data: { totalXp: { increment: xpReward } },
    });

    return {
      attemptId: attempt.id,
      articleId: article.id,
      quizId: article.quiz.id,
      score: earnedPoints,
      maxScore: maxPoints,
      percentage,
      passed,
      passingScore: article.quiz.passingScore,
      correctCount,
      incorrectCount,
      xpAwarded: xpReward,
      completedAt: attempt.completedAt,
      breakdown,
    };
  }
}

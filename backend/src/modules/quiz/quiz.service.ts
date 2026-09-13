import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QuizQueryDto } from './dto/quiz-query.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { ActivityType, Prisma } from '@prisma/client';

@Injectable()
export class QuizService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QuizQueryDto) {
    const { page = 1, limit = 20, search, level, difficulty } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.QuizWhereInput = {
      ...(level && { level }),
      ...(difficulty && { difficulty }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, data] = await Promise.all([
      this.prisma.quiz.count({ where }),
      this.prisma.quiz.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { questions: true, attempts: true },
          },
          listeningLesson: {
            select: { id: true, title: true, slug: true },
          },
          readingArticle: {
            select: { id: true, title: true, slug: true },
          },
        },
      }),
    ]);

    const formatted = data.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      level: quiz.level,
      difficulty: quiz.difficulty,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      questionCount: quiz._count.questions,
      attemptsCount: quiz._count.attempts,
      lessonType: quiz.listeningLesson
        ? 'LISTENING'
        : quiz.readingArticle
          ? 'READING'
          : 'GENERAL',
      associatedLesson: quiz.listeningLesson || quiz.readingArticle || null,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
    }));

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

  async findOne(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
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
        listeningLesson: {
          select: { id: true, title: true, audioUrl: true },
        },
        readingArticle: {
          select: { id: true, title: true },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return quiz;
  }

  async submit(id: string, userId: string, dto: SubmitQuizDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    let earnedPoints = 0;
    let maxPoints = 0;
    const answerMap = new Map(dto.answers.map((a) => [a.questionId, a.answer.trim()]));

    const breakdown = quiz.questions.map((q) => {
      maxPoints += q.points;
      const submittedAnswer = answerMap.get(q.id);
      const isCorrect =
        submittedAnswer !== undefined &&
        submittedAnswer.toLowerCase() === q.correctAnswer.trim().toLowerCase();

      const pointsEarned = isCorrect ? q.points : 0;
      earnedPoints += pointsEarned;

      return {
        questionId: q.id,
        prompt: q.prompt,
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
    const passed = percentage >= quiz.passingScore;

    // 1. Record Quiz Attempt
    const attempt = await this.prisma.quizAttempt.create({
      data: {
        userId,
        quizId: id,
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
        type: ActivityType.QUIZ,
        referenceId: id,
        durationMinutes: quiz.timeLimit || 5,
        score: percentage,
        metadata: {
          quizTitle: quiz.title,
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
      quizId: quiz.id,
      quizTitle: quiz.title,
      score: earnedPoints,
      maxScore: maxPoints,
      percentage,
      passed,
      passingScore: quiz.passingScore,
      xpAwarded: xpReward,
      completedAt: attempt.completedAt,
      breakdown,
    };
  }
}

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
          grammarLesson: {
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
          : quiz.grammarLesson
            ? 'GRAMMAR'
            : 'GENERAL',
      associatedLesson:
        quiz.listeningLesson || quiz.readingArticle || quiz.grammarLesson || null,
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
        grammarLesson: {
          select: { id: true, title: true, slug: true },
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
      let isCorrect = false;

      if (submittedAnswer !== undefined && submittedAnswer !== null && submittedAnswer !== '') {
        const cleanSubmitted = submittedAnswer.trim();
        const cleanCorrect = q.correctAnswer.trim();

        if (q.questionType === 'SENTENCE_ORDERING') {
          // Normalize whitespace, casing, and trailing punctuation
          const normSub = cleanSubmitted.toLowerCase().replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ');
          const normCorr = cleanCorrect.toLowerCase().replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ');
          isCorrect = normSub === normCorr;
        } else if (q.questionType === 'MATCHING') {
          // Compare sorted pairs e.g. "1:a,2:b" vs "2:b,1:a"
          const subPairs = cleanSubmitted.toLowerCase().split(',').map((s) => s.trim()).sort().join(',');
          const corrPairs = cleanCorrect.toLowerCase().split(',').map((s) => s.trim()).sort().join(',');
          isCorrect = subPairs === corrPairs;
        } else if (q.questionType === 'FILL_BLANK' || q.questionType === 'SENTENCE_CORRECTION') {
          // Support multiple acceptable alternatives separated by |
          const alternatives = cleanCorrect.split(/\s*\|\s*/).map((s) => s.toLowerCase().trim());
          isCorrect = alternatives.includes(cleanSubmitted.toLowerCase());
        } else if (q.questionType === 'MULTIPLE_CHOICE') {
          // Check if matches option id or option text
          const directMatch = cleanSubmitted.toLowerCase() === cleanCorrect.toLowerCase();
          if (directMatch) {
            isCorrect = true;
          } else if (Array.isArray(q.options)) {
            const matchedOption = (q.options as any[]).find(
              (opt) =>
                (opt.id && opt.id.toLowerCase() === cleanSubmitted.toLowerCase() && opt.id.toLowerCase() === cleanCorrect.toLowerCase()) ||
                (opt.text && opt.text.toLowerCase() === cleanSubmitted.toLowerCase() && opt.id && opt.id.toLowerCase() === cleanCorrect.toLowerCase()) ||
                (opt.id && opt.id.toLowerCase() === cleanSubmitted.toLowerCase() && opt.text && opt.text.toLowerCase() === cleanCorrect.toLowerCase()),
            );
            isCorrect = !!matchedOption;
          }
        } else {
          isCorrect = cleanSubmitted.toLowerCase() === cleanCorrect.toLowerCase();
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
    const passed = percentage >= quiz.passingScore;
    const correctCount = breakdown.filter((b) => b.isCorrect).length;
    const incorrectCount = breakdown.length - correctCount;

    // 1. Record Quiz Attempt in PostgreSQL
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

    // 3. Award XP to learner
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
      correctCount,
      incorrectCount,
      xpAwarded: xpReward,
      completedAt: attempt.completedAt,
      breakdown,
    };
  }
}

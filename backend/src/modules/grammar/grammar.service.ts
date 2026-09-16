import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GrammarQueryDto } from './dto/grammar-query.dto';
import { SubmitGrammarExerciseDto } from './dto/submit-exercise.dto';
import { ActivityType, Prisma } from '@prisma/client';

export interface GrammarCategorySummary {
  slug: string;
  name: string;
  nameVi: string;
  description: string;
  icon: string;
  lessonCount: number;
}

export const GRAMMAR_CATEGORIES: Array<{
  slug: string;
  name: string;
  nameVi: string;
  description: string;
  icon: string;
}> = [
  {
    slug: 'basic-grammar',
    name: 'Basic Grammar',
    nameVi: 'Ngữ Pháp Căn Bản',
    description:
      'Word classes, sentence construction, adjectives, comparatives, and relative clauses.',
    icon: 'BookOpen',
  },
  {
    slug: 'tenses',
    name: 'Tenses',
    nameVi: 'Các Thì Trong Tiếng Anh',
    description:
      'Master present, past, future, continuous, and perfect tenses with timeline rules.',
    icon: 'Clock',
  },
  {
    slug: 'modal-verbs',
    name: 'Modal Verbs',
    nameVi: 'Động Từ Khuyết Thiếu',
    description:
      'Can, could, must, should, may, might, and have to for ability, obligations, and advice.',
    icon: 'Sparkles',
  },
  {
    slug: 'articles',
    name: 'Articles',
    nameVi: 'Mạo Từ (A, An, The)',
    description:
      'Definite, indefinite, and zero articles with countability distinctions.',
    icon: 'FileText',
  },
  {
    slug: 'prepositions',
    name: 'Prepositions',
    nameVi: 'Giới Từ Chỉ Thời Gian & Nơi Chốn',
    description: 'In, on, at, by, for, and common dependent prepositions.',
    icon: 'Compass',
  },
  {
    slug: 'conditionals',
    name: 'Conditionals',
    nameVi: 'Câu Điều Kiện',
    description:
      'Zero, First, Second, and Third conditionals, hypothetical clauses, and unless.',
    icon: 'GitFork',
  },
  {
    slug: 'passive-voice',
    name: 'Passive Voice',
    nameVi: 'Câu Bị Động',
    description:
      'Transform active statements into passive constructions across various tenses.',
    icon: 'Repeat',
  },
  {
    slug: 'reported-speech',
    name: 'Reported Speech',
    nameVi: 'Câu Trực Tiếp & Gián Tiếp',
    description:
      'Tense backshifting, pronouns transformation, and reporting questions & commands.',
    icon: 'MessageSquareQuote',
  },
];

@Injectable()
export class GrammarService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GrammarQueryDto) {
    const { page = 1, limit = 20, search, level, category } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.GrammarLessonWhereInput = {
      ...(level && { level }),
      ...(category && {
        category: {
          equals: category,
          mode: 'insensitive',
        },
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { titleVi: { contains: search, mode: 'insensitive' } },
          { summary: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, data] = await Promise.all([
      this.prisma.grammarLesson.count({ where }),
      this.prisma.grammarLesson.findMany({
        where,
        skip,
        take: limit,
        orderBy: { order: 'asc' },
        include: {
          _count: {
            select: { exercises: true },
          },
          quiz: {
            select: { id: true, title: true, timeLimit: true, passingScore: true },
          },
        },
      }),
    ]);

    const formatted = data.map((lesson) => ({
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      titleVi: lesson.titleVi,
      category: lesson.category,
      categoryVi: lesson.categoryVi,
      summary: lesson.summary,
      level: lesson.level,
      order: lesson.order,
      exerciseCount: lesson._count.exercises,
      quiz: lesson.quiz,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
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

  async getCategories(): Promise<GrammarCategorySummary[]> {
    // Count lessons per category from the database
    const counts = await this.prisma.grammarLesson.groupBy({
      by: ['category'],
      _count: { id: true },
    });

    const countMap = new Map<string, number>();
    counts.forEach((c) => {
      countMap.set(c.category.toLowerCase(), c._count.id);
    });

    return GRAMMAR_CATEGORIES.map((cat) => ({
      ...cat,
      lessonCount: countMap.get(cat.name.toLowerCase()) || 0,
    }));
  }

  async findOne(id: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id,
    );

    const lesson = await this.prisma.grammarLesson.findFirst({
      where: isUuid ? { OR: [{ id }, { slug: id }] } : { slug: id },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
        },
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            timeLimit: true,
            passingScore: true,
            _count: { select: { questions: true } },
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Grammar lesson with identifier ${id} not found`);
    }

    return lesson;
  }

  async findExercises(id: string) {
    const lesson = await this.findOne(id);
    return this.prisma.grammarExercise.findMany({
      where: { lessonId: lesson.id },
      orderBy: { order: 'asc' },
    });
  }

  async submitExercises(id: string, userId: string, dto: SubmitGrammarExerciseDto) {
    const lesson = await this.findOne(id);
    const exercises = await this.prisma.grammarExercise.findMany({
      where: { lessonId: lesson.id },
      orderBy: { order: 'asc' },
    });

    if (!exercises || exercises.length === 0) {
      throw new NotFoundException(`No exercises found for grammar lesson ${id}`);
    }

    const answerMap = new Map(dto.answers.map((a) => [a.exerciseId, a.answer.trim()]));
    let correctCount = 0;

    const breakdown = exercises.map((ex) => {
      const submitted = answerMap.get(ex.id) || '';
      const correct = ex.correctAnswer.trim();

      // Normalize comparison for case and multiple acceptable options (delimited by | or /)
      const validOptions = correct.split(/\s*\|\s*/).map((s) => s.toLowerCase().trim());
      const isCorrect = validOptions.includes(submitted.toLowerCase().trim());

      if (isCorrect) correctCount++;

      return {
        exerciseId: ex.id,
        instruction: ex.instruction,
        question: ex.question,
        questionType: ex.questionType,
        submittedAnswer: submitted || null,
        correctAnswer: ex.correctAnswer,
        isCorrect,
        explanation: ex.explanation,
        explanationVi: ex.explanationVi,
      };
    });

    const totalQuestions = exercises.length;
    const percentage =
      totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = percentage >= 70;

    // Log Learning Activity for user progress
    await this.prisma.learningActivity.create({
      data: {
        userId,
        type: ActivityType.GRAMMAR,
        referenceId: lesson.id,
        durationMinutes: 5,
        score: percentage,
        metadata: {
          lessonTitle: lesson.title,
          lessonSlug: lesson.slug,
          category: lesson.category,
          correctCount,
          totalQuestions,
          passed,
        },
      },
    });

    // Award XP
    const xpEarned = passed ? 25 : 10;
    await this.prisma.userProfile.updateMany({
      where: { userId },
      data: { totalXp: { increment: xpEarned } },
    });

    return {
      lessonId: lesson.id,
      lessonSlug: lesson.slug,
      lessonTitle: lesson.title,
      totalQuestions,
      correctCount,
      incorrectCount: totalQuestions - correctCount,
      percentage,
      passed,
      xpAwarded: xpEarned,
      breakdown,
    };
  }
}

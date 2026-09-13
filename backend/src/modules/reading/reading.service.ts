import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReadingQueryDto } from './dto/reading-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReadingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ReadingQueryDto) {
    const { page = 1, limit = 20, search, level } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ReadingArticleWhereInput = {
      ...(level && { level }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { titleVi: { contains: search, mode: 'insensitive' } },
          { summary: { contains: search, mode: 'insensitive' } },
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
              _count: { select: { questions: true } },
            },
          },
        },
      }),
    ]);

    const formatted = data.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      titleVi: item.titleVi,
      summary: item.summary,
      level: item.level,
      readingTime: item.readingTime,
      quiz: item.quiz
        ? {
            id: item.quiz.id,
            title: item.quiz.title,
            questionCount: item.quiz._count.questions,
            passingScore: item.quiz.passingScore,
          }
        : null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
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
            _count: { select: { questions: true } },
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException(`Reading article with identifier ${id} not found`);
    }

    return {
      ...article,
      quiz: article.quiz
        ? {
            id: article.quiz.id,
            title: article.quiz.title,
            questionCount: article.quiz._count.questions,
            passingScore: article.quiz.passingScore,
            timeLimit: article.quiz.timeLimit,
          }
        : null,
    };
  }
}

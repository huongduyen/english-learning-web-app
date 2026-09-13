import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ListeningQueryDto } from './dto/listening-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ListeningService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListeningQueryDto) {
    const { page = 1, limit = 20, search, level } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ListeningLessonWhereInput = {
      ...(level && { level }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { titleVi: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, data] = await Promise.all([
      this.prisma.listeningLesson.count({ where }),
      this.prisma.listeningLesson.findMany({
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
      description: item.description,
      audioUrl: item.audioUrl,
      duration: item.duration,
      level: item.level,
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

    const lesson = await this.prisma.listeningLesson.findFirst({
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

    if (!lesson) {
      throw new NotFoundException(`Listening lesson with identifier ${id} not found`);
    }

    return {
      ...lesson,
      quiz: lesson.quiz
        ? {
            id: lesson.quiz.id,
            title: lesson.quiz.title,
            questionCount: lesson.quiz._count.questions,
            passingScore: lesson.quiz.passingScore,
            timeLimit: lesson.quiz.timeLimit,
          }
        : null,
    };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GrammarQueryDto } from './dto/grammar-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GrammarService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GrammarQueryDto) {
    const { page = 1, limit = 20, search, level } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.GrammarLessonWhereInput = {
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
        },
      }),
    ]);

    const formatted = data.map((lesson) => ({
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      titleVi: lesson.titleVi,
      summary: lesson.summary,
      level: lesson.level,
      order: lesson.order,
      exerciseCount: lesson._count.exercises,
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
}

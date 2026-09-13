import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConversationDto, SendMessageDto } from './dto/create-conversation.dto';
import { MessageRole } from '@prisma/client';

@Injectable()
export class AiTutorService {
  constructor(private readonly prisma: PrismaService) {}

  async listConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { messages: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { content: true, role: true, createdAt: true },
        },
      },
    });
  }

  async getConversation(id: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation || conversation.userId !== userId) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    return conversation;
  }

  async createConversation(userId: string, dto: CreateConversationDto) {
    const conversation = await this.prisma.conversation.create({
      data: {
        userId,
        title: dto.title || 'English Conversation Practice',
        topic: dto.topic || 'General Discussion',
        scenario: dto.scenario || 'Casual conversation',
        level: dto.level || 'BEGINNER',
        messages: {
          create: {
            role: MessageRole.ASSISTANT,
            content: `Hello! I'm your AI English Tutor. Let's practice speaking about ${dto.topic || 'anything you like'}. How has your day been?`,
          },
        },
      },
      include: {
        messages: true,
      },
    });

    return conversation;
  }

  async sendMessage(id: string, userId: string, dto: SendMessageDto) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation || conversation.userId !== userId) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    // 1. Record user message
    const userMsg = await this.prisma.conversationMessage.create({
      data: {
        conversationId: id,
        role: MessageRole.USER,
        content: dto.content,
      },
    });

    // 2. Simulated AI response placeholder (Pending full Phase 4 LLM integration)
    const assistantMsg = await this.prisma.conversationMessage.create({
      data: {
        conversationId: id,
        role: MessageRole.ASSISTANT,
        content: `Great sentence! That was clear and well-expressed. Let's continue practicing: can you tell me more about that?`,
        feedback: {
          grammar: 'Good grammatical structure',
          vocabularySuggestions: [],
        },
      },
    });

    await this.prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return {
      userMessage: userMsg,
      assistantMessage: assistantMsg,
    };
  }
}

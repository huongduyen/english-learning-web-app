import { Controller, Get, Post, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AiTutorService } from './ai-tutor.service';
import { CreateConversationDto, SendMessageDto } from './dto/create-conversation.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('AI Tutor')
@Controller('ai-tutor')
export class AiTutorController {
  constructor(private readonly aiTutorService: AiTutorService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'List conversational practice sessions for current user' })
  @ApiResponse({ status: 200, description: 'List of conversations' })
  async getConversations(@CurrentUser() userId: string) {
    return this.aiTutorService.listConversations(userId);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get conversation details and message history' })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  @ApiResponse({ status: 200, description: 'Conversation history' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getConversation(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.aiTutorService.getConversation(id, userId);
  }

  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Start a new AI conversation practice session' })
  @ApiResponse({ status: 201, description: 'Conversation started' })
  async createConversation(
    @Body() dto: CreateConversationDto,
    @CurrentUser() userId: string,
  ) {
    return this.aiTutorService.createConversation(userId, dto);
  }

  @Post('conversations/:id/messages')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a message in conversation session' })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  @ApiResponse({ status: 200, description: 'Message processed and response generated' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async sendMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() userId: string,
  ) {
    return this.aiTutorService.sendMessage(id, userId, dto);
  }
}

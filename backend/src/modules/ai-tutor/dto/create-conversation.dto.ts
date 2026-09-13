import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EnglishLevel } from '@prisma/client';

export class CreateConversationDto {
  @ApiPropertyOptional({
    description: 'Conversation title',
    example: 'Ordering coffee at a cafe',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Practice topic', example: 'Food & Drinks' })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiPropertyOptional({
    description: 'Roleplay scenario',
    example: 'Barista and customer',
  })
  @IsOptional()
  @IsString()
  scenario?: string;

  @ApiPropertyOptional({
    enum: EnglishLevel,
    description: 'Target CEFR proficiency level',
  })
  @IsOptional()
  @IsEnum(EnglishLevel)
  level?: EnglishLevel;
}

export class SendMessageDto {
  @ApiPropertyOptional({
    description: 'Message content from user',
    example: 'Hello! I would like to order a cappuccino.',
  })
  @IsString()
  content: string;
}

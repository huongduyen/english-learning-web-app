import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType } from '@prisma/client';

export class CreateActivityDto {
  @ApiProperty({ enum: ActivityType, description: 'Type of learning activity' })
  @IsEnum(ActivityType)
  type: ActivityType;

  @ApiPropertyOptional({
    description: 'ID or slug of associated lesson, article, or topic',
  })
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiPropertyOptional({
    description: 'Duration spent on this activity in minutes',
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  durationMinutes?: number;

  @ApiPropertyOptional({ description: 'Score or percentage achieved (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  score?: number;

  @ApiPropertyOptional({
    description: 'Number of words learned or reviewed during activity',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  wordsLearned?: number;

  @ApiPropertyOptional({ description: 'Additional structured metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}

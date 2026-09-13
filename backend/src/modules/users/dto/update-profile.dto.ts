import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EnglishLevel } from '@prisma/client';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'User display name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ enum: EnglishLevel, description: 'Target English level' })
  @IsOptional()
  @IsEnum(EnglishLevel)
  targetLevel?: EnglishLevel;

  @ApiPropertyOptional({ description: 'Native language code (e.g. vi)' })
  @IsOptional()
  @IsString()
  nativeLanguage?: string;

  @ApiPropertyOptional({
    description: 'Daily study goal in minutes',
    minimum: 5,
    maximum: 180,
  })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(180)
  dailyGoalMinutes?: number;
}

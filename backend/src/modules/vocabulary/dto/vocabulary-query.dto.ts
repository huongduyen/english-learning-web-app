import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EnglishLevel, Difficulty } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class VocabularyQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by topic ID' })
  @IsOptional()
  @IsString()
  topicId?: string;

  @ApiPropertyOptional({ enum: EnglishLevel, description: 'Filter by English level' })
  @IsOptional()
  @IsEnum(EnglishLevel)
  level?: EnglishLevel;

  @ApiPropertyOptional({ enum: Difficulty, description: 'Filter by difficulty' })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiPropertyOptional({
    description: 'Filter by part of speech (noun, verb, adjective, etc.)',
  })
  @IsOptional()
  @IsString()
  partOfSpeech?: string;
}

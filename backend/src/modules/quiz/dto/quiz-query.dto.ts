import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EnglishLevel, Difficulty } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QuizQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: EnglishLevel, description: 'Filter by English level' })
  @IsOptional()
  @IsEnum(EnglishLevel)
  level?: EnglishLevel;

  @ApiPropertyOptional({ enum: Difficulty, description: 'Filter by difficulty' })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;
}

import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty, EnglishLevel } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ReadingQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: EnglishLevel, description: 'Filter by English level' })
  @IsOptional()
  @IsEnum(EnglishLevel)
  level?: EnglishLevel;

  @ApiPropertyOptional({ enum: Difficulty, description: 'Filter by difficulty' })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiPropertyOptional({ description: 'Filter by topic name' })
  @IsOptional()
  @IsString()
  topic?: string;
}

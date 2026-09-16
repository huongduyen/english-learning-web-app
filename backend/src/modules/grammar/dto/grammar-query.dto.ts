import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EnglishLevel } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class GrammarQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: EnglishLevel, description: 'Filter by English level' })
  @IsOptional()
  @IsEnum(EnglishLevel)
  level?: EnglishLevel;

  @ApiPropertyOptional({ description: 'Filter by grammar category' })
  @IsOptional()
  category?: string;
}

import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ActivityQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ActivityType, description: 'Filter by activity type' })
  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;
}

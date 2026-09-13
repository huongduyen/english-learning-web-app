import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDailyGoalDto {
  @ApiPropertyOptional({ description: 'Target study duration in minutes', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  targetMinutes?: number;

  @ApiPropertyOptional({
    description: 'Actual study duration achieved in minutes',
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  actualMinutes?: number;

  @ApiPropertyOptional({ description: 'Target words to learn', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  targetWords?: number;

  @ApiPropertyOptional({ description: 'Actual words learned', minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  actualWords?: number;

  @ApiPropertyOptional({ description: 'Manual completion override status' })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

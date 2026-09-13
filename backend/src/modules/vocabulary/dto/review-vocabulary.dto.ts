import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewVocabularyDto {
  @ApiPropertyOptional({
    description: 'Whether the review answer was correct',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean = true;

  @ApiPropertyOptional({
    description: 'Self-assessed quality rating (1 to 5)',
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
}

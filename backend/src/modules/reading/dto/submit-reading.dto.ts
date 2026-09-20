import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReadingAnswerDto {
  @ApiProperty({ description: 'Question UUID' })
  @IsNotEmpty({ message: 'Question ID is required' })
  @IsString()
  questionId: string;

  @ApiProperty({ description: 'Selected answer key or text' })
  @IsNotEmpty({ message: 'Answer cannot be empty' })
  @IsString()
  answer: string;
}

export class SubmitReadingDto {
  @ApiProperty({ type: [ReadingAnswerDto], description: 'List of answered questions' })
  @IsArray({ message: 'Answers must be an array' })
  @ArrayNotEmpty({ message: 'Answers array cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => ReadingAnswerDto)
  answers: ReadingAnswerDto[];

  @ApiPropertyOptional({ description: 'Time spent reading and answering in seconds' })
  @IsOptional()
  @IsNumber()
  durationSeconds?: number;
}

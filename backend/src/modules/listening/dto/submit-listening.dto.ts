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

export class ListeningAnswerDto {
  @ApiProperty({ description: 'Question UUID' })
  @IsNotEmpty({ message: 'Question ID is required' })
  @IsString()
  questionId: string;

  @ApiProperty({ description: 'Selected answer key or text' })
  @IsNotEmpty({ message: 'Answer cannot be empty' })
  @IsString()
  answer: string;
}

export class SubmitListeningDto {
  @ApiProperty({ type: [ListeningAnswerDto], description: 'List of answered questions' })
  @IsArray({ message: 'Answers must be an array' })
  @ArrayNotEmpty({ message: 'Answers array cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => ListeningAnswerDto)
  answers: ListeningAnswerDto[];

  @ApiPropertyOptional({ description: 'Time spent listening and answering in seconds' })
  @IsOptional()
  @IsNumber()
  durationSeconds?: number;
}

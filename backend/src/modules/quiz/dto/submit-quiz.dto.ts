import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuestionAnswerDto {
  @ApiProperty({ description: 'Question ID' })
  @IsNotEmpty()
  @IsString()
  questionId: string;

  @ApiProperty({ description: 'Selected answer key or text' })
  @IsNotEmpty()
  @IsString()
  answer: string;
}

export class SubmitQuizDto {
  @ApiProperty({ type: [QuestionAnswerDto], description: 'List of answered questions' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerDto)
  answers: QuestionAnswerDto[];

  @ApiPropertyOptional({ description: 'Time spent in seconds' })
  @IsOptional()
  @IsNumber()
  durationSeconds?: number;
}


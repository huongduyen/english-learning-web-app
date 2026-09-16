import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ExerciseAnswerDto {
  @ApiProperty({ description: 'Grammar exercise UUID' })
  @IsNotEmpty()
  @IsString()
  exerciseId: string;

  @ApiProperty({ description: 'Learner submitted answer' })
  @IsNotEmpty()
  @IsString()
  answer: string;
}

export class SubmitGrammarExerciseDto {
  @ApiProperty({ type: [ExerciseAnswerDto], description: 'List of submitted exercise answers' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseAnswerDto)
  answers: ExerciseAnswerDto[];
}

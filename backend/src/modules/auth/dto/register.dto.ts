import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnglishLevel } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ description: 'User email address', example: 'newlearner@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ description: 'User full name', example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    enum: EnglishLevel,
    description: 'Current English proficiency level',
  })
  @IsOptional()
  @IsEnum(EnglishLevel)
  level?: EnglishLevel;

  @ApiPropertyOptional({
    enum: EnglishLevel,
    description: 'Target English level to achieve',
  })
  @IsOptional()
  @IsEnum(EnglishLevel)
  targetLevel?: EnglishLevel;
}

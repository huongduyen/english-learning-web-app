import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnglishLevel } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ description: 'User email address', example: 'newlearner@example.com' })
  @IsEmail({}, { message: 'Invalid email address format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description:
      'Account password (min 8 characters, with uppercase, lowercase, number, and special character)',
    example: 'Password123!',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#_()\-+=<>.,])[A-Za-z\d@$!%*?&^#_()\-+=<>.,]{8,}$/,
    {
      message:
        'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (!@#$%^&*)',
    },
  )
  password: string;

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

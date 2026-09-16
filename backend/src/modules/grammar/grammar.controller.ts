import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GrammarService } from './grammar.service';
import { GrammarQueryDto } from './dto/grammar-query.dto';
import { SubmitGrammarExerciseDto } from './dto/submit-exercise.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Grammar')
@Controller('grammar')
export class GrammarController {
  constructor(private readonly grammarService: GrammarService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get all grammar categories with lesson counts' })
  @ApiResponse({
    status: 200,
    description: 'List of grammar categories with metadata and lesson counts',
  })
  async getCategories() {
    return this.grammarService.getCategories();
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated grammar lessons' })
  @ApiResponse({
    status: 200,
    description: 'Paginated grammar lessons with exercise count and category',
  })
  async getLessons(@Query() query: GrammarQueryDto) {
    return this.grammarService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get grammar lesson by ID or slug' })
  @ApiParam({ name: 'id', description: 'Lesson UUID or slug' })
  @ApiResponse({ status: 200, description: 'Grammar lesson details' })
  @ApiResponse({ status: 404, description: 'Grammar lesson not found' })
  async getLessonById(@Param('id') id: string) {
    return this.grammarService.findOne(id);
  }

  @Get(':id/exercises')
  @ApiOperation({ summary: 'Get exercises for a grammar lesson' })
  @ApiParam({ name: 'id', description: 'Lesson UUID or slug' })
  @ApiResponse({ status: 200, description: 'List of grammar exercises' })
  @ApiResponse({ status: 404, description: 'Grammar lesson not found' })
  async getLessonExercises(@Param('id') id: string) {
    return this.grammarService.findExercises(id);
  }

  @Post(':id/exercises/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit grammar exercises and get graded results' })
  @ApiParam({ name: 'id', description: 'Lesson UUID or slug' })
  @ApiResponse({ status: 200, description: 'Graded exercise results with explanation' })
  async submitExercises(
    @Param('id') id: string,
    @Body() dto: SubmitGrammarExerciseDto,
    @CurrentUser() userId: string,
  ) {
    return this.grammarService.submitExercises(id, userId, dto);
  }
}

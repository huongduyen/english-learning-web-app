import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GrammarService } from './grammar.service';
import { GrammarQueryDto } from './dto/grammar-query.dto';

@ApiTags('Grammar')
@Controller('grammar')
export class GrammarController {
  constructor(private readonly grammarService: GrammarService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated grammar lessons' })
  @ApiResponse({
    status: 200,
    description: 'Paginated grammar lessons with exercise count',
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
}

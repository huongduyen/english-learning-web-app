import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ReadingService } from './reading.service';
import { ReadingQueryDto } from './dto/reading-query.dto';

@ApiTags('Reading')
@Controller('reading')
export class ReadingController {
  constructor(private readonly readingService: ReadingService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated reading articles' })
  @ApiResponse({ status: 200, description: 'Paginated reading articles' })
  async getArticles(@Query() query: ReadingQueryDto) {
    return this.readingService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reading article by ID or slug' })
  @ApiParam({ name: 'id', description: 'Article UUID or slug' })
  @ApiResponse({ status: 200, description: 'Reading article details and content' })
  @ApiResponse({ status: 404, description: 'Reading article not found' })
  async getArticleById(@Param('id') id: string) {
    return this.readingService.findOne(id);
  }
}

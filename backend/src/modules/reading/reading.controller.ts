import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ReadingService } from './reading.service';
import { ReadingQueryDto } from './dto/reading-query.dto';
import { SubmitReadingDto } from './dto/submit-reading.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Reading')
@Controller('reading')
export class ReadingController {
  constructor(private readonly readingService: ReadingService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated reading articles with progress' })
  @ApiResponse({ status: 200, description: 'Paginated reading articles' })
  async getArticles(@Query() query: ReadingQueryDto, @CurrentUser() userId: string) {
    return this.readingService.findAll(query, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reading article by ID or slug with questions' })
  @ApiParam({ name: 'id', description: 'Article UUID or slug' })
  @ApiResponse({
    status: 200,
    description: 'Reading article details, content, and sanitized questions',
  })
  @ApiResponse({ status: 404, description: 'Reading article not found' })
  async getArticleById(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.readingService.findOne(id, userId);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit reading comprehension exercise answers' })
  @ApiParam({ name: 'id', description: 'Article UUID or slug' })
  @ApiResponse({
    status: 200,
    description: 'Graded reading exercise results with score breakdown',
  })
  @ApiResponse({ status: 404, description: 'Reading article not found' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or no questions available',
  })
  async submitArticle(
    @Param('id') id: string,
    @Body() dto: SubmitReadingDto,
    @CurrentUser() userId: string,
  ) {
    return this.readingService.submit(id, userId, dto);
  }
}

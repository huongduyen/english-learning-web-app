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
import { VocabularyService } from './vocabulary.service';
import { VocabularyQueryDto } from './dto/vocabulary-query.dto';
import { ReviewVocabularyDto } from './dto/review-vocabulary.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Vocabulary')
@Controller('vocabulary')
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Get('topics')
  @ApiOperation({ summary: 'Get all vocabulary topics with word counts' })
  @ApiResponse({ status: 200, description: 'List of vocabulary topics' })
  async getTopics() {
    return this.vocabularyService.findTopics();
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated vocabulary words with filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of vocabulary words' })
  async getVocabulary(@Query() query: VocabularyQueryDto, @CurrentUser() userId: string) {
    return this.vocabularyService.findAll(query, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single vocabulary word by ID' })
  @ApiParam({ name: 'id', description: 'Vocabulary UUID' })
  @ApiResponse({ status: 200, description: 'Vocabulary details' })
  @ApiResponse({ status: 404, description: 'Vocabulary not found' })
  async getVocabularyById(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.vocabularyService.findOne(id, userId);
  }

  @Post(':id/learn')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark vocabulary as learning for the current user' })
  @ApiParam({ name: 'id', description: 'Vocabulary UUID' })
  @ApiResponse({ status: 200, description: 'Updated user vocabulary learning status' })
  @ApiResponse({ status: 404, description: 'Vocabulary not found' })
  async learnVocabulary(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.vocabularyService.learn(id, userId);
  }

  @Post(':id/review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit a review result for spaced repetition' })
  @ApiParam({ name: 'id', description: 'Vocabulary UUID' })
  @ApiResponse({ status: 200, description: 'Updated spaced repetition status' })
  @ApiResponse({ status: 404, description: 'Vocabulary not found' })
  async reviewVocabulary(
    @Param('id') id: string,
    @Body() dto: ReviewVocabularyDto,
    @CurrentUser() userId: string,
  ) {
    return this.vocabularyService.review(id, userId, dto);
  }

  @Post(':id/favorite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle favorite status for the current user' })
  @ApiParam({ name: 'id', description: 'Vocabulary UUID' })
  @ApiResponse({ status: 200, description: 'Toggled favorite status' })
  @ApiResponse({ status: 404, description: 'Vocabulary not found' })
  async toggleFavorite(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.vocabularyService.toggleFavorite(id, userId);
  }
}

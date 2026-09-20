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
import { ListeningService } from './listening.service';
import { ListeningQueryDto } from './dto/listening-query.dto';
import { SubmitListeningDto } from './dto/submit-listening.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Listening')
@Controller('listening')
export class ListeningController {
  constructor(private readonly listeningService: ListeningService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated listening lessons with progress' })
  @ApiResponse({ status: 200, description: 'Paginated listening lessons' })
  async getLessons(@Query() query: ListeningQueryDto, @CurrentUser() userId: string) {
    return this.listeningService.findAll(query, userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get listening lesson by ID or slug with audio and questions',
  })
  @ApiParam({ name: 'id', description: 'Lesson UUID or slug' })
  @ApiResponse({
    status: 200,
    description:
      'Listening lesson details with audio, transcript, and sanitized questions',
  })
  @ApiResponse({ status: 404, description: 'Listening lesson not found' })
  async getLessonById(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.listeningService.findOne(id, userId);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit listening comprehension exercise answers' })
  @ApiParam({ name: 'id', description: 'Lesson UUID or slug' })
  @ApiResponse({
    status: 200,
    description: 'Graded listening exercise results with score breakdown',
  })
  @ApiResponse({ status: 404, description: 'Listening lesson not found' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or no questions available',
  })
  async submitLesson(
    @Param('id') id: string,
    @Body() dto: SubmitListeningDto,
    @CurrentUser() userId: string,
  ) {
    return this.listeningService.submit(id, userId, dto);
  }
}

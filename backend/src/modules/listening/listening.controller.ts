import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ListeningService } from './listening.service';
import { ListeningQueryDto } from './dto/listening-query.dto';

@ApiTags('Listening')
@Controller('listening')
export class ListeningController {
  constructor(private readonly listeningService: ListeningService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated listening lessons' })
  @ApiResponse({ status: 200, description: 'Paginated listening lessons' })
  async getLessons(@Query() query: ListeningQueryDto) {
    return this.listeningService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get listening lesson by ID or slug' })
  @ApiParam({ name: 'id', description: 'Lesson UUID or slug' })
  @ApiResponse({
    status: 200,
    description: 'Listening lesson details with audio and transcript',
  })
  @ApiResponse({ status: 404, description: 'Listening lesson not found' })
  async getLessonById(@Param('id') id: string) {
    return this.listeningService.findOne(id);
  }
}

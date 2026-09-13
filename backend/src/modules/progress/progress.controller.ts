import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { ActivityQueryDto } from './dto/activity-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user overall learning progress and statistics' })
  @ApiResponse({
    status: 200,
    description: 'Summary statistics including XP, streak, vocabularies, and quizzes',
  })
  async getProgress(@CurrentUser() userId: string) {
    return this.progressService.getUserProgress(userId);
  }

  @Get('activities')
  @ApiOperation({ summary: 'Get paginated activity log for current user' })
  @ApiResponse({ status: 200, description: 'Paginated activity log' })
  async getActivities(@Query() query: ActivityQueryDto, @CurrentUser() userId: string) {
    return this.progressService.getUserActivities(userId, query);
  }
}

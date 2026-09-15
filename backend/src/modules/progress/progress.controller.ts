import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { ActivityQueryDto } from './dto/activity-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@ApiTags('Progress')
@ApiBearerAuth()
@UseGuards(OptionalJwtAuthGuard)
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

  @Get('continue-learning')
  @ApiOperation({ summary: 'Get up to 3 continue learning items for current user' })
  @ApiResponse({ status: 200, description: 'List of continue learning items' })
  async getContinueLearning(@CurrentUser() userId: string) {
    return this.progressService.getContinueLearning(userId);
  }
}

import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { ActivityQueryDto } from './dto/activity-query.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
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
    description:
      'Summary statistics including XP, streak, vocabularies, skills, and quizzes',
  })
  async getProgress(@CurrentUser() userId: string) {
    return this.progressService.getUserProgress(userId);
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Get 7-day weekly activity breakdown for charting' })
  @ApiResponse({
    status: 200,
    description: 'List of past 7 days study minutes and activities',
  })
  async getWeekly(@CurrentUser() userId: string) {
    return this.progressService.getWeeklyActivity(userId);
  }

  @Post('activity')
  @ApiOperation({ summary: 'Log a new learning activity and trigger achievement checks' })
  @ApiResponse({ status: 201, description: 'Created activity and unlocked achievements' })
  async logActivity(@CurrentUser() userId: string, @Body() dto: CreateActivityDto) {
    return this.progressService.logActivity(userId, dto);
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

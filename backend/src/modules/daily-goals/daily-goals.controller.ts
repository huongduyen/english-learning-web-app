import { Controller, Get, Patch, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DailyGoalsService } from './daily-goals.service';
import { UpdateDailyGoalDto } from './dto/update-daily-goal.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Daily Goals')
@Controller('daily-goals')
export class DailyGoalsController {
  constructor(private readonly dailyGoalsService: DailyGoalsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user daily goal for today or specified date' })
  @ApiQuery({ name: 'date', required: false, description: 'Target date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Daily goal data' })
  async getDailyGoal(
    @Query('date') date: string | undefined,
    @CurrentUser() userId: string,
  ) {
    return this.dailyGoalsService.getTodayGoal(userId, date);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update progress towards a daily goal' })
  @ApiParam({ name: 'id', description: 'Daily goal UUID' })
  @ApiResponse({ status: 200, description: 'Updated daily goal' })
  @ApiResponse({ status: 404, description: 'Daily goal not found' })
  async updateDailyGoal(
    @Param('id') id: string,
    @Body() dto: UpdateDailyGoalDto,
    @CurrentUser() userId: string,
  ) {
    return this.dailyGoalsService.updateGoal(id, userId, dto);
  }
}

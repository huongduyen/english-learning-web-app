import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AchievementsService } from './achievements.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Achievements')
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all achievements with current user unlock progress' })
  @ApiResponse({ status: 200, description: 'List of achievements and unlock status' })
  async getAchievements(@CurrentUser() userId: string) {
    return this.achievementsService.findAll(userId);
  }
}

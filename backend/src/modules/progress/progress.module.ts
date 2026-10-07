import { Module } from '@nestjs/common';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { AchievementsModule } from '../achievements/achievements.module';
import { DailyGoalsModule } from '../daily-goals/daily-goals.module';

@Module({
  imports: [AchievementsModule, DailyGoalsModule],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}

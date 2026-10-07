import { Module } from '@nestjs/common';
import { ListeningController } from './listening.controller';
import { ListeningService } from './listening.service';
import { AchievementsModule } from '../achievements/achievements.module';
import { DailyGoalsModule } from '../daily-goals/daily-goals.module';

@Module({
  imports: [AchievementsModule, DailyGoalsModule],
  controllers: [ListeningController],
  providers: [ListeningService],
  exports: [ListeningService],
})
export class ListeningModule {}

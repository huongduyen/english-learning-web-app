import { Module } from '@nestjs/common';
import { ReadingController } from './reading.controller';
import { ReadingService } from './reading.service';
import { AchievementsModule } from '../achievements/achievements.module';
import { DailyGoalsModule } from '../daily-goals/daily-goals.module';

@Module({
  imports: [AchievementsModule, DailyGoalsModule],
  controllers: [ReadingController],
  providers: [ReadingService],
  exports: [ReadingService],
})
export class ReadingModule {}

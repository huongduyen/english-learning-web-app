import { Module } from '@nestjs/common';
import { DailyGoalsController } from './daily-goals.controller';
import { DailyGoalsService } from './daily-goals.service';

@Module({
  controllers: [DailyGoalsController],
  providers: [DailyGoalsService],
  exports: [DailyGoalsService],
})
export class DailyGoalsModule {}

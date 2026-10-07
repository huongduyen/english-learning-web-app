import { Module } from '@nestjs/common';
import { GrammarController } from './grammar.controller';
import { GrammarService } from './grammar.service';
import { AchievementsModule } from '../achievements/achievements.module';
import { DailyGoalsModule } from '../daily-goals/daily-goals.module';

@Module({
  imports: [AchievementsModule, DailyGoalsModule],
  controllers: [GrammarController],
  providers: [GrammarService],
  exports: [GrammarService],
})
export class GrammarModule {}

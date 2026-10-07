import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { AchievementsModule } from '../achievements/achievements.module';
import { DailyGoalsModule } from '../daily-goals/daily-goals.module';

@Module({
  imports: [AchievementsModule, DailyGoalsModule],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}

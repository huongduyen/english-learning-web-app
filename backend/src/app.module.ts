import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { VocabularyModule } from './modules/vocabulary/vocabulary.module';
import { GrammarModule } from './modules/grammar/grammar.module';
import { ListeningModule } from './modules/listening/listening.module';
import { ReadingModule } from './modules/reading/reading.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { ProgressModule } from './modules/progress/progress.module';
import { DailyGoalsModule } from './modules/daily-goals/daily-goals.module';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { AiTutorModule } from './modules/ai-tutor/ai-tutor.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    VocabularyModule,
    GrammarModule,
    ListeningModule,
    ReadingModule,
    QuizModule,
    ProgressModule,
    DailyGoalsModule,
    AchievementsModule,
    AiTutorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

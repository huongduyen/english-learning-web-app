import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:5173');

  // Enable CORS
  app.enableCors({
    origin: corsOrigin.split(','),
    credentials: true,
  });

  // Rewrite unversioned /api/* -> /api/v1/* (except swagger /api/docs)
  app.use((req: any, res: any, next: () => void) => {
    if (
      req.url.startsWith('/api/') &&
      !req.url.startsWith('/api/v1') &&
      !req.url.startsWith('/api/docs')
    ) {
      req.url = req.url.replace(/^\/api(\/.*)?$/, '/api/v1$1');
    }
    next();
  });

  // Global API Route Prefix with versioning
  app.setGlobalPrefix('api/v1');

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // OpenAPI / Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('English Learning API')
    .setDescription('Core REST API documentation for the English Learning Platform')
    .setVersion('1.0')
    .addTag('Vocabulary', 'Vocabulary lists, topics, learning & spaced repetition')
    .addTag('Grammar', 'Grammar lessons and practice exercises')
    .addTag('Listening', 'Listening audio lessons and transcripts')
    .addTag('Reading', 'Reading articles and comprehension')
    .addTag('Quiz', 'Quizzes, assessments, and submission grading')
    .addTag('Progress', 'User progress, statistics, and learning activity logs')
    .addTag('Daily Goals', 'Daily study targets and progress tracking')
    .addTag('Achievements', 'Badges, gamification milestones, and unlock criteria')
    .addTag('Auth', 'User authentication and account registration')
    .addTag('Users', 'User profiles and learning preferences')
    .addTag('AI Tutor', 'AI-assisted conversational practice sessions')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);
  SwaggerModule.setup('api/v1/docs', app, document);

  await app.listen(port);
  console.log(`[NestJS] Application is running on: http://localhost:${port}/api/v1`);
  console.log(
    `[NestJS] Swagger docs available at: http://localhost:${port}/api/v1/docs and http://localhost:${port}/api/docs`,
  );
}

bootstrap();

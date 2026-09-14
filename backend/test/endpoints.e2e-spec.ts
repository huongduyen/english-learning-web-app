import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Phase 3 Core REST API - Versioned /api/v1 (e2e)', () => {
  let app: INestApplication;
  let testVocabId: string;
  let testGrammarId: string;
  let testListeningId: string;
  let testReadingId: string;
  let testQuizId: string;
  let testDailyGoalId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

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

    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new HttpExceptionFilter());
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

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Endpoint', () => {
    it('/api/v1/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
        });
    });

    it('/api/health (GET) - fallback rewrite to versioned endpoint', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
        });
    });
  });

  describe('Vocabulary Endpoints (/api/v1/vocabulary)', () => {
    it('GET /api/v1/vocabulary/topics - list all topics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/vocabulary/topics')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('slug');
      expect(res.body[0]).toHaveProperty('vocabularyCount');
    });

    it('GET /api/v1/vocabulary - list paginated words', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/vocabulary?page=1&limit=10')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      testVocabId = res.body.data[0].id;
      expect(res.body.data[0]).toHaveProperty('word');
      expect(res.body.data[0]).toHaveProperty('meaning');
    });

    it('GET /api/v1/vocabulary/:id - get single vocabulary word', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/vocabulary/${testVocabId}`)
        .expect(200);

      expect(res.body.id).toBe(testVocabId);
      expect(res.body).toHaveProperty('topic');
    });

    it('POST /api/v1/vocabulary/:id/learn - mark word as learning', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/vocabulary/${testVocabId}/learn`)
        .expect(200);

      expect(res.body.vocabularyId).toBe(testVocabId);
      expect(res.body.status).toBe('LEARNING');
    });

    it('POST /api/v1/vocabulary/:id/review - submit review for spaced repetition', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/vocabulary/${testVocabId}/review`)
        .send({ isCorrect: true, rating: 4 })
        .expect(200);

      expect(res.body.vocabularyId).toBe(testVocabId);
      expect(res.body.reviewCount).toBeGreaterThan(0);
      expect(res.body).toHaveProperty('masteryScore');
    });
  });

  describe('Grammar Endpoints (/api/v1/grammar)', () => {
    it('GET /api/v1/grammar - list grammar lessons', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/grammar?page=1&limit=10')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      testGrammarId = res.body.data[0].id;
      expect(res.body.data[0]).toHaveProperty('title');
      expect(res.body.data[0]).toHaveProperty('exerciseCount');
    });

    it('GET /api/v1/grammar/:id - get grammar lesson details', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/grammar/${testGrammarId}`)
        .expect(200);

      expect(res.body.id).toBe(testGrammarId);
      expect(res.body).toHaveProperty('content');
    });

    it('GET /api/v1/grammar/:id/exercises - get exercises for grammar lesson', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/grammar/${testGrammarId}/exercises`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('instruction');
        expect(res.body[0]).toHaveProperty('question');
      }
    });
  });

  describe('Listening Endpoints (/api/v1/listening)', () => {
    it('GET /api/v1/listening - list listening lessons', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/listening?page=1&limit=10')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      testListeningId = res.body.data[0].id;
      expect(res.body.data[0]).toHaveProperty('audioUrl');
      expect(res.body.data[0]).toHaveProperty('title');
    });

    it('GET /api/v1/listening/:id - get listening lesson details', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/listening/${testListeningId}`)
        .expect(200);

      expect(res.body.id).toBe(testListeningId);
      expect(res.body).toHaveProperty('transcript');
      expect(res.body).toHaveProperty('audioUrl');
    });
  });

  describe('Reading Endpoints (/api/v1/reading)', () => {
    it('GET /api/v1/reading - list reading articles', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/reading?page=1&limit=10')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      testReadingId = res.body.data[0].id;
      expect(res.body.data[0]).toHaveProperty('readingTime');
      expect(res.body.data[0]).toHaveProperty('title');
    });

    it('GET /api/v1/reading/:id - get reading article details', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/reading/${testReadingId}`)
        .expect(200);

      expect(res.body.id).toBe(testReadingId);
      expect(res.body).toHaveProperty('content');
    });
  });

  describe('Quiz Endpoints (/api/v1/quizzes)', () => {
    it('GET /api/v1/quizzes - list quizzes', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/quizzes?page=1&limit=10')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      testQuizId = res.body.data[0].id;
      expect(res.body.data[0]).toHaveProperty('questionCount');
      expect(res.body.data[0]).toHaveProperty('passingScore');
    });

    it('GET /api/v1/quizzes/:id - get quiz details and questions', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/quizzes/${testQuizId}`)
        .expect(200);

      expect(res.body.id).toBe(testQuizId);
      expect(Array.isArray(res.body.questions)).toBe(true);
    });

    it('POST /api/v1/quizzes/:id/submit - grade and record attempt', async () => {
      const quizRes = await request(app.getHttpServer())
        .get(`/api/v1/quizzes/${testQuizId}`)
        .expect(200);

      const answers = quizRes.body.questions.map((q: any) => ({
        questionId: q.id,
        answer: 'sample_answer',
      }));

      const res = await request(app.getHttpServer())
        .post(`/api/v1/quizzes/${testQuizId}/submit`)
        .send({ answers })
        .expect(200);

      expect(res.body).toHaveProperty('attemptId');
      expect(res.body).toHaveProperty('score');
      expect(res.body).toHaveProperty('percentage');
      expect(res.body).toHaveProperty('passed');
      expect(Array.isArray(res.body.breakdown)).toBe(true);
    });
  });

  describe('Progress Endpoints (/api/v1/progress)', () => {
    it('GET /api/v1/progress - get user progress metrics', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/progress').expect(200);

      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('vocabulary');
      expect(res.body).toHaveProperty('quizzes');
      expect(res.body).toHaveProperty('learning');
      expect(res.body.user).toHaveProperty('totalXp');
    });

    it('GET /api/v1/progress/activities - get user learning activity history', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/progress/activities?page=1&limit=5')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Daily Goals Endpoints (/api/v1/daily-goals)', () => {
    it('GET /api/v1/daily-goals - get or create today goal', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/daily-goals')
        .expect(200);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('targetMinutes');
      expect(res.body).toHaveProperty('actualMinutes');
      expect(res.body).toHaveProperty('targetWords');
      expect(res.body).toHaveProperty('completed');

      testDailyGoalId = res.body.id;
    });

    it('PATCH /api/v1/daily-goals/:id - update daily goal progress', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/daily-goals/${testDailyGoalId}`)
        .send({
          actualMinutes: 25,
          actualWords: 5,
        })
        .expect(200);

      expect(res.body.actualMinutes).toBe(25);
      expect(res.body.actualWords).toBe(5);
      expect(res.body.completed).toBe(true);
    });
  });

  describe('Achievements Endpoints (/api/v1/achievements)', () => {
    it('GET /api/v1/achievements - get all achievements with unlock progress', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/achievements')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('code');
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[0]).toHaveProperty('unlocked');
    });
  });

  describe('Auth & Users Endpoints (/api/v1/auth, /api/v1/users)', () => {
    let authAccessToken: string;
    let authRefreshToken: string;
    const testRegisterEmail = `newlearner_${Date.now()}@example.com`;

    it('POST /api/v1/auth/register - create new user with hashed password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testRegisterEmail,
          password: 'Password123!',
          name: 'New Test Learner',
          level: 'BEGINNER',
          targetLevel: 'INTERMEDIATE',
        })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testRegisterEmail);
      expect(res.body.user.password).toBeUndefined();
      expect(res.body.user.hashedRefreshToken).toBeUndefined();
    });

    it('POST /api/v1/auth/register - prevent duplicate email registration', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testRegisterEmail,
          password: 'Password123!',
          name: 'Duplicate Learner',
        })
        .expect(409);

      expect(res.body.statusCode).toBe(409);
      expect(res.body.message).toContain('already exists');
    });

    it('POST /api/v1/auth/login - reject invalid password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'learner@example.com',
          password: 'WrongPassword!',
        })
        .expect(401);

      expect(res.body.statusCode).toBe(401);
    });

    it('POST /api/v1/auth/login - authenticate user and return token pair', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'learner@example.com',
          password: 'Learner123!',
        })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('learner@example.com');
      expect(res.body.user.password).toBeUndefined();
      expect(res.body.user.hashedRefreshToken).toBeUndefined();

      authAccessToken = res.body.accessToken;
      authRefreshToken = res.body.refreshToken;
    });

    it('GET /api/v1/users/me - 401 when token is missing', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .expect(401);
    });

    it('GET /api/v1/users/me - retrieve authenticated profile with Bearer token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${authAccessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('email', 'learner@example.com');
      expect(res.body).toHaveProperty('profile');
      expect(res.body.password).toBeUndefined();
      expect(res.body.hashedRefreshToken).toBeUndefined();
    });

    it('PATCH /api/v1/users/me - update profile with Bearer token', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${authAccessToken}`)
        .send({
          dailyGoalMinutes: 25,
          nativeLanguage: 'vi',
        })
        .expect(200);

      expect(res.body.profile.dailyGoalMinutes).toBe(25);
      expect(res.body.profile.nativeLanguage).toBe('vi');
    });

    it('GET /api/v1/users/profile - backward-compatible profile alias', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${authAccessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('email', 'learner@example.com');
    });

    it('POST /api/v1/auth/refresh - refresh access token using valid refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: authRefreshToken })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.accessToken).toBeDefined();

      authAccessToken = res.body.accessToken;
      authRefreshToken = res.body.refreshToken;
    });

    it('POST /api/v1/auth/refresh - 401 with invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid.token.here' })
        .expect(401);
    });

    it('POST /api/v1/auth/logout - invalidate refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${authAccessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
    });

    it('POST /api/v1/auth/refresh - 401 after logout when session was invalidated', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: authRefreshToken })
        .expect(401);
    });
  });

  describe('AI Tutor Endpoints (/api/v1/ai-tutor)', () => {
    let testConversationId: string;

    it('POST /api/v1/ai-tutor/conversations - start practice session', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/ai-tutor/conversations')
        .send({
          title: 'At the restaurant',
          topic: 'Food & Dining',
          scenario: 'Ordering a meal',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('At the restaurant');
      expect(Array.isArray(res.body.messages)).toBe(true);

      testConversationId = res.body.id;
    });

    it('GET /api/v1/ai-tutor/conversations - list practice sessions', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/ai-tutor/conversations')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/ai-tutor/conversations/:id - get conversation history', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/ai-tutor/conversations/${testConversationId}`)
        .expect(200);

      expect(res.body.id).toBe(testConversationId);
      expect(Array.isArray(res.body.messages)).toBe(true);
    });

    it('POST /api/v1/ai-tutor/conversations/:id/messages - send practice message', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/ai-tutor/conversations/${testConversationId}/messages`)
        .send({
          content: 'I would like to order a table for two, please.',
        })
        .expect(200);

      expect(res.body).toHaveProperty('userMessage');
      expect(res.body).toHaveProperty('assistantMessage');
      expect(res.body.userMessage.content).toContain('table for two');
    });
  });

  describe('Validation & Error Handling', () => {
    it('POST /api/v1/vocabulary/:id/review - 400 on invalid input', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/vocabulary/${testVocabId}/review`)
        .send({ rating: 99 }) // Maximum is 5
        .expect(400);

      expect(res.body.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('GET /api/v1/vocabulary/invalid-uuid - 404 on not found', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/vocabulary/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(res.body.statusCode).toBe(404);
      expect(res.body.error).toBe('Not Found');
    });
  });
});

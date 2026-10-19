# Testing and Quality Assurance Documentation

This document describes the testing architecture, tools, environment configuration, and execution procedures for the **English Learning Web Application**.

---

## 1. Testing Architecture & Tools

The project enforces a multi-layered testing pyramid to guarantee reliability, data integrity, and regressions prevention:

| Test Layer | Framework / Tools | Scope & Responsibilities | Location |
|---|---|---|---|
| **Frontend Unit & Component** | Vitest, React Testing Library, jsdom | UI components, forms, validation, state stores, view transitions, user interactions | `frontend/src/test/` |
| **Backend Unit** | Jest, `@nestjs/testing` | Service logic, authentication, scoring, streak calculation, data isolation, boundary cases | `backend/src/**/*.spec.ts` |
| **API Integration** | Supertest, Jest | End-to-end HTTP pipeline, guards, validation pipes, route status codes, unauthorized access | `backend/test/` |
| **End-to-End (E2E)** | Playwright (Chromium, Firefox, WebKit) | Complete browser user flows, auth lifecycle, quiz execution, learning progress reflection | `frontend/e2e/` |
| **Type Safety & Linting** | TypeScript (`tsc`), ESLint, Prettier | Compile-time validation, static analysis, zero warning enforcement | Both workspaces |

---

## 2. Prerequisites & Environment Setup

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **PostgreSQL 16**: (Via Docker Compose or local instance)

### Environment Configuration
Ensure `.env` files are populated in both `backend/` and `frontend/` workspaces:

```bash
# Backend environment configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/english_learning_db?schema=public"
PORT=3000
JWT_SECRET="test-jwt-secret-key-12345"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="test-jwt-refresh-secret-key-67890"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
NODE_ENV="test" # Or "development"

# Frontend environment configuration
VITE_API_BASE_URL="http://localhost:3000/api/v1"
```

### Starting the Database & Seeding
```bash
# 1. Start PostgreSQL
npm run db:up

# 2. Apply Prisma migrations & seed baseline data
cd backend
npx prisma migrate dev
npx prisma db seed
cd ..
```

---

## 3. How to Run Frontend Tests

All frontend unit and component tests run using **Vitest** with JSDOM and Testing Library.

```bash
# Run all frontend unit and component tests once
npm --prefix frontend run test
# Or from root:
npm run test:frontend

# Run tests in watch mode
npm --prefix frontend run test:watch

# Generate frontend test coverage report
npm --prefix frontend run test:coverage
# Or from root:
npm run test:frontend:cov

# Run TypeScript typecheck without emitting output
npm --prefix frontend run typecheck

# Run ESLint (enforcing --max-warnings 0)
npm --prefix frontend run lint
```

### Frontend Test Suites Covered
- `src/test/auth.test.tsx`: Login form rendering, validation error states, demo quick-fill, `useAuthStore` session management, `ProtectedRoute` redirect.
- `src/test/dashboard.test.tsx`: `WelcomeSection` profile display, `DailyGoalCard` progress/completion/loading/retry, `QuickActions` navigation links.
- `src/test/vocabulary.test.tsx`: `VocabularyCard` details, `Flashcard` front/back flip animation & mastery buttons, `VocabularyFilters` search/level/status.
- `src/test/grammar-quiz.test.tsx`: `GrammarCard` lesson details, `QuizResultCard` score breakdown, metrics, retry/review actions.
- `src/test/listening-reading.test.tsx`: `AudioPlayer` playback controls, `TranscriptViewer` bilingual toggles, `ReadingArticleCard` metadata.
- `src/test/progress-achievements.test.tsx`: `ProgressOverviewCards` metrics rendering, `AchievementsSection` badge filtering by unlocked status.

---

## 4. How to Run Backend Unit Tests

Backend services and business logic are tested using **Jest** with isolated dependency mocking.

```bash
# Run all backend unit test suites
npm --prefix backend run test
# Or from root:
npm run test:backend

# Run unit tests in watch mode
npm --prefix backend run test:watch

# Generate backend test coverage report
npm --prefix backend run test:cov
# Or from root:
npm run test:backend:cov

# Run backend ESLint
npm --prefix backend run lint
```

### Backend Unit Test Coverage
- `AuthService`: Password hashing, credentials validation, duplicate email detection, token generation & sanitization.
- `UsersService`: Profile retrieval, user updates, duplicate handling.
- `VocabularyService`: Vocabulary list querying, topic filters, favorite toggling, learning status updates, not-found handling.
- `GrammarService`: Lesson retrieval, exercise retrieval, exercise submission & scoring.
- `QuizService`: Quiz retrieval, question submission, score calculations, percentage evaluation, breakdown generation.
- `ListeningService` & `ReadingService`: Lesson querying, answer submission, result verification.
- `DailyGoalsService`: Daily goal retrieval, auto-creation, activity recording, XP award triggers.
- `AchievementsService`: Seed verification, user unlocked badge evaluation, progress tracking.
- `ProgressService`: Aggregated metrics, activity recording, consecutive streak calculation.

---

## 5. How to Run API Integration Tests

Backend API integration tests run against NestJS HTTP endpoints using **Supertest** and Jest.

```bash
# Run all backend e2e integration tests
npm --prefix backend run test:e2e
# Or from root:
npm run test:backend:e2e
```

### API Endpoints Tested
- `GET /api/v1/health`: Health status 200 OK.
- `POST /api/v1/auth/register` & `POST /api/v1/auth/login`: Validation rules, 400 on missing required fields, 401 on invalid credentials, 201/200 on success.
- `GET /api/v1/users/me` & `PATCH /api/v1/users/me`: Protected endpoint access, 401 on missing Bearer token, profile updates.
- `GET /api/v1/vocabulary`, `GET /api/v1/vocabulary/topics`, `POST /api/v1/vocabulary/:id/learn`, `POST /api/v1/vocabulary/:id/favorite`: Data retrieval, 404 on nonexistent UUIDs.
- `GET /api/v1/grammar`, `GET /api/v1/grammar/:id`: 200 with lesson details, 404 on invalid IDs.
- `GET /api/v1/quizzes`, `GET /api/v1/quizzes/:id`: 200 with quiz details, 404 on invalid IDs.
- `POST /api/v1/quizzes/:id/submit`: Quiz grading, score calculation, 404 on invalid IDs.
- `GET /api/v1/listening`, `GET /api/v1/listening/:id`, `POST /api/v1/listening/:id/submit`: Lesson retrieval, answer submission, 404 handling.
- `GET /api/v1/reading`, `GET /api/v1/reading/:id`, `POST /api/v1/reading/:id/submit`: Article retrieval, answer submission, 404 handling.
- `GET /api/v1/progress`, `GET /api/v1/progress/weekly`, `POST /api/v1/progress/activity`: Aggregated stats, activity logging.
- `GET /api/v1/achievements`: Gamification badges retrieval.
- `GET /api/v1/daily-goals`: Daily learning targets.

---

## 6. How to Run End-to-End (E2E) Tests

Playwright automates end-to-end browser user flows against the integrated full-stack application.

### Prerequisites for E2E
1. PostgreSQL running (`npm run db:up`).
2. Backend API server listening on `http://localhost:3000` (`npm --prefix backend run start`).
3. Frontend dev server or preview build listening on `http://localhost:5173` (Playwright auto-launches Vite if not running).

```bash
# Run all E2E test flows
npm --prefix frontend run test:e2e
# Or from root:
npm run test:frontend:e2e

# Run with interactive Playwright UI mode
cd frontend
npx playwright test --ui

# Run a specific flow spec
npx playwright test e2e/auth.spec.ts
npx playwright test e2e/quiz.spec.ts
npx playwright test e2e/progress.spec.ts
```

### High-Value User Flows Verified
- **Flow A: Authentication (`e2e/auth.spec.ts`)**: Registration -> Auto-redirect to Dashboard -> Refresh token persistence -> Logout -> Login with demo account -> Protected route access verification.
- **Flow B: Vocabulary Learning (`e2e/vocabulary.spec.ts`)**: Vocabulary browsing -> Filtering by level/topic -> Card detail view -> Flashcards practice session -> Flipping cards -> Marking mastery/difficult -> Progress update.
- **Flow C: Quiz & Assessment (`e2e/quiz.spec.ts`)**: Quizzes list -> Search & filter -> Start quiz -> Answer multiple questions (Multiple Choice / True-False / Fill-in-the-blank) -> Submit quiz -> Verify calculated score, breakdown, and review answers.
- **Flow D: Listening & Reading (`e2e/listening.spec.ts`, `e2e/reading.spec.ts`)**: Browse lessons/articles -> Filter by difficulty -> Audio playback controls -> Transcript English/Vietnamese toggles -> Comprehension questions answering -> Submit -> Verify comprehension results.
- **Flow E: Learning Progress & Achievements (`e2e/progress.spec.ts`)**: Complete learning activity -> Navigate to Progress dashboard -> Verify study metrics (Study Time, Words Learned, Lessons Done, Avg Score, Streak) -> Verify Achievements badge filters (`All`, `Unlocked`, `In Progress`).

---

## 7. Generating Coverage Reports

Coverage is measured using V8 coverage on the frontend and Jest Istanbul on the backend.

```bash
# Generate Frontend coverage
npm --prefix frontend run test:coverage
# Reports output to frontend/coverage/

# Generate Backend coverage
npm --prefix backend run test:cov
# Reports output to backend/coverage/
```

### Coverage Highlights
- **Backend Services**: Core modules (`AuthService`, `UsersService`, `VocabularyService`, `GrammarService`, `QuizService`, `DailyGoalsService`, `AchievementsService`, `ProgressService`) achieve **90–100% statement and branch coverage**.
- **Frontend Components**: All critical interactive components across Auth, Dashboard, Vocabulary, Quizzes, Listening, Reading, and Progress are fully covered with semantic ARIA role and user interaction tests.

---

## 8. Known Limitations & Scope Boundaries

1. **AI Tutor Feature**: Intentionally excluded from the project scope per phase requirements.
2. **External Audio & Third-Party APIs**: E2E tests and component tests do not call real external speech-to-text or TTS third-party services. Audio elements are mocked using standard HTML5 Media Element polyfills.
3. **Database Isolation**: API integration tests run against the development/test PostgreSQL database configured via `DATABASE_URL`. Ensure test runs do not target a production environment.

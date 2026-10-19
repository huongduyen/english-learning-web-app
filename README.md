# English Learning Web Application

[![CI/CD Pipeline](https://github.com/huongduyen/english-learning-web-app/actions/workflows/ci.yml/badge.svg)](https://github.com/huongduyen/english-learning-web-app/actions/workflows/ci.yml)
[![Node.js Version](https://img.shields.io/badge/Node.js-v20.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-10-ea2845.svg)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)

A full-stack, enterprise-grade English Learning Platform built with **React 18 (Vite)**, **NestJS 10**, **Prisma ORM**, and **PostgreSQL 16**. The platform delivers a gamified, structured learning journey covering vocabulary, grammar, listening, reading, timed assessments, and real-time progress analytics.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database](#database)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Running with Docker](#running-with-docker)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security & Best Practices](#security--best-practices)

---

## Project Overview

The English Learning Web Application provides non-native speakers with an adaptive learning experience mapped to the Common European Framework of Reference for Languages (**CEFR Levels: A1 to C2**).

Key platform capabilities:
- **Comprehensive Skill Coverage**: Interactive modules for Vocabulary, Grammar, Listening, Reading, and Quizzes.
- **Adaptive Spaced Repetition**: Flashcards and vocabulary mastery tracked via spaced repetition intervals.
- **Rich Gamification Engine**: Continuous streak counters, dynamic XP rewards, CEFR tier advancement, and unlockable achievement badges.
- **Production-Ready Architecture**: Strict TypeScript typing, versioned REST APIs (`/api/v1`), stateless JWT authentication with token rotation, containerized deployments, and automated GitHub Actions CI/CD workflows.

---

## Features

### 1. Vocabulary & Spaced Repetition Flashcards
- Topic-organized word decks (Business, Travel, Academic, Daily Conversation).
- Audio pronunciation, International Phonetic Alphabet (IPA), definitions, and bilingual translations.
- Interactive flashcard flipping, confidence rating, and automated mastery scoring.

### 2. Grammar Lessons & Exercises
- Structured explanations categorized by proficiency level (A1 Beginner to C2 Proficient).
- Fill-in-the-blank, multiple-choice, and sentence construction exercises.
- Instant validation, explanations for wrong answers, and rule summaries.

### 3. Audio Listening Comprehension
- Integrated HTML5 Audio player with interactive playback rate control (0.75x, 1x, 1.25x).
- Synchronized transcripts with toggleable visibility for listening self-assessment.
- Contextual comprehension questions linked directly to audio timestamps.

### 4. Reading Comprehension & Articles
- Curated articles across varied topics with estimated reading time indicators.
- In-text vocabulary highlights and inline contextual translations.
- Multi-question reading assessments testing recall, inference, and main ideas.

### 5. Quizzes & Assessments
- Timed practice exams and adaptive chapter evaluations.
- Instant score calculations, detailed answer keys, and skill breakdown reviews.
- Historic quiz records stored for trend analysis.

### 6. Gamification & Analytics Dashboard
- **Streak Tracking**: Daily learning streak maintenance with automated freeze mechanisms.
- **XP & Level Progression**: Experience point accumulation tied to CEFR level benchmarks.
- **Daily Goals**: Customizable daily study time targets (e.g., 15, 30, 45 minutes) with real-time completion rings.
- **Badges & Milestones**: Milestone-based achievement awards (e.g., *Vocab Master*, *7-Day Streak*, *Grammar Guru*).

### 7. Authentication & Security
- Secure user registration and session management.
- Dual-token JWT security: short-lived Access Tokens (15 min) and hashed Refresh Tokens (7 days).
- Role-based authorization (`LEARNER`, `TEACHER`, `ADMIN`).
- Pre-configured demo accounts for immediate evaluation.

---

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6 (Fast HMR, optimized production rollup bundles)
- **Styling**: Tailwind CSS, PostCSS, Lucide React icons
- **State Management**:
  - Server state: TanStack Query (React Query v5) for caching and background synchronization
  - Client state: Zustand for lightweight session and UI states
- **Routing**: React Router v6
- **Forms & Validation**: React Hook Form with Zod schemas
- **Unit & Component Testing**: Vitest, React Testing Library, jsdom
- **End-to-End Testing**: Playwright (Cross-browser automated test suites)

### Backend
- **Framework**: NestJS 10 (TypeScript) with Modular Clean Architecture
- **API Standard**: RESTful API with global versioning prefix (`/api/v1`)
- **Documentation**: Swagger / OpenAPI 3.0 UI (`/api/v1/docs`)
- **Database & ORM**: PostgreSQL 16, Prisma ORM 5
- **Authentication**: Passport.js, `@nestjs/jwt`, `bcrypt` hashing
- **Data Validation**: `class-validator`, `class-transformer`
- **Testing**: Jest (Unit testing), Supertest (API integration testing)

### DevOps & Infrastructure
- **Containerization**: Docker, Docker Compose
- **Web Server**: Nginx 1.27 Alpine (SPA routing fallback, gzip compression, reverse proxy)
- **CI/CD**: GitHub Actions workflow (multi-stage lint, typecheck, unit tests, integration tests, E2E browser tests)
- **Process Supervisor**: `dumb-init` (POSIX signal handling in containers)

---

## Architecture

```
                          ┌─────────────────────────────────────┐
                          │         Client Web Browser          │
                          └──────────────────┬──────────────────┘
                                             │ HTTP :5173 / :80
                                             ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               Docker Compose Network                                   │
│                                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │                        Frontend Container (Nginx Alpine)                       │   │
│   │  - Serves compiled React 18 SPA (HTML/JS/CSS)                                  │   │
│   │  - SPA client route fallback (try_files $uri /index.html)                      │   │
│   │  - Reverse proxies /api/ requests to Backend container                         │   │
│   └────────────────────────────────────────┬───────────────────────────────────────┘   │
│                                            │ HTTP :3000 (app-network)                  │
│                                            ▼                                           │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │                         Backend Container (NestJS)                             │   │
│   │  - Global route prefix /api/v1                                                 │   │
│   │  - Controllers -> Services -> Repositories Layer                               │   │
│   │  - Passport JWT Authentication & Authorization Guards                          │   │
│   │  - Prisma Client ORM Layer                                                     │   │
│   │  - Auto-executes migrations on container boot                                  │   │
│   └────────────────────────────────────────┬───────────────────────────────────────┘   │
│                                            │ TCP :5432 (PostgreSQL wire protocol)      │
│                                            ▼                                           │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │                         Database (PostgreSQL 16)                               │   │
│   │  - Persistent data volume (postgres_data)                                      │   │
│   │  - Automated health check (pg_isready)                                         │   │
│   └────────────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Monorepo Structure

```text
english-learning-web-app/
├── .github/
│   └── workflows/
│       └── ci.yml               # Complete GitHub Actions CI/CD pipeline
├── backend/                     # NestJS application workspace
│   ├── prisma/
│   │   ├── migrations/          # Version-controlled SQL migrations
│   │   ├── schema.prisma        # Prisma ORM data schema
│   │   └── seed.ts              # Database seeding script with realistic data
│   ├── src/
│   │   ├── common/              # Filters, interceptors, guards, decorators
│   │   ├── modules/             # Auth, Users, Vocab, Grammar, Listening, Reading, Quiz, Progress
│   │   ├── app.module.ts        # Root NestJS module
│   │   └── main.ts              # Entry point with CORS, Swagger, validation pipes
│   ├── test/                    # Jest E2E integration test suites
│   ├── Dockerfile               # Multi-stage production Dockerfile
│   ├── docker-entrypoint.sh     # Startup entrypoint running Prisma migrations
│   ├── .dockerignore            # Build context filter
│   ├── .env.example             # Backend environment template
│   └── package.json             # Backend dependencies & scripts
├── frontend/                    # React 18 SPA workspace
│   ├── e2e/                     # Playwright browser end-to-end tests
│   ├── src/
│   │   ├── components/          # Reusable UI primitives and module components
│   │   ├── pages/               # Route page components
│   │   ├── lib/                 # Utilities, API client (Axios/Fetch), TanStack Query client
│   │   ├── store/               # Zustand state stores
│   │   ├── types/               # TypeScript data contracts and API models
│   │   ├── App.tsx              # Application route tree
│   │   └── main.tsx             # Application bootstrap
│   ├── Dockerfile               # Multi-stage Nginx production Dockerfile
│   ├── nginx.conf               # Production Nginx reverse proxy & SPA router config
│   ├── .dockerignore            # Build context filter
│   ├── .env.example             # Frontend environment template
│   └── package.json             # Frontend dependencies & scripts
├── docker-compose.yml           # Production & local Docker Compose definition
├── .dockerignore                # Root Docker ignore rules
├── .gitignore                   # Strict Git ignore policy (secrets & build outputs)
├── .env.example                 # Root environment variables template
├── package.json                 # Monorepo orchestration scripts
└── README.md                    # Project documentation
```

---

## Database

The application uses **PostgreSQL 16** managed through **Prisma ORM**.

### Core Schema Models

| Model | Description |
| :--- | :--- |
| `User` | Learner/Teacher/Admin profiles, credentials, role, target CEFR level, streak count, total XP |
| `RefreshToken` | Hashed refresh tokens supporting secure JWT rotation and revocation |
| `VocabularyTopic` | Categorized topics (e.g., Oxford 3000, Business, Travel, Technology) |
| `VocabularyWord` | Word, phonetic IPA, definition, Vietnamese translation, CEFR level, example sentences |
| `UserVocabularyProgress` | Spaced repetition intervals, retention ease factor, review dates, mastery status |
| `GrammarLesson` | Grammar topic, explanation markdown, rules, level |
| `GrammarExercise` | Interactive exercises, question prompts, options, explanation keys |
| `ListeningLesson` | Audio lesson URL, duration, difficulty level, transcript lines |
| `ListeningQuestion` | Comprehension questions mapped to audio content |
| `ReadingArticle` | Full-text articles, word count, estimated reading time, CEFR rating |
| `ReadingQuestion` | Reading comprehension multiple-choice questions |
| `Quiz` | Timed practice and benchmark assessments |
| `QuizQuestion` | Question items with weights and answer explanations |
| `QuizSubmission` | Historical user submissions with calculated scores and timestamps |
| `DailyGoal` | Configurable daily study time target and current completion status |
| `Achievement` | Gamification badges with unlock criteria and badge icons |
| `UserAchievement` | Unlocked achievements per user with timestamps |
| `LearningActivity` | Historical event log recording daily minutes studied, quizzes passed, and XP earned |

### Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Apply pending migrations (development)
npm run prisma:migrate

# Apply migrations to production database
npm --prefix backend run prisma:migrate:deploy

# Seed initial curriculum and demo accounts
npm --prefix backend run prisma:seed

# Open Prisma Studio web inspector (http://localhost:5555)
npm --prefix backend run prisma:studio
```

---

## Local Setup

### Prerequisites

- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **Docker & Docker Compose**: For containerized database or full-stack deployment
- **Git**

### Step-by-Step Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/huongduyen/english-learning-web-app.git
   cd english-learning-web-app
   ```

2. **Configure environment variables:**
   ```bash
   # Copy environment templates
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Install dependencies:**
   ```bash
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies
   cd ../frontend && npm install
   
   # Return to root
   cd ..
   ```

4. **Start the PostgreSQL database:**
   ```bash
   # Launch PostgreSQL container
   npm run db:up
   ```

5. **Initialize database schema & seed data:**
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Apply database migrations
   npm run prisma:migrate

   # Seed database with sample courses, vocabulary, and demo users
   npm --prefix backend run prisma:seed
   ```

6. **Start development servers:**
   ```bash
   # In terminal 1: Start Backend API (runs on http://localhost:3000)
   npm run dev:backend

   # In terminal 2: Start Frontend Application (runs on http://localhost:5173)
   npm run dev:frontend
   ```

7. **Open the application:**
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:3000/api/v1](http://localhost:3000/api/v1)
   - **Swagger Docs**: [http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)

### Demo Credentials

The database seed provides ready-to-use demo accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Learner** | `learner@example.com` | `Learner123!` |
| **Teacher** | `teacher@example.com` | `Teacher123!` |
| **Admin** | `admin@example.com` | `Admin123!` |

*(A quick-fill button is also available on the Login page for one-click demo login).*

---

## Environment Variables

### Root / Docker Configuration (`.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `POSTGRES_USER` | PostgreSQL superuser username | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL superuser password | `postgres` *(change in production!)* |
| `POSTGRES_DB` | PostgreSQL database name | `english_learning_db` |
| `POSTGRES_PORT` | PostgreSQL host exposed port | `5432` |
| `BACKEND_PORT` | Backend API exposed port | `3000` |
| `DATABASE_URL` | Prisma PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/english_learning_db?schema=public` |
| `FRONTEND_PORT` | Frontend application exposed port | `5173` |
| `VITE_API_BASE_URL` | Base API URL called by browser | `http://localhost:3000/api/v1` |
| `JWT_SECRET` | Secret key for signing Access Tokens | `super-secret-jwt-access-key-2026-english-learning` |
| `JWT_EXPIRATION` | Access token lifespan | `15m` |
| `JWT_REFRESH_SECRET` | Secret key for signing Refresh Tokens | `super-secret-jwt-refresh-key-2026-english-learning` |
| `JWT_REFRESH_EXPIRATION` | Refresh token lifespan | `7d` |

### Backend Specific (`backend/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | HTTP port NestJS listens on | `3000` |
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://postgres:postgres@localhost:5432/english_learning_db?schema=public` |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `http://localhost:5173,http://localhost:80` |
| `JWT_SECRET` | Access token secret | `your-super-secret-jwt-access-key` |
| `JWT_EXPIRATION` | Access token duration | `15m` |
| `JWT_REFRESH_SECRET` | Refresh token secret | `your-super-secret-jwt-refresh-key` |
| `JWT_REFRESH_EXPIRATION` | Refresh token duration | `7d` |

### Frontend Specific (`frontend/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base endpoint for API requests | `http://localhost:3000/api/v1` |
| `VITE_APP_NAME` | Application display title | `English Learning Platform` |

> [!CAUTION]
> **Security Policy**: Never commit actual `.env` files, API keys, database passwords, or JWT secrets to Git. All `.env*` files are ignored by `.gitignore` (except `.env.example`).

---

## Running with Docker

The entire platform—including PostgreSQL, NestJS backend, and React/Vite frontend (served via Nginx)—can be launched with a single Docker Compose command.

### Architecture in Docker Compose

1. **`postgres`** (`postgres:16-alpine`):
   - Healthcheck: `pg_isready`
   - Persistent volume: `postgres_data`
2. **`backend`** (`backend/Dockerfile`):
   - Built on `node:20-alpine` with `dumb-init`
   - Automatically executes `npx prisma migrate deploy` on startup via `docker-entrypoint.sh`
   - Waits for `postgres` to be healthy before starting
   - Healthcheck: `GET /api/v1/health`
3. **`frontend`** (`frontend/Dockerfile`):
   - Multi-stage build (Node build -> Nginx Alpine runtime)
   - Configured with SPA route fallback and reverse proxy
   - Waits for `backend` to be healthy before starting
   - Exposes port `5173` (mapped to internal port `80`)

### Docker Commands

```bash
# Build and start all services in detached mode
docker compose up --build -d

# Check running container statuses
docker compose ps

# View unified real-time logs
docker compose logs -f

# View backend logs specifically
docker compose logs -f backend

# Stop all containers
docker compose down

# Stop containers and remove persistent database volume
docker compose down -v
```

### Accessing Docker Services

- **Web Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3000/api/v1](http://localhost:3000/api/v1)
- **API Health Check**: [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)
- **Swagger Documentation**: [http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)

---

## Testing

The codebase features automated test coverage across all layers:

### Test Suite Summary

- **Backend Unit Tests** (11 test suites, 77 unit tests passing):
  - Modules: Auth, Users, Vocabulary, Grammar, Listening, Reading, Quiz, Progress, Daily Goals, Achievements, Health.
- **Frontend Unit & Component Tests** (6 test suites, 35 unit/component tests passing):
  - Modules: Auth Forms, Dashboard Navigation, Vocab Flashcards, Grammar Drills, Audio Players, Progress Cards.
- **Backend E2E Integration Tests**: Supertest testing versioned `/api/v1` endpoints against PostgreSQL.
- **Frontend E2E Browser Tests**: Playwright covering full user journeys (Registration, Login, Profile Edit, Learning, Quizzes).

### Running Tests from Monorepo Root

```bash
# Run all backend unit tests
npm run test:backend

# Run backend unit tests with code coverage
npm run test:backend:cov

# Run backend API integration tests
npm run test:backend:e2e

# Run all frontend unit & component tests (Vitest)
npm run test:frontend

# Run frontend tests with code coverage
npm run test:frontend:cov

# Run Playwright browser end-to-end tests
npm run test:frontend:e2e

# Run TypeScript checks across both workspaces
npm run typecheck:frontend
npm run typecheck:backend

# Run linting across both workspaces
npm run lint:frontend
npm run lint:backend
```

### Running Tests Directly in Workspaces

```bash
# Backend workspace
cd backend
npm run test              # Jest unit tests
npm run test:cov          # Jest coverage
npm run test:e2e          # Supertest integration tests
npm run typecheck         # TypeScript verification
npm run lint              # ESLint check

# Frontend workspace
cd frontend
npm run test              # Vitest unit tests
npm run test:coverage     # Vitest coverage
npm run test:e2e          # Playwright headless browser tests
npm run typecheck         # TypeScript verification
npm run lint              # ESLint check
```

---

## Deployment

### Continuous Integration (GitHub Actions)

The repository includes a comprehensive CI pipeline located at [`.github/workflows/ci.yml`](.github/workflows/ci.yml). On every push or pull request to `main`, `master`, or `develop`, the workflow executes:

1. **Backend Checks**:
   - Spawns a PostgreSQL 16 service container
   - Installs dependencies with `npm ci`
   - Validates Prisma schema & deploys migrations
   - Seeds test data
   - Runs ESLint (`npm run lint`)
   - Runs TypeScript validation (`npm run typecheck`)
   - Runs 77 Jest unit tests (`npm test`)
   - Runs Supertest API integration tests (`npm run test:e2e`)
   - Builds production NestJS distribution (`npm run build`)

2. **Frontend Checks**:
   - Installs dependencies with `npm ci`
   - Runs ESLint (`npm run lint`)
   - Runs TypeScript validation (`npm run typecheck`)
   - Runs 35 Vitest component tests (`npm test`)
   - Builds production Vite distribution (`npm run build`)

3. **Playwright Browser E2E Tests**:
   - Launches PostgreSQL and Backend API in background
   - Installs Playwright Chromium browser binaries
   - Executes full integration tests against real services
   - Uploads HTML test artifacts on completion

#### Configuring GitHub Actions Secrets

In your GitHub repository, navigate to **Settings > Secrets and variables > Actions** and configure:

| Secret Name | Description | Recommended Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | Production/staging database connection URI | `postgresql://<user>:<password>@<host>:5432/<dbname>?schema=public` |
| `POSTGRES_USER` | CI PostgreSQL user | `postgres` |
| `POSTGRES_PASSWORD` | CI PostgreSQL password | Strong randomized password |
| `POSTGRES_DB` | CI PostgreSQL database | `english_learning_db` |
| `JWT_SECRET` | 256-bit secret for Access Token signing | Generate with `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | 256-bit secret for Refresh Token signing | Generate with `openssl rand -hex 32` |
| `VITE_API_BASE_URL` | Production public API base URL | `https://api.yourdomain.com/api/v1` |

---

### Production Deployment Strategies

#### Option 1: Docker Compose on Cloud VPS (AWS EC2, DigitalOcean, Hetzner, Linode)

1. Provision an Ubuntu 22.04/24.04 server with Docker and Docker Compose installed.
2. Clone repository and configure production `.env` with strong passwords and SSL domain names.
3. Configure a reverse proxy (e.g., Caddy, Traefik, or Nginx with Let's Encrypt Certbot) for automatic HTTPS:
   ```text
   learn.yourdomain.com -> localhost:5173
   api.yourdomain.com   -> localhost:3000
   ```
4. Start services:
   ```bash
   docker compose up -d --build
   ```

#### Option 2: Managed Cloud Containers (AWS ECS, Google Cloud Run, Render, Railway)

- **Backend**: Deploy `backend/Dockerfile` as a container service. Supply `DATABASE_URL` pointing to AWS RDS / Supabase / Neon PostgreSQL.
- **Frontend**: Deploy `frontend/Dockerfile` as a container service or deploy static `dist/` directly to Vercel, Netlify, or Cloudflare Pages with `VITE_API_BASE_URL` pointing to your deployed backend.

---

## Security & Best Practices

- **Never Commit Secrets**: Secrets, `.env` files, private keys (`.pem`, `.key`), and database dumps are blocked by `.gitignore`.
- **Least-Privilege Containers**: Backend container runs as an unprivileged system user (`nestuser:nodejs`, UID 1001) rather than root.
- **Signal Handling**: Containers utilize `dumb-init` to properly reap zombie processes and gracefully handle SIGTERM/SIGINT during zero-downtime rolling deploys.
- **Strict CORS**: Backend CORS is explicitly restricted to designated frontend origins in production.
- **Input Validation**: Global NestJS `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` prevents parameter pollution and injection attacks.
- **Password Security**: Passwords and refresh tokens are salted and hashed using `bcrypt` (10 rounds).

---

## License

This project is licensed under the [MIT License](LICENSE).

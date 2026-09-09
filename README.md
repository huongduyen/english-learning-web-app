# English Learning Web Application

A modern, full-stack English Learning platform designed with high performance, modularity, and strict type safety.

---

## Technology Stack

### Frontend
- **Framework & Runtime**: React 18, TypeScript, Vite
- **Styling & UI**: Tailwind CSS, shadcn/ui design tokens
- **Routing & State**: React Router v6, TanStack Query v5, Zustand
- **Forms & Validation**: React Hook Form, Zod
- **Testing**: Playwright (E2E)
- **Code Quality**: ESLint, Prettier

### Backend
- **Framework**: NestJS (TypeScript)
- **API Architecture**: REST API with global `/api/v1` prefix
- **ORM & Database**: Prisma ORM, PostgreSQL 16
- **Testing**: Jest (Unit tests), Supertest (E2E integration)
- **Validation**: class-validator, class-transformer

### DevOps & Tooling
- **Containerization**: Docker & Docker Compose (PostgreSQL 16)
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`)
- **Monorepo Structure**: Separate frontend & backend workspaces for independent lifecycle management

---

## Project Structure

```text
english-learning-web-app/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI pipeline for linting, testing, and building
├── backend/                    # NestJS REST API workspace
│   ├── prisma/
│   │   └── schema.prisma       # Database schema definition
│   ├── src/
│   │   ├── prisma/             # Prisma service and module
│   │   ├── app.controller.ts   # Health check controller
│   │   ├── app.module.ts       # Root NestJS module
│   │   ├── app.service.ts      # Health check service
│   │   └── main.ts             # Application entry point with CORS & validation
│   ├── test/                   # Jest e2e tests
│   ├── .env.example            # Backend environment template
│   ├── .eslintrc.js            # Backend ESLint configuration
│   ├── .prettierrc             # Backend Prettier configuration
│   ├── nest-cli.json           # NestJS CLI configuration
│   └── package.json            # Backend dependencies & scripts
├── frontend/                   # React + Vite workspace
│   ├── e2e/                    # Playwright end-to-end tests
│   ├── src/
│   │   ├── lib/utils.ts        # shadcn/ui utility helpers (cn)
│   │   ├── store/              # Zustand global client stores
│   │   ├── App.tsx             # Root layout & route configuration
│   │   ├── main.tsx            # App entry point with React Router & TanStack Query
│   │   └── index.css           # Tailwind base styles and theme CSS variables
│   ├── .env.example            # Frontend environment template
│   ├── .eslintrc.cjs           # Frontend ESLint configuration
│   ├── .prettierrc             # Frontend Prettier configuration
│   ├── components.json         # shadcn/ui CLI configuration
│   ├── tailwind.config.ts      # Tailwind CSS configuration
│   ├── vite.config.ts          # Vite build & alias configuration
│   └── package.json            # Frontend dependencies & scripts
├── docs/
│   └── architecture.md         # System architecture and design documentation
├── docker-compose.yml          # PostgreSQL 16 service for local development
├── .gitignore                  # Git ignore rules for node, dist, logs, env
├── .env.example                # Global environment variables template
├── package.json                # Root convenience scripts for monorepo
└── README.md                   # Project overview and setup guide
```

---

## Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **Docker**: For running PostgreSQL locally

---

## Environment Setup

1. Copy root environment template:
   ```bash
   cp .env.example .env
   ```

2. Copy backend environment template:
   ```bash
   cp backend/.env.example backend/.env
   ```

3. Copy frontend environment template:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

---

## Database (Docker Compose)

Start the PostgreSQL container:
```bash
# From the root directory:
docker compose up -d postgres

# Or via npm script:
npm run db:up
```

To stop the database:
```bash
npm run db:down
```

---

## Running the Backend

The backend can be run directly from the `backend/` directory or from the root.

### From the `backend/` directory:
```bash
cd backend
npm install
npx prisma generate
npm run start:dev
```

### From the root directory:
```bash
npm run dev:backend
```

Backend REST API will be accessible at: `http://localhost:3000/api/v1`
Health check endpoint: `http://localhost:3000/api/v1/health`

---

## Running the Frontend

The frontend can be run directly from the `frontend/` directory or from the root.

### From the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```

### From the root directory:
```bash
npm run dev:frontend
```

Frontend application will be accessible at: `http://localhost:5173`

---

## Testing & Quality Control

### Backend Tests & Linting
```bash
# Unit tests
npm --prefix backend run test

# E2E integration tests
npm --prefix backend run test:e2e

# Linting
npm --prefix backend run lint
```

### Frontend Tests & Linting
```bash
# Type check and build
npm --prefix frontend run build

# Linting
npm --prefix frontend run lint

# E2E tests (Playwright)
npm --prefix frontend run test:e2e
```

### Database Schema Validation
```bash
npm --prefix backend run prisma:generate
```

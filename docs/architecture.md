# English Learning Web Application - Architecture Documentation

## 1. System Overview

The English Learning Web Application is architected as a modular monorepo containing an independent React SPA frontend and a NestJS REST API backend, backed by PostgreSQL.

```
┌────────────────────────────────────────────────────────┐
│                   Frontend (React/Vite)                │
│  - React Router (Routing)                              │
│  - TanStack Query (Server State Cache)                 │
│  - Zustand (Client UI State)                           │
│  - Tailwind CSS + shadcn/ui (Design System)            │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON REST API
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Backend (NestJS)                     │
│  - REST Controllers & Services                         │
│  - Validation Pipes (class-validator / Zod)            │
│  - Prisma ORM Data Layer                               │
└───────────────────────────┬────────────────────────────┘
                            │ SQL / TCP
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Database (PostgreSQL 16)             │
│  - Managed via Docker Compose in local development     │
│  - Schema migrations driven by Prisma                  │
└────────────────────────────────────────────────────────┘
```

## 2. Monorepo Organization

- **Independent Workspaces**: Both `frontend` and `backend` contain their own `package.json`, TypeScript configuration, and lockfiles. This prevents version incompatibilities between frontend build tooling and backend runtime packages.
- **Root Orchestration**: The root directory provides a top-level `docker-compose.yml`, shared documentation, CI workflows, and convenience development scripts.

## 3. Technology Choices

### Frontend
- **Vite + React 18/19 + TypeScript**: Rapid HMR, fast production builds, and strict type safety.
- **Tailwind CSS + shadcn/ui**: Accessible, customizable component primitives with utility-first styling.
- **TanStack Query (v5)**: Declarative data fetching, caching, deduplication, and synchronization.
- **Zustand**: Lightweight, boilerplate-free global client state management.
- **React Hook Form + Zod**: High-performance, schema-validated forms.
- **Playwright**: Modern browser-based end-to-end testing.

### Backend
- **NestJS**: Structured, enterprise-grade architecture with dependency injection and modularity.
- **Prisma**: Type-safe ORM for database modeling and migrations.
- **PostgreSQL 16**: Relational data store supporting complex learning metrics, user progress, and vocabulary relations.
- **Jest + Supertest**: Unit and end-to-end integration testing.

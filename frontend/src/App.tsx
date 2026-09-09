import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { BookOpen, Moon, Sun, CheckCircle2, Server, Globe, Database } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { theme, toggleTheme } = useAppStore();

  const technologies = [
    { name: 'React 18 & Vite', category: 'Frontend' },
    { name: 'TypeScript', category: 'Language' },
    { name: 'Tailwind CSS & shadcn/ui', category: 'Styling' },
    { name: 'React Router & TanStack Query', category: 'Routing & Data' },
    { name: 'Zustand & React Hook Form', category: 'State & Forms' },
    { name: 'NestJS REST API', category: 'Backend' },
    { name: 'Prisma ORM & PostgreSQL', category: 'Database' },
    { name: 'Jest, Supertest & Playwright', category: 'Testing' },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">English Learning Platform</span>
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                Foundation v0.1.0
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl flex-1 px-4 py-12 sm:px-6">
        <section className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Monorepo Foundation Initialized
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Empower Your English Journey
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A production-ready platform architecture combining modern React, NestJS, and Prisma.
            Learning modules and interactive vocabulary features will be implemented in subsequent phases.
          </p>
        </section>

        <section className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
                <Globe className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-base">Frontend Architecture</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Vite dev server with React 18, Tailwind CSS, shadcn/ui tokens, React Router, TanStack Query, and Zustand client store.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                <Server className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-base">Backend Architecture</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              NestJS structured backend with global validation pipes, REST API routing, and modular configuration.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                <Database className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-base">Data & Persistence</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              PostgreSQL 16 containerized via Docker Compose, paired with Prisma ORM for schema validation and migrations.
            </p>
          </div>
        </section>

        <section className="mt-12 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Configured Technology Stack</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {technologies.map((item) => (
              <div
                key={item.name}
                className="flex flex-col rounded-lg border bg-background/50 p-3"
              >
                <span className="text-xs font-medium text-muted-foreground">{item.category}</span>
                <span className="mt-1 font-semibold text-sm">{item.name}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        English Learning Web Application &copy; {new Date().getFullYear()} &middot; Built with modern TypeScript stack
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="*"
        element={
          <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
            <h1 className="text-3xl font-bold">404 - Not Found</h1>
            <p className="mt-2 text-muted-foreground">The requested page does not exist.</p>
            <Link to="/" className="mt-4 text-primary underline">
              Return Home
            </Link>
          </div>
        }
      />
    </Routes>
  );
};

export default App;

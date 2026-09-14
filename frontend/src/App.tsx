import React, { useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicOnlyRoute } from './components/PublicOnlyRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CheckCircle2, Server, Globe, Database, Shield, ArrowRight } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  const technologies = [
    { name: 'React 18 & Vite', category: 'Frontend' },
    { name: 'TypeScript', category: 'Language' },
    { name: 'Tailwind CSS & shadcn/ui', category: 'Styling' },
    { name: 'React Router & TanStack Query', category: 'Routing & Data' },
    { name: 'Zustand & React Hook Form', category: 'State & Forms' },
    { name: 'NestJS REST API', category: 'Backend' },
    { name: 'Prisma ORM & PostgreSQL', category: 'Database' },
    { name: 'JWT & Bcrypt Security', category: 'Authentication' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="container mx-auto max-w-6xl flex-1 px-4 py-12 sm:px-6">
        <section className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            JWT Authentication & Role Security Ready
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Empower Your English Journey
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A secure, full-stack learning platform featuring token-based authentication,
            bcrypt password hashing, refresh token rotation, and personalized study
            profiles.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                id="hero-dashboard-button"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  id="hero-register-button"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  id="hero-login-button"
                  className="inline-flex items-center gap-2 rounded-xl border border-input bg-card px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-accent"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </section>

        <section className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-600 dark:text-blue-400">
                <Globe className="h-5 w-5" />
              </div>
              <h2 className="text-base font-semibold">Frontend Architecture</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              React 18 with Vite, React Hook Form, Zod schemas, TanStack Query, and
              persistent Zustand store.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
                <Server className="h-5 w-5" />
              </div>
              <h2 className="text-base font-semibold">NestJS REST API</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Modular controllers and services with global validation pipes, exception
              filters, and OpenAPI Swagger documentation.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-500/10 p-2.5 text-indigo-600 dark:text-indigo-400">
                <Shield className="h-5 w-5" />
              </div>
              <h2 className="text-base font-semibold">JWT Security</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Access tokens (15m) paired with bcrypt-hashed refresh tokens (7d), NestJS
              guards, and auto-refresh replay interceptors.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-400">
                <Database className="h-5 w-5" />
              </div>
              <h2 className="text-base font-semibold">PostgreSQL & Prisma</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              PostgreSQL relational database with Prisma ORM migrations, relational
              profiles, and seeded English lessons.
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
                <span className="text-xs font-medium text-muted-foreground">
                  {item.category}
                </span>
                <span className="mt-1 text-sm font-semibold">{item.name}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        English Learning Web Application &copy; {new Date().getFullYear()} &middot; Built
        with modern TypeScript stack
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
            <h1 className="text-3xl font-bold">404 - Not Found</h1>
            <p className="mt-2 text-muted-foreground">
              The requested page does not exist.
            </p>
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

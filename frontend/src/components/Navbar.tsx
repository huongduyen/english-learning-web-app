import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import {
  BookOpen,
  BookA,
  Trophy,
  Moon,
  Sun,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useAppStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight sm:text-lg">
                English Learning
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Platform
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
            <Link
              to="/"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  id="nav-dashboard-link"
                  className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  to="/vocabulary"
                  id="nav-vocabulary-link"
                  className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <BookOpen className="h-4 w-4" />
                  Vocabulary
                </Link>
                <Link
                  to="/grammar"
                  id="nav-grammar-link"
                  className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <BookA className="h-4 w-4" />
                  Grammar
                </Link>
                <Link
                  to="/quizzes"
                  id="nav-quizzes-link"
                  className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Trophy className="h-4 w-4" />
                  Quizzes
                </Link>
                <Link
                  to="/profile"
                  id="nav-profile-link"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Profile
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-lg border border-border/80 bg-card/60 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || user.email}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                    <UserIcon className="h-3.5 w-3.5" />
                  </div>
                )}
                <span className="hidden max-w-[120px] truncate font-semibold sm:inline-block">
                  {user.name || user.email.split('@')[0]}
                </span>
                <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
                  {user.level}
                </span>
              </Link>

              <button
                id="logout-button"
                onClick={handleLogout}
                aria-label="Log out"
                className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-all hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                id="nav-login-button"
                className="inline-flex h-9 items-center justify-center rounded-lg px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                id="nav-register-button"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

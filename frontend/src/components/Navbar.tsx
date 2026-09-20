import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  Headphones,
  BookMarked,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useAppStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    setMobileOpen(false);
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/quizzes') {
      return location.pathname === '/quizzes' || location.pathname.startsWith('/quiz/');
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-xs">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Left Section: Logo & Desktop Navigation */}
        <div className="flex items-center gap-2 xl:gap-6 min-w-0">
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-2.5 transition-opacity hover:opacity-90 shrink-0"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shrink-0">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight sm:text-base leading-tight whitespace-nowrap">
                English Learning
              </span>
              <span className="hidden xl:inline text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-1 xl:gap-1.5 text-sm font-medium lg:flex min-w-0">
            <Link
              to="/"
              className={`hidden xl:inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs xl:text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                isActive('/')
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  id="nav-dashboard-link"
                  className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 xl:px-2.5 text-xs xl:text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <LayoutDashboard className="h-3.5 w-3.5 xl:h-4 xl:w-4 shrink-0" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/vocabulary"
                  id="nav-vocabulary-link"
                  className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 xl:px-2.5 text-xs xl:text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                    isActive('/vocabulary')
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5 xl:h-4 xl:w-4 shrink-0" />
                  <span>Vocabulary</span>
                </Link>
                <Link
                  to="/grammar"
                  id="nav-grammar-link"
                  className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 xl:px-2.5 text-xs xl:text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                    isActive('/grammar')
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <BookA className="h-3.5 w-3.5 xl:h-4 xl:w-4 shrink-0" />
                  <span>Grammar</span>
                </Link>
                <Link
                  to="/listening"
                  id="nav-listening-link"
                  className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 xl:px-2.5 text-xs xl:text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                    isActive('/listening')
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <Headphones className="h-3.5 w-3.5 xl:h-4 xl:w-4 shrink-0" />
                  <span>Listening</span>
                </Link>
                <Link
                  to="/reading"
                  id="nav-reading-link"
                  className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 xl:px-2.5 text-xs xl:text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                    isActive('/reading')
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <BookMarked className="h-3.5 w-3.5 xl:h-4 xl:w-4 shrink-0" />
                  <span>Reading</span>
                </Link>
                <Link
                  to="/quizzes"
                  id="nav-quizzes-link"
                  className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 xl:px-2.5 text-xs xl:text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                    isActive('/quizzes')
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <Trophy className="h-3.5 w-3.5 xl:h-4 xl:w-4 shrink-0" />
                  <span>Quizzes</span>
                </Link>
                <Link
                  to="/profile"
                  id="nav-profile-link"
                  className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 xl:px-2.5 text-xs xl:text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                    isActive('/profile')
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <UserIcon className="h-3.5 w-3.5 xl:h-4 xl:w-4 shrink-0" />
                  <span>Profile</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right Section: Theme Toggle, User Profile, Logout & Mobile Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground shrink-0"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Link
                to="/profile"
                className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-border/80 bg-card/60 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-medium transition-colors hover:bg-accent shrink-0"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || user.email}
                    className="h-5 w-5 sm:h-6 sm:w-6 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-primary/10 font-bold text-primary shrink-0">
                    <UserIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </div>
                )}
                <span className="hidden sm:inline-block max-w-[80px] xl:max-w-[110px] truncate font-semibold">
                  {user.name || user.email.split('@')[0]}
                </span>
                <span className="hidden xl:inline-block rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-primary shrink-0">
                  {user.level}
                </span>
              </Link>

              <button
                id="logout-button"
                onClick={handleLogout}
                aria-label="Log out"
                title="Log out"
                className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/10 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-medium text-destructive transition-all hover:bg-destructive hover:text-destructive-foreground shrink-0"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden xl:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Link
                to="/login"
                id="nav-login-button"
                className="inline-flex h-8 sm:h-9 items-center justify-center rounded-lg px-2.5 sm:px-3 text-xs sm:text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground shrink-0"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                id="nav-register-button"
                className="inline-flex h-8 sm:h-9 items-center justify-center rounded-lg bg-primary px-3 sm:px-3.5 text-xs sm:text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 shrink-0"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            id="mobile-menu-button"
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden shrink-0"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer Dropdown */}
      {mobileOpen && (
        <div
          id="mobile-nav-drawer"
          className="border-t border-border/70 bg-background/98 backdrop-blur-xl lg:hidden shadow-lg animate-in slide-in-from-top-1 duration-200"
        >
          <div className="container mx-auto px-4 py-3 space-y-3 max-w-6xl">
            {isAuthenticated && user && (
              <div className="flex items-center justify-between rounded-xl bg-card border border-border/80 p-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || user.email}
                      className="h-9 w-9 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-bold text-primary shrink-0">
                      <UserIcon className="h-4 w-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate leading-tight">
                      {user.name || user.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <span className="rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary shrink-0">
                  {user.level}
                </span>
              </div>
            )}

            <div className="grid gap-1">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <span>Home</span>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive('/dashboard')
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </Link>
                  <Link
                    to="/vocabulary"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive('/vocabulary')
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="h-4 w-4" />
                      <span>Vocabulary</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </Link>
                  <Link
                    to="/grammar"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive('/grammar')
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BookA className="h-4 w-4" />
                      <span>Grammar</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </Link>
                  <Link
                    to="/listening"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive('/listening')
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Headphones className="h-4 w-4" />
                      <span>Listening</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </Link>
                  <Link
                    to="/reading"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive('/reading')
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BookMarked className="h-4 w-4" />
                      <span>Reading</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </Link>
                  <Link
                    to="/quizzes"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive('/quizzes')
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Trophy className="h-4 w-4" />
                      <span>Quizzes</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive('/profile')
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <UserIcon className="h-4 w-4" />
                      <span>Profile</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </Link>

                  <div className="pt-2 border-t border-border/70">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <div className="flex items-center gap-2.5">
                        <LogOut className="h-4 w-4" />
                        <span>Log Out</span>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};


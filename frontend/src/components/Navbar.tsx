import React, { useState, useEffect, useRef } from 'react';
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
  TrendingUp,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useAppStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [skillsOpen, setSkillsOpen] = useState(false);
  const skillsRef = useRef<HTMLDivElement>(null);

  // Close menus on route changes
  useEffect(() => {
    setMobileOpen(false);
    setSkillsOpen(false);
  }, [location.pathname]);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (skillsRef.current && !skillsRef.current.contains(e.target as Node)) {
        setSkillsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setSkillsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    setMobileOpen(false);
    setSkillsOpen(false);
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

  const isSkillsActive =
    isActive('/vocabulary') ||
    isActive('/grammar') ||
    isActive('/listening') ||
    isActive('/reading');

  const skillItems = [
    {
      name: 'Vocabulary',
      nameVi: 'Từ Vựng',
      path: '/vocabulary',
      id: 'nav-vocabulary-link',
      icon: BookOpen,
      color: 'text-indigo-600 bg-indigo-500/10 dark:text-indigo-400',
      description: 'Flashcards, topics & word lists',
    },
    {
      name: 'Grammar',
      nameVi: 'Ngữ Pháp',
      path: '/grammar',
      id: 'nav-grammar-link',
      icon: BookA,
      color: 'text-amber-600 bg-amber-500/10 dark:text-amber-400',
      description: 'Rules, categories & exercises',
    },
    {
      name: 'Listening',
      nameVi: 'Luyện Nghe',
      path: '/listening',
      id: 'nav-listening-link',
      icon: Headphones,
      color: 'text-blue-600 bg-blue-500/10 dark:text-blue-400',
      description: 'Audio lessons & quizzes',
    },
    {
      name: 'Reading',
      nameVi: 'Luyện Đọc',
      path: '/reading',
      id: 'nav-reading-link',
      icon: BookMarked,
      color: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400',
      description: 'Articles, stories & comprehension',
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-xs">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-3 sm:px-6">
        {/* Left Section: Logo & Desktop Navigation */}
        <div className="flex items-center gap-3 xl:gap-6 shrink-0">
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
          <nav className="hidden items-center gap-1 xl:gap-1.5 text-xs xl:text-sm font-medium lg:flex shrink-0">
            <Link
              to="/"
              className={`hidden 2xl:inline-flex items-center rounded-lg px-2.5 py-1.5 font-medium whitespace-nowrap shrink-0 transition-colors ${
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
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium whitespace-nowrap shrink-0 transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <LayoutDashboard className="h-3.5 w-3.5 xl:h-4 xl:w-4 shrink-0" />
                  <span>Dashboard</span>
                </Link>

                {/* Skills Dropdown Popover with 100% Solid/Opaque Background */}
                <div className="relative" ref={skillsRef}>
                  <button
                    type="button"
                    id="nav-skills-dropdown"
                    onClick={() => setSkillsOpen((prev) => !prev)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium whitespace-nowrap shrink-0 transition-colors ${
                      isSkillsActive || skillsOpen
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                    aria-expanded={skillsOpen}
                    aria-haspopup="true"
                  >
                    <BookOpen className="h-3.5 w-3.5 xl:h-4 xl:w-4 shrink-0" />
                    <span>Skills</span>
                    <ChevronDown
                      className={`h-3 w-3 xl:h-3.5 xl:w-3.5 shrink-0 opacity-70 transition-transform duration-200 ${
                        skillsOpen ? 'rotate-180 text-primary' : ''
                      }`}
                    />
                  </button>

                  {/* Skills Dropdown Popup Menu (Guaranteed 100% solid opaque background) */}
                  {skillsOpen && (
                    <div
                      id="skills-dropdown-menu"
                      className="absolute left-0 top-full mt-2 w-72 rounded-2xl border border-border bg-card p-2 shadow-2xl z-50 animate-in fade-in-0 zoom-in-95 duration-150"
                      style={{
                        backgroundColor: theme === 'dark' ? '#0b1120' : '#ffffff',
                      }}
                    >
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 mb-1">
                        Core Skills
                      </div>
                      <div className="space-y-1">
                        {skillItems.map((item) => {
                          const Icon = item.icon;
                          const active = isActive(item.path);
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              id={item.id}
                              onClick={() => setSkillsOpen(false)}
                              className={`flex items-start gap-3 rounded-xl p-2.5 transition-colors ${
                                active
                                  ? 'bg-primary/15 text-primary font-semibold'
                                  : 'hover:bg-accent/80 hover:text-foreground text-foreground'
                              }`}
                            >
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.color}`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-bold leading-tight">
                                    {item.name}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {item.nameVi}
                                  </span>
                                </div>
                                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 font-normal">
                                  {item.description}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/quizzes"
                  id="nav-quizzes-link"
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium whitespace-nowrap shrink-0 transition-colors ${
                    isActive('/quizzes')
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <Trophy className="h-3.5 w-3.5 xl:h-4 xl:w-4 shrink-0" />
                  <span>Quizzes</span>
                </Link>

                <Link
                  to="/progress"
                  id="nav-progress-link"
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium whitespace-nowrap shrink-0 transition-colors ${
                    isActive('/progress')
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5 xl:h-4 xl:w-4 shrink-0" />
                  <span>Progress</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right Section: Theme Toggle, User Profile, Logout & Mobile Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
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
                id="nav-profile-link"
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

                  {skillItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive(item.path)
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 opacity-50" />
                      </Link>
                    );
                  })}

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
                    to="/progress"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive('/progress')
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <TrendingUp className="h-4 w-4" />
                      <span>Progress</span>
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

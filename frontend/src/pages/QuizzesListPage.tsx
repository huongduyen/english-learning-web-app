import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { quizApi } from '../services/quizApi';
import { EnglishLevel } from '../types/grammar';
import {
  Trophy,
  Clock,
  HelpCircle,
  ArrowRight,
  Search,
  RotateCcw,
} from 'lucide-react';

export const QuizzesListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<EnglishLevel | ''>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | ''>('');

  const {
    data: quizResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['quizzes-list', searchTerm, selectedLevel, selectedDifficulty],
    queryFn: () =>
      quizApi.getQuizzes({
        search: searchTerm,
        level: (selectedLevel as EnglishLevel) || undefined,
        difficulty: (selectedDifficulty as 'EASY' | 'MEDIUM' | 'HARD') || undefined,
        limit: 50,
      }),
  });

  const quizzes = quizResponse?.data || [];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedLevel('');
    setSelectedDifficulty('');
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'EASY':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'HARD':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="container mx-auto max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {/* Hero */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
            <Trophy className="h-3.5 w-3.5" />
            Knowledge Assessments
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Quizzes & Proficiency Tests
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Test your English across multiple question types: multiple choice, true/false,
            gap-filling, concept matching, and sentence ordering. Earn XP and track your attempts.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              id="quiz-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search quizzes by title or topic..."
              className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2.5 text-sm text-foreground shadow-xs transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as EnglishLevel | '')}
              className="rounded-xl border border-input bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-xs focus:border-primary focus:outline-none sm:text-sm"
            >
              <option value="">All Levels</option>
              <option value="BEGINNER">Beginner (A1)</option>
              <option value="ELEMENTARY">Elementary (A2)</option>
              <option value="INTERMEDIATE">Intermediate (B1)</option>
              <option value="UPPER_INTERMEDIATE">Upper Intermediate (B2)</option>
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) =>
                setSelectedDifficulty(e.target.value as 'EASY' | 'MEDIUM' | 'HARD' | '')
              }
              className="rounded-xl border border-input bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-xs focus:border-primary focus:outline-none sm:text-sm"
            >
              <option value="">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>

        {/* Quizzes Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-60 animate-pulse rounded-2xl border border-border/80 bg-card/60 p-5"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <p className="text-sm font-semibold text-destructive">
              Failed to load quizzes.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Try Again
            </button>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="rounded-2xl border bg-card p-12 text-center shadow-xs">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground/60" />
            <h3 className="mt-4 text-lg font-bold text-foreground">No Quizzes Found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search criteria or clear active filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="group flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-xs transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                      {quiz.lessonType} QUIZ
                    </span>
                    <span
                      className={`rounded-lg border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${getDifficultyBadge(
                        quiz.difficulty
                      )}`}
                    >
                      {quiz.difficulty}
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-bold text-foreground transition-colors group-hover:text-primary sm:text-lg">
                    {quiz.title}
                  </h3>

                  {quiz.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                      {quiz.description}
                    </p>
                  )}
                </div>

                <div className="mt-6 border-t border-border/60 pt-4">
                  <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <HelpCircle className="h-3.5 w-3.5 text-primary" />
                      <span>{quiz.questionCount} Questions</span>
                    </div>
                    {quiz.timeLimit && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        <span>{quiz.timeLimit} Mins</span>
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/quiz/${quiz.id}`}
                    id={`quiz-start-${quiz.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                  >
                    <span>Start Quiz</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

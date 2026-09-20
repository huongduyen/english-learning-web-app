import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '../components/Navbar';
import { grammarApi } from '../services/grammarApi';
import { GrammarCard } from '../components/grammar/GrammarCard';
import { GrammarCategoryFilter } from '../components/grammar/GrammarCategoryFilter';
import { EnglishLevel } from '../types/grammar';
import {
  Search,
  BookOpen,
  Filter,
  Sparkles,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';

export const GrammarListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<EnglishLevel | ''>('');

  // 1. Fetch categories with counts
  const { data: categories = [] } = useQuery({
    queryKey: ['grammar-categories'],
    queryFn: () => grammarApi.getCategories(),
  });

  // 2. Fetch paginated lessons with filters
  const {
    data: lessonsResponse,
    isLoading: isLessonsLoading,
    isError: isLessonsError,
    refetch: refetchLessons,
  } = useQuery({
    queryKey: ['grammar-lessons', searchTerm, selectedCategory, selectedLevel],
    queryFn: () =>
      grammarApi.getLessons({
        search: searchTerm,
        category: selectedCategory || undefined,
        level: (selectedLevel as EnglishLevel) || undefined,
        limit: 50,
      }),
  });

  const lessons = lessonsResponse?.data || [];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedLevel('');
  };

  const levels: Array<{ label: string; value: EnglishLevel | '' }> = [
    { label: 'All Levels', value: '' },
    { label: 'Beginner (A1)', value: 'BEGINNER' },
    { label: 'Elementary (A2)', value: 'ELEMENTARY' },
    { label: 'Intermediate (B1)', value: 'INTERMEDIATE' },
    { label: 'Upper Intermediate (B2)', value: 'UPPER_INTERMEDIATE' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="container mx-auto max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/dashboard"
            id="back-to-dashboard-link"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Page Hero */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              English Grammar Curriculum
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Grammar Lessons & Interactive Exercises
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Explore essential English rules, timelines, sentence structures, and practice
              interactive multiple-choice, fill-in-the-blank, and sentence correction exercises.
            </p>
          </div>
        </div>

        {/* Search & Level Filter Row */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              id="grammar-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search grammar lessons, tenses, or Vietnamese keywords..."
              className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2.5 text-sm text-foreground shadow-xs transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Level selector */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              id="grammar-level-select"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as EnglishLevel | '')}
              className="rounded-xl border border-input bg-card px-3 py-2.5 text-xs font-semibold text-foreground shadow-xs transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-sm"
            >
              {levels.map((lvl) => (
                <option key={lvl.value} value={lvl.value}>
                  {lvl.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mb-8">
          <GrammarCategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Lessons List Grid */}
        {isLessonsLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl border border-border/80 bg-card/60 p-5"
              />
            ))}
          </div>
        ) : isLessonsError ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <p className="text-sm font-semibold text-destructive">
              Failed to load grammar lessons.
            </p>
            <button
              type="button"
              onClick={() => refetchLessons()}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Try Again
            </button>
          </div>
        ) : lessons.length === 0 ? (
          <div className="rounded-2xl border bg-card p-12 text-center shadow-xs">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/60" />
            <h3 className="mt-4 text-lg font-bold text-foreground">
              No Grammar Lessons Found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We couldn't find any lessons matching your search or category filter.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset All Filters
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing <strong className="text-foreground">{lessons.length}</strong> grammar lessons
              </span>
              {(searchTerm || selectedCategory || selectedLevel) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="font-semibold text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {lessons.map((lesson) => (
                <GrammarCard key={lesson.id} lesson={lesson} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

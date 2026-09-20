import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '../components/Navbar';
import { readingApi } from '../services/readingApi';
import { ReadingArticleCard } from '../components/reading/ReadingArticleCard';
import { EnglishLevel } from '../types/grammar';
import {
  BookOpen,
  Search,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';

export const ReadingListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['reading-articles', searchTerm, selectedDifficulty, selectedLevel],
    queryFn: () =>
      readingApi.getArticles({
        search: searchTerm || undefined,
        difficulty: selectedDifficulty === 'ALL' ? undefined : selectedDifficulty,
        level: selectedLevel === 'ALL' ? undefined : (selectedLevel as EnglishLevel),
      }),
  });

  const articles = response?.data || [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="container mx-auto max-w-5xl flex-1 px-4 py-8 sm:px-6">
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

        {/* Page Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
              <BookOpen className="h-3.5 w-3.5" />
              Module 8 &middot; Reading
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Reading Comprehension
            </h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Explore engaging articles, broaden your vocabulary in context, and answer comprehension quizzes.
            </p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              id="reading-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by topic, article title, or keyword..."
              className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2 text-xs sm:text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <select
              id="reading-difficulty-filter"
              value={selectedDifficulty}
              onChange={(e) =>
                setSelectedDifficulty(e.target.value as 'ALL' | 'EASY' | 'MEDIUM' | 'HARD')
              }
              className="rounded-xl border border-input bg-card px-3 py-2 text-xs sm:text-sm text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>

            {/* Level Filter */}
            <select
              id="reading-level-filter"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="rounded-xl border border-input bg-card px-3 py-2 text-xs sm:text-sm text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="ALL">All Levels</option>
              <option value="BEGINNER">Beginner (A1)</option>
              <option value="ELEMENTARY">Elementary (A2)</option>
              <option value="INTERMEDIATE">Intermediate (B1)</option>
              <option value="UPPER_INTERMEDIATE">Upper Intermediate (B2)</option>
              <option value="ADVANCED">Advanced (C1)</option>
            </select>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-8">
          {isLoading && (
            <div id="reading-loading-skeleton" className="grid gap-5 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-2xl border border-border bg-muted/40 p-5"
                />
              ))}
            </div>
          )}

          {isError && (
            <div
              id="reading-error-state"
              className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-10 text-center"
            >
              <AlertCircle className="h-10 w-10 text-destructive" />
              <h3 className="mt-3 text-base font-bold text-foreground">
                Unable to load reading articles
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                An error occurred while connecting to the reading service.
              </p>
              <button
                type="button"
                id="reading-retry-button"
                onClick={() => refetch()}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          )}

          {!isLoading && !isError && articles.length === 0 && (
            <div
              id="reading-empty-state"
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center"
            >
              <BookOpen className="h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-3 text-base font-bold text-foreground">
                No reading articles available yet.
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                Try adjusting your search query or filters to discover available reading lessons.
              </p>
              {(searchTerm || selectedDifficulty !== 'ALL' || selectedLevel !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDifficulty('ALL');
                    setSelectedLevel('ALL');
                  }}
                  className="mt-4 text-xs font-semibold text-primary underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {!isLoading && !isError && articles.length > 0 && (
            <div
              id="reading-articles-grid"
              className="grid gap-5 sm:grid-cols-2"
            >
              {articles.map((article) => (
                <ReadingArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

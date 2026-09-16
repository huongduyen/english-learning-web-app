import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { VocabularyCard } from '../components/vocabulary/VocabularyCard';
import { VocabularyFilters } from '../components/vocabulary/VocabularyFilters';
import {
  useVocabularyList,
  useVocabularyTopics,
} from '../hooks/useVocabulary';
import {
  Difficulty,
  VocabularyQueryFilters,
} from '../types/vocabulary';
import {
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  GraduationCap,
  Layers,
} from 'lucide-react';

export const VocabularyListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTopic = searchParams.get('topicId') || '';
  const initialDifficulty = (searchParams.get('difficulty') as Difficulty) || '';
  const initialSearch = searchParams.get('search') || '';

  const [filters, setFilters] = useState<VocabularyQueryFilters>({
    page: Number(searchParams.get('page')) || 1,
    limit: 12,
    search: initialSearch,
    topicId: initialTopic,
    difficulty: initialDifficulty,
    partOfSpeech: searchParams.get('partOfSpeech') || '',
  });

  const {
    data: topics = [],
    isLoading: isTopicsLoading,
  } = useVocabularyTopics();

  const {
    data: listData,
    isLoading: isVocabLoading,
    isError,
    error,
    refetch,
  } = useVocabularyList(filters);

  const handleFilterChange = (newFilters: VocabularyQueryFilters) => {
    setFilters(newFilters);

    // Sync to URL search params
    const params = new URLSearchParams();
    if (newFilters.page && newFilters.page > 1)
      params.set('page', newFilters.page.toString());
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.topicId) params.set('topicId', newFilters.topicId);
    if (newFilters.difficulty) params.set('difficulty', newFilters.difficulty);
    if (newFilters.partOfSpeech) params.set('partOfSpeech', newFilters.partOfSpeech);
    setSearchParams(params, { replace: true });
  };

  const handlePageChange = (newPage: number) => {
    handleFilterChange({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const vocabularies = listData?.data || [];
  const pagination = listData?.pagination;
  const totalCount = pagination?.total;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="container mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6">
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

          <Link
            to={`/vocabulary/flashcards${
              filters.topicId ? `?topicId=${filters.topicId}` : ''
            }`}
            id="start-flashcards-button"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            Start Flashcards
          </Link>
        </div>

        {/* Hero Section */}
        <div className="mb-8 rounded-3xl border border-border/80 bg-gradient-to-r from-primary/10 via-background to-secondary/30 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <GraduationCap className="h-3.5 w-3.5" />
                Comprehensive English Vocabulary
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                Vocabulary
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Master essential English vocabulary with IPA phonetic pronunciations,
                Vietnamese meanings, sample context sentences, and spaced repetition.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  Available Words
                </span>
                <p className="text-2xl font-bold text-foreground">
                  {totalCount !== undefined ? totalCount : '...'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Topic Chips */}
          {!isTopicsLoading && topics.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
              <span className="text-xs font-semibold text-muted-foreground mr-1">
                Topics:
              </span>
              <button
                type="button"
                onClick={() =>
                  handleFilterChange({ ...filters, topicId: '', page: 1 })
                }
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                  !filters.topicId
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-background/80 text-muted-foreground hover:bg-card hover:text-foreground border'
                }`}
              >
                All Topics ({topics.reduce((acc, t) => acc + t.vocabularyCount, 0)})
              </button>
              {topics.slice(0, 7).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    handleFilterChange({
                      ...filters,
                      topicId: filters.topicId === t.id ? '' : t.id,
                      page: 1,
                    })
                  }
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                    filters.topicId === t.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-background/80 text-muted-foreground hover:bg-card hover:text-foreground border'
                  }`}
                >
                  {t.title} ({t.vocabularyCount})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Controls Bar */}
        <div className="mb-6">
          <VocabularyFilters
            filters={filters}
            topics={topics}
            totalCount={totalCount}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Loading State */}
        {isVocabLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl border border-border bg-card/60 p-5"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <h3 className="text-lg font-semibold text-destructive">
              Failed to load vocabulary
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isVocabLoading && !isError && vocabularies.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/60" />
            <h3 className="mt-4 text-lg font-bold text-foreground">
              No vocabulary words match your filters
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search query, topic, or difficulty level.
            </p>
            <button
              type="button"
              onClick={() =>
                handleFilterChange({
                  page: 1,
                  limit: 12,
                  search: '',
                  topicId: '',
                  difficulty: '',
                  partOfSpeech: '',
                })
              }
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Vocabulary Cards Grid */}
        {!isVocabLoading && !isError && vocabularies.length > 0 && (
          <div
            id="vocabulary-cards-grid"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {vocabularies.map((item) => (
              <VocabularyCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!isVocabLoading &&
          pagination &&
          pagination.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
              <span className="text-xs text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <div className="flex items-center gap-2">
                <button
                  id="vocab-prev-page"
                  type="button"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="inline-flex h-9 items-center gap-1 rounded-xl border border-input bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <div className="hidden items-center gap-1 sm:flex">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePageChange(p)}
                        className={`h-9 w-9 rounded-xl text-xs font-semibold transition-all ${
                          p === pagination.page
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'border border-input bg-card text-foreground hover:bg-accent'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                <button
                  id="vocab-next-page"
                  type="button"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="inline-flex h-9 items-center gap-1 rounded-xl border border-input bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        English Learning Web Application &copy; {new Date().getFullYear()} &middot; Built
        with modern TypeScript stack
      </footer>
    </div>
  );
};

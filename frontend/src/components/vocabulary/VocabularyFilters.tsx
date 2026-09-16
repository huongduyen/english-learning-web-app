import React from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';
import {
  Difficulty,
  VocabularyQueryFilters,
  VocabularyTopic,
} from '../../types/vocabulary';

interface VocabularyFiltersProps {
  filters: VocabularyQueryFilters;
  topics: VocabularyTopic[];
  totalCount?: number;
  onFilterChange: (filters: VocabularyQueryFilters) => void;
  className?: string;
}

export const VocabularyFilters: React.FC<VocabularyFiltersProps> = ({
  filters,
  topics,
  totalCount,
  onFilterChange,
  className = '',
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      search: e.target.value,
      page: 1,
    });
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      topicId: e.target.value || undefined,
      page: 1,
    });
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      difficulty: (e.target.value as Difficulty) || '',
      page: 1,
    });
  };

  const handlePosChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      partOfSpeech: e.target.value || undefined,
      page: 1,
    });
  };

  const handleResetFilters = () => {
    onFilterChange({
      page: 1,
      limit: 20,
      search: '',
      topicId: '',
      difficulty: '',
      partOfSpeech: '',
    });
  };

  const hasActiveFilters = Boolean(
    filters.search || filters.topicId || filters.difficulty || filters.partOfSpeech
  );

  return (
    <div
      className={`rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5 ${className}`}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
        {/* Search Input */}
        <div className="relative lg:col-span-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="vocab-search-input"
            type="text"
            value={filters.search || ''}
            onChange={handleSearchChange}
            placeholder="Search words, meanings..."
            className="h-10 w-full rounded-xl border border-input bg-background/50 pl-10 pr-9 text-sm text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, search: '', page: 1 })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Topic Filter */}
        <div className="lg:col-span-3">
          <select
            id="vocab-topic-filter"
            value={filters.topicId || ''}
            onChange={handleTopicChange}
            className="h-10 w-full rounded-xl border border-input bg-background/50 px-3 text-sm text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Topics ({topics.length})</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.vocabularyCount})
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className="lg:col-span-2">
          <select
            id="vocab-difficulty-filter"
            value={filters.difficulty || ''}
            onChange={handleDifficultyChange}
            className="h-10 w-full rounded-xl border border-input bg-background/50 px-3 text-sm text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        {/* Part-of-Speech Filter */}
        <div className="lg:col-span-2">
          <select
            id="vocab-pos-filter"
            value={filters.partOfSpeech || ''}
            onChange={handlePosChange}
            className="h-10 w-full rounded-xl border border-input bg-background/50 px-3 text-sm text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Parts of Speech</option>
            <option value="noun">Noun</option>
            <option value="verb">Verb</option>
            <option value="adjective">Adjective</option>
            <option value="phrasal verb">Phrasal Verb</option>
          </select>
        </div>

        {/* Reset / Actions */}
        <div className="flex items-center justify-end gap-2 lg:col-span-1">
          {hasActiveFilters && (
            <button
              id="vocab-reset-filters-button"
              type="button"
              onClick={handleResetFilters}
              title="Reset all filters"
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-input bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:w-10 lg:px-0"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="lg:hidden">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Stats Bar */}
      <div className="mt-3 flex flex-wrap items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-primary" />
          <span>
            Showing{' '}
            <strong className="font-semibold text-foreground">
              {totalCount !== undefined ? totalCount : '...'}
            </strong>{' '}
            vocabulary {totalCount === 1 ? 'word' : 'words'}
          </span>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5">
            {filters.search && (
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                &ldquo;{filters.search}&rdquo;
              </span>
            )}
            {filters.topicId && (
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                Topic:{' '}
                {topics.find((t) => t.id === filters.topicId)?.title || 'Selected'}
              </span>
            )}
            {filters.difficulty && (
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {filters.difficulty}
              </span>
            )}
            {filters.partOfSpeech && (
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {filters.partOfSpeech}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

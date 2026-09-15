import React from 'react';
import { Link } from 'react-router-dom';
import { ContinueLearningItem } from '../../types/dashboard';
import { BookOpen, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';

interface ContinueLearningProps {
  items: ContinueLearningItem[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export const ContinueLearning: React.FC<ContinueLearningProps> = ({
  items,
  isLoading,
  isError,
  onRetry,
}) => {
  return (
    <section
      aria-labelledby="continue-learning-heading"
      id="continue-learning-section"
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2
          id="continue-learning-heading"
          className="text-lg font-bold tracking-tight text-foreground"
        >
          Continue Learning
        </h2>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="flex animate-pulse items-center justify-between rounded-2xl border bg-card p-4 shadow-sm"
            >
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-20 rounded bg-muted" />
                <div className="h-5 w-44 rounded bg-muted" />
                <div className="h-2 w-32 rounded bg-muted" />
              </div>
              <div className="h-8 w-20 rounded-xl bg-muted" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div
          id="continue-learning-error-state"
          role="alert"
          className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
            <p className="text-sm font-medium text-destructive">
              Unable to load your learning data.
            </p>
          </div>
          <button
            id="retry-continue-learning-button"
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div
          id="continue-learning-empty-state"
          className="rounded-2xl border border-dashed bg-card/60 p-8 text-center shadow-sm"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <BookOpen className="h-6 w-6" />
          </div>
          <p
            id="continue-learning-empty-message"
            className="mt-3 text-sm font-semibold text-foreground"
          >
            You haven't started any lessons yet.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Pick a skill below or dive into vocabulary to get started.
          </p>
          <Link
            to="/vocabulary"
            id="start-learning-button"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            Start Learning
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        /* Continue Items List */
        <div className="space-y-3">
          {items.slice(0, 3).map((item, idx) => {
            const hasStarted = item.progress > 0;
            return (
              <div
                key={item.id || idx}
                id={`continue-learning-item-${idx}`}
                className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {item.category}
                  </span>
                  <h3 className="truncate text-base font-bold text-foreground">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {hasStarted ? `Progress: ${item.progress}%` : 'Not started'}
                    </span>
                    {hasStarted && (
                      <div
                        className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary"
                        role="progressbar"
                        aria-valuenow={item.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${item.title} progress`}
                      >
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  to={item.path}
                  id={`continue-action-${idx}`}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-input bg-background px-4 py-2 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {hasStarted ? 'Continue' : 'Start'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

import React from 'react';
import { DailyGoal } from '../../types/dashboard';
import { Flame, Clock, RefreshCw, AlertCircle } from 'lucide-react';

interface DailyGoalCardProps {
  goal: DailyGoal | null | undefined;
  streakDays: number;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export const DailyGoalCard: React.FC<DailyGoalCardProps> = ({
  goal,
  streakDays,
  isLoading,
  isError,
  onRetry,
}) => {
  if (isLoading) {
    return (
      <div
        aria-label="Today's goal loading"
        className="rounded-2xl border bg-card p-6 shadow-sm"
      >
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between">
            <div className="h-5 w-28 rounded bg-muted" />
            <div className="h-5 w-24 rounded bg-muted" />
          </div>
          <div className="h-8 w-36 rounded bg-muted" />
          <div className="h-3 w-full rounded-full bg-muted" />
          <div className="h-5 w-24 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        id="daily-goal-error-state"
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
          id="retry-daily-goal-button"
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const targetMinutes = goal?.targetMinutes || 15;
  const actualMinutes = goal?.actualMinutes || 0;
  const progressPercentage = Math.min(
    100,
    Math.round((actualMinutes / targetMinutes) * 100)
  );

  return (
    <section
      aria-labelledby="daily-goal-heading"
      id="daily-goal-card"
      className="rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h2
            id="daily-goal-heading"
            className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Today's Goal
          </h2>
        </div>

        {/* Streak Indicator */}
        <div
          id="daily-streak-badge"
          className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400"
        >
          <Flame className="h-4 w-4 text-amber-500" />
          <span>{streakDays} day streak</span>
        </div>
      </div>

      {/* Progress Numbers */}
      <div className="mt-4 flex items-baseline justify-between">
        <div className="flex items-baseline gap-1.5">
          <span
            id="actual-minutes-value"
            className="text-3xl font-extrabold text-foreground"
          >
            {actualMinutes}
          </span>
          <span className="text-xl font-medium text-muted-foreground">/</span>
          <span
            id="target-minutes-value"
            className="text-xl font-bold text-muted-foreground"
          >
            {targetMinutes}
          </span>
          <span className="ml-1 text-sm font-medium text-muted-foreground">minutes</span>
        </div>

        <span id="daily-goal-percentage" className="text-sm font-bold text-foreground">
          {progressPercentage}%
        </span>
      </div>

      {/* Accessible Progress Bar */}
      <div
        className="mt-3 h-3 w-full overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-valuenow={progressPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Today's learning progress"
      >
        <div
          id="daily-goal-progress-bar"
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {progressPercentage >= 100 && (
        <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          🎉 Goal achieved for today! Great job!
        </p>
      )}
    </section>
  );
};

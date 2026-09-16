import React from 'react';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface FlashcardProgressBarProps {
  currentIndex: number;
  totalCount: number;
  learnedCount: number;
  difficultCount: number;
  reviewsCount: number;
  className?: string;
}

export const FlashcardProgressBar: React.FC<FlashcardProgressBarProps> = ({
  currentIndex,
  totalCount,
  learnedCount,
  difficultCount,
  reviewsCount,
  className = '',
}) => {
  const currentCardNumber = totalCount > 0 ? currentIndex + 1 : 0;
  const percentage =
    totalCount > 0
      ? Math.min(100, Math.round(((currentIndex + 1) / totalCount) * 100))
      : 0;

  return (
    <div className={`mx-auto w-full max-w-xl space-y-2.5 ${className}`}>
      {/* Top Tracker Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span
            id="flashcard-counter"
            className="rounded-lg bg-card px-2.5 py-1 font-semibold text-foreground shadow-sm border"
          >
            Card {currentCardNumber} / {totalCount}
          </span>
          <span className="text-muted-foreground font-medium">
            {percentage}% completed
          </span>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2">
          <span
            id="flashcard-learned-count"
            className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-semibold text-emerald-700 dark:text-emerald-300"
            title="Learned words in this session"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>{learnedCount} learned</span>
          </span>

          <span
            id="flashcard-difficult-count"
            className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 font-semibold text-amber-700 dark:text-amber-300"
            title="Words needing review"
          >
            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
            <span>{difficultCount} difficult</span>
          </span>

          <span
            id="flashcard-reviews-count"
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 font-medium text-muted-foreground"
            title="Total reviews submitted"
          >
            <RefreshCw className="h-3 w-3" />
            <span>{reviewsCount} reviews</span>
          </span>
        </div>
      </div>

      {/* Accessible Progress Bar */}
      <div
        id="flashcard-progress-bar"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Flashcard session progress"
        className="relative h-2 w-full overflow-hidden rounded-full bg-secondary"
      >
        <div
          className="h-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, RotateCcw } from 'lucide-react';
import { VocabularyItem } from '../../types/vocabulary';

interface FlashcardSessionSummaryProps {
  items: VocabularyItem[];
  learnedIds: string[];
  difficultIds: string[];
  reviewsCount: number;
  onRestart: () => void;
  onPracticeDifficult: () => void;
  className?: string;
}

export const FlashcardSessionSummary: React.FC<FlashcardSessionSummaryProps> = ({
  items,
  learnedIds,
  difficultIds,
  reviewsCount,
  onRestart,
  onPracticeDifficult,
  className = '',
}) => {
  const total = items.length;
  const learnedCount = learnedIds.length;
  const difficultCount = difficultIds.length;
  const masteryRate = total > 0 ? Math.round((learnedCount / total) * 100) : 0;

  const difficultWords = items.filter((item) => difficultIds.includes(item.id));

  return (
    <div
      id="flashcard-session-summary"
      className={`mx-auto w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-8 ${className}`}
    >
      <div className="flex flex-col items-center text-center">
        {/* Celebration Badge */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
          <Trophy className="h-8 w-8 animate-bounce" />
        </div>

        <h2
          id="summary-heading"
          className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl"
        >
          Session Complete!
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Great job practicing your English vocabulary today.
        </p>

        {/* Metric Cards Grid */}
        <div className="mt-6 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border bg-muted/30 p-3.5 text-center">
            <span className="text-xs font-medium text-muted-foreground">Words</span>
            <p className="mt-1 text-2xl font-bold text-foreground">{total}</p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-center">
            <div className="flex items-center justify-center gap-1 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="h-3 w-3" />
              <span>Learned</span>
            </div>
            <p
              id="summary-learned-count"
              className="mt-1 text-2xl font-bold text-emerald-600"
            >
              {learnedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-center">
            <div className="flex items-center justify-center gap-1 text-xs font-medium text-amber-600">
              <AlertCircle className="h-3 w-3" />
              <span>Difficult</span>
            </div>
            <p
              id="summary-difficult-count"
              className="mt-1 text-2xl font-bold text-amber-600"
            >
              {difficultCount}
            </p>
          </div>

          <div className="rounded-2xl border bg-muted/30 p-3.5 text-center">
            <div className="flex items-center justify-center gap-1 text-xs font-medium text-muted-foreground">
              <RefreshCw className="h-3 w-3" />
              <span>Reviews</span>
            </div>
            <p
              id="summary-reviews-count"
              className="mt-1 text-2xl font-bold text-foreground"
            >
              {reviewsCount}
            </p>
          </div>
        </div>

        {/* Mastery Score Progress */}
        <div className="mt-6 w-full rounded-2xl border border-border/80 bg-background/50 p-4">
          <div className="flex items-center justify-between text-xs font-medium">
            <span>Session Mastery Score</span>
            <span className="font-bold text-primary">{masteryRate}%</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500"
              style={{ width: `${masteryRate}%` }}
            />
          </div>
        </div>

        {/* Difficult Words List */}
        {difficultWords.length > 0 && (
          <div className="mt-6 w-full text-left">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Words Needing Review ({difficultWords.length})
            </h3>
            <div className="mt-2 divide-y rounded-xl border bg-card/60">
              {difficultWords.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{item.word}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.meaningVi}
                    </span>
                  </div>
                  <Link
                    to={`/vocabulary/${item.id}`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View details &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Session Action Buttons */}
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
          {difficultCount > 0 && (
            <button
              id="summary-practice-difficult-btn"
              type="button"
              onClick={onPracticeDifficult}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 text-sm font-semibold text-white shadow-md transition-all hover:bg-amber-700 active:scale-95"
            >
              <AlertCircle className="h-4 w-4" />
              Practice Difficult Words
            </button>
          )}

          <button
            id="summary-restart-btn"
            type="button"
            onClick={onRestart}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-input bg-card px-4 text-sm font-semibold text-foreground transition-all hover:bg-accent active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            Restart Session
          </button>

          <Link
            to="/vocabulary"
            id="summary-back-to-list-btn"
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Vocabulary List
          </Link>
        </div>
      </div>
    </div>
  );
};

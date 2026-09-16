import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Flag,
} from 'lucide-react';

interface FlashcardControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  onFlip: () => void;
  onKnowThis: () => void;
  onNeedReview: () => void;
  onFinishSession: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  isProcessing?: boolean;
  className?: string;
}

export const FlashcardControls: React.FC<FlashcardControlsProps> = ({
  onPrevious,
  onNext,
  onFlip,
  onKnowThis,
  onNeedReview,
  onFinishSession,
  hasPrevious,
  hasNext,
  isProcessing = false,
  className = '',
}) => {
  return (
    <div className={`mx-auto flex w-full max-w-xl flex-col gap-4 ${className}`}>
      {/* Primary Study Actions: Need Review vs I Know This */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <button
          id="flashcard-need-review-button"
          type="button"
          onClick={onNeedReview}
          disabled={isProcessing}
          className="group inline-flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-amber-500/30 bg-amber-500/10 px-4 font-semibold text-amber-700 transition-all hover:border-amber-500 hover:bg-amber-500 hover:text-white active:scale-95 disabled:opacity-50 dark:text-amber-400 dark:hover:text-white"
        >
          <AlertCircle className="h-5 w-5 transition-transform group-hover:rotate-12" />
          <span>Need Review</span>
        </button>

        <button
          id="flashcard-know-button"
          type="button"
          onClick={onKnowThis}
          disabled={isProcessing}
          className="group inline-flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/10 px-4 font-semibold text-emerald-700 transition-all hover:border-emerald-500 hover:bg-emerald-500 hover:text-white active:scale-95 disabled:opacity-50 dark:text-emerald-400 dark:hover:text-white"
        >
          <CheckCircle2 className="h-5 w-5 transition-transform group-hover:scale-110" />
          <span>I Know This</span>
        </button>
      </div>

      {/* Secondary Controls: Navigation, Flip, Finish */}
      <div className="flex items-center justify-between gap-2 rounded-2xl border border-border/80 bg-card/60 p-2 backdrop-blur-sm">
        <button
          id="flashcard-prev-button"
          type="button"
          onClick={onPrevious}
          disabled={!hasPrevious || isProcessing}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Prev</span>
        </button>

        <button
          id="flashcard-flip-button"
          type="button"
          onClick={onFlip}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-input bg-background px-4 text-xs font-semibold text-foreground shadow-sm transition-all hover:bg-accent active:scale-95"
        >
          <RotateCw className="h-3.5 w-3.5" />
          <span>Flip</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            id="flashcard-finish-button"
            type="button"
            onClick={onFinishSession}
            title="Finish and see results"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-secondary/50 px-3 text-xs font-semibold text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
          >
            <Flag className="h-3.5 w-3.5" />
            <span>Finish</span>
          </button>

          <button
            id="flashcard-next-button"
            type="button"
            onClick={onNext}
            disabled={!hasNext || isProcessing}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

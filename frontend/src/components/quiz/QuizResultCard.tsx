import React from 'react';
import { QuizResultData } from '../../types/quiz';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Sparkles,
  Award,
} from 'lucide-react';

interface Props {
  result: QuizResultData;
  onRetry: () => void;
  onReview: () => void;
  onBack?: () => void;
}

export const QuizResultCard: React.FC<Props> = ({
  result,
  onRetry,
  onReview,
  onBack,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border bg-card p-6 shadow-xl sm:p-8">
      {/* Header Banner */}
      <div className="text-center">
        <div
          className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl shadow-lg transition-transform ${
            result.passed
              ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-emerald-500/25 animate-bounce'
              : 'bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-amber-500/25'
          }`}
        >
          {result.passed ? (
            <Trophy className="h-10 w-10" />
          ) : (
            <Award className="h-10 w-10" />
          )}
        </div>

        <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {result.passed ? 'Outstanding Work!' : 'Good Effort! Keep Practicing'}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {result.passed
            ? 'You have successfully passed the assessment and met the target score.'
            : `You achieved ${result.percentage}%. The passing threshold is ${result.passingScore}%.`}
        </p>

        {result.xpAwarded && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
            <Sparkles className="h-3.5 w-3.5" /> +{result.xpAwarded} XP Earned
          </div>
        )}
      </div>

      {/* Main Score Metrics */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Score */}
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-background/60 p-4 text-center">
          <span className="text-xs font-medium text-muted-foreground">Score</span>
          <span className="mt-1 text-2xl font-extrabold text-foreground">
            {result.score}/{result.maxScore}
          </span>
          <span className="text-[11px] font-semibold text-primary">
            {result.percentage}%
          </span>
        </div>

        {/* Correct Answers */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-medium">Correct</span>
          </div>
          <span className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {result.correctCount}
          </span>
          <span className="text-[11px] text-muted-foreground">questions</span>
        </div>

        {/* Incorrect Answers */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-center">
          <div className="flex items-center gap-1 text-destructive">
            <XCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Incorrect</span>
          </div>
          <span className="mt-1 text-2xl font-extrabold text-destructive">
            {result.incorrectCount}
          </span>
          <span className="text-[11px] text-muted-foreground">questions</span>
        </div>

        {/* Time Spent */}
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-background/60 p-4 text-center">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">Time</span>
          </div>
          <span className="mt-1 text-2xl font-extrabold text-foreground">
            {formatTime(result.timeSpentSeconds)}
          </span>
          <span className="text-[11px] text-muted-foreground">elapsed</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onReview}
          id="quiz-review-answers-button"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-input bg-background py-3.5 text-sm font-semibold text-foreground shadow-xs transition-all hover:bg-accent hover:text-accent-foreground"
        >
          <BookOpen className="h-4 w-4" />
          Review Answers
        </button>

        <button
          type="button"
          onClick={onRetry}
          id="quiz-retry-button"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 py-3.5 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
        >
          <RotateCcw className="h-4 w-4" />
          Retry Quiz
        </button>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            id="quiz-continue-button"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90"
          >
            <span>Continue</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

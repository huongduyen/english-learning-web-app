import React from 'react';
import { Link } from 'react-router-dom';
import { ReadingArticleListItem } from '../../types/reading';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

interface ReadingArticleCardProps {
  article: ReadingArticleListItem;
}

const DIFFICULTY_STYLES: Record<string, { label: string; className: string }> = {
  EASY: {
    label: 'Easy',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  MEDIUM: {
    label: 'Medium',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  HARD: {
    label: 'Hard',
    className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },
};

export const ReadingArticleCard: React.FC<ReadingArticleCardProps> = ({ article }) => {
  const diff = DIFFICULTY_STYLES[article.difficulty] || DIFFICULTY_STYLES.EASY;
  const questionCount = article.quiz?.questionCount ?? 0;
  const readingMins = article.estimatedReadingTime || article.readingTime || 5;

  return (
    <div
      id={`reading-article-card-${article.id}`}
      className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div>
        {/* Badges: Difficulty, Level, Topic & Completion */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${diff.className}`}
            >
              {diff.label}
            </span>
            <span className="rounded-lg border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {article.level}
            </span>
            <span className="rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
              {article.topic}
            </span>
          </div>

          {article.isCompleted && (
            <div
              id={`reading-completed-badge-${article.id}`}
              className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Completed</span>
              {article.lastScore !== null && (
                <span className="ml-0.5 opacity-90">({article.lastScore}%)</span>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <h3
          id={`reading-title-${article.id}`}
          className="mt-3.5 text-base font-bold text-foreground transition-colors group-hover:text-primary sm:text-lg"
        >
          {article.title}
        </h3>
        {article.titleVi && (
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">
            {article.titleVi}
          </p>
        )}

        {/* Short description / summary */}
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {article.summary || article.description || 'Improve reading comprehension with engaging topics.'}
        </p>
      </div>

      {/* Meta details and action button */}
      <div className="mt-5 border-t border-border/60 pt-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {readingMins} min read
            </span>
            {questionCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5" />
                {questionCount} questions
              </span>
            )}
          </div>

          <Link
            to={`/reading/${article.id}`}
            id={`reading-card-btn-${article.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {article.isCompleted ? (
              <>
                Continue
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                <BookOpen className="h-3.5 w-3.5" />
                Read
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { GrammarLessonListItem } from '../../types/grammar';
import {
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface Props {
  lesson: GrammarLessonListItem;
}

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  ELEMENTARY: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  INTERMEDIATE: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  UPPER_INTERMEDIATE: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  ADVANCED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  PROFICIENT: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
};

export const GrammarCard: React.FC<Props> = ({ lesson }) => {
  const levelBadgeClass =
    LEVEL_COLORS[lesson.level] || 'bg-muted text-muted-foreground border-border';

  return (
    <div className="group flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-xs transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
            {lesson.category}
          </span>
          <span
            className={`rounded-lg border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${levelBadgeClass}`}
          >
            {lesson.level}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-4 text-base font-bold text-foreground transition-colors group-hover:text-primary sm:text-lg">
          {lesson.title}
        </h3>
        <p className="mt-0.5 text-xs font-medium text-muted-foreground">
          {lesson.titleVi}
        </p>

        {/* Summary */}
        {lesson.summary && (
          <p className="mt-3 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {lesson.summary}
          </p>
        )}
      </div>

      {/* Footer Info & Action Button */}
      <div className="mt-6 border-t border-border/60 pt-4">
        <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            <span>{lesson.exerciseCount} Exercises</span>
          </div>
          {lesson.quiz && (
            <div className="flex items-center gap-1 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="font-semibold">Quiz Available</span>
            </div>
          )}
        </div>

        <Link
          to={`/grammar/${lesson.slug}`}
          id={`lesson-link-${lesson.slug}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 py-2.5 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
        >
          <span>Start Lesson</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
};

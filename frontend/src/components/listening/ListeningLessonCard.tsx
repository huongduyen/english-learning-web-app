import React from 'react';
import { Link } from 'react-router-dom';
import { ListeningLessonListItem } from '../../types/listening';
import {
  Clock,
  Headphones,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

interface ListeningLessonCardProps {
  lesson: ListeningLessonListItem;
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

export const ListeningLessonCard: React.FC<ListeningLessonCardProps> = ({ lesson }) => {
  const diff = DIFFICULTY_STYLES[lesson.difficulty] || DIFFICULTY_STYLES.EASY;

  // Format seconds to mm:ss
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '2 mins';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const questionCount = lesson.quiz?.questionCount ?? 0;

  return (
    <div
      id={`listening-lesson-card-${lesson.id}`}
      className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div>
        {/* Top Badges: Difficulty, Level, Topic & Completion */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${diff.className}`}
            >
              {diff.label}
            </span>
            <span className="rounded-lg border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {lesson.level}
            </span>
            <span className="rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
              {lesson.topic}
            </span>
          </div>

          {lesson.isCompleted && (
            <div
              id={`listening-completed-badge-${lesson.id}`}
              className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Completed</span>
              {lesson.lastScore !== null && (
                <span className="ml-0.5 opacity-90">({lesson.lastScore}%)</span>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <h3
          id={`listening-title-${lesson.id}`}
          className="mt-3.5 text-base font-bold text-foreground transition-colors group-hover:text-primary sm:text-lg"
        >
          {lesson.title}
        </h3>
        {lesson.titleVi && (
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">
            {lesson.titleVi}
          </p>
        )}

        {/* Description */}
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {lesson.description || 'Practice active listening comprehension with authentic dialogue.'}
        </p>
      </div>

      {/* Meta details and action button */}
      <div className="mt-5 border-t border-border/60 pt-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(lesson.duration)}
            </span>
            {questionCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5" />
                {questionCount} questions
              </span>
            )}
          </div>

          <Link
            to={`/listening/${lesson.id}`}
            id={`listening-card-btn-${lesson.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {lesson.isCompleted ? (
              <>
                Continue
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                <Headphones className="h-3.5 w-3.5" />
                Start
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

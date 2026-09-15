import React from 'react';
import { Link } from 'react-router-dom';
import { LearningActivity } from '../../types/dashboard';
import { CheckCircle2, RefreshCw, AlertCircle, ArrowRight, History } from 'lucide-react';

interface RecentActivityProps {
  activities: LearningActivity[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

const formatActivityText = (activity: LearningActivity): string => {
  if (activity.metadata && typeof activity.metadata === 'object') {
    if (activity.metadata.description) {
      return String(activity.metadata.description);
    }
    if (activity.metadata.wordsReviewed) {
      return `Learned ${activity.metadata.wordsReviewed} vocabulary words`;
    }
  }

  switch (activity.type) {
    case 'VOCABULARY':
      return 'Learned vocabulary words';
    case 'GRAMMAR':
      return 'Completed a grammar exercise';
    case 'LISTENING':
      return 'Finished a listening lesson';
    case 'READING':
      return 'Completed a reading exercise';
    case 'QUIZ':
      return activity.score
        ? `Completed a quiz (Score: ${Math.round(activity.score)}%)`
        : 'Completed a quiz';
    case 'CONVERSATION':
    case 'SPEAKING':
      return 'Completed speaking practice';
    default:
      return 'Completed learning activity';
  }
};

const formatRelativeTime = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  } catch {
    return '';
  }
};

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  isLoading,
  isError,
  onRetry,
}) => {
  return (
    <section
      aria-labelledby="recent-activity-heading"
      id="recent-activity-section"
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2
          id="recent-activity-heading"
          className="text-lg font-bold tracking-tight text-foreground"
        >
          Recent Activity
        </h2>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="flex animate-pulse items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm"
            >
              <div className="h-5 w-5 rounded-full bg-muted" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-48 rounded bg-muted" />
                <div className="h-3 w-16 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div
          id="recent-activity-error-state"
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
            id="retry-recent-activity-button"
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      ) : activities.length === 0 ? (
        /* Empty State */
        <div
          id="recent-activity-empty-state"
          className="rounded-2xl border border-dashed bg-card/60 p-8 text-center shadow-sm"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <History className="h-6 w-6" />
          </div>
          <p
            id="recent-activity-empty-message"
            className="mt-3 text-sm font-semibold text-foreground"
          >
            No learning activity yet.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Start your first lesson to see your progress here.
          </p>
          <Link
            to="/vocabulary"
            id="activity-start-learning-button"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            Start Learning
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        /* Activity List */
        <ul className="space-y-2.5" role="list">
          {activities.slice(0, 5).map((activity, idx) => (
            <li
              key={activity.id || idx}
              id={`recent-activity-item-${idx}`}
              className="flex items-center justify-between rounded-2xl border bg-card p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {formatActivityText(activity)}
                </span>
              </div>

              {activity.createdAt && (
                <span className="ml-3 shrink-0 text-xs text-muted-foreground">
                  {formatRelativeTime(activity.createdAt)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

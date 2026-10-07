import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { progressApi } from '../../services/progressApi';
import { ActivityType } from '../../types/dashboard';
import { LearningActivityItem } from '../../types/progress';
import {
  History,
  BookOpen,
  BookA,
  Headphones,
  BookMarked,
  Trophy,
  Mic,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const LearningHistoryTable: React.FC = () => {
  const [selectedType, setSelectedType] = useState<ActivityType | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['learning-activities', page, selectedType],
    queryFn: () =>
      progressApi.getActivities(
        page,
        limit,
        selectedType === 'ALL' ? undefined : selectedType
      ),
  });

  const activities = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'VOCABULARY':
        return { icon: BookOpen, color: 'text-indigo-600 bg-indigo-500/10' };
      case 'GRAMMAR':
        return { icon: BookA, color: 'text-amber-600 bg-amber-500/10' };
      case 'LISTENING':
        return { icon: Headphones, color: 'text-blue-600 bg-blue-500/10' };
      case 'READING':
        return { icon: BookMarked, color: 'text-emerald-600 bg-emerald-500/10' };
      case 'QUIZ':
        return { icon: Trophy, color: 'text-purple-600 bg-purple-500/10' };
      case 'SPEAKING':
      case 'CONVERSATION':
        return { icon: Mic, color: 'text-pink-600 bg-pink-500/10' };
      default:
        return { icon: Clock, color: 'text-primary bg-primary/10' };
    }
  };

  const getActivityTitle = (act: LearningActivityItem): string => {
    const meta = act.metadata as Record<string, string | undefined> | null;
    if (meta?.quizTitle) return meta.quizTitle;
    if (meta?.lessonTitle) return meta.lessonTitle;
    if (meta?.articleTitle) return meta.articleTitle;
    if (meta?.word) return `Vocabulary word: "${meta.word}"`;
    if (meta?.action) return `Vocabulary ${meta.action}`;
    return `${act.type.charAt(0) + act.type.slice(1).toLowerCase()} Practice`;
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold sm:text-lg">Learning History</h2>
            <p className="text-xs text-muted-foreground">
              Detailed chronological log of study sessions, exercises, and quizzes
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1 hidden sm:inline" />
          {(['ALL', 'VOCABULARY', 'GRAMMAR', 'LISTENING', 'READING', 'QUIZ'] as const).map(
            (type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setSelectedType(type);
                  setPage(1);
                }}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                  selectedType === type
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-background/80 text-muted-foreground hover:bg-accent hover:text-foreground border border-border/60'
                }`}
              >
                {type === 'ALL'
                  ? 'All'
                  : type.charAt(0) + type.slice(1).toLowerCase()}
              </button>
            )
          )}
        </div>
      </div>

      {/* Table / List */}
      <div className="mt-5 divide-y divide-border/60">
        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Loading activity history...
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No activities recorded for this filter yet. Start studying to record your sessions!
          </div>
        ) : (
          activities.map((act) => {
            const { icon: Icon, color } = getActivityIcon(act.type);
            const title = getActivityTitle(act);
            const dateStr = new Date(act.createdAt).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={act.id}
                className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1 transition-colors hover:bg-accent/20 px-2 rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium uppercase text-[10px] tracking-wider">
                        {act.type}
                      </span>
                      <span>&middot;</span>
                      <span>{dateStr}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3 text-right">
                  {act.score !== null && act.score !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        act.score >= 80
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : act.score >= 50
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {Math.round(act.score)}%
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                    <Clock className="h-3 w-3" />
                    {act.durationMinutes}m
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 font-semibold hover:bg-accent disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </button>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 font-semibold hover:bg-accent disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Clock, BookOpen, CheckCircle2, Trophy, Flame, Award } from 'lucide-react';
import { ProgressOverview } from '../../types/progress';

interface ProgressOverviewCardsProps {
  overview: ProgressOverview;
}

export const ProgressOverviewCards: React.FC<ProgressOverviewCardsProps> = ({
  overview,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
      {/* 1. Total Learning Time */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-all hover:border-blue-500/30 hover:shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Clock className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Study Time
          </span>
        </div>
        <div className="mt-3">
          <p className="text-xl font-extrabold tracking-tight sm:text-2xl text-foreground">
            {overview.totalLearningTimeFormatted}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {overview.totalLearningTimeMinutes} total mins
          </p>
        </div>
      </div>

      {/* 2. Words Learned */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-all hover:border-indigo-500/30 hover:shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Words Learned
          </span>
        </div>
        <div className="mt-3">
          <p className="text-xl font-extrabold tracking-tight sm:text-2xl text-foreground">
            {overview.wordsLearned}
          </p>
          <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {overview.wordsMastered} mastered
          </p>
        </div>
      </div>

      {/* 3. Lessons Completed */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Lessons Done
          </span>
        </div>
        <div className="mt-3">
          <p className="text-xl font-extrabold tracking-tight sm:text-2xl text-foreground">
            {overview.lessonsCompleted}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            across all skills
          </p>
        </div>
      </div>

      {/* 4. Average Quiz Score */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-all hover:border-purple-500/30 hover:shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Trophy className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Avg Quiz Score
          </span>
        </div>
        <div className="mt-3">
          <p className="text-xl font-extrabold tracking-tight sm:text-2xl text-foreground">
            {overview.averageQuizScore}%
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            comprehension
          </p>
        </div>
      </div>

      {/* 5. Current Streak */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-card to-card p-4 shadow-sm transition-all hover:border-amber-500/40 hover:shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 shadow-xs">
            <Flame className="h-4 w-4 fill-amber-500" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Current Streak
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <p className="text-xl font-extrabold tracking-tight sm:text-2xl text-foreground">
              {overview.currentStreak}
            </p>
            <span className="text-xs font-semibold text-muted-foreground">days</span>
          </div>
          <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
            {overview.currentStreak > 0 ? 'Habit active 🔥' : 'Start streak today'}
          </p>
        </div>
      </div>

      {/* 6. Longest Streak */}
      <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 via-card to-card p-4 shadow-sm transition-all hover:border-orange-500/40 hover:shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-500 shadow-xs">
            <Award className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
            Longest Streak
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <p className="text-xl font-extrabold tracking-tight sm:text-2xl text-foreground">
              {overview.longestStreak}
            </p>
            <span className="text-xs font-semibold text-muted-foreground">days</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            personal record 🏆
          </p>
        </div>
      </div>
    </div>
  );
};

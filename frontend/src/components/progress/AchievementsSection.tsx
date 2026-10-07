import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  Flame,
  Zap,
  BookOpen,
  Headphones,
  Crown,
  Star,
  MessageSquare,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { AchievementItem } from '../../types/achievements';

interface AchievementsSectionProps {
  achievements: AchievementItem[];
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  achievements,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'in-progress'>('all');

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const earnedPoints = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);
  const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);

  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'in-progress') return !a.unlocked;
    return true;
  });

  const getAchievementIcon = (iconName: string | null) => {
    switch (iconName) {
      case 'sparkles':
        return Sparkles;
      case 'flame':
        return Flame;
      case 'zap':
        return Zap;
      case 'trophy':
        return Trophy;
      case 'crown':
        return Crown;
      case 'headphones':
        return Headphones;
      case 'book-open':
      case 'book-open-check':
        return BookOpen;
      case 'star':
        return Star;
      case 'message-square':
        return MessageSquare;
      default:
        return Award;
    }
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold sm:text-lg">Achievements & Badges</h2>
              <p className="text-xs text-muted-foreground">
                Automatic gamification milestones unlocked from your PostgreSQL study records
              </p>
            </div>
          </div>
        </div>

        {/* Stats summary & filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Award className="h-3.5 w-3.5" />
            {unlockedCount} / {totalCount} Unlocked ({earnedPoints} / {totalPoints} XP)
          </span>

          <div className="inline-flex rounded-xl border border-border bg-background p-1 text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unlocked')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                filter === 'unlocked'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Unlocked ({unlockedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('in-progress')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                filter === 'in-progress'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              In Progress ({totalCount - unlockedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Achievements */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAchievements.map((item) => {
          const Icon = getAchievementIcon(item.icon);
          const isUnlocked = item.unlocked;

          return (
            <div
              key={item.id}
              className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all ${
                isUnlocked
                  ? 'border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-card to-card shadow-sm hover:border-amber-500/60'
                  : 'border-border/70 bg-background/50 hover:border-border hover:bg-background/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-xs transition-transform ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white ring-2 ring-amber-400/30'
                          : 'bg-muted/70 text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground leading-tight">
                        {item.title}
                      </h3>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {item.titleVi}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase shrink-0 ${
                      isUnlocked
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    +{item.points} XP
                  </span>
                </div>

                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground/80 italic">
                  {item.descriptionVi}
                </p>
              </div>

              {/* Footer status / progress bar */}
              <div className="mt-4 pt-3 border-t border-border/50">
                {isUnlocked ? (
                  <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Unlocked
                    </span>
                    {item.unlockedAt && (
                      <span className="text-[10px] text-muted-foreground font-normal">
                        {new Date(item.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Lock className="h-3 w-3" />
                        Progress
                      </span>
                      <span className="font-bold text-foreground">
                        {item.progress}%
                      </span>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuenow={item.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${item.title} progress`}
                      className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/60"
                    >
                      <div
                        className="h-full rounded-full bg-primary/70 transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

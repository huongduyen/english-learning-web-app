import React from 'react';
import { Difficulty } from '../../types/vocabulary';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  difficulty,
  className = '',
}) => {
  const config = {
    EASY: {
      label: 'Easy',
      classes:
        'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300',
    },
    MEDIUM: {
      label: 'Medium',
      classes:
        'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300',
    },
    HARD: {
      label: 'Hard',
      classes:
        'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300',
    },
  }[difficulty] || {
    label: difficulty,
    classes: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${config.classes} ${className}`}
    >
      {config.label}
    </span>
  );
};

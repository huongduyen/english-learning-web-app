import React from 'react';

interface PartOfSpeechBadgeProps {
  partOfSpeech?: string | null;
  className?: string;
  id?: string;
}

export const PartOfSpeechBadge: React.FC<PartOfSpeechBadgeProps> = ({
  partOfSpeech,
  className = '',
  id,
}) => {
  if (!partOfSpeech) return null;

  const posLower = partOfSpeech.toLowerCase();

  let colorClass =
    'bg-indigo-500/10 text-indigo-700 border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-300';

  if (posLower.includes('verb')) {
    colorClass =
      'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-300';
  } else if (posLower.includes('adj')) {
    colorClass =
      'bg-purple-500/10 text-purple-700 border-purple-500/20 dark:bg-purple-500/15 dark:text-purple-300';
  } else if (posLower.includes('adv')) {
    colorClass =
      'bg-teal-500/10 text-teal-700 border-teal-500/20 dark:bg-teal-500/15 dark:text-teal-300';
  } else if (posLower.includes('noun')) {
    colorClass =
      'bg-sky-500/10 text-sky-700 border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-300';
  }

  return (
    <span
      id={id}
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium italic ${colorClass} ${className}`}
    >
      {partOfSpeech}
    </span>
  );
};

import React from 'react';
import { GrammarCategory } from '../../types/grammar';
import {
  BookOpen,
  Clock,
  Sparkles,
  FileText,
  Compass,
  GitFork,
  Repeat,
  MessageSquareQuote,
  LayoutGrid,
} from 'lucide-react';

interface Props {
  categories: GrammarCategory[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  BookOpen,
  Clock,
  Sparkles,
  FileText,
  Compass,
  GitFork,
  Repeat,
  MessageSquareQuote,
};

export const GrammarCategoryFilter: React.FC<Props> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const totalLessons = categories.reduce((sum, c) => sum + c.lessonCount, 0);

  return (
    <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        type="button"
        onClick={() => onSelectCategory('')}
        className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
          selectedCategory === ''
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        <span>All Categories</span>
        <span
          className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
            selectedCategory === ''
              ? 'bg-primary-foreground/20 text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {totalLessons}
        </span>
      </button>

      {categories.map((cat) => {
        const IconComponent = ICON_MAP[cat.icon] || BookOpen;
        const isSelected =
          selectedCategory.toLowerCase() === cat.name.toLowerCase();

        return (
          <button
            key={cat.slug}
            type="button"
            onClick={() => onSelectCategory(isSelected ? '' : cat.name)}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
              isSelected
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <IconComponent className="h-3.5 w-3.5" />
            <span>{cat.name}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                isSelected
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {cat.lessonCount}
            </span>
          </button>
        );
      })}
    </div>
  );
};

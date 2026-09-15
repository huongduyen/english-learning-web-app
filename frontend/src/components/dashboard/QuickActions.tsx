import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, BookA, Headphones, BookMarked, ArrowRight } from 'lucide-react';

interface QuickActionItem {
  id: string;
  name: string;
  to: string;
  description: string;
  icon: React.ReactNode;
}

const ACTIONS: QuickActionItem[] = [
  {
    id: 'quick-action-vocabulary',
    name: 'Vocabulary',
    to: '/vocabulary',
    description: 'Flashcards & topics',
    icon: <BookOpen className="h-5 w-5 text-blue-500" />,
  },
  {
    id: 'quick-action-grammar',
    name: 'Grammar',
    to: '/grammar',
    description: 'Rules & exercises',
    icon: <BookA className="h-5 w-5 text-emerald-500" />,
  },
  {
    id: 'quick-action-listening',
    name: 'Listening',
    to: '/listening',
    description: 'Audio lessons & quizzes',
    icon: <Headphones className="h-5 w-5 text-purple-500" />,
  },
  {
    id: 'quick-action-reading',
    name: 'Reading',
    to: '/reading',
    description: 'Articles & stories',
    icon: <BookMarked className="h-5 w-5 text-amber-500" />,
  },
];

export const QuickActions: React.FC = () => {
  return (
    <section aria-labelledby="quick-actions-heading" id="quick-actions-section">
      <h2
        id="quick-actions-heading"
        className="text-lg font-bold tracking-tight text-foreground"
      >
        Start Learning
      </h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Choose a skill to begin practicing today
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ACTIONS.map((action) => (
          <Link
            key={action.id}
            id={action.id}
            to={action.to}
            className="group flex flex-col justify-between rounded-2xl border bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:bg-accent/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-background p-2.5 shadow-sm ring-1 ring-border">
                {action.icon}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-bold text-foreground group-hover:text-primary">
                {action.name}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

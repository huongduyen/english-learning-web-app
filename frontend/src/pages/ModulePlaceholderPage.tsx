import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ArrowLeft, BookOpen, Clock } from 'lucide-react';

interface ModulePlaceholderPageProps {
  title: string;
  category: string;
  description: string;
}

export const ModulePlaceholderPage: React.FC<ModulePlaceholderPageProps> = ({
  title,
  category,
  description,
}) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="container mx-auto max-w-4xl flex-1 px-4 py-12 sm:px-6">
        <div className="mb-6">
          <Link
            to="/dashboard"
            id="back-to-dashboard-link"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
        </div>

        <div className="rounded-2xl border bg-card p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="h-7 w-7" />
          </div>

          <span className="mt-4 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            {category} Module
          </span>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            {description}
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border bg-background/50 px-3.5 py-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            Learning lessons for this module will be activated in subsequent phases.
          </div>

          <div className="mt-8">
            <Link
              to="/dashboard"
              id="placeholder-return-dashboard-button"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

import React from 'react';
import { User } from '../../types/auth';
import { User as UserIcon } from 'lucide-react';

interface WelcomeSectionProps {
  user: User | null;
  isLoading?: boolean;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  user,
  isLoading = false,
}) => {
  if (isLoading && !user) {
    return (
      <section
        aria-label="Welcome banner"
        className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8"
      >
        <div className="flex animate-pulse items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-7 w-48 rounded bg-muted" />
            <div className="h-4 w-72 rounded bg-muted" />
          </div>
        </div>
      </section>
    );
  }

  const displayName = user?.name || user?.email?.split('@')[0] || 'Learner';

  return (
    <section
      aria-label="Welcome banner"
      id="dashboard-welcome-section"
      className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={displayName}
              className="h-14 w-14 rounded-2xl object-cover ring-2 ring-primary/20"
            />
          ) : (
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-sm"
              aria-hidden="true"
            >
              {displayName[0]?.toUpperCase() || <UserIcon className="h-6 w-6" />}
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1
                id="dashboard-welcome-heading"
                className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              >
                Welcome back, {displayName}!
              </h1>
              {user?.level && (
                <span
                  id="user-level-badge"
                  className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase text-primary"
                >
                  {user.level}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep learning and improve your English every day.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

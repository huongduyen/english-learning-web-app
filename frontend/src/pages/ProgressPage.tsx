import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { progressApi } from '../services/progressApi';
import { achievementsApi } from '../services/achievementsApi';
import { Navbar } from '../components/Navbar';
import { ProgressOverviewCards } from '../components/progress/ProgressOverviewCards';
import { WeeklyActivityChart } from '../components/progress/WeeklyActivityChart';
import { SkillProgressCard } from '../components/progress/SkillProgressCard';
import { AchievementsSection } from '../components/progress/AchievementsSection';
import { LearningHistoryTable } from '../components/progress/LearningHistoryTable';
import {
  Clock,
  BookOpen,
  Trophy,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Award,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProgressPage: React.FC = () => {
  // 1. Fetch comprehensive progress data
  const {
    data: progress,
    isLoading: isProgressLoading,
    isRefetching,
    refetch: refetchProgress,
  } = useQuery({
    queryKey: ['learning-progress'],
    queryFn: () => progressApi.getProgress(),
  });

  // 2. Fetch achievements with user status
  const {
    data: achievements = [],
    refetch: refetchAchievements,
  } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => achievementsApi.getAchievements(),
  });

  const handleRefresh = async () => {
    await Promise.all([refetchProgress(), refetchAchievements()]);
  };

  if (isProgressLoading || !progress) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="container mx-auto max-w-6xl flex-1 px-4 py-12 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-semibold text-muted-foreground">
              Loading your real-time PostgreSQL learning progress...
            </p>
          </div>
        </main>
      </div>
    );
  }

  const { overview, skills, weeklyActivity, quizzes, vocabulary, dailyGoal, completedLessonsList, user } =
    progress;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="container mx-auto max-w-6xl flex-1 space-y-8 px-4 py-8 sm:px-6">
        {/* 1. Header Banner */}
        <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-primary/10 via-card to-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                  Level: {user.level}
                </span>
                <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                  {user.totalXp} XP
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground">
                Learning Progress & Achievements
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Live statistics, skill mastery, weekly activity, and automated badges powered by PostgreSQL.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefetching}
                id="refresh-progress-button"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground shadow-xs transition-colors hover:bg-accent disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
                {isRefetching ? 'Updating...' : 'Sync Live Data'}
              </button>

              <Link
                to="/dashboard"
                id="back-to-dashboard-button"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
              >
                Start Studying
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Key Metrics Overview (6 cards) */}
        <section aria-label="Key Progress Metrics">
          <ProgressOverviewCards overview={overview} />
        </section>

        {/* 3. Daily Learning Goal Card */}
        <section aria-label="Daily Goal Status">
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold sm:text-lg">Today's Learning Goal</h2>
                  <p className="text-xs text-muted-foreground">
                    Target: {dailyGoal.targetMinutes} minutes study and {dailyGoal.targetWords} new vocabulary words
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    dailyGoal.completed
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {dailyGoal.completed ? 'Goal Achieved (+25 XP) 🎉' : `${dailyGoal.percentage}% Complete`}
                </span>
              </div>
            </div>

            {/* Goal Progress Bars */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border/60 bg-background/50 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-blue-500" />
                    Study Duration
                  </span>
                  <span className="font-bold text-foreground">
                    {dailyGoal.actualMinutes} / {dailyGoal.targetMinutes} mins
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted/60">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (dailyGoal.actualMinutes / Math.max(1, dailyGoal.targetMinutes)) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-background/50 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                    Vocabulary Learned
                  </span>
                  <span className="font-bold text-foreground">
                    {dailyGoal.actualWords} / {dailyGoal.targetWords} words
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted/60">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (dailyGoal.actualWords / Math.max(1, dailyGoal.targetWords)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Weekly Activity Chart */}
        <section aria-label="Weekly Activity Chart">
          <WeeklyActivityChart days={weeklyActivity} targetGoalMinutes={dailyGoal.targetMinutes} />
        </section>

        {/* 5. In-Depth Quiz & Vocabulary Statistics Grid */}
        <section aria-label="Detailed Quiz and Vocabulary Statistics">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Quiz Statistics Card */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Trophy className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold">Quiz Performance</h2>
                  <p className="text-xs text-muted-foreground">Comprehension scores & pass rate</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Average Score
                  </span>
                  <p className="mt-1 text-2xl font-extrabold text-foreground">
                    {quizzes.averageScore}%
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Highest Score
                  </span>
                  <p className="mt-1 text-2xl font-extrabold text-foreground">
                    {quizzes.highestScore}%
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Pass Rate
                  </span>
                  <p className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {quizzes.passRate}%
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Passed / Total
                  </span>
                  <p className="mt-1 text-2xl font-extrabold text-foreground">
                    {quizzes.passedAttempts} / {quizzes.totalAttempts}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50">
                <Link
                  to="/quizzes"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80"
                >
                  Take a new quiz
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Vocabulary Statistics Card */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold">Vocabulary Retention</h2>
                  <p className="text-xs text-muted-foreground">Spaced repetition memory stages</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2.5 text-center">
                <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Learning
                  </span>
                  <p className="mt-1 text-xl font-extrabold text-blue-600 dark:text-blue-400">
                    {vocabulary.learning}
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Reviewing
                  </span>
                  <p className="mt-1 text-xl font-extrabold text-amber-600 dark:text-amber-400">
                    {vocabulary.reviewing}
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Mastered
                  </span>
                  <p className="mt-1 text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {vocabulary.mastered}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-border/60 bg-background/40 p-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Retention Rate (Mastered / Enrolled)</span>
                <span className="font-extrabold text-foreground">{vocabulary.retentionRate}%</span>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50">
                <Link
                  to="/vocabulary/flashcards"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80"
                >
                  Review flashcards
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Skill Progress (Vocabulary, Grammar, Listening, Reading, Speaking) */}
        <section aria-label="Skill Progress Breakdown">
          <SkillProgressCard skills={skills} />
        </section>

        {/* 7. Achievements & Badges (Automatic unlocking based on activity) */}
        <section aria-label="Achievements Showcase">
          <AchievementsSection achievements={achievements} />
        </section>

        {/* 8. Completed Lessons List */}
        <section aria-label="Completed Lessons Summary">
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold sm:text-lg">Completed Lessons ({completedLessonsList.length})</h2>
                <p className="text-xs text-muted-foreground">
                  Lessons, audio practices, and reading articles you have successfully finished
                </p>
              </div>
            </div>

            {completedLessonsList.length === 0 ? (
              <div className="mt-5 py-8 text-center text-sm text-muted-foreground">
                No lessons completed yet. Start your first lesson in Grammar, Listening, or Reading!
              </div>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {completedLessonsList.map((lesson) => (
                  <div
                    key={`${lesson.type}-${lesson.id}`}
                    className="flex flex-col justify-between rounded-xl border border-border/70 bg-background/50 p-3.5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`rounded px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                            lesson.type === 'GRAMMAR'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : lesson.type === 'LISTENING'
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {lesson.type}
                        </span>
                        {lesson.score !== undefined && (
                          <span className="text-xs font-bold text-foreground">
                            {Math.round(lesson.score)}%
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 text-sm font-semibold text-foreground line-clamp-1">
                        {lesson.title}
                      </h3>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                      <span>{new Date(lesson.completedAt).toLocaleDateString()}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 9. Learning History Table */}
        <section aria-label="Learning Activity History">
          <LearningHistoryTable />
        </section>
      </main>
    </div>
  );
};

export default ProgressPage;

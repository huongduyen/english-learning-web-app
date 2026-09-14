import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { Navbar } from '../components/Navbar';
import { profileUpdateSchema, ProfileUpdateFormValues } from '../lib/validations/auth';
import { apiClient } from '../lib/api-client';
import { User, EnglishLevel } from '../types/auth';
import {
  Flame,
  Clock,
  Award,
  RefreshCw,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';

const ENGLISH_LEVELS: EnglishLevel[] = [
  'BEGINNER',
  'ELEMENTARY',
  'INTERMEDIATE',
  'UPPER_INTERMEDIATE',
  'ADVANCED',
  'PROFICIENT',
];

export const DashboardPage: React.FC = () => {
  const { user, refreshSession, isRefreshing, logout, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Fetch current user details via TanStack Query from /users/me
  const { data: userProfile, isLoading: isProfileLoading } = useQuery<User>({
    queryKey: ['user-profile'],
    queryFn: () => apiClient.get<User>('/users/me'),
    initialData: user || undefined,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    values: {
      name: userProfile?.name || '',
      targetLevel: (userProfile?.profile?.targetLevel as EnglishLevel) || 'INTERMEDIATE',
      dailyGoalMinutes: userProfile?.profile?.dailyGoalMinutes || 15,
      nativeLanguage: userProfile?.profile?.nativeLanguage || 'vi',
    },
  });

  // Mutation for updating profile via PATCH /api/users/me
  const updateMutation = useMutation({
    mutationFn: (values: ProfileUpdateFormValues) =>
      apiClient.patch<User>('/users/me', values),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user-profile'], updatedUser);
      updateUser(updatedUser);
      setUpdateSuccess(true);
      reset({
        name: updatedUser.name || '',
        targetLevel: (updatedUser.profile?.targetLevel as EnglishLevel) || 'INTERMEDIATE',
        dailyGoalMinutes: updatedUser.profile?.dailyGoalMinutes || 15,
        nativeLanguage: updatedUser.profile?.nativeLanguage || 'vi',
      });
      setTimeout(() => setUpdateSuccess(false), 3500);
    },
  });

  const onUpdateProfile = (data: ProfileUpdateFormValues) => {
    setUpdateSuccess(false);
    updateMutation.mutate(data);
  };

  const handleManualRefresh = async () => {
    setRefreshMessage(null);
    const success = await refreshSession();
    if (success) {
      setRefreshMessage(
        `Session refreshed successfully at ${new Date().toLocaleTimeString()} (rotated access & refresh tokens).`
      );
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    } else {
      setRefreshMessage('Failed to refresh session. Please re-authenticate.');
    }
    setTimeout(() => setRefreshMessage(null), 5000);
  };

  const currentUser = userProfile || user;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="container mx-auto max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {/* Welcome Header */}
        <div className="rounded-2xl border bg-gradient-to-r from-primary/10 via-card to-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name || currentUser.email}
                  className="h-16 w-16 rounded-2xl object-cover ring-2 ring-primary/20"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-md">
                  {currentUser?.name ? (
                    currentUser.name[0].toUpperCase()
                  ) : (
                    <UserIcon className="h-8 w-8" />
                  )}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {currentUser?.name || currentUser?.email.split('@')[0]}
                  </h1>
                  <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-bold uppercase text-primary">
                    {currentUser?.level}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{currentUser?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Session Active (JWT)
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-400">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Streak
                </span>
                <p className="text-2xl font-extrabold">
                  {currentUser?.profile?.streakDays ?? 0}{' '}
                  <span className="text-sm font-normal text-muted-foreground">days</span>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-600 dark:text-blue-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Daily Goal
                </span>
                <p className="text-2xl font-extrabold">
                  {currentUser?.profile?.dailyGoalMinutes ?? 15}{' '}
                  <span className="text-sm font-normal text-muted-foreground">
                    mins/day
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/10 p-2.5 text-purple-600 dark:text-purple-400">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total XP
                </span>
                <p className="text-2xl font-extrabold">
                  {currentUser?.profile?.totalXp ?? 0}{' '}
                  <span className="text-sm font-normal text-muted-foreground">XP</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Settings & Session Refresh Section */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Edit Profile Form */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-bold">Learning Preferences</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Update your target level and study time (stored in PostgreSQL via PATCH
              /api/users/me)
            </p>

            {updateSuccess && (
              <div
                id="profile-update-success"
                className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Profile preferences updated successfully!
              </div>
            )}

            {updateMutation.isError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {updateMutation.error instanceof Error
                  ? updateMutation.error.message
                  : 'Failed to update profile'}
              </div>
            )}

            <form onSubmit={handleSubmit(onUpdateProfile)} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="profile-name-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Display Name
                </label>
                <input
                  id="profile-name-input"
                  type="text"
                  {...register('name')}
                  disabled={isProfileLoading}
                  className="mt-1.5 block w-full rounded-xl border border-input bg-background/50 px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="profile-target-level"
                    className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Target English Level
                  </label>
                  <select
                    id="profile-target-level"
                    {...register('targetLevel')}
                    disabled={isProfileLoading}
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {ENGLISH_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                  {errors.targetLevel && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.targetLevel.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="profile-daily-goal-minutes"
                    className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Daily Study Goal (Minutes)
                  </label>
                  <input
                    id="profile-daily-goal-minutes"
                    type="number"
                    min={5}
                    max={180}
                    {...register('dailyGoalMinutes')}
                    disabled={isProfileLoading}
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background/50 px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.dailyGoalMinutes && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.dailyGoalMinutes.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="save-profile-button"
                  type="submit"
                  disabled={updateMutation.isPending || !isDirty}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      Save Preferences
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Session Tools & Actions */}
          <div className="space-y-6">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="text-base font-bold">Authentication Session</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Verify JWT access token rotation using your secure refresh token.
              </p>

              {refreshMessage && (
                <div
                  id="refresh-session-status"
                  className="mt-4 rounded-xl border border-primary/20 bg-primary/10 p-3 text-xs font-medium text-primary"
                >
                  {refreshMessage}
                </div>
              )}

              <button
                id="refresh-session-button"
                type="button"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-input bg-background py-2 text-xs font-semibold transition-all hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                {isRefreshing ? 'Refreshing Token...' : 'Test Session Refresh'}
              </button>
            </div>

            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 shadow-sm">
              <h2 className="text-base font-bold text-destructive">Sign Out</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Revokes your refresh token on the NestJS backend and clears stored
                credentials.
              </p>

              <button
                id="dashboard-logout-button"
                type="button"
                onClick={logout}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-destructive py-2 text-xs font-semibold text-destructive-foreground shadow-sm transition-all hover:bg-destructive/90"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

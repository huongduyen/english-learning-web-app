import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { Navbar } from '../components/Navbar';
import { apiClient } from '../lib/api-client';
import { User } from '../types/auth';
import {
  DailyGoal,
  ContinueLearningItem,
  ActivityListResponse,
} from '../types/dashboard';
import { WelcomeSection } from '../components/dashboard/WelcomeSection';
import { DailyGoalCard } from '../components/dashboard/DailyGoalCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { ContinueLearning } from '../components/dashboard/ContinueLearning';
import { RecentActivity } from '../components/dashboard/RecentActivity';

export const DashboardPage: React.FC = () => {
  const { user: authUser } = useAuthStore();

  // 1. Fetch User Profile
  const { data: userProfile, isLoading: isProfileLoading } = useQuery<User>({
    queryKey: ['user-profile'],
    queryFn: () => apiClient.get<User>('/users/me'),
    initialData: authUser || undefined,
  });

  const currentUser = userProfile || authUser;
  const streakDays = currentUser?.profile?.streakDays ?? 0;

  // 2. Fetch Today's Daily Goal
  const {
    data: dailyGoal,
    isLoading: isGoalLoading,
    isError: isGoalError,
    refetch: refetchGoal,
  } = useQuery<DailyGoal>({
    queryKey: ['daily-goal'],
    queryFn: () => apiClient.get<DailyGoal>('/daily-goals'),
  });

  // 3. Fetch Continue Learning Items
  const {
    data: continueItems = [],
    isLoading: isContinueLoading,
    isError: isContinueError,
    refetch: refetchContinue,
  } = useQuery<ContinueLearningItem[]>({
    queryKey: ['continue-learning'],
    queryFn: () => apiClient.get<ContinueLearningItem[]>('/progress/continue-learning'),
  });

  // 4. Fetch Recent Activities
  const {
    data: activityResponse,
    isLoading: isActivitiesLoading,
    isError: isActivitiesError,
    refetch: refetchActivities,
  } = useQuery<ActivityListResponse>({
    queryKey: ['recent-activities'],
    queryFn: () => apiClient.get<ActivityListResponse>('/progress/activities?limit=5'),
  });

  const recentActivities = activityResponse?.data || [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="container mx-auto max-w-5xl flex-1 space-y-8 px-4 py-8 sm:px-6">
        {/* 1. Welcome Section */}
        <WelcomeSection user={currentUser} isLoading={isProfileLoading} />

        {/* 2. Today's Goal Card */}
        <DailyGoalCard
          goal={dailyGoal}
          streakDays={streakDays}
          isLoading={isGoalLoading}
          isError={isGoalError}
          onRetry={refetchGoal}
        />

        {/* 3. Quick Actions ("Start Learning") */}
        <QuickActions />

        {/* 4. Continue Learning & 5. Recent Activity Layout */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Continue Learning */}
          <div className="lg:col-span-7">
            <ContinueLearning
              items={continueItems}
              isLoading={isContinueLoading}
              isError={isContinueError}
              onRetry={refetchContinue}
            />
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-5">
            <RecentActivity
              activities={recentActivities}
              isLoading={isActivitiesLoading}
              isError={isActivitiesError}
              onRetry={refetchActivities}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;

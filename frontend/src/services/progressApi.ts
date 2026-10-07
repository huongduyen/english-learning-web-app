import { apiClient } from '../lib/api-client';
import {
  UserProgressResponse,
  WeeklyActivityDay,
  LearningActivityListResponse,
  CreateActivityPayload,
  LearningActivityItem,
} from '../types/progress';
import { AchievementItem } from '../types/achievements';
import { ActivityType, ContinueLearningItem } from '../types/dashboard';

export const progressApi = {
  /**
   * Fetch current user overall learning progress, skill breakdowns, streaks, and quiz stats.
   */
  getProgress: async (): Promise<UserProgressResponse> => {
    return apiClient.get<UserProgressResponse>('/progress');
  },

  /**
   * Fetch 7-day weekly activity breakdown for charting.
   */
  getWeeklyActivity: async (): Promise<WeeklyActivityDay[]> => {
    return apiClient.get<WeeklyActivityDay[]>('/progress/weekly');
  },

  /**
   * Fetch paginated learning activity history with optional activity type filter.
   */
  getActivities: async (
    page = 1,
    limit = 20,
    type?: ActivityType
  ): Promise<LearningActivityListResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (type) params.append('type', type);

    return apiClient.get<LearningActivityListResponse>(`/progress/activities?${params.toString()}`);
  },

  /**
   * Log an activity and automatically trigger daily goals and achievement unlocking.
   */
  logActivity: async (
    payload: CreateActivityPayload
  ): Promise<{ activity: LearningActivityItem; newlyUnlockedAchievements: AchievementItem[] }> => {
    return apiClient.post('/progress/activity', payload);
  },

  /**
   * Get continue learning items.
   */
  getContinueLearning: async (): Promise<ContinueLearningItem[]> => {
    return apiClient.get<ContinueLearningItem[]>('/progress/continue-learning');
  },
};

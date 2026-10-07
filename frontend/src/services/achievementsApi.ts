import { apiClient } from '../lib/api-client';
import { AchievementItem } from '../types/achievements';

export const achievementsApi = {
  /**
   * Fetch all achievements with current user unlock status and progress.
   */
  getAchievements: async (): Promise<AchievementItem[]> => {
    return apiClient.get<AchievementItem[]>('/achievements');
  },
};

export interface AchievementItem {
  id: string;
  code: string;
  title: string;
  titleVi: string;
  description: string;
  descriptionVi: string;
  icon: string | null;
  points: number;
  unlocked: boolean;
  progress: number;
  unlockedAt: string | null;
}

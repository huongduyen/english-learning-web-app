import { ActivityType } from './dashboard';

export interface WeeklyActivityDay {
  date: string;
  day: string;
  fullDay: string;
  minutes: number;
  activitiesCount: number;
  wordsCount: number;
  goalMinutes: number;
  isGoalReached: boolean;
  isToday: boolean;
}

export interface SkillProgressData {
  vocabulary: {
    percentage: number;
    totalAvailable: number;
    wordsLearned: number;
    learning: number;
    reviewing: number;
    mastered: number;
  };
  grammar: {
    percentage: number;
    totalLessons: number;
    completedLessons: number;
  };
  listening: {
    percentage: number;
    totalLessons: number;
    completedLessons: number;
  };
  reading: {
    percentage: number;
    totalArticles: number;
    completedArticles: number;
  };
  speaking: {
    percentage: number;
    totalConversations: number;
    completedConversations: number;
  };
}

export interface ProgressOverview {
  totalLearningTimeMinutes: number;
  totalLearningTimeFormatted: string;
  wordsLearned: number;
  wordsMastered: number;
  lessonsCompleted: number;
  averageQuizScore: number;
  currentStreak: number;
  longestStreak: number;
}

export interface CompletedLessonItem {
  id: string;
  title: string;
  type: 'GRAMMAR' | 'LISTENING' | 'READING';
  completedAt: string;
  score?: number;
}

export interface QuizStatistics {
  totalAttempts: number;
  passedAttempts: number;
  averageScore: number;
  highestScore: number;
  passRate: number;
}

export interface VocabularyStatistics {
  totalAvailable: number;
  totalEnrolled: number;
  learning: number;
  reviewing: number;
  mastered: number;
  retentionRate: number;
}

export interface DailyGoalProgress {
  id: string;
  targetMinutes: number;
  actualMinutes: number;
  targetWords: number;
  actualWords: number;
  completed: boolean;
  percentage: number;
}

export interface AchievementsSummary {
  totalUnlocked: number;
  totalAvailable: number;
}

export interface UserProgressResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    level: string;
    targetLevel: string;
    totalXp: number;
    streakDays: number;
    longestStreakDays: number;
    dailyGoalMinutes: number;
  };
  overview: ProgressOverview;
  skills: SkillProgressData;
  weeklyActivity: WeeklyActivityDay[];
  quizzes: QuizStatistics;
  vocabulary: VocabularyStatistics;
  completedLessonsList: CompletedLessonItem[];
  dailyGoal: DailyGoalProgress;
  achievementsSummary: AchievementsSummary;
  learning: {
    totalActivities: number;
    totalStudyMinutes: number;
  };
}

export interface LearningActivityItem {
  id: string;
  userId: string;
  type: ActivityType;
  referenceId: string | null;
  durationMinutes: number;
  score: number | null;
  metadata: Record<string, any> | null;
  createdAt: string;
}

export interface LearningActivityListResponse {
  data: LearningActivityItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateActivityPayload {
  type: ActivityType;
  referenceId?: string;
  durationMinutes?: number;
  score?: number;
  wordsLearned?: number;
  metadata?: Record<string, any>;
}

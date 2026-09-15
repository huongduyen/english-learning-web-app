export interface DailyGoal {
  id: string;
  userId: string;
  date: string;
  targetMinutes: number;
  actualMinutes: number;
  targetWords: number;
  actualWords: number;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContinueLearningItem {
  id: string;
  type: string;
  category: string;
  title: string;
  progress: number;
  path: string;
}

export type ActivityType =
  | 'VOCABULARY'
  | 'GRAMMAR'
  | 'LISTENING'
  | 'READING'
  | 'QUIZ'
  | 'CONVERSATION'
  | 'SPEAKING';

export interface LearningActivity {
  id: string;
  userId: string;
  type: ActivityType;
  referenceId?: string | null;
  durationMinutes: number;
  score?: number | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface ActivityListResponse {
  data: LearningActivity[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

import { EnglishLevel } from './grammar';
import { QuestionBreakdown, QuizQuestion } from './quiz';

export interface ListeningLessonListItem {
  id: string;
  slug: string;
  title: string;
  titleVi?: string;
  description?: string;
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  duration?: number; // In seconds
  audioUrl: string;
  level: EnglishLevel;
  isCompleted?: boolean;
  lastScore?: number | null;
  quiz?: {
    id: string;
    title: string;
    questionCount: number;
    passingScore: number;
    timeLimit?: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListeningLessonDetail {
  id: string;
  slug: string;
  title: string;
  titleVi?: string;
  description?: string;
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  duration?: number;
  audioUrl: string;
  transcript?: string;
  transcriptVi?: string;
  level: EnglishLevel;
  isCompleted?: boolean;
  lastScore?: number | null;
  lastAttemptDate?: string | null;
  quiz?: {
    id: string;
    title: string;
    questionCount: number;
    passingScore: number;
    timeLimit?: number;
  } | null;
  questions: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedListeningResponse {
  data: ListeningLessonListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ListeningFilters {
  page?: number;
  limit?: number;
  search?: string;
  level?: EnglishLevel;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  topic?: string;
}

export interface ListeningSubmitPayload {
  answers: Array<{
    questionId: string;
    answer: string;
  }>;
  durationSeconds?: number;
}

export interface ListeningResultData {
  attemptId: string;
  lessonId: string;
  quizId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  correctCount: number;
  incorrectCount: number;
  xpAwarded?: number;
  completedAt?: string;
  breakdown: QuestionBreakdown[];
}

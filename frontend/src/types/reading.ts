import { EnglishLevel } from './grammar';
import { QuestionBreakdown, QuizQuestion } from './quiz';

export interface ReadingArticleListItem {
  id: string;
  slug: string;
  title: string;
  titleVi?: string;
  summary?: string;
  description?: string;
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  readingTime?: number; // In minutes
  estimatedReadingTime?: number;
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

export interface ReadingArticleDetail {
  id: string;
  slug: string;
  title: string;
  titleVi?: string;
  summary?: string;
  description?: string;
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  readingTime?: number;
  estimatedReadingTime?: number;
  content: string;
  contentVi?: string;
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

export interface PaginatedReadingResponse {
  data: ReadingArticleListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ReadingFilters {
  page?: number;
  limit?: number;
  search?: string;
  level?: EnglishLevel;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  topic?: string;
}

export interface ReadingSubmitPayload {
  answers: Array<{
    questionId: string;
    answer: string;
  }>;
  durationSeconds?: number;
}

export interface ReadingResultData {
  attemptId: string;
  articleId: string;
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

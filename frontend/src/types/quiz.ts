import { EnglishLevel, QuestionType } from './grammar';

export interface MultipleChoiceOption {
  id: string;
  text: string;
}

export interface MatchingPair {
  leftId: string;
  left: string;
  rightId: string;
  right: string;
}

export interface MatchingOptions {
  pairs: MatchingPair[];
}

export interface SentenceOrderingOptions {
  tokens: string[];
}

export interface SentenceCorrectionOptions {
  error?: string;
  correction?: string;
  suggestion?: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  instruction?: string;
  questionType: QuestionType;
  options?: unknown;
  correctAnswer: string;
  explanation?: string;
  explanationVi?: string;
  points?: number;
  order?: number;
}

export interface QuizListItem {
  id: string;
  title: string;
  description?: string;
  level: EnglishLevel;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimit?: number; // In minutes
  passingScore: number;
  questionCount: number;
  attemptsCount: number;
  lessonType: 'GRAMMAR' | 'LISTENING' | 'READING' | 'GENERAL';
  associatedLesson?: {
    id: string;
    title: string;
    slug?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuizDetail {
  id: string;
  title: string;
  description?: string;
  level: EnglishLevel;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimit?: number;
  passingScore: number;
  questions: QuizQuestion[];
  listeningLesson?: { id: string; title: string; audioUrl?: string } | null;
  readingArticle?: { id: string; title: string } | null;
  grammarLesson?: { id: string; title: string; slug: string } | null;
}

export interface PaginatedQuizResponse {
  data: QuizListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface QuizQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  level?: EnglishLevel;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface AnswerSubmission {
  questionId: string;
  answer: string;
}

export interface QuestionBreakdown {
  questionId: string;
  prompt: string;
  instruction?: string;
  questionType?: QuestionType;
  options?: unknown;
  submittedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  points: number;
  pointsEarned: number;
  explanation?: string;
  explanationVi?: string;
}

export interface QuizResultData {
  attemptId?: string;
  quizId?: string;
  quizTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  correctCount: number;
  incorrectCount: number;
  timeSpentSeconds: number;
  xpAwarded?: number;
  completedAt?: string;
  breakdown: QuestionBreakdown[];
}

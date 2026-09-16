export type EnglishLevel =
  | 'BEGINNER'
  | 'ELEMENTARY'
  | 'INTERMEDIATE'
  | 'UPPER_INTERMEDIATE'
  | 'ADVANCED'
  | 'PROFICIENT';

export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'FILL_BLANK'
  | 'MATCHING'
  | 'TRUE_FALSE'
  | 'SENTENCE_ORDERING'
  | 'SENTENCE_CORRECTION';

export interface GrammarCategory {
  slug: string;
  name: string;
  nameVi: string;
  description: string;
  icon: string;
  lessonCount: number;
}

export interface GrammarExercise {
  id: string;
  lessonId: string;
  instruction: string;
  question: string;
  questionType: QuestionType;
  options: unknown;
  correctAnswer: string;
  explanation?: string;
  explanationVi?: string;
  order: number;
}

export interface GrammarLessonListItem {
  id: string;
  slug: string;
  title: string;
  titleVi: string;
  category: string;
  categoryVi?: string;
  summary?: string;
  level: EnglishLevel;
  order: number;
  exerciseCount: number;
  quiz?: {
    id: string;
    title: string;
    timeLimit?: number;
    passingScore: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface GrammarLessonDetail {
  id: string;
  slug: string;
  title: string;
  titleVi: string;
  category: string;
  categoryVi?: string;
  summary?: string;
  content: string;
  level: EnglishLevel;
  order: number;
  exercises: GrammarExercise[];
  quiz?: {
    id: string;
    title: string;
    description?: string;
    timeLimit?: number;
    passingScore: number;
    _count?: { questions: number };
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedGrammarResponse {
  data: GrammarLessonListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GrammarQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  level?: EnglishLevel;
  category?: string;
}

export interface ExerciseAnswerSubmission {
  exerciseId: string;
  answer: string;
}

export interface ExerciseBreakdownItem {
  exerciseId: string;
  instruction: string;
  question: string;
  questionType: QuestionType;
  submittedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
  explanationVi?: string;
}

export interface ExerciseSubmissionResult {
  lessonId: string;
  lessonSlug: string;
  lessonTitle: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  percentage: number;
  passed: boolean;
  xpAwarded: number;
  breakdown: ExerciseBreakdownItem[];
}

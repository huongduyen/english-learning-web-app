export type EnglishLevel =
  | 'BEGINNER'
  | 'ELEMENTARY'
  | 'INTERMEDIATE'
  | 'UPPER_INTERMEDIATE'
  | 'ADVANCED'
  | 'PROFICIENT';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type VocabularyStatus = 'NEW' | 'LEARNING' | 'REVIEWING' | 'MASTERED';

export interface VocabularyTopic {
  id: string;
  slug: string;
  title: string;
  titleVi: string;
  description?: string;
  thumbnail?: string;
  level: EnglishLevel;
  order: number;
  vocabularyCount: number;
}

export interface UserVocabularyProgress {
  status: VocabularyStatus;
  reviewCount: number;
  masteryScore: number;
  isFavorite?: boolean;
  lastReviewedAt?: string;
  nextReviewAt?: string;
}

export interface VocabularyItem {
  id: string;
  topicId: string;
  word: string;
  phonetic?: string | null;
  partOfSpeech?: string | null;
  meaning: string;
  meaningVi: string;
  exampleSentence?: string | null;
  exampleSentenceVi?: string | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
  difficulty: Difficulty;
  topic?: {
    id: string;
    slug: string;
    title: string;
    titleVi: string;
    level: EnglishLevel;
  };
  userProgress?: UserVocabularyProgress | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface VocabularyQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  topicId?: string;
  difficulty?: Difficulty | '';
  partOfSpeech?: string;
  level?: EnglishLevel | '';
}

export interface PaginatedVocabularyResponse {
  data: VocabularyItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ReviewVocabularyPayload {
  isCorrect?: boolean;
  rating?: number; // 1 to 5
}

export interface FlashcardSessionStats {
  totalCount: number;
  reviewedCount: number;
  learnedIds: string[];
  difficultIds: string[];
  reviewsCount: number;
  isCompleted: boolean;
}

import { apiClient } from '../lib/api-client';
import {
  GrammarCategory,
  GrammarLessonDetail,
  GrammarQueryFilters,
  PaginatedGrammarResponse,
  GrammarExercise,
  ExerciseAnswerSubmission,
  ExerciseSubmissionResult,
} from '../types/grammar';

export const grammarApi = {
  /**
   * Fetch grammar categories with lesson counts
   */
  getCategories: async (): Promise<GrammarCategory[]> => {
    return apiClient.get<GrammarCategory[]>('/grammar/categories');
  },

  /**
   * Fetch paginated list of grammar lessons with filters
   */
  getLessons: async (
    filters: GrammarQueryFilters = {}
  ): Promise<PaginatedGrammarResponse> => {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search && filters.search.trim())
      params.append('search', filters.search.trim());
    if (filters.level) params.append('level', filters.level);
    if (filters.category && filters.category.trim())
      params.append('category', filters.category.trim());

    const queryString = params.toString();
    const endpoint = queryString ? `/grammar?${queryString}` : '/grammar';
    return apiClient.get<PaginatedGrammarResponse>(endpoint);
  },

  /**
   * Fetch a single grammar lesson by ID or slug
   */
  getLesson: async (idOrSlug: string): Promise<GrammarLessonDetail> => {
    return apiClient.get<GrammarLessonDetail>(`/grammar/${idOrSlug}`);
  },

  /**
   * Fetch exercises for a grammar lesson
   */
  getLessonExercises: async (idOrSlug: string): Promise<GrammarExercise[]> => {
    return apiClient.get<GrammarExercise[]>(`/grammar/${idOrSlug}/exercises`);
  },

  /**
   * Submit exercises for grading and activity tracking
   */
  submitExercises: async (
    idOrSlug: string,
    answers: ExerciseAnswerSubmission[]
  ): Promise<ExerciseSubmissionResult> => {
    return apiClient.post<ExerciseSubmissionResult>(
      `/grammar/${idOrSlug}/exercises/submit`,
      { answers }
    );
  },
};

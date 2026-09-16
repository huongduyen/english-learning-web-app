import { apiClient } from '../lib/api-client';
import {
  AnswerSubmission,
  PaginatedQuizResponse,
  QuizDetail,
  QuizQueryFilters,
  QuizResultData,
} from '../types/quiz';

export const quizApi = {
  /**
   * Fetch paginated list of quizzes with filters
   */
  getQuizzes: async (filters: QuizQueryFilters = {}): Promise<PaginatedQuizResponse> => {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search && filters.search.trim())
      params.append('search', filters.search.trim());
    if (filters.level) params.append('level', filters.level);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);

    const queryString = params.toString();
    const endpoint = queryString ? `/quizzes?${queryString}` : '/quizzes';
    return apiClient.get<PaginatedQuizResponse>(endpoint);
  },

  /**
   * Fetch a single quiz with its questions by UUID
   */
  getQuizById: async (id: string): Promise<QuizDetail> => {
    return apiClient.get<QuizDetail>(`/quizzes/${id}`);
  },

  /**
   * Submit quiz answers and obtain graded results
   */
  submitQuiz: async (
    id: string,
    answers: AnswerSubmission[],
    durationSeconds?: number
  ): Promise<QuizResultData> => {
    return apiClient.post<QuizResultData>(`/quizzes/${id}/submit`, {
      answers,
      durationSeconds,
    });
  },
};


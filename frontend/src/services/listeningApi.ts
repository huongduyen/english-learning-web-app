import { apiClient } from '../lib/api-client';
import {
  ListeningFilters,
  ListeningLessonDetail,
  ListeningResultData,
  PaginatedListeningResponse,
} from '../types/listening';

export const listeningApi = {
  /**
   * Fetch paginated list of listening lessons with optional filters
   */
  getLessons: async (filters: ListeningFilters = {}): Promise<PaginatedListeningResponse> => {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search && filters.search.trim())
      params.append('search', filters.search.trim());
    if (filters.level) params.append('level', filters.level);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.topic && filters.topic.trim())
      params.append('topic', filters.topic.trim());

    const queryString = params.toString();
    const endpoint = queryString ? `/listening?${queryString}` : '/listening';
    return apiClient.get<PaginatedListeningResponse>(endpoint);
  },

  /**
   * Fetch a single listening lesson with audio, transcript, and sanitized questions
   */
  getLessonById: async (id: string): Promise<ListeningLessonDetail> => {
    return apiClient.get<ListeningLessonDetail>(`/listening/${id}`);
  },

  /**
   * Submit listening comprehension exercise answers and receive graded evaluation
   */
  submitLesson: async (
    id: string,
    answers: Array<{ questionId: string; answer: string }>,
    durationSeconds?: number
  ): Promise<ListeningResultData> => {
    return apiClient.post<ListeningResultData>(`/listening/${id}/submit`, {
      answers,
      durationSeconds,
    });
  },
};

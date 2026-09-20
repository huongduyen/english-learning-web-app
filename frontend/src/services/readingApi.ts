import { apiClient } from '../lib/api-client';
import {
  PaginatedReadingResponse,
  ReadingArticleDetail,
  ReadingFilters,
  ReadingResultData,
} from '../types/reading';

export const readingApi = {
  /**
   * Fetch paginated list of reading articles with optional filters
   */
  getArticles: async (filters: ReadingFilters = {}): Promise<PaginatedReadingResponse> => {
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
    const endpoint = queryString ? `/reading?${queryString}` : '/reading';
    return apiClient.get<PaginatedReadingResponse>(endpoint);
  },

  /**
   * Fetch a single reading article with content and sanitized questions
   */
  getArticleById: async (id: string): Promise<ReadingArticleDetail> => {
    return apiClient.get<ReadingArticleDetail>(`/reading/${id}`);
  },

  /**
   * Submit reading comprehension exercise answers and receive graded evaluation
   */
  submitArticle: async (
    id: string,
    answers: Array<{ questionId: string; answer: string }>,
    durationSeconds?: number
  ): Promise<ReadingResultData> => {
    return apiClient.post<ReadingResultData>(`/reading/${id}/submit`, {
      answers,
      durationSeconds,
    });
  },
};

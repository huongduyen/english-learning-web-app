import { apiClient } from '../lib/api-client';
import {
  PaginatedVocabularyResponse,
  ReviewVocabularyPayload,
  UserVocabularyProgress,
  VocabularyItem,
  VocabularyQueryFilters,
  VocabularyTopic,
} from '../types/vocabulary';

export const vocabularyApi = {
  /**
   * Fetch all vocabulary topics with word counts
   */
  getTopics: async (): Promise<VocabularyTopic[]> => {
    return apiClient.get<VocabularyTopic[]>('/vocabulary/topics');
  },

  /**
   * Fetch paginated list of vocabulary words with filters
   */
  getVocabularies: async (
    filters: VocabularyQueryFilters = {}
  ): Promise<PaginatedVocabularyResponse> => {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search && filters.search.trim())
      params.append('search', filters.search.trim());
    if (filters.topicId) params.append('topicId', filters.topicId);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.partOfSpeech && filters.partOfSpeech.trim())
      params.append('partOfSpeech', filters.partOfSpeech.trim());
    if (filters.level) params.append('level', filters.level);

    const queryString = params.toString();
    const endpoint = queryString ? `/vocabulary?${queryString}` : '/vocabulary';
    return apiClient.get<PaginatedVocabularyResponse>(endpoint);
  },

  /**
   * Fetch a single vocabulary item by ID
   */
  getVocabularyById: async (id: string): Promise<VocabularyItem> => {
    return apiClient.get<VocabularyItem>(`/vocabulary/${id}`);
  },

  /**
   * Mark a vocabulary word as learning
   */
  learnVocabulary: async (id: string): Promise<UserVocabularyProgress> => {
    return apiClient.post<UserVocabularyProgress>(`/vocabulary/${id}/learn`);
  },

  /**
   * Submit spaced repetition review rating
   */
  reviewVocabulary: async (
    id: string,
    payload: ReviewVocabularyPayload
  ): Promise<UserVocabularyProgress> => {
    return apiClient.post<UserVocabularyProgress>(
      `/vocabulary/${id}/review`,
      payload
    );
  },

  /**
   * Toggle favorite status
   */
  toggleFavorite: async (
    id: string
  ): Promise<{ vocabularyId: string; isFavorite: boolean; status: string }> => {
    return apiClient.post<{
      vocabularyId: string;
      isFavorite: boolean;
      status: string;
    }>(`/vocabulary/${id}/favorite`);
  },
};

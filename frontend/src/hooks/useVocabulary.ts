import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vocabularyApi } from '../services/vocabularyApi';
import {
  PaginatedVocabularyResponse,
  ReviewVocabularyPayload,
  VocabularyItem,
  VocabularyQueryFilters,
  VocabularyTopic,
} from '../types/vocabulary';

export const VOCABULARY_KEYS = {
  all: ['vocabulary'] as const,
  topics: () => [...VOCABULARY_KEYS.all, 'topics'] as const,
  list: (filters: VocabularyQueryFilters) =>
    [...VOCABULARY_KEYS.all, 'list', filters] as const,
  detail: (id: string) => [...VOCABULARY_KEYS.all, 'detail', id] as const,
};

/**
 * Hook to retrieve all vocabulary topics
 */
export function useVocabularyTopics() {
  return useQuery<VocabularyTopic[], Error>({
    queryKey: VOCABULARY_KEYS.topics(),
    queryFn: () => vocabularyApi.getTopics(),
    staleTime: 1000 * 60 * 10, // 10 mins
  });
}

/**
 * Hook to retrieve paginated vocabulary list with query filters
 */
export function useVocabularyList(filters: VocabularyQueryFilters) {
  return useQuery<PaginatedVocabularyResponse, Error>({
    queryKey: VOCABULARY_KEYS.list(filters),
    queryFn: () => vocabularyApi.getVocabularies(filters),
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to retrieve a single vocabulary item by ID
 */
export function useVocabularyDetail(id?: string) {
  return useQuery<VocabularyItem, Error>({
    queryKey: VOCABULARY_KEYS.detail(id || ''),
    queryFn: () => {
      if (!id) throw new Error('Vocabulary ID is required');
      return vocabularyApi.getVocabularyById(id);
    },
    enabled: Boolean(id),
  });
}

/**
 * Mutation hook to mark a word as learning
 */
export function useLearnVocabularyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vocabularyApi.learnVocabulary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOCABULARY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/**
 * Mutation hook to submit spaced repetition review
 */
export function useReviewVocabularyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ReviewVocabularyPayload;
    }) => vocabularyApi.reviewVocabulary(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOCABULARY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/**
 * Mutation hook to toggle favorite status
 */
export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vocabularyApi.toggleFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOCABULARY_KEYS.all });
    },
  });
}

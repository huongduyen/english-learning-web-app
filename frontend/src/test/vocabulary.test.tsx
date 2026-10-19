import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VocabularyCard } from '../components/vocabulary/VocabularyCard';
import { Flashcard } from '../components/vocabulary/Flashcard';
import { VocabularyFilters } from '../components/vocabulary/VocabularyFilters';
import { VocabularyItem, VocabularyTopic } from '../types/vocabulary';

describe('Vocabulary & Flashcards Component Tests', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const mockItem: VocabularyItem = {
    id: 'vocab-1',
    word: 'resilient',
    phonetic: '/rɪˈzɪl.jənt/',
    partOfSpeech: 'adjective',
    meaning: 'able to withstand or recover quickly from difficult conditions',
    meaningVi: 'kiên cường, có khả năng phục hồi nhanh',
    exampleSentence: 'Babies are surprisingly resilient.',
    exampleSentenceVi: 'Trẻ sơ sinh có khả năng phục hồi đáng ngạc nhiên.',
    audioUrl: 'https://example.com/resilient.mp3',
    difficulty: 'MEDIUM',
    topicId: 'topic-1',
    topic: {
      id: 'topic-1',
      slug: 'personality',
      title: 'Personality & Character',
      titleVi: 'Tính cách & Phẩm chất',
      level: 'INTERMEDIATE',
    },
    userProgress: {
      status: 'LEARNING',
      reviewCount: 3,
      masteryScore: 60,
      isFavorite: true,
      lastReviewedAt: '2026-10-10',
      nextReviewAt: '2026-10-12',
    },
  };

  const mockTopics: VocabularyTopic[] = [
    {
      id: 'topic-1',
      slug: 'personality',
      title: 'Personality & Character',
      titleVi: 'Tính cách',
      level: 'INTERMEDIATE',
      order: 1,
      vocabularyCount: 25,
    },
  ];

  describe('VocabularyCard', () => {
    it('renders English word, IPA, Vietnamese meaning, and badges', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <VocabularyCard item={mockItem} />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      expect(screen.getByText('resilient')).toBeInTheDocument();
      expect(screen.getByText('/rɪˈzɪl.jənt/')).toBeInTheDocument();
      expect(
        screen.getByText('kiên cường, có khả năng phục hồi nhanh'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('able to withstand or recover quickly from difficult conditions'),
      ).toBeInTheDocument();
      expect(screen.getByText('“Babies are surprisingly resilient.”')).toBeInTheDocument();
      expect(screen.getByText('Learning')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
    });

    it('links to word details and flashcards practice', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <VocabularyCard item={mockItem} />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      const detailsLink = screen.getByRole('link', { name: /details/i });
      expect(detailsLink).toHaveAttribute('href', '/vocabulary/vocab-1');

      const flashcardLink = screen.getByRole('link', { name: /flashcard/i });
      expect(flashcardLink).toHaveAttribute(
        'href',
        '/vocabulary/flashcards?wordId=vocab-1&topicId=topic-1',
      );
    });
  });

  describe('Flashcard', () => {
    it('renders front side by default with word and prompt', () => {
      render(
        <Flashcard
          item={mockItem}
          isFlipped={false}
          onFlip={() => {}}
        />,
      );

      expect(screen.getByText('resilient')).toBeInTheDocument();
      expect(screen.getByText('/rɪˈzɪl.jənt/')).toBeInTheDocument();
      expect(screen.getByText('Front')).toBeInTheDocument();
      expect(screen.getByText(/click card or press space to flip/i)).toBeInTheDocument();
    });

    it('renders back side when isFlipped is true', () => {
      render(
        <Flashcard
          item={mockItem}
          isFlipped={true}
          onFlip={() => {}}
        />,
      );

      expect(screen.getByText('Back')).toBeInTheDocument();
      expect(
        screen.getByText('kiên cường, có khả năng phục hồi nhanh'),
      ).toBeInTheDocument();
    });

    it('calls onFlip callback on card click', async () => {
      const user = userEvent.setup();
      const flipMock = vi.fn();

      render(
        <Flashcard
          item={mockItem}
          isFlipped={false}
          onFlip={flipMock}
        />,
      );

      const card = screen.getByRole('button', { name: /flashcard for resilient/i });
      await user.click(card);

      expect(flipMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('VocabularyFilters', () => {
    it('renders search input and filters, triggering onFilterChange on input', async () => {
      const user = userEvent.setup();
      const filterChangeMock = vi.fn();

      render(
        <VocabularyFilters
          filters={{ search: '', page: 1, limit: 20 }}
          topics={mockTopics}
          totalCount={25}
          onFilterChange={filterChangeMock}
        />,
      );

      expect(screen.getByPlaceholderText(/search words, meanings/i)).toBeInTheDocument();
      const searchInput = screen.getByPlaceholderText(/search words, meanings/i);
      await user.type(searchInput, 'brave');

      expect(filterChangeMock).toHaveBeenCalled();
    });
  });
});

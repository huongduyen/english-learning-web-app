import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Flashcard } from '../components/vocabulary/Flashcard';
import { FlashcardControls } from '../components/vocabulary/FlashcardControls';
import { FlashcardProgressBar } from '../components/vocabulary/FlashcardProgressBar';
import { FlashcardSessionSummary } from '../components/vocabulary/FlashcardSessionSummary';
import {
  useVocabularyList,
  useVocabularyTopics,
  useReviewVocabularyMutation,
} from '../hooks/useVocabulary';
import { Difficulty, VocabularyItem } from '../types/vocabulary';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const FlashcardsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTopic = searchParams.get('topicId') || '';
  const initialWordId = searchParams.get('wordId') || '';
  const initialDifficulty = (searchParams.get('difficulty') as Difficulty) || '';

  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);

  // Deck State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedIds, setLearnedIds] = useState<string[]>([]);
  const [difficultIds, setDifficultIds] = useState<string[]>([]);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [difficultOnlyMode, setDifficultOnlyMode] = useState(false);

  const { data: topics = [] } = useVocabularyTopics();

  const {
    data: listResponse,
    isLoading,
  } = useVocabularyList({
    limit: 50,
    topicId: selectedTopic || undefined,
    difficulty: selectedDifficulty || undefined,
  });

  const reviewMutation = useReviewVocabularyMutation();

  const allItems: VocabularyItem[] = useMemo(
    () => listResponse?.data || [],
    [listResponse]
  );

  // Filter items if practicing difficult words only
  const sessionItems: VocabularyItem[] = useMemo(() => {
    if (difficultOnlyMode) {
      return allItems.filter((item) => difficultIds.includes(item.id));
    }
    return allItems;
  }, [allItems, difficultOnlyMode, difficultIds]);

  const hasInitialWordSet = React.useRef(false);

  // Jump to wordId if provided in query params on first load
  useEffect(() => {
    if (!hasInitialWordSet.current && initialWordId && sessionItems.length > 0) {
      const idx = sessionItems.findIndex((item) => item.id === initialWordId);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
      hasInitialWordSet.current = true;
    }
  }, [initialWordId, sessionItems]);

  const currentCard = sessionItems[currentIndex];
  const totalCount = sessionItems.length;

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < totalCount - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setIsCompleted(true);
    }
  }, [currentIndex, totalCount]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const handleKnowThis = useCallback(() => {
    if (!currentCard) return;

    // Call API review endpoint
    reviewMutation.mutate({
      id: currentCard.id,
      payload: { isCorrect: true, rating: 5 },
    });

    // Update session tracking
    setLearnedIds((prev) => Array.from(new Set([...prev, currentCard.id])));
    setDifficultIds((prev) => prev.filter((id) => id !== currentCard.id));
    setReviewsCount((prev) => prev + 1);

    handleNext();
  }, [currentCard, handleNext, reviewMutation]);

  const handleNeedReview = useCallback(() => {
    if (!currentCard) return;

    // Call API review endpoint with isCorrect: false
    reviewMutation.mutate({
      id: currentCard.id,
      payload: { isCorrect: false, rating: 1 },
    });

    // Update session tracking
    setDifficultIds((prev) => Array.from(new Set([...prev, currentCard.id])));
    setLearnedIds((prev) => prev.filter((id) => id !== currentCard.id));
    setReviewsCount((prev) => prev + 1);

    handleNext();
  }, [currentCard, handleNext, reviewMutation]);

  const handleFinishSession = useCallback(() => {
    setIsCompleted(true);
  }, []);

  const handleRestart = useCallback(() => {
    setDifficultOnlyMode(false);
    setCurrentIndex(0);
    setIsFlipped(false);
    setLearnedIds([]);
    setDifficultIds([]);
    setReviewsCount(0);
    setIsCompleted(false);
  }, []);

  const handlePracticeDifficult = useCallback(() => {
    setDifficultOnlyMode(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
  }, []);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or select
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === '1') {
        e.preventDefault();
        handleNeedReview();
      } else if (e.key === '2') {
        e.preventDefault();
        handleKnowThis();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrevious, handleNeedReview, handleKnowThis]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="container mx-auto max-w-4xl flex-1 px-4 py-8 sm:px-6">
        {/* Navigation & Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/vocabulary"
            id="back-to-vocabulary-list"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Exit to Vocabulary
          </Link>

          {/* Topic & Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              id="flashcard-topic-select"
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                setCurrentIndex(0);
                setIsFlipped(false);
                setIsCompleted(false);
                const params = new URLSearchParams(searchParams);
                if (e.target.value) params.set('topicId', e.target.value);
                else params.delete('topicId');
                setSearchParams(params);
              }}
              className="h-9 rounded-xl border border-input bg-card px-3 text-xs font-medium text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Topics ({topics.length})</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>

            <select
              id="flashcard-difficulty-select"
              value={selectedDifficulty}
              onChange={(e) => {
                const diff = (e.target.value as Difficulty) || '';
                setSelectedDifficulty(diff);
                setCurrentIndex(0);
                setIsFlipped(false);
                setIsCompleted(false);
              }}
              className="h-9 rounded-xl border border-input bg-card px-3 text-xs font-medium text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Levels</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex h-96 flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-muted-foreground">
              Preparing your flashcard deck...
            </p>
          </div>
        )}

        {/* Error / Empty State */}
        {!isLoading && totalCount === 0 && (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center">
            <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/60" />
            <h2 className="mt-4 text-xl font-bold">No flashcards available</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Try selecting a different topic or difficulty level.
            </p>
            <Link
              to="/vocabulary"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Back to Vocabulary
            </Link>
          </div>
        )}

        {/* Active Study Arena or Completed Summary */}
        {!isLoading && totalCount > 0 && (
          <div className="space-y-6">
            {isCompleted ? (
              <FlashcardSessionSummary
                items={sessionItems}
                learnedIds={learnedIds}
                difficultIds={difficultIds}
                reviewsCount={reviewsCount}
                onRestart={handleRestart}
                onPracticeDifficult={handlePracticeDifficult}
              />
            ) : (
              <>
                {/* Progress Bar & Tracker */}
                <FlashcardProgressBar
                  currentIndex={currentIndex}
                  totalCount={totalCount}
                  learnedCount={learnedIds.length}
                  difficultCount={difficultIds.length}
                  reviewsCount={reviewsCount}
                />

                {/* 3D Interactive Flashcard */}
                {currentCard && (
                  <Flashcard
                    item={currentCard}
                    isFlipped={isFlipped}
                    onFlip={handleFlip}
                  />
                )}

                {/* Study Controls */}
                <FlashcardControls
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onFlip={handleFlip}
                  onKnowThis={handleKnowThis}
                  onNeedReview={handleNeedReview}
                  onFinishSession={handleFinishSession}
                  hasPrevious={currentIndex > 0}
                  hasNext={currentIndex < totalCount - 1}
                  isProcessing={reviewMutation.isPending}
                />

                {/* Keyboard Shortcut Hints */}
                <div className="mx-auto flex max-w-xl flex-wrap items-center justify-center gap-4 text-center text-xs text-muted-foreground/75 pt-2">
                  <span>
                    <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                      Space
                    </kbd>{' '}
                    Flip
                  </span>
                  <span>
                    <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                      1
                    </kbd>{' '}
                    Need Review
                  </span>
                  <span>
                    <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                      2
                    </kbd>{' '}
                    I Know This
                  </span>
                  <span>
                    <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                      &larr; / &rarr;
                    </kbd>{' '}
                    Navigate
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        English Learning Web Application &copy; {new Date().getFullYear()} &middot; Built
        with modern TypeScript stack
      </footer>
    </div>
  );
};

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import {
  useVocabularyDetail,
  useLearnVocabularyMutation,
  useReviewVocabularyMutation,
} from '../hooks/useVocabulary';
import { AudioPronounceButton } from '../components/vocabulary/AudioPronounceButton';
import { DifficultyBadge } from '../components/vocabulary/DifficultyBadge';
import { PartOfSpeechBadge } from '../components/vocabulary/PartOfSpeechBadge';
import { FavoriteButton } from '../components/vocabulary/FavoriteButton';
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const VocabularyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: item, isLoading, isError, error } = useVocabularyDetail(id);
  const learnMutation = useLearnVocabularyMutation();
  const reviewMutation = useReviewVocabularyMutation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="container mx-auto max-w-4xl flex-1 px-4 py-12">
          <div className="h-96 animate-pulse rounded-3xl border bg-card/50" />
        </main>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="container mx-auto max-w-2xl flex-1 px-4 py-16 text-center">
          <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-8">
            <h2 className="text-xl font-bold text-destructive">
              Vocabulary word not found
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {error?.message ||
                'The requested vocabulary item does not exist or has been removed.'}
            </p>
            <Link
              to="/vocabulary"
              id="back-to-vocabulary-link"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Vocabulary List
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const progress = item.userProgress;
  const status = progress?.status || 'NEW';
  const masteryScore = progress?.masteryScore || 0;
  const reviewCount = progress?.reviewCount || 0;

  const handleQuickLearn = () => {
    if (!id) return;
    learnMutation.mutate(id);
  };

  const handleQuickReview = (isCorrect: boolean, rating: number) => {
    if (!id) return;
    reviewMutation.mutate({ id, payload: { isCorrect, rating } });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="container mx-auto max-w-4xl flex-1 px-4 py-8 sm:px-6">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Link
              to="/vocabulary"
              id="back-to-vocabulary-link"
              className="inline-flex items-center gap-1.5 font-medium hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Vocabulary
            </Link>
            <span>/</span>
            {item.topic && (
              <>
                <Link
                  to={`/vocabulary?topicId=${item.topic.id}`}
                  className="font-medium hover:text-foreground"
                >
                  {item.topic.title}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="font-semibold text-foreground">{item.word}</span>
          </div>

          <Link
            to="/dashboard"
            id="back-to-dashboard-link"
            className="text-xs hover:underline"
          >
            Dashboard
          </Link>
        </div>

        {/* Word Header Card */}
        <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <DifficultyBadge difficulty={item.difficulty} />
                <PartOfSpeechBadge partOfSpeech={item.partOfSpeech} />
                {item.topic && (
                  <span className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs text-muted-foreground">
                    {item.topic.title}
                  </span>
                )}
              </div>

              {/* Main Word Title */}
              <div className="mt-3 flex items-center gap-4">
                <h1
                  id="detail-word"
                  className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl"
                >
                  {item.word}
                </h1>
                <AudioPronounceButton
                  id="detail-audio-btn"
                  word={item.word}
                  audioUrl={item.audioUrl}
                  size="lg"
                />
                <FavoriteButton
                  id="detail-favorite-btn"
                  vocabularyId={item.id}
                  initialIsFavorite={progress?.isFavorite}
                  className="rounded-full border border-border bg-card p-2.5"
                />
              </div>

              {item.phonetic && (
                <p
                  id="detail-ipa"
                  className="mt-2 font-mono text-lg text-muted-foreground"
                >
                  {item.phonetic}
                </p>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={`/vocabulary/flashcards?wordId=${item.id}${
                  item.topicId ? `&topicId=${item.topicId}` : ''
                }`}
                id="detail-start-flashcards-btn"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
              >
                <Sparkles className="h-4 w-4" />
                Start Flashcards
              </Link>

              <button
                id="detail-learn-btn"
                type="button"
                onClick={handleQuickLearn}
                disabled={learnMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl border border-input bg-card px-4 py-3 text-sm font-semibold text-foreground transition-all hover:bg-accent active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {status === 'NEW' ? 'Mark as Learning' : 'Refresh Learning'}
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="mt-6 grid gap-6 md:grid-cols-12">
          {/* Meanings & Definitions (8 Cols) */}
          <div className="space-y-6 md:col-span-7">
            {/* Vietnamese Meaning Card */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Vietnamese Meaning &middot; Nghĩa Tiếng Việt
              </span>
              <p
                id="detail-meaning-vi"
                className="mt-2 text-2xl font-bold text-foreground"
              >
                {item.meaningVi}
              </p>

              {item.meaning && (
                <div className="mt-4 border-t border-border/60 pt-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    English Definition
                  </span>
                  <p
                    id="detail-meaning-en"
                    className="mt-1 text-sm text-foreground/85 leading-relaxed"
                  >
                    {item.meaning}
                  </p>
                </div>
              )}
            </div>

            {/* Example Sentences Card */}
            {item.exampleSentence && (
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Context & Example Sentence
                  </span>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="mt-3 rounded-xl bg-muted/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p
                      id="detail-example"
                      className="text-base font-medium text-foreground italic leading-relaxed"
                    >
                      &ldquo;{item.exampleSentence}&rdquo;
                    </p>
                    <AudioPronounceButton
                      word={item.exampleSentence}
                      size="sm"
                      className="shrink-0"
                    />
                  </div>

                  {item.exampleSentenceVi && (
                    <p
                      id="detail-example-vi"
                      className="mt-2 border-t border-border/50 pt-2 text-sm text-muted-foreground"
                    >
                      {item.exampleSentenceVi}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Spaced Repetition & Progress Tracker (5 Cols) */}
          <div className="space-y-6 md:col-span-5">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Your Learning Status
                </span>
                <Award className="h-4 w-4 text-amber-500" />
              </div>

              {/* Status Indicator */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Status
                </span>
                <span
                  id="detail-status-badge"
                  className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary"
                >
                  {status}
                </span>
              </div>

              {/* Mastery Score Progress */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Mastery Score</span>
                  <span className="font-bold text-foreground">{masteryScore}%</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${masteryScore}%` }}
                  />
                </div>
              </div>

              {/* Review Count */}
              <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs">
                <span className="text-muted-foreground">Times Reviewed</span>
                <span
                  id="detail-review-count"
                  className="font-semibold text-foreground"
                >
                  {reviewCount} times
                </span>
              </div>

              {/* Next Review Schedule */}
              {progress?.nextReviewAt && (
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Next Review</span>
                  <span className="flex items-center gap-1 text-foreground font-medium">
                    <Clock className="h-3 w-3 text-primary" />
                    {new Date(progress.nextReviewAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Spaced Repetition Practice Buttons */}
              <div className="mt-6 border-t pt-4">
                <span className="text-xs font-semibold text-muted-foreground">
                  Quick Spaced Repetition Review:
                </span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickReview(false, 1)}
                    disabled={reviewMutation.isPending}
                    className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-500 hover:text-white dark:text-amber-400"
                  >
                    Need Practice (-10)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickReview(true, 5)}
                    disabled={reviewMutation.isPending}
                    className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-500 hover:text-white dark:text-emerald-400"
                  >
                    Mastered (+25)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        English Learning Web Application &copy; {new Date().getFullYear()} &middot; Built
        with modern TypeScript stack
      </footer>
    </div>
  );
};

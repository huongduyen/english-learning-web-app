import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '../components/Navbar';
import { readingApi } from '../services/readingApi';
import { ReadingArticleContent } from '../components/reading/ReadingArticleContent';
import { ReadingQuestions } from '../components/reading/ReadingQuestions';
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

const DIFFICULTY_STYLES: Record<string, { label: string; className: string }> = {
  EASY: {
    label: 'Easy',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  MEDIUM: {
    label: 'Medium',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  HARD: {
    label: 'Hard',
    className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },
};

export const ReadingArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const {
    data: article,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['reading-article', id],
    queryFn: () => readingApi.getArticleById(id || ''),
    enabled: !!id,
  });

  const handleExerciseSubmit = async (
    answers: Array<{ questionId: string; answer: string }>
  ) => {
    if (!id) throw new Error('Article ID is missing');
    const res = await readingApi.submitArticle(id, answers);
    // Invalidate list and article queries so completion badge updates
    queryClient.invalidateQueries({ queryKey: ['reading-articles'] });
    queryClient.invalidateQueries({ queryKey: ['reading-article', id] });
    return res;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="container mx-auto max-w-4xl flex-1 px-4 py-8 sm:px-6">
          <div id="reading-article-loading" className="space-y-6">
            <div className="h-6 w-36 animate-pulse rounded-lg bg-muted/60" />
            <div className="h-28 animate-pulse rounded-2xl bg-muted/40" />
            <div className="h-96 animate-pulse rounded-2xl bg-muted/40" />
            <div className="h-64 animate-pulse rounded-2xl bg-muted/40" />
          </div>
        </main>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="container mx-auto max-w-md flex-1 px-4 py-16 text-center">
          <div id="reading-article-error" className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-xl font-bold text-foreground">
              Unable to load this lesson.
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              The requested reading article could not be loaded. It may not exist or the network request failed.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                id="article-error-retry-button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-card px-4 py-2 text-xs font-semibold hover:bg-accent"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
              <Link
                to="/reading"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                Back to Articles
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const diff = DIFFICULTY_STYLES[article.difficulty] || DIFFICULTY_STYLES.EASY;
  const readingMins = article.estimatedReadingTime || article.readingTime || 5;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="container mx-auto max-w-4xl flex-1 px-4 py-8 sm:px-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/reading"
            id="back-to-reading-list"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reading Articles
          </Link>
        </div>

        {/* Article Details Card */}
        <section
          id="reading-article-header"
          aria-labelledby="article-title"
          className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${diff.className}`}
              >
                {diff.label}
              </span>
              <span className="rounded-lg border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {article.level}
              </span>
              <span className="rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
                {article.topic}
              </span>
            </div>

            {article.isCompleted && (
              <div
                id="article-completed-status"
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Completed</span>
                {article.lastScore !== null && (
                  <span className="ml-0.5 font-semibold">({article.lastScore}%)</span>
                )}
              </div>
            )}
          </div>

          <h1
            id="article-title"
            className="mt-4 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl"
          >
            {article.title}
          </h1>
          {article.titleVi && (
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {article.titleVi}
            </p>
          )}

          <p className="mt-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {article.summary ||
              article.description ||
              'Read the article carefully to understand the concepts, then complete the comprehension questions below.'}
          </p>

          <div className="mt-4 flex items-center gap-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Clock className="h-3.5 w-3.5" />
              Estimated Reading Time: {readingMins} mins
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <HelpCircle className="h-3.5 w-3.5" />
              {article.questions?.length ?? 0} comprehension questions
            </span>
          </div>
        </section>

        {/* 2. Article Content Reader */}
        <section aria-label="Article Content" className="mt-6">
          <ReadingArticleContent
            content={article.content}
            contentVi={article.contentVi}
          />
        </section>

        {/* 3. Comprehension Questions */}
        <section
          aria-labelledby="reading-questions-heading"
          className="mt-8 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2
              id="reading-questions-heading"
              className="text-lg font-bold text-foreground sm:text-xl"
            >
              Comprehension Questions
            </h2>
            <span className="text-xs text-muted-foreground">
              Answer the questions based on the article above
            </span>
          </div>

          <ReadingQuestions
            articleId={article.id}
            questions={article.questions || []}
            onSubmit={handleExerciseSubmit}
          />
        </section>
      </main>
    </div>
  );
};

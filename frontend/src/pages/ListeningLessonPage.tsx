import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '../components/Navbar';
import { listeningApi } from '../services/listeningApi';
import { AudioPlayer } from '../components/listening/AudioPlayer';
import { TranscriptViewer } from '../components/listening/TranscriptViewer';
import { ListeningQuestions } from '../components/listening/ListeningQuestions';
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

export const ListeningLessonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const {
    data: lesson,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['listening-lesson', id],
    queryFn: () => listeningApi.getLessonById(id || ''),
    enabled: !!id,
  });

  const handleExerciseSubmit = async (
    answers: Array<{ questionId: string; answer: string }>
  ) => {
    if (!id) throw new Error('Lesson ID is missing');
    const res = await listeningApi.submitLesson(id, answers);
    // Invalidate list and lesson queries so completion badge updates
    queryClient.invalidateQueries({ queryKey: ['listening-lessons'] });
    queryClient.invalidateQueries({ queryKey: ['listening-lesson', id] });
    return res;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '2 mins';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="container mx-auto max-w-4xl flex-1 px-4 py-8 sm:px-6">
          <div id="listening-lesson-loading" className="space-y-6">
            <div className="h-6 w-36 animate-pulse rounded-lg bg-muted/60" />
            <div className="h-28 animate-pulse rounded-2xl bg-muted/40" />
            <div className="h-24 animate-pulse rounded-2xl bg-muted/40" />
            <div className="h-64 animate-pulse rounded-2xl bg-muted/40" />
          </div>
        </main>
      </div>
    );
  }

  if (isError || !lesson) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="container mx-auto max-w-md flex-1 px-4 py-16 text-center">
          <div id="listening-lesson-error" className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-xl font-bold text-foreground">
              Unable to load this lesson.
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              The requested listening exercise could not be retrieved. It may not exist or the network connection failed.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                id="lesson-error-retry-button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-card px-4 py-2 text-xs font-semibold hover:bg-accent"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
              <Link
                to="/listening"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                Back to Lessons
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const diff = DIFFICULTY_STYLES[lesson.difficulty] || DIFFICULTY_STYLES.EASY;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="container mx-auto max-w-4xl flex-1 px-4 py-8 sm:px-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/listening"
            id="back-to-listening-list"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Listening Lessons
          </Link>
        </div>

        {/* Lesson Details Card */}
        <section
          id="listening-lesson-header"
          aria-labelledby="lesson-title"
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
                {lesson.level}
              </span>
              <span className="rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
                {lesson.topic}
              </span>
            </div>

            {lesson.isCompleted && (
              <div
                id="lesson-completed-status"
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Completed</span>
                {lesson.lastScore !== null && (
                  <span className="ml-0.5 font-semibold">({lesson.lastScore}%)</span>
                )}
              </div>
            )}
          </div>

          <h1
            id="lesson-title"
            className="mt-4 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl"
          >
            {lesson.title}
          </h1>
          {lesson.titleVi && (
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {lesson.titleVi}
            </p>
          )}

          <p className="mt-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {lesson.description ||
              'Listen carefully to the audio excerpt, check the transcript when needed, and complete the comprehension questions below.'}
          </p>

          <div className="mt-4 flex items-center gap-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Clock className="h-3.5 w-3.5" />
              Duration: {formatDuration(lesson.duration)}
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <HelpCircle className="h-3.5 w-3.5" />
              {lesson.questions?.length ?? 0} comprehension questions
            </span>
          </div>
        </section>

        {/* 2. Audio Player */}
        <section aria-label="Audio Player" className="mt-6">
          <AudioPlayer audioUrl={lesson.audioUrl} title={lesson.title} />
        </section>

        {/* 3. Transcript Toggle */}
        <section aria-label="Transcript" className="mt-6">
          <TranscriptViewer
            transcript={lesson.transcript}
            transcriptVi={lesson.transcriptVi}
          />
        </section>

        {/* 4. Comprehension Questions */}
        <section
          aria-labelledby="comprehension-questions-heading"
          className="mt-8 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2
              id="comprehension-questions-heading"
              className="text-lg font-bold text-foreground sm:text-xl"
            >
              Comprehension Questions
            </h2>
            <span className="text-xs text-muted-foreground">
              Select the best answer for each question
            </span>
          </div>

          <ListeningQuestions
            lessonId={lesson.id}
            questions={lesson.questions || []}
            onSubmit={handleExerciseSubmit}
          />
        </section>
      </main>
    </div>
  );
};

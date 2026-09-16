import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '../components/Navbar';
import { quizApi } from '../services/quizApi';
import { QuizRunner } from '../components/quiz/QuizRunner';
import { QuizResultData } from '../types/quiz';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export const QuizPlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: quiz,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['quiz-detail', id],
    queryFn: () => quizApi.getQuizById(id || ''),
    enabled: !!id,
  });

  const handleSubmit = async (
    answers: Array<{ questionId: string; answer: string }>,
    timeSpentSeconds: number
  ): Promise<QuizResultData> => {
    if (!id) throw new Error('Quiz ID missing');
    const result = await quizApi.submitQuiz(id, answers, timeSpentSeconds);
    
    // Ensure breakdown items have question metadata from quiz if missing
    const enrichedBreakdown = (result.breakdown || []).map((b) => {
      const q = quiz?.questions?.find((item) => item.id === b.questionId);
      return {
        ...b,
        prompt: b.prompt || q?.prompt || '',
        instruction: b.instruction || q?.instruction,
        questionType: b.questionType || q?.questionType,
        options: b.options || q?.options,
      };
    });

    const correctCount =
      result.correctCount ?? enrichedBreakdown.filter((b) => b.isCorrect).length;
    const incorrectCount =
      result.incorrectCount ?? (enrichedBreakdown.length - correctCount);

    return {
      ...result,
      correctCount,
      incorrectCount,
      timeSpentSeconds,
      breakdown: enrichedBreakdown,
    };
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="container mx-auto max-w-3xl flex-1 px-4 py-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Preparing quiz questions...</p>
        </div>
      </div>
    );
  }

  if (isError || !quiz) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="container mx-auto max-w-md flex-1 px-4 py-16 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-xl font-bold text-foreground">Quiz Not Found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The requested assessment could not be loaded.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-xl border border-input bg-card px-4 py-2 text-xs font-semibold hover:bg-accent"
            >
              Retry
            </button>
            <Link
              to="/quizzes"
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm"
            >
              Back to Quizzes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="container mx-auto max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/quizzes"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All Quizzes</span>
          </Link>
          <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Passing Score: {quiz.passingScore}%
          </span>
        </div>

        {/* Reusable Quiz Runner Engine */}
        <QuizRunner
          quizId={quiz.id}
          title={quiz.title}
          description={quiz.description}
          questions={quiz.questions}
          passingScore={quiz.passingScore}
          timeLimit={quiz.timeLimit}
          mode="EXAM"
          onSubmit={handleSubmit}
          onBack={() => navigate('/quizzes')}
        />
      </main>
    </div>
  );
};

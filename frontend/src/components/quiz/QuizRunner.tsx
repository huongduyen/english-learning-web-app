import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { QuizQuestion, QuizResultData } from '../../types/quiz';
import { MultipleChoiceRenderer } from './renderers/MultipleChoiceRenderer';
import { TrueFalseRenderer } from './renderers/TrueFalseRenderer';
import { FillBlankRenderer } from './renderers/FillBlankRenderer';
import { MatchingRenderer } from './renderers/MatchingRenderer';
import { SentenceOrderingRenderer } from './renderers/SentenceOrderingRenderer';
import { SentenceCorrectionRenderer } from './renderers/SentenceCorrectionRenderer';
import { QuizResultCard } from './QuizResultCard';
import { QuizReviewView } from './QuizReviewView';
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Loader2,
  Check,
} from 'lucide-react';

export interface QuizRunnerProps {
  quizId?: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore?: number;
  timeLimit?: number; // In minutes
  mode?: 'EXAM' | 'PRACTICE';
  onSubmit: (
    answers: Array<{ questionId: string; answer: string }>,
    timeSpentSeconds: number
  ) => Promise<QuizResultData>;
  onComplete?: (result: QuizResultData) => void;
  onBack?: () => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  quizId,
  title,
  description,
  questions,
  passingScore = 70,
  timeLimit,
  mode = 'EXAM',
  onSubmit,
  onComplete,
  onBack,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewState, setViewState] = useState<'PLAY' | 'RESULT' | 'REVIEW'>('PLAY');
  const [resultData, setResultData] = useState<QuizResultData | null>(null);

  // Timer interval
  useEffect(() => {
    if (viewState !== 'PLAY') return;

    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [viewState]);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] || '' : '';
  const isQuestionChecked = currentQuestion ? !!checkedQuestions[currentQuestion.id] : false;

  const answeredCount = useMemo(() => {
    return Object.values(answers).filter((a) => a && a.trim() !== '').length;
  }, [answers]);

  const progressPercentage = useMemo(() => {
    if (!questions || questions.length === 0) return 0;
    return Math.round(((currentIndex + 1) / questions.length) * 100);
  }, [currentIndex, questions]);

  const handleSelectAnswer = useCallback(
    (val: string) => {
      if (!currentQuestion || isQuestionChecked) return;
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: val,
      }));
    },
    [currentQuestion, isQuestionChecked]
  );

  const handleCheckAnswer = () => {
    if (!currentQuestion) return;
    setCheckedQuestions((prev) => ({
      ...prev,
      [currentQuestion.id]: true,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const submissionAnswers = questions.map((q) => ({
        questionId: q.id,
        answer: (answers[q.id] || '').trim(),
      }));

      const result = await onSubmit(submissionAnswers, timeSpent);
      
      // Ensure breakdown items have questionType, options, and instruction from questions if missing
      const enrichedBreakdown = (result.breakdown || []).map((b) => {
        const q = questions.find((item) => item.id === b.questionId);
        return {
          ...b,
          instruction: b.instruction || q?.instruction,
          questionType: b.questionType || q?.questionType,
          options: b.options || q?.options,
          correctAnswer: b.correctAnswer || q?.correctAnswer || '',
        };
      });

      const correctCount =
        result.correctCount ?? enrichedBreakdown.filter((b) => b.isCorrect).length;
      const incorrectCount =
        result.incorrectCount ?? (enrichedBreakdown.length - correctCount);

      const enrichedResult: QuizResultData = {
        ...result,
        correctCount,
        incorrectCount,
        breakdown: enrichedBreakdown,
      };

      setResultData(enrichedResult);
      setViewState('RESULT');
      if (onComplete) {
        onComplete(enrichedResult);
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      // Fallback local calculation if offline / mock
      const localBreakdown = questions.map((q) => {
        const sub = (answers[q.id] || '').trim();
        const corr = (q.correctAnswer || '').trim();
        const isCorr = corr ? sub.toLowerCase() === corr.toLowerCase() : false;
        const pts = q.points || 20;
        return {
          questionId: q.id,
          prompt: q.prompt,
          instruction: q.instruction,
          questionType: q.questionType,
          options: q.options,
          submittedAnswer: sub || null,
          correctAnswer: corr || '(Answer pending server grading)',
          isCorrect: isCorr,
          points: pts,
          pointsEarned: isCorr ? pts : 0,
          explanation: q.explanation,
          explanationVi: q.explanationVi,
        };
      });

      const maxScore = localBreakdown.reduce((acc, b) => acc + b.points, 0);
      const earnedScore = localBreakdown.reduce((acc, b) => acc + b.pointsEarned, 0);
      const percentage = maxScore > 0 ? Math.round((earnedScore / maxScore) * 100) : 0;
      const correctCount = localBreakdown.filter((b) => b.isCorrect).length;

      const fallbackResult: QuizResultData = {
        quizId,
        quizTitle: title,
        score: earnedScore,
        maxScore,
        percentage,
        passed: percentage >= passingScore,
        passingScore,
        correctCount,
        incorrectCount: questions.length - correctCount,
        timeSpentSeconds: timeSpent,
        breakdown: localBreakdown,
      };

      setResultData(fallbackResult);
      setViewState('RESULT');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setCheckedQuestions({});
    setCurrentIndex(0);
    setTimeSpent(0);
    setResultData(null);
    setViewState('PLAY');
  };

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render Result View
  if (viewState === 'RESULT' && resultData) {
    return (
      <QuizResultCard
        result={resultData}
        onRetry={handleRetry}
        onReview={() => setViewState('REVIEW')}
        onBack={onBack}
      />
    );
  }

  // Render Review View
  if (viewState === 'REVIEW' && resultData) {
    return (
      <QuizReviewView
        quizTitle={title}
        breakdown={resultData.breakdown}
        questions={questions}
        onBackToResult={() => setViewState('RESULT')}
        onRetry={handleRetry}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
        No questions available for this exercise.
      </div>
    );
  }

  const isCurrentCorrect =
    currentQuestion &&
    currentAnswer.trim().toLowerCase() ===
      (currentQuestion.correctAnswer || '').trim().toLowerCase();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* 1. Top Header Bar: Progress, Question Counter & Timer */}
      <div className="rounded-2xl border bg-card p-4 shadow-xs sm:p-5">
        {description && (
          <p className="mb-3 border-b border-border/60 pb-2 text-xs text-muted-foreground">
            {description}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Go back"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <span className="font-extrabold text-foreground sm:text-sm">
                Question {currentIndex + 1}
              </span>
              <span className="text-muted-foreground"> of {questions.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>{formatTimer(timeSpent)}</span>
              {timeLimit && <span> / {timeLimit}m</span>}
            </div>

            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-bold text-primary">
              {answeredCount}/{questions.length} Answered
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3.5 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 2. Question Card */}
      <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
        {/* Instruction Badge */}
        {currentQuestion.instruction && (
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {currentQuestion.instruction}
          </div>
        )}

        {/* Question Prompt */}
        <h3 className="text-lg font-bold leading-relaxed text-foreground sm:text-xl">
          {currentQuestion.prompt}
        </h3>

        {/* Dynamic Question Renderer by QuestionType */}
        <div className="mt-6">
          {currentQuestion.questionType === 'MULTIPLE_CHOICE' && (
            <MultipleChoiceRenderer
              options={currentQuestion.options}
              selectedAnswer={currentAnswer}
              onSelectAnswer={handleSelectAnswer}
              disabled={mode === 'PRACTICE' && isQuestionChecked}
              correctAnswer={currentQuestion.correctAnswer}
              showFeedback={mode === 'PRACTICE' && isQuestionChecked}
            />
          )}

          {currentQuestion.questionType === 'TRUE_FALSE' && (
            <TrueFalseRenderer
              selectedAnswer={currentAnswer}
              onSelectAnswer={handleSelectAnswer}
              disabled={mode === 'PRACTICE' && isQuestionChecked}
              correctAnswer={currentQuestion.correctAnswer}
              showFeedback={mode === 'PRACTICE' && isQuestionChecked}
            />
          )}

          {currentQuestion.questionType === 'FILL_BLANK' && (
            <FillBlankRenderer
              selectedAnswer={currentAnswer}
              onSelectAnswer={handleSelectAnswer}
              disabled={mode === 'PRACTICE' && isQuestionChecked}
              correctAnswer={currentQuestion.correctAnswer}
              showFeedback={mode === 'PRACTICE' && isQuestionChecked}
            />
          )}

          {currentQuestion.questionType === 'MATCHING' && (
            <MatchingRenderer
              options={currentQuestion.options}
              selectedAnswer={currentAnswer}
              onSelectAnswer={handleSelectAnswer}
              disabled={mode === 'PRACTICE' && isQuestionChecked}
              correctAnswer={currentQuestion.correctAnswer}
              showFeedback={mode === 'PRACTICE' && isQuestionChecked}
            />
          )}

          {currentQuestion.questionType === 'SENTENCE_ORDERING' && (
            <SentenceOrderingRenderer
              options={currentQuestion.options}
              selectedAnswer={currentAnswer}
              onSelectAnswer={handleSelectAnswer}
              disabled={mode === 'PRACTICE' && isQuestionChecked}
              correctAnswer={currentQuestion.correctAnswer}
              showFeedback={mode === 'PRACTICE' && isQuestionChecked}
            />
          )}

          {currentQuestion.questionType === 'SENTENCE_CORRECTION' && (
            <SentenceCorrectionRenderer
              options={currentQuestion.options}
              selectedAnswer={currentAnswer}
              onSelectAnswer={handleSelectAnswer}
              disabled={mode === 'PRACTICE' && isQuestionChecked}
              correctAnswer={currentQuestion.correctAnswer}
              showFeedback={mode === 'PRACTICE' && isQuestionChecked}
            />
          )}
        </div>

        {/* Practice Mode Feedback Reveal */}
        {mode === 'PRACTICE' && isQuestionChecked && (
          <div className="mt-6 rounded-2xl border border-border/80 bg-accent/30 p-5 text-sm transition-all">
            <div className="flex items-center gap-2">
              {isCurrentCorrect ? (
                <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Excellent! Correct Answer</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 font-bold text-destructive">
                  <XCircle className="h-5 w-5" />
                  <span>Incorrect. The right answer is: {currentQuestion.correctAnswer}</span>
                </div>
              )}
            </div>

            {currentQuestion.explanation && (
              <p className="mt-2.5 text-foreground leading-relaxed">
                <span className="font-semibold text-muted-foreground">Explanation: </span>
                {currentQuestion.explanation}
              </p>
            )}

            {currentQuestion.explanationVi && (
              <p className="mt-2 border-t border-border/40 pt-2 text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Giải thích: </span>
                {currentQuestion.explanationVi}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 3. Navigation Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          id="quiz-prev-button"
          className="flex items-center gap-1.5 rounded-xl border border-input bg-card px-4 py-2.5 text-xs font-semibold text-foreground shadow-xs transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40 sm:text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Practice mode instant check button */}
          {mode === 'PRACTICE' && !isQuestionChecked && (
            <button
              type="button"
              disabled={!currentAnswer}
              onClick={handleCheckAnswer}
              id="quiz-check-button"
              className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary transition-all hover:bg-primary/20 disabled:pointer-events-none disabled:opacity-40 sm:text-sm"
            >
              <Check className="h-4 w-4" />
              <span>Check Answer</span>
            </button>
          )}

          {/* Next or Submit Button */}
          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              id="quiz-next-button"
              className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 sm:text-sm"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting || answeredCount === 0}
              onClick={handleSubmitQuiz}
              id="quiz-submit-button"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-500 disabled:pointer-events-none disabled:opacity-50 sm:text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Quiz</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

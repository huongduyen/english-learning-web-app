import React, { useState } from 'react';
import { QuizQuestion } from '../../types/quiz';
import { ListeningResultData } from '../../types/listening';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
  RotateCcw,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface ListeningQuestionsProps {
  lessonId: string;
  questions: QuizQuestion[];
  onSubmit: (answers: Array<{ questionId: string; answer: string }>) => Promise<ListeningResultData>;
  onSuccess?: (result: ListeningResultData) => void;
}

export const ListeningQuestions: React.FC<ListeningQuestionsProps> = ({
  questions,
  onSubmit,
  onSuccess,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ListeningResultData | null>(null);

  if (!questions || questions.length === 0) {
    return (
      <div
        id="questions-empty-state"
        className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-xs text-muted-foreground"
      >
        <HelpCircle className="mx-auto h-8 w-8 text-muted-foreground/60" />
        <p className="mt-2 font-semibold text-foreground">No questions available for this lesson.</p>
        <p className="mt-1">Enjoy the audio listening practice and transcript!</p>
      </div>
    );
  }

  const handleSelect = (questionId: string, optionId: string) => {
    if (result) return; // locked once submitted
    setValidationError(null);
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (result) return;

    // Validate that all questions are answered
    const unanswered = questions.filter((q) => !answers[q.id] || answers[q.id].trim() === '');
    if (unanswered.length > 0) {
      setValidationError(`Please answer all ${questions.length} questions before submitting.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setValidationError(null);
      const payload = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
      const res = await onSubmit(payload);
      setResult(res);
      if (onSuccess) onSuccess(res);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit answers. Please try again.';
      setValidationError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setAnswers({});
    setValidationError(null);
  };

  return (
    <div id="listening-questions-container" className="space-y-6">
      {/* Result Card if submitted */}
      {result && (
        <div
          id="listening-result-card"
          className={`rounded-2xl border p-6 shadow-sm transition-all ${
            result.passed
              ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20'
              : 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                  result.passed
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                }`}
              >
                {result.passed ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <XCircle className="h-6 w-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground sm:text-lg">
                    {result.passed ? 'Excellent Work!' : 'Keep Practicing!'}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      result.passed
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {result.passed ? 'Passed' : 'Needs Review'}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  You scored {result.score} / {result.maxScore} points ({result.percentage}%) &middot;{' '}
                  {result.correctCount} of {questions.length} correct
                </p>
              </div>
            </div>

            <button
              type="button"
              id="try-again-btn"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 self-start rounded-xl border border-input bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-xs hover:bg-accent"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Questions Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((question, index) => {
          const breakdownItem = result?.breakdown?.find((b) => b.questionId === question.id);
          const selectedAnswer = answers[question.id];

          // Normalize options: if array, use it; if true/false, create True / False options
          let options: Array<{ id: string; text: string }> = [];
          if (Array.isArray(question.options)) {
            options = question.options;
          } else if (question.questionType === 'TRUE_FALSE') {
            options = [
              { id: 'true', text: 'True' },
              { id: 'false', text: 'False' },
            ];
          }

          return (
            <div
              key={question.id}
              id={`question-block-${question.id}`}
              className={`rounded-2xl border bg-card p-5 shadow-sm transition-colors ${
                breakdownItem
                  ? breakdownItem.isCorrect
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-rose-500/40 bg-rose-500/5'
                  : 'border-border'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground sm:text-base">
                    {question.prompt}
                  </h4>
                </div>

                {breakdownItem && (
                  <div className="shrink-0">
                    {breakdownItem.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                        <XCircle className="h-4 w-4" /> Incorrect
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="mt-4 space-y-2.5">
                {options.map((opt) => {
                  const isChecked = selectedAnswer === opt.id;
                  const isCorrectAnswer =
                    breakdownItem &&
                    (breakdownItem.correctAnswer.toLowerCase() === opt.id.toLowerCase() ||
                      breakdownItem.correctAnswer.toLowerCase() === opt.text.toLowerCase());
                  const isWrongAnswer = breakdownItem && isChecked && !breakdownItem.isCorrect;

                  let optClass =
                    'border-border bg-card hover:bg-accent/50 text-foreground';
                  if (isChecked && !breakdownItem) {
                    optClass = 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/40';
                  } else if (isCorrectAnswer) {
                    optClass = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500/40';
                  } else if (isWrongAnswer) {
                    optClass = 'border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/40';
                  }

                  return (
                    <label
                      key={opt.id}
                      htmlFor={`opt-${question.id}-${opt.id}`}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 text-xs sm:text-sm transition-all ${optClass} ${
                        result ? 'cursor-default' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          id={`opt-${question.id}-${opt.id}`}
                          name={`question-${question.id}`}
                          value={opt.id}
                          checked={isChecked}
                          disabled={!!result}
                          onChange={() => handleSelect(question.id, opt.id)}
                          className="h-4 w-4 text-primary focus:ring-primary/40"
                        />
                        <span>{opt.text}</span>
                      </div>

                      {breakdownItem && isCorrectAnswer && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      )}
                      {breakdownItem && isWrongAnswer && (
                        <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                      )}
                    </label>
                  );
                })}
              </div>

              {/* Explanation after submission */}
              {breakdownItem && breakdownItem.explanation && (
                <div className="mt-3.5 rounded-xl border border-border/80 bg-background/60 p-3 text-xs leading-relaxed text-muted-foreground">
                  <p className="font-semibold text-foreground">Explanation:</p>
                  <p className="mt-0.5">{breakdownItem.explanation}</p>
                  {breakdownItem.explanationVi && (
                    <p className="mt-1 italic text-muted-foreground/80">
                      {breakdownItem.explanationVi}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Validation Alert */}
        {validationError && (
          <div
            id="questions-validation-alert"
            className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Submit Button */}
        {!result && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              id="submit-listening-answers-button"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Evaluating Answers...
                </>
              ) : (
                <>
                  Submit Answers
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

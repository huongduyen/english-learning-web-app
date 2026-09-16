import React from 'react';
import { Check, X, HelpCircle } from 'lucide-react';

interface Props {
  selectedAnswer: string;
  onSelectAnswer: (answer: string) => void;
  disabled?: boolean;
  correctAnswer?: string;
  showFeedback?: boolean;
}

export const FillBlankRenderer: React.FC<Props> = ({
  selectedAnswer,
  onSelectAnswer,
  disabled = false,
  correctAnswer,
  showFeedback = false,
}) => {
  const isCorrect =
    correctAnswer &&
    correctAnswer
      .split(/\s*\|\s*/)
      .map((s) => s.toLowerCase().trim())
      .includes(selectedAnswer.toLowerCase().trim());

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <label
          htmlFor="fill-blank-input"
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Type your answer
        </label>
        <div className="relative">
          <input
            id="fill-blank-input"
            type="text"
            disabled={disabled}
            value={selectedAnswer}
            onChange={(e) => onSelectAnswer(e.target.value)}
            placeholder="Type your answer here..."
            autoComplete="off"
            className={`w-full rounded-lg border bg-background px-4 py-3 text-base text-foreground shadow-sm transition-all focus:outline-none focus:ring-2 ${
              showFeedback
                ? isCorrect
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/50'
                  : 'border-destructive bg-destructive/10 text-destructive ring-1 ring-destructive/50'
                : 'border-input focus:border-primary focus:ring-primary/20'
            }`}
          />
          {showFeedback && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {isCorrect ? (
                <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <Check className="h-4 w-4" /> Correct
                </div>
              ) : (
                <div className="flex items-center gap-1 rounded-full bg-destructive/20 px-2 py-1 text-xs font-bold text-destructive">
                  <X className="h-4 w-4" /> Incorrect
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showFeedback && !isCorrect && correctAnswer && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-200">
          <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <span className="font-semibold">Correct Answer: </span>
            <span className="font-bold underline">{correctAnswer}</span>
          </div>
        </div>
      )}
    </div>
  );
};

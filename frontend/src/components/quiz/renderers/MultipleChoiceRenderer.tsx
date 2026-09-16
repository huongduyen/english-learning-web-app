import React from 'react';
import { MultipleChoiceOption } from '../../../types/quiz';
import { Check, X } from 'lucide-react';

interface Props {
  options?: MultipleChoiceOption[] | string[];
  selectedAnswer: string;
  onSelectAnswer: (answer: string) => void;
  disabled?: boolean;
  correctAnswer?: string;
  showFeedback?: boolean;
}

export const MultipleChoiceRenderer: React.FC<Props> = ({
  options = [],
  selectedAnswer,
  onSelectAnswer,
  disabled = false,
  correctAnswer,
  showFeedback = false,
}) => {
  // Normalize options to [{ id, text }]
  const normalizedOptions: MultipleChoiceOption[] = options.map((opt) => {
    if (typeof opt === 'string') {
      return { id: opt, text: opt };
    }
    return opt;
  });

  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="grid gap-3 sm:grid-cols-1">
      {normalizedOptions.map((opt, idx) => {
        const isSelected =
          selectedAnswer.toLowerCase() === opt.id.toLowerCase() ||
          selectedAnswer.toLowerCase() === opt.text.toLowerCase();

        const isCorrect =
          correctAnswer &&
          (correctAnswer.toLowerCase() === opt.id.toLowerCase() ||
            correctAnswer.toLowerCase() === opt.text.toLowerCase());

        let buttonStyle =
          'border-border bg-card hover:border-primary/50 hover:bg-accent/40 text-foreground';

        if (showFeedback) {
          if (isCorrect) {
            buttonStyle = 'border-emerald-500/80 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500/50';
          } else if (isSelected && !isCorrect) {
            buttonStyle = 'border-destructive/80 bg-destructive/10 text-destructive font-semibold ring-1 ring-destructive/50';
          } else {
            buttonStyle = 'border-border/60 bg-card/40 opacity-60 text-muted-foreground';
          }
        } else if (isSelected) {
          buttonStyle = 'border-primary bg-primary/10 text-primary font-semibold shadow-sm ring-2 ring-primary/30';
        }

        return (
          <button
            key={opt.id || idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelectAnswer(opt.id || opt.text)}
            className={`group relative flex items-center justify-between rounded-xl border p-4 text-left transition-all ${buttonStyle} ${
              disabled ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                  showFeedback && isCorrect
                    ? 'bg-emerald-500 text-white'
                    : showFeedback && isSelected && !isCorrect
                      ? 'bg-destructive text-white'
                      : isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
                }`}
              >
                {letters[idx] || idx + 1}
              </span>
              <span className="text-sm font-medium sm:text-base">{opt.text}</span>
            </div>

            {showFeedback && isCorrect && (
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4" />
                <span>Correct</span>
              </div>
            )}

            {showFeedback && isSelected && !isCorrect && (
              <div className="flex items-center gap-1 text-xs font-bold text-destructive">
                <X className="h-4 w-4" />
                <span>Selected</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

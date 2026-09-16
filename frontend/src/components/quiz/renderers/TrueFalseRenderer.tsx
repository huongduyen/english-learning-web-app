import React from 'react';
import { CheckCircle2, XCircle, Check, X } from 'lucide-react';

interface Props {
  selectedAnswer: string;
  onSelectAnswer: (answer: string) => void;
  disabled?: boolean;
  correctAnswer?: string;
  showFeedback?: boolean;
}

export const TrueFalseRenderer: React.FC<Props> = ({
  selectedAnswer,
  onSelectAnswer,
  disabled = false,
  correctAnswer,
  showFeedback = false,
}) => {
  const choices = [
    { value: 'true', label: 'True', icon: CheckCircle2 },
    { value: 'false', label: 'False', icon: XCircle },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {choices.map((choice) => {
        const isSelected = selectedAnswer.toLowerCase() === choice.value;
        const isCorrect = correctAnswer && correctAnswer.toLowerCase() === choice.value;
        const Icon = choice.icon;

        let style =
          'border-border bg-card hover:border-primary/50 hover:bg-accent/40 text-foreground';

        if (showFeedback) {
          if (isCorrect) {
            style = 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold ring-2 ring-emerald-500/40';
          } else if (isSelected && !isCorrect) {
            style = 'border-destructive bg-destructive/10 text-destructive font-semibold ring-2 ring-destructive/40';
          } else {
            style = 'border-border/50 bg-card/40 opacity-50 text-muted-foreground';
          }
        } else if (isSelected) {
          style = 'border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/30';
        }

        return (
          <button
            key={choice.value}
            type="button"
            disabled={disabled}
            onClick={() => onSelectAnswer(choice.value)}
            className={`flex flex-col items-center justify-center gap-3 rounded-2xl border p-6 text-center transition-all ${style} ${
              disabled ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <Icon
              className={`h-8 w-8 ${
                showFeedback && isCorrect
                  ? 'text-emerald-500'
                  : showFeedback && isSelected && !isCorrect
                    ? 'text-destructive'
                    : isSelected
                      ? 'text-primary'
                      : 'text-muted-foreground'
              }`}
            />
            <span className="text-base font-bold sm:text-lg">{choice.label}</span>

            {showFeedback && isCorrect && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5" /> Correct Answer
              </span>
            )}
            {showFeedback && isSelected && !isCorrect && (
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/20 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                <X className="h-3.5 w-3.5" /> Your Choice
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

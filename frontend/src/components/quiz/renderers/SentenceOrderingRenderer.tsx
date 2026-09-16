import React, { useMemo } from 'react';
import { SentenceOrderingOptions } from '../../../types/quiz';
import { RotateCcw, Undo2, Check, X } from 'lucide-react';

interface Props {
  options?: SentenceOrderingOptions | string[];
  selectedAnswer: string;
  onSelectAnswer: (answer: string) => void;
  disabled?: boolean;
  correctAnswer?: string;
  showFeedback?: boolean;
}

export const SentenceOrderingRenderer: React.FC<Props> = ({
  options,
  selectedAnswer,
  onSelectAnswer,
  disabled = false,
  correctAnswer,
  showFeedback = false,
}) => {
  // Raw tokens list
  const rawTokens: string[] = useMemo(() => {
    if (!options) return [];
    if (Array.isArray(options)) return options;
    if ('tokens' in options && Array.isArray(options.tokens)) return options.tokens;
    return [];
  }, [options]);

  // Selected tokens ordered array
  const orderedTokens: string[] = useMemo(() => {
    if (!selectedAnswer) return [];
    // We can join with space, but tokens could be words or multi-word chunks
    // So we match tokens sequentially from selectedAnswer
    const words = selectedAnswer.split(' ').filter(Boolean);
    return words;
  }, [selectedAnswer]);

  // Available tokens remaining in pool
  // Count frequency of tokens used
  const availableTokens: string[] = useMemo(() => {
    const remaining = [...rawTokens];
    for (const token of orderedTokens) {
      const idx = remaining.indexOf(token);
      if (idx !== -1) {
        remaining.splice(idx, 1);
      }
    }
    return remaining;
  }, [rawTokens, orderedTokens]);

  const handleAddToken = (token: string) => {
    if (disabled) return;
    const next = [...orderedTokens, token].join(' ');
    onSelectAnswer(next);
  };

  const handleRemoveTokenAt = (idx: number) => {
    if (disabled) return;
    const nextList = [...orderedTokens];
    nextList.splice(idx, 1);
    onSelectAnswer(nextList.join(' '));
  };

  const handleUndo = () => {
    if (disabled || orderedTokens.length === 0) return;
    const nextList = [...orderedTokens];
    nextList.pop();
    onSelectAnswer(nextList.join(' '));
  };

  const handleReset = () => {
    if (disabled) return;
    onSelectAnswer('');
  };

  const isCorrect =
    correctAnswer &&
    selectedAnswer.trim().toLowerCase().replace(/[.,!?;:]/g, '') ===
      correctAnswer.trim().toLowerCase().replace(/[.,!?;:]/g, '');

  return (
    <div className="space-y-5">
      {/* 1. Constructed Sentence Target Area */}
      <div className="rounded-2xl border border-dashed border-border bg-card/60 p-5 shadow-xs">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Constructed Sentence
          </span>
          {!disabled && orderedTokens.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleUndo}
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Undo2 className="h-3 w-3" /> Undo
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-xs font-medium text-destructive transition-colors hover:underline"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </div>
          )}
        </div>

        <div className="flex min-h-[56px] flex-wrap items-center gap-2 rounded-xl border border-input bg-background/80 p-3">
          {orderedTokens.length === 0 ? (
            <span className="text-xs italic text-muted-foreground sm:text-sm">
              Tap the word chips below in the correct grammatical order...
            </span>
          ) : (
            orderedTokens.map((token, idx) => (
              <button
                key={`${token}-${idx}`}
                type="button"
                disabled={disabled}
                onClick={() => handleRemoveTokenAt(idx)}
                className={`group flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary transition-all hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 ${
                  disabled ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <span>{token}</span>
                {!disabled && (
                  <span className="text-xs opacity-60 group-hover:opacity-100">×</span>
                )}
              </button>
            ))
          )}
        </div>

        {showFeedback && (
          <div className="mt-3 flex items-center gap-2">
            {isCorrect ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4" /> Correct sequence!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-destructive">
                <X className="h-4 w-4" /> Sequence needs adjustment
              </span>
            )}
          </div>
        )}
      </div>

      {/* 2. Word Pool Bank */}
      <div className="rounded-2xl border bg-card p-5 shadow-xs">
        <span className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Word Bank (Tap to add)
        </span>
        <div className="flex flex-wrap gap-2.5">
          {availableTokens.map((token, idx) => (
            <button
              key={`${token}-${idx}`}
              type="button"
              disabled={disabled}
              onClick={() => handleAddToken(token)}
              className="rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground shadow-xs transition-all hover:border-primary hover:bg-accent hover:shadow-sm active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              {token}
            </button>
          ))}
          {availableTokens.length === 0 && orderedTokens.length > 0 && (
            <span className="text-xs text-muted-foreground">
              All words placed in sentence. Click Submit when ready.
            </span>
          )}
        </div>
      </div>

      {/* Reveal correct sentence in feedback mode */}
      {showFeedback && !isCorrect && correctAnswer && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-900 dark:text-emerald-100">
          <span className="font-bold">Correct Sentence: </span>
          <span className="font-semibold underline">{correctAnswer}</span>
        </div>
      )}
    </div>
  );
};

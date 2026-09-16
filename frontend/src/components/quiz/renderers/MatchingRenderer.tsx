import React, { useState, useMemo } from 'react';
import { MatchingOptions, MatchingPair } from '../../../types/quiz';
import { Link2, RotateCcw, Check, X } from 'lucide-react';

interface Props {
  options?: MatchingOptions | any;
  selectedAnswer: string;
  onSelectAnswer: (answer: string) => void;
  disabled?: boolean;
  correctAnswer?: string;
  showFeedback?: boolean;
}

const PAIR_COLORS = [
  'border-blue-500 bg-blue-500/15 text-blue-700 dark:text-blue-300',
  'border-purple-500 bg-purple-500/15 text-purple-700 dark:text-purple-300',
  'border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300',
  'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  'border-pink-500 bg-pink-500/15 text-pink-700 dark:text-pink-300',
];

export const MatchingRenderer: React.FC<Props> = ({
  options,
  selectedAnswer,
  onSelectAnswer,
  disabled = false,
  correctAnswer,
  showFeedback = false,
}) => {
  const [activeLeftId, setActiveLeftId] = useState<string | null>(null);

  // Parse pairs
  const rawPairs: MatchingPair[] = useMemo(() => {
    if (!options) return [];
    if (Array.isArray(options.pairs)) return options.pairs;
    if (Array.isArray(options)) return options;
    return [];
  }, [options]);

  // Parse current user matches from string: "1:a,2:b" -> Map<leftId, rightId>
  const userMatches = useMemo(() => {
    const map = new Map<string, string>();
    if (!selectedAnswer) return map;
    const tokens = selectedAnswer.split(',');
    tokens.forEach((t) => {
      const [l, r] = t.split(':');
      if (l && r) map.set(l.trim(), r.trim());
    });
    return map;
  }, [selectedAnswer]);

  // Parse correct matches: "1:a,2:b" -> Map<leftId, rightId>
  const correctMatches = useMemo(() => {
    const map = new Map<string, string>();
    if (!correctAnswer) return map;
    const tokens = correctAnswer.split(',');
    tokens.forEach((t) => {
      const [l, r] = t.split(':');
      if (l && r) map.set(l.trim().toLowerCase(), r.trim().toLowerCase());
    });
    return map;
  }, [correctAnswer]);

  // Shuffled right items for presentation
  const rightItems = useMemo(() => {
    // Keep consistent order based on hash
    return [...rawPairs].sort((a, b) => a.right.localeCompare(b.right));
  }, [rawPairs]);

  const handleLeftClick = (leftId: string) => {
    if (disabled) return;
    if (activeLeftId === leftId) {
      setActiveLeftId(null);
    } else {
      setActiveLeftId(leftId);
    }
  };

  const handleRightClick = (rightId: string) => {
    if (disabled || !activeLeftId) return;

    const newMap = new Map(userMatches);
    // If another left was using this right, remove it
    for (const [l, r] of newMap.entries()) {
      if (r === rightId) newMap.delete(l);
    }

    newMap.set(activeLeftId, rightId);
    setActiveLeftId(null);

    // Serialize back: "1:a,2:b"
    const serialized = Array.from(newMap.entries())
      .map(([l, r]) => `${l}:${r}`)
      .join(',');
    onSelectAnswer(serialized);
  };

  const handleClearPair = (leftId: string) => {
    if (disabled) return;
    const newMap = new Map(userMatches);
    newMap.delete(leftId);
    const serialized = Array.from(newMap.entries())
      .map(([l, r]) => `${l}:${r}`)
      .join(',');
    onSelectAnswer(serialized);
  };

  const handleResetAll = () => {
    if (disabled) return;
    setActiveLeftId(null);
    onSelectAnswer('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {disabled
            ? 'Matched items:'
            : activeLeftId
              ? 'Now select a matching item on the right column 👉'
              : 'Click an item on the left, then click its pair on the right'}
        </span>
        {!disabled && userMatches.size > 0 && (
          <button
            type="button"
            onClick={handleResetAll}
            className="flex items-center gap-1 font-medium text-destructive hover:underline"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset all
          </button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Concepts / Terms
          </h4>
          {rawPairs.map((pair, idx) => {
            const isPaired = userMatches.has(pair.leftId);
            const pairedRightId = userMatches.get(pair.leftId);
            const isCurrentActive = activeLeftId === pair.leftId;
            const colorClass = PAIR_COLORS[idx % PAIR_COLORS.length];

            const isPairCorrect =
              showFeedback &&
              pairedRightId &&
              correctMatches.get(pair.leftId.toLowerCase()) === pairedRightId.toLowerCase();

            let borderClass = 'border-border bg-card hover:border-primary/40 text-foreground';

            if (showFeedback) {
              if (isPairCorrect) {
                borderClass = 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200';
              } else if (isPaired && !isPairCorrect) {
                borderClass = 'border-destructive bg-destructive/10 text-destructive';
              }
            } else if (isCurrentActive) {
              borderClass = 'border-primary bg-primary/10 ring-2 ring-primary/40 font-semibold';
            } else if (isPaired) {
              borderClass = `${colorClass} font-medium`;
            }

            return (
              <div
                key={pair.leftId}
                onClick={() => handleLeftClick(pair.leftId)}
                className={`flex items-center justify-between rounded-xl border p-3.5 text-sm transition-all ${borderClass} ${
                  disabled ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <span className="font-semibold">{pair.left}</span>
                {isPaired && (
                  <div className="flex items-center gap-1.5">
                    {showFeedback ? (
                      isPairCorrect ? (
                        <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <Check className="h-3 w-3" /> Correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 rounded-full bg-destructive/20 px-2 py-0.5 text-xs font-bold text-destructive">
                          <X className="h-3 w-3" /> Incorrect
                        </span>
                      )
                    ) : (
                      <span className="flex items-center gap-1 rounded-md bg-background px-2 py-0.5 text-xs font-bold shadow-xs">
                        <Link2 className="h-3 w-3 text-primary" /> Paired
                      </span>
                    )}
                    {!disabled && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearPair(pair.leftId);
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Descriptions / Matches
          </h4>
          {rightItems.map((pair) => {
            let matchedLeftId: string | null = null;
            for (const [l, r] of userMatches.entries()) {
              if (r === pair.rightId) {
                matchedLeftId = l;
                break;
              }
            }

            const isMatched = matchedLeftId !== null;
            const leftIndex = rawPairs.findIndex((p) => p.leftId === matchedLeftId);
            const colorClass = leftIndex >= 0 ? PAIR_COLORS[leftIndex % PAIR_COLORS.length] : '';

            let itemClass = 'border-border bg-card hover:border-primary/40 text-foreground';

            if (isMatched) {
              itemClass = `${colorClass} font-medium`;
            }

            return (
              <button
                key={pair.rightId}
                type="button"
                disabled={disabled}
                onClick={() => handleRightClick(pair.rightId)}
                className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-sm transition-all ${itemClass} ${
                  disabled ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <span>{pair.right}</span>
                {isMatched && (
                  <span className="rounded-md bg-background px-2 py-0.5 text-xs font-bold shadow-xs">
                    Linked
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

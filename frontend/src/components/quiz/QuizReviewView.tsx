import React, { useState, useMemo } from 'react';
import { QuestionBreakdown, QuizQuestion } from '../../types/quiz';
import { QuestionType } from '../../types/grammar';
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Check,
  X,
  CheckCheck,
  Filter,
} from 'lucide-react';

interface Props {
  quizTitle: string;
  breakdown: QuestionBreakdown[];
  questions?: QuizQuestion[];
  onBackToResult: () => void;
  onRetry: () => void;
}

export const QuizReviewView: React.FC<Props> = ({
  quizTitle,
  breakdown,
  questions = [],
  onBackToResult,
  onRetry,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'INCORRECT' | 'CORRECT'>('ALL');

  // Question lookup map
  const questionMap = useMemo(() => {
    const map = new Map<string, QuizQuestion>();
    questions.forEach((q) => {
      map.set(q.id, q);
    });
    return map;
  }, [questions]);

  // Filtered breakdown
  const filteredBreakdown = useMemo(() => {
    if (filterMode === 'INCORRECT') {
      return breakdown.filter((item) => !item.isCorrect);
    }
    if (filterMode === 'CORRECT') {
      return breakdown.filter((item) => item.isCorrect);
    }
    return breakdown;
  }, [breakdown, filterMode]);

  const correctCount = useMemo(() => breakdown.filter((b) => b.isCorrect).length, [breakdown]);
  const incorrectCount = breakdown.length - correctCount;

  /**
   * Helper: Resolves human-readable label for Multiple Choice options
   */
  const resolveMultipleChoiceLabel = (
    value: string | null | undefined,
    options: any
  ): { label: string; text: string; full: string } | null => {
    if (!value || !Array.isArray(options)) return null;

    const cleanVal = value.trim().toLowerCase();
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

    // Try match by id
    const idxById = options.findIndex((opt: any) => {
      const optId = typeof opt === 'string' ? opt : opt?.id;
      return String(optId).trim().toLowerCase() === cleanVal;
    });

    if (idxById !== -1) {
      const opt = options[idxById];
      const text = typeof opt === 'string' ? opt : opt.text;
      const letter = letters[idxById] || String(idxById + 1);
      return { label: letter, text, full: `${letter}. ${text}` };
    }

    // Try match by text
    const idxByText = options.findIndex((opt: any) => {
      const optText = typeof opt === 'string' ? opt : opt?.text;
      return String(optText).trim().toLowerCase() === cleanVal;
    });

    if (idxByText !== -1) {
      const opt = options[idxByText];
      const text = typeof opt === 'string' ? opt : opt.text;
      const letter = letters[idxByText] || String(idxByText + 1);
      return { label: letter, text, full: `${letter}. ${text}` };
    }

    // Fallback if value is direct letter
    const letterIdx = ['a', 'b', 'c', 'd', 'e', 'f'].indexOf(cleanVal);
    if (letterIdx !== -1 && options[letterIdx]) {
      const opt = options[letterIdx];
      const text = typeof opt === 'string' ? opt : opt.text;
      const letter = letters[letterIdx];
      return { label: letter, text, full: `${letter}. ${text}` };
    }

    return { label: '', text: value, full: value };
  };

  /**
   * Helper: Formats matching pairs into human-readable list
   */
  const formatMatchingPairs = (
    pairString: string | null | undefined,
    pairsMeta: any
  ): Array<{ left: string; right: string }> => {
    if (!pairString) return [];
    const pairsList: Array<{ left: string; right: string }> = [];

    const availablePairs = pairsMeta?.pairs || (Array.isArray(pairsMeta) ? pairsMeta : []);
    const items = pairString.split(',').map((p) => p.trim());

    items.forEach((item) => {
      const parts = item.split(':').map((s) => s.trim());
      if (parts.length === 2) {
        const [leftId, rightId] = parts;
        const matched = availablePairs.find(
          (p: any) =>
            String(p.leftId).toLowerCase() === leftId.toLowerCase() &&
            String(p.rightId).toLowerCase() === rightId.toLowerCase()
        );

        if (matched) {
          pairsList.push({ left: matched.left, right: matched.right });
        } else {
          // Look up left and right separately if user matched differently
          const leftObj = availablePairs.find(
            (p: any) => String(p.leftId).toLowerCase() === leftId.toLowerCase()
          );
          const rightObj = availablePairs.find(
            (p: any) => String(p.rightId).toLowerCase() === rightId.toLowerCase()
          );
          pairsList.push({
            left: leftObj?.left || `Item ${leftId}`,
            right: rightObj?.right || `Option ${rightId}`,
          });
        }
      }
    });

    return pairsList;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* 1. Header Bar with Actions & Quick Filters */}
      <div className="rounded-2xl border bg-card p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToResult}
              id="review-back-button"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h3 className="text-base font-bold text-foreground">Detailed Answer Review</h3>
              <p className="text-xs text-muted-foreground">{quizTitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRetry}
            id="review-retry-button"
            className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary/20"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Retake Quiz</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
          <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> Filter:
          </span>

          <button
            type="button"
            onClick={() => setFilterMode('ALL')}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
              filterMode === 'ALL'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            All Questions ({breakdown.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('INCORRECT')}
            className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
              filterMode === 'INCORRECT'
                ? 'bg-destructive text-destructive-foreground shadow-xs'
                : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
            }`}
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>Incorrect ({incorrectCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('CORRECT')}
            className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
              filterMode === 'CORRECT'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Correct ({correctCount})</span>
          </button>
        </div>
      </div>

      {/* 2. Questions List */}
      {filteredBreakdown.length === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          No questions match the current filter.
        </div>
      ) : (
        <div className="space-y-5">
          {filteredBreakdown.map((item) => {
            // Find original question for full options and type if present
            const originalQ = questionMap.get(item.questionId);
            const questionType: QuestionType =
              item.questionType || originalQ?.questionType || 'MULTIPLE_CHOICE';
            const options = item.options || originalQ?.options;
            const instruction = item.instruction || originalQ?.instruction;

            // Resolve MC options
            const mcCorrect = resolveMultipleChoiceLabel(item.correctAnswer, options);
            const mcSubmitted = resolveMultipleChoiceLabel(item.submittedAnswer, options);

            // Question index in full list
            const originalIndex = breakdown.findIndex(
              (b) => b.questionId === item.questionId
            );
            const questionNumber = originalIndex !== -1 ? originalIndex + 1 : 1;

            return (
              <div
                key={item.questionId}
                className={`rounded-2xl border p-5 shadow-xs transition-all ${
                  item.isCorrect
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-destructive/30 bg-destructive/5'
                }`}
              >
                {/* Header: Question Number & Result Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        item.isCorrect
                          ? 'bg-emerald-500 text-white'
                          : 'bg-destructive text-white'
                      }`}
                    >
                      {questionNumber}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Question {questionNumber} of {breakdown.length}
                    </span>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                      {questionType.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.isCorrect ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        +{item.pointsEarned} pts
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-destructive/20 px-2.5 py-0.5 text-xs font-bold text-destructive">
                        <XCircle className="h-3.5 w-3.5" />
                        0 / {item.points || 20} pts
                      </span>
                    )}
                  </div>
                </div>

                {/* Instruction Badge */}
                {instruction && (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span>{instruction}</span>
                  </div>
                )}

                {/* Question Prompt */}
                <h4 className="mt-3 text-base font-bold leading-relaxed text-foreground">
                  {item.prompt}
                </h4>

                {/* 3. TYPE-SPECIFIC VISUAL ANSWER REVIEW */}
                <div className="mt-4 space-y-3">
                  {/* MULTIPLE CHOICE OPTIONS GRID */}
                  {questionType === 'MULTIPLE_CHOICE' && Array.isArray(options) && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Options & Results:
                      </span>
                      <div className="grid gap-2">
                        {options.map((opt: any, optIdx: number) => {
                          const optId = typeof opt === 'string' ? opt : opt.id;
                          const optText = typeof opt === 'string' ? opt : opt.text;
                          const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
                          const letter = letters[optIdx] || String(optIdx + 1);

                          const isOptionCorrect =
                            optId.toLowerCase() === (item.correctAnswer || '').toLowerCase() ||
                            optText.toLowerCase() === (item.correctAnswer || '').toLowerCase();

                          const isOptionSubmitted =
                            item.submittedAnswer &&
                            (optId.toLowerCase() === item.submittedAnswer.toLowerCase() ||
                              optText.toLowerCase() === item.submittedAnswer.toLowerCase());

                          let cardClasses =
                            'border-border/70 bg-card/60 text-muted-foreground';
                          let badgeNode = null;

                          if (isOptionCorrect) {
                            cardClasses =
                              'border-emerald-500/80 bg-emerald-500/15 text-emerald-950 dark:text-emerald-100 font-semibold ring-1 ring-emerald-500/40';
                            badgeNode = (
                              <span className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
                                <Check className="h-3 w-3" /> Correct Answer
                              </span>
                            );
                          }

                          if (isOptionSubmitted && !isOptionCorrect) {
                            cardClasses =
                              'border-destructive/80 bg-destructive/15 text-destructive font-semibold ring-1 ring-destructive/40';
                            badgeNode = (
                              <span className="flex items-center gap-1 rounded-md bg-destructive px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
                                <X className="h-3 w-3" /> Your Selection (Incorrect)
                              </span>
                            );
                          } else if (isOptionSubmitted && isOptionCorrect) {
                            badgeNode = (
                              <span className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
                                <CheckCheck className="h-3.5 w-3.5" /> Your Selection (Correct!)
                              </span>
                            );
                          }

                          return (
                            <div
                              key={optId || optIdx}
                              className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-sm transition-all ${cardClasses}`}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                    isOptionCorrect
                                      ? 'bg-emerald-600 text-white'
                                      : isOptionSubmitted
                                        ? 'bg-destructive text-white'
                                        : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {letter}
                                </span>
                                <span>{optText}</span>
                              </div>
                              {badgeNode}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TRUE / FALSE REVIEW */}
                  {questionType === 'TRUE_FALSE' && (
                    <div className="grid grid-cols-2 gap-3">
                      {['true', 'false'].map((val) => {
                        const isCorrectOption =
                          (item.correctAnswer || '').toLowerCase() === val;
                        const isSubmittedOption =
                          (item.submittedAnswer || '').toLowerCase() === val;

                        let style = 'border-border bg-card/60 text-muted-foreground';
                        if (isCorrectOption) {
                          style =
                            'border-emerald-500/80 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 font-bold ring-1 ring-emerald-500/40';
                        } else if (isSubmittedOption && !isCorrectOption) {
                          style =
                            'border-destructive/80 bg-destructive/15 text-destructive font-bold ring-1 ring-destructive/40';
                        }

                        return (
                          <div
                            key={val}
                            className={`flex items-center justify-between rounded-xl border p-3.5 text-sm ${style}`}
                          >
                            <span className="capitalize">{val}</span>
                            {isCorrectOption && (
                              <span className="flex items-center gap-1 rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                                <Check className="h-3 w-3" /> Correct
                              </span>
                            )}
                            {isSubmittedOption && !isCorrectOption && (
                              <span className="flex items-center gap-1 rounded bg-destructive px-2 py-0.5 text-[10px] font-bold text-white">
                                <X className="h-3 w-3" /> Your Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* MATCHING PAIRS REVIEW */}
                  {questionType === 'MATCHING' && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Correct Match Connections:
                      </span>
                      <div className="grid gap-2 sm:grid-cols-1">
                        {formatMatchingPairs(item.correctAnswer, options).map((pair, pIdx) => (
                          <div
                            key={pIdx}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm"
                          >
                            <span className="font-semibold text-foreground">{pair.left}</span>
                            <span className="text-muted-foreground">➔</span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-300">
                              {pair.right}
                            </span>
                          </div>
                        ))}
                      </div>

                      {!item.isCorrect && item.submittedAnswer && (
                        <div className="mt-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs">
                          <span className="font-semibold text-destructive">
                            Your submitted pairs:{' '}
                          </span>
                          <span className="text-muted-foreground">
                            {formatMatchingPairs(item.submittedAnswer, options)
                              .map((p) => `${p.left} ➔ ${p.right}`)
                              .join(' | ') || item.submittedAnswer}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SENTENCE ORDERING REVIEW */}
                  {questionType === 'SENTENCE_ORDERING' && (
                    <div className="space-y-2">
                      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5">
                        <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                          Correct Completed Sentence:
                        </span>
                        <p className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                          "{item.correctAnswer}"
                        </p>
                      </div>

                      {!item.isCorrect && (
                        <div className="rounded-xl border border-border/80 bg-background/80 p-3">
                          <span className="text-xs font-semibold text-muted-foreground">
                            Your Ordered Sentence:
                          </span>
                          <p className="mt-1 text-sm font-bold text-destructive">
                            "{item.submittedAnswer || '(No answer provided)'}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* FILL BLANK & SENTENCE CORRECTION COMPARISON */}
                  {(questionType === 'FILL_BLANK' || questionType === 'SENTENCE_CORRECTION') && (
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      <div className="rounded-xl border border-border/80 bg-background/80 p-3">
                        <span className="text-xs font-medium text-muted-foreground">
                          Your Submitted Answer:
                        </span>
                        <p
                          className={`mt-1 text-sm font-bold ${
                            item.isCorrect
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-destructive'
                          }`}
                        >
                          {item.submittedAnswer || '(No answer provided)'}
                        </p>
                      </div>

                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                        <span className="text-xs font-medium text-emerald-800 dark:text-emerald-200">
                          Correct Answer:
                        </span>
                        <p className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                          {item.correctAnswer}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* SUMMARY COMPARISON FOR MULTIPLE CHOICE / GENERAL */}
                  {questionType === 'MULTIPLE_CHOICE' && (
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      <div className="rounded-xl border border-border/80 bg-background/80 p-3">
                        <span className="text-xs font-medium text-muted-foreground">
                          Your Selected Answer:
                        </span>
                        <p
                          className={`mt-1 text-sm font-bold ${
                            item.isCorrect
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-destructive'
                          }`}
                        >
                          {mcSubmitted ? mcSubmitted.full : item.submittedAnswer || '(No answer provided)'}
                        </p>
                      </div>

                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                        <span className="text-xs font-medium text-emerald-800 dark:text-emerald-200">
                          Correct Answer:
                        </span>
                        <p className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                          {mcCorrect ? mcCorrect.full : item.correctAnswer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Explanations Section */}
                {(item.explanation || item.explanationVi) && (
                  <div className="mt-4 rounded-xl border border-border/60 bg-card/60 p-3.5 text-xs">
                    {item.explanation && (
                      <div className="flex items-start gap-2">
                        <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <p className="leading-relaxed text-foreground">
                          <span className="font-semibold text-muted-foreground">
                            Explanation:{' '}
                          </span>
                          {item.explanation}
                        </p>
                      </div>
                    )}

                    {item.explanationVi && (
                      <div className="mt-2 flex items-start gap-2 border-t border-border/40 pt-2">
                        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                        <p className="leading-relaxed text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            Giải thích chi tiết:{' '}
                          </span>
                          {item.explanationVi}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Bottom Navigation Button */}
      <div className="flex justify-center pb-8">
        <button
          type="button"
          onClick={onBackToResult}
          id="review-back-to-summary"
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Summary</span>
        </button>
      </div>
    </div>
  );
};

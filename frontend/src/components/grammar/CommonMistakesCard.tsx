import React from 'react';
import { XCircle, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

export interface CommonMistakeItem {
  incorrect: string;
  correct: string;
  reason: string;
  reasonVi: string;
}

interface Props {
  mistakes: CommonMistakeItem[];
}

export const CommonMistakesCard: React.FC<Props> = ({ mistakes }) => {
  if (!mistakes || mistakes.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <span>Common Mistakes & Traps to Avoid</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-1">
        {mistakes.map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-amber-500/30"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Incorrect */}
              <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-destructive">
                  <XCircle className="h-4 w-4 shrink-0" />
                  <span>INCORRECT (LỖI SAI THƯỜNG GẶP)</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-destructive/90 line-through decoration-destructive/60">
                  {item.incorrect}
                </p>
              </div>

              {/* Correct */}
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>CORRECT (CÂU CHUẨN XÁC)</span>
                </div>
                <p className="mt-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  {item.correct}
                </p>
              </div>
            </div>

            {/* Explanation / Why */}
            <div className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/40 p-3 text-xs">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  <span className="font-bold text-muted-foreground">Why: </span>
                  {item.reason}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-bold text-foreground">Giải thích: </span>
                  {item.reasonVi}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

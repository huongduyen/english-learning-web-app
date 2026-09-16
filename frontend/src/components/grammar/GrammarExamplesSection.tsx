import React from 'react';
import { Volume2, Sparkles, BookOpen } from 'lucide-react';

export interface GrammarExampleItem {
  english: string;
  vietnamese: string;
  highlight?: string;
  note?: string;
}

interface Props {
  examples: GrammarExampleItem[];
}

export const GrammarExamplesSection: React.FC<Props> = ({ examples }) => {
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!examples || examples.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
        <BookOpen className="h-4 w-4 text-primary" />
        <span>Contextual Examples (Ví Dụ Thực Tế)</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-1">
        {examples.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start justify-between gap-4 rounded-2xl border bg-card p-4 shadow-xs transition-all hover:border-primary/40 hover:bg-accent/20"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  {idx + 1}
                </span>
                <p className="text-base font-semibold text-foreground">
                  {item.english}
                </p>
              </div>

              <p className="pl-7 text-xs font-medium text-muted-foreground sm:text-sm">
                {item.vietnamese}
              </p>

              {item.note && (
                <div className="ml-7 inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span>{item.note}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleSpeak(item.english)}
              aria-label="Listen to example sentence"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-input bg-background text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary active:scale-95"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

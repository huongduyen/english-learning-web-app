import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Languages } from 'lucide-react';

interface TranscriptViewerProps {
  transcript?: string;
  transcriptVi?: string;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  transcript,
  transcriptVi,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showVietnamese, setShowVietnamese] = useState(false);

  if (!transcript || transcript.trim() === '') {
    return (
      <div
        id="transcript-empty-state"
        className="rounded-2xl border border-dashed border-border bg-card p-4 text-xs text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground/60" />
          <span>No transcript available for this lesson.</span>
        </div>
      </div>
    );
  }

  // Parse lines to format speaker dialogues cleanly if present (e.g. "Speaker: Text")
  const activeContent = showVietnamese && transcriptVi ? transcriptVi : transcript;
  const lines = activeContent
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  return (
    <div
      id="transcript-section"
      className="rounded-2xl border border-border bg-card shadow-sm transition-all"
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground sm:text-sm">
              Lesson Transcript
            </h4>
            <p className="text-[11px] text-muted-foreground">
              {isOpen ? 'Follow along with the speaker dialogue' : 'Hidden by default'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOpen && transcriptVi && (
            <button
              type="button"
              id="transcript-translate-toggle"
              onClick={() => setShowVietnamese((prev) => !prev)}
              aria-pressed={showVietnamese}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                showVietnamese
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-input bg-card text-muted-foreground hover:bg-accent'
              }`}
            >
              <Languages className="h-3.5 w-3.5" />
              <span>{showVietnamese ? 'Tiếng Việt' : 'English'}</span>
            </button>
          )}

          <button
            type="button"
            id="transcript-toggle-button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-controls="transcript-content"
            className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-xs hover:bg-accent"
          >
            <span>{isOpen ? 'Hide Transcript' : 'Show Transcript'}</span>
            {isOpen ? (
              <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          id="transcript-content"
          className="border-t border-border/60 bg-muted/20 px-4 py-5 sm:px-6"
        >
          <div className="space-y-3 font-sans text-xs leading-relaxed text-foreground sm:text-sm">
            {lines.map((line, idx) => {
              const colonIndex = line.indexOf(':');
              if (colonIndex > 0 && colonIndex < 30) {
                const speaker = line.substring(0, colonIndex);
                const utterance = line.substring(colonIndex + 1);
                return (
                  <p key={idx} className="flex flex-col sm:flex-row sm:gap-2">
                    <span className="font-bold text-primary shrink-0 sm:w-28">
                      {speaker}:
                    </span>
                    <span className="text-muted-foreground">{utterance.trim()}</span>
                  </p>
                );
              }
              return (
                <p key={idx} className="text-muted-foreground">
                  {line}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

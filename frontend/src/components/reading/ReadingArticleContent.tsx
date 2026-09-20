import React, { useState } from 'react';
import { Languages } from 'lucide-react';

interface ReadingArticleContentProps {
  content: string;
  contentVi?: string;
}

export const ReadingArticleContent: React.FC<ReadingArticleContentProps> = ({
  content,
  contentVi,
}) => {
  const [showVietnamese, setShowVietnamese] = useState(false);

  const activeText = showVietnamese && contentVi ? contentVi : content;

  // Split into sections/paragraphs for comfortable reading typography
  const paragraphs = activeText
    .trim()
    .split('\n\n')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <article
      id="reading-article-content-container"
      className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10"
    >
      {/* Article controls: Language toggle */}
      {contentVi && (
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            id="article-language-toggle"
            onClick={() => setShowVietnamese((prev) => !prev)}
            aria-pressed={showVietnamese}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
              showVietnamese
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-input bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <Languages className="h-3.5 w-3.5" />
            <span>{showVietnamese ? 'Tiếng Việt' : 'English'}</span>
          </button>
        </div>
      )}

      {/* Reader-Friendly Article Body */}
      <div className="space-y-5 text-foreground">
        {paragraphs.map((para, idx) => {
          // Check for Markdown headers: # Header 1, ## Header 2, ### Header 3
          if (para.startsWith('# ')) {
            return (
              <h1
                key={idx}
                className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl pt-2 pb-1 border-b border-border/40"
              >
                {para.replace('# ', '')}
              </h1>
            );
          }
          if (para.startsWith('## ')) {
            return (
              <h2
                key={idx}
                className="text-lg font-bold tracking-tight text-foreground sm:text-xl pt-2"
              >
                {para.replace('## ', '')}
              </h2>
            );
          }
          if (para.startsWith('### ')) {
            return (
              <h3
                key={idx}
                className="text-base font-bold text-foreground sm:text-lg pt-1 text-primary"
              >
                {para.replace('### ', '')}
              </h3>
            );
          }

          // Standard paragraph with comfortable line-height and font size
          return (
            <p
              key={idx}
              className="text-sm sm:text-base leading-relaxed text-foreground/90 font-sans tracking-normal selection:bg-primary/20"
            >
              {para}
            </p>
          );
        })}
      </div>
    </article>
  );
};

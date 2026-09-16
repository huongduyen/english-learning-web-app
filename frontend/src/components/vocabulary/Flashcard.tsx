import React from 'react';
import { VocabularyItem } from '../../types/vocabulary';
import { AudioPronounceButton } from './AudioPronounceButton';
import { DifficultyBadge } from './DifficultyBadge';
import { PartOfSpeechBadge } from './PartOfSpeechBadge';
import { RotateCw, Sparkles } from 'lucide-react';

interface FlashcardProps {
  item: VocabularyItem;
  isFlipped: boolean;
  onFlip: () => void;
  className?: string;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  item,
  isFlipped,
  onFlip,
  className = '',
}) => {
  return (
    <div
      className={`group relative mx-auto h-[380px] w-full max-w-xl cursor-pointer select-none [perspective:1200px] ${className}`}
      onClick={onFlip}
      id="flashcard-container"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onFlip();
        }
      }}
      aria-label={`Flashcard for ${item.word}. Press Space or click to flip.`}
    >
      <div
        className={`relative h-full w-full rounded-3xl transition-transform duration-500 [transform-style:preserve-3d] shadow-xl ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* ================= FRONT SIDE ================= */}
        <div
          id="flashcard-front"
          className="absolute inset-0 flex flex-col justify-between rounded-3xl border-2 border-border/80 bg-gradient-to-br from-card via-card to-secondary/30 p-8 [backface-visibility:hidden] [transform:rotateY(0deg)]"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DifficultyBadge difficulty={item.difficulty} />
              {item.topic && (
                <span className="text-xs font-medium text-muted-foreground">
                  {item.topic.title}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Front</span>
            </div>
          </div>

          {/* Central Word Content */}
          <div className="my-auto flex flex-col items-center justify-center text-center">
            <h2
              id="flashcard-word"
              className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl"
            >
              {item.word}
            </h2>

            {item.phonetic && (
              <span
                id="flashcard-ipa"
                className="mt-3 font-mono text-lg text-muted-foreground"
              >
                {item.phonetic}
              </span>
            )}

            <div className="mt-5">
              <AudioPronounceButton
                id="flashcard-audio"
                word={item.word}
                audioUrl={item.audioUrl}
                size="lg"
              />
            </div>
          </div>

          {/* Bottom Flip Prompt */}
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground/80 group-hover:text-primary">
            <RotateCw className="h-3.5 w-3.5 transition-transform group-hover:rotate-45" />
            <span>Click card or press Space to flip</span>
          </div>
        </div>

        {/* ================= BACK SIDE ================= */}
        <div
          id="flashcard-back"
          className="absolute inset-0 flex flex-col justify-between rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-8 [backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PartOfSpeechBadge
                id="flashcard-pos"
                partOfSpeech={item.partOfSpeech}
              />
              <span className="text-xs font-semibold text-primary">
                Meaning & Usage
              </span>
            </div>
            <span className="text-xs text-muted-foreground">Back</span>
          </div>

          {/* Back Content */}
          <div className="my-auto space-y-4">
            {/* Vietnamese Meaning */}
            <div className="rounded-2xl bg-primary/10 p-4 text-center dark:bg-primary/15">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Nghĩa tiếng Việt
              </span>
              <p
                id="flashcard-meaning-vi"
                className="mt-1 text-2xl font-bold text-foreground sm:text-3xl"
              >
                {item.meaningVi}
              </p>
            </div>

            {/* English Definition */}
            {item.meaning && (
              <p
                id="flashcard-meaning-en"
                className="text-center text-sm text-muted-foreground"
              >
                {item.meaning}
              </p>
            )}

            {/* Example Sentences */}
            {item.exampleSentence && (
              <div className="rounded-xl border border-border/60 bg-muted/40 p-3.5 text-left text-sm">
                <p
                  id="flashcard-example"
                  className="font-medium text-foreground italic"
                >
                  &ldquo;{item.exampleSentence}&rdquo;
                </p>
                {item.exampleSentenceVi && (
                  <p
                    id="flashcard-example-vi"
                    className="mt-1 text-xs text-muted-foreground"
                  >
                    {item.exampleSentenceVi}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Bottom Flip Prompt */}
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground/80 group-hover:text-primary">
            <RotateCw className="h-3.5 w-3.5" />
            <span>Click card to see word again</span>
          </div>
        </div>
      </div>
    </div>
  );
};

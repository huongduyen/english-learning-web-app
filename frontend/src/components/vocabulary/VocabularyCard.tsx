import React from 'react';
import { Link } from 'react-router-dom';
import { VocabularyItem } from '../../types/vocabulary';
import { AudioPronounceButton } from './AudioPronounceButton';
import { DifficultyBadge } from './DifficultyBadge';
import { PartOfSpeechBadge } from './PartOfSpeechBadge';
import { FavoriteButton } from './FavoriteButton';
import { Sparkles, ArrowUpRight, BookOpen } from 'lucide-react';

interface VocabularyCardProps {
  item: VocabularyItem;
  className?: string;
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({
  item,
  className = '',
}) => {
  const isFavorite = item.userProgress?.isFavorite ?? false;
  const status = item.userProgress?.status || 'NEW';
  const masteryScore = item.userProgress?.masteryScore || 0;

  const statusConfig = {
    NEW: { label: 'New', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
    LEARNING: { label: 'Learning', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    REVIEWING: { label: 'Reviewing', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    MASTERED: { label: 'Mastered', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  }[status];

  return (
    <div
      id={`vocab-card-${item.id}`}
      className={`group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 ${className}`}
    >
      <div>
        {/* Top Header: Topic/Badges & Favorite */}
        <div className="flex items-center justify-between gap-2 pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <DifficultyBadge difficulty={item.difficulty} />
            <PartOfSpeechBadge partOfSpeech={item.partOfSpeech} />
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <FavoriteButton
              id={`vocab-fav-${item.id}`}
              vocabularyId={item.id}
              initialIsFavorite={isFavorite}
            />
          </div>
        </div>

        {/* Word, IPA & Audio Button */}
        <div className="flex items-baseline justify-between gap-3 pt-1">
          <div className="flex flex-col">
            <Link
              to={`/vocabulary/${item.id}`}
              id={`vocab-word-link-${item.id}`}
              className="group/title inline-flex items-center gap-1.5 text-xl font-bold tracking-tight text-foreground hover:text-primary"
            >
              <span id={`vocab-word-text-${item.id}`}>{item.word}</span>
              <ArrowUpRight className="h-4 w-4 opacity-0 transition-all duration-200 group-hover/title:translate-x-0.5 group-hover/title:-translate-y-0.5 group-hover/title:opacity-100" />
            </Link>
            {item.phonetic && (
              <span
                id={`vocab-ipa-${item.id}`}
                className="mt-0.5 font-mono text-sm text-muted-foreground"
              >
                {item.phonetic}
              </span>
            )}
          </div>

          <AudioPronounceButton
            id={`vocab-audio-${item.id}`}
            word={item.word}
            audioUrl={item.audioUrl}
            size="sm"
          />
        </div>

        {/* Vietnamese Meaning */}
        <div className="mt-3.5 rounded-xl bg-muted/40 p-3">
          <p
            id={`vocab-meaning-vi-${item.id}`}
            className="text-sm font-semibold text-foreground/90"
          >
            {item.meaningVi}
          </p>
          {item.meaning && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {item.meaning}
            </p>
          )}
        </div>

        {/* Example Sentence & Translation */}
        {item.exampleSentence && (
          <div className="mt-3.5 space-y-1 text-xs">
            <p
              id={`vocab-example-${item.id}`}
              className="font-medium text-foreground/80 italic"
            >
              &ldquo;{item.exampleSentence}&rdquo;
            </p>
            {item.exampleSentenceVi && (
              <p
                id={`vocab-example-vi-${item.id}`}
                className="text-muted-foreground"
              >
                {item.exampleSentenceVi}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer: Mastery Progress & Action Links */}
      <div className="mt-5 border-t pt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${masteryScore}%` }}
              />
            </div>
            <span className="font-medium">{masteryScore}%</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/vocabulary/flashcards?wordId=${item.id}${
                item.topicId ? `&topicId=${item.topicId}` : ''
              }`}
              id={`vocab-flashcard-link-${item.id}`}
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              title="Practice this word in flashcards"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Flashcard
            </Link>
            <Link
              to={`/vocabulary/${item.id}`}
              className="inline-flex items-center gap-1 font-medium text-foreground/70 hover:text-foreground"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

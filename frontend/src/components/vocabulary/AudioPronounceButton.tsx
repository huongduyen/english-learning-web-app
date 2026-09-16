import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';

interface AudioPronounceButtonProps {
  word: string;
  audioUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
}

export const AudioPronounceButton: React.FC<AudioPronounceButtonProps> = ({
  word,
  audioUrl,
  size = 'md',
  className = '',
  id,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isPlaying) return;
    setIsPlaying(true);

    // 1. If audioUrl exists, attempt audio playback
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        // Fallback to SpeechSynthesis on error
        playSpeechSynthesis();
      };
      audio.play().catch(() => {
        playSpeechSynthesis();
      });
      return;
    }

    // 2. Fallback to SpeechSynthesis
    playSpeechSynthesis();
  };

  const playSpeechSynthesis = () => {
    if (!('speechSynthesis' in window)) {
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Slightly slower for clear English learning pronunciation

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const sizeClasses = {
    sm: 'h-8 w-8 p-1.5 text-xs',
    md: 'h-9 w-9 p-2 text-sm',
    lg: 'h-11 w-11 p-2.5 text-base',
  }[size];

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }[size];

  const buttonId =
    id || `audio-btn-${word.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <button
      id={buttonId}
      type="button"
      onClick={handlePlayAudio}
      aria-label={`Listen to pronunciation for ${word}`}
      title={`Listen to pronunciation for "${word}"`}
      className={`relative inline-flex items-center justify-center rounded-full border transition-all duration-200 active:scale-95 ${
        isPlaying
          ? 'border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30'
          : 'border-border bg-secondary/50 text-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary'
      } ${sizeClasses} ${className}`}
    >
      <Volume2
        className={`${iconSizes} transition-transform ${
          isPlaying ? 'scale-110 animate-pulse text-current' : ''
        }`}
      />
      {isPlaying && (
        <span className="absolute -inset-1 animate-ping rounded-full bg-primary/20" />
      )}
    </button>
  );
};

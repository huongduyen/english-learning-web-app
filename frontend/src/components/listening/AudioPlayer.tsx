import React, { useRef, useState } from 'react';
import { Headphones, Volume2, AlertCircle, RefreshCw } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl?: string;
  title?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, title }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playbackError, setPlaybackError] = useState(false);

  if (!audioUrl) {
    return (
      <div
        id="audio-empty-state"
        className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground"
      >
        <Headphones className="h-5 w-5 text-muted-foreground/60" />
        <div>
          <p className="font-semibold text-foreground">Audio recording unavailable</p>
          <p className="mt-0.5">Please refer to the transcript below to practice listening comprehension.</p>
        </div>
      </div>
    );
  }

  const handleAudioError = () => {
    setPlaybackError(true);
  };

  const handleRetry = () => {
    setPlaybackError(false);
    if (audioRef.current) {
      audioRef.current.load();
    }
  };

  return (
    <div
      id="audio-player-container"
      className="rounded-2xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Volume2 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground sm:text-sm">
              Lesson Audio Track
            </h4>
            {title && (
              <p className="text-[11px] text-muted-foreground truncate max-w-xs sm:max-w-md">
                {title}
              </p>
            )}
          </div>
        </div>
      </div>

      {playbackError ? (
        <div
          id="audio-error-state"
          className="flex items-center justify-between gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Unable to play audio from current source.</span>
          </div>
          <button
            type="button"
            id="audio-retry-button"
            onClick={handleRetry}
            className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-accent"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      ) : (
        <audio
          ref={audioRef}
          id="standard-audio-player"
          controls
          preload="metadata"
          onError={handleAudioError}
          className="w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label={title ? `Audio for ${title}` : 'Lesson Audio Player'}
        >
          <source src={audioUrl} type="audio/ogg" />
          <source src={audioUrl} type="audio/mpeg" />
          <source src={audioUrl} />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};

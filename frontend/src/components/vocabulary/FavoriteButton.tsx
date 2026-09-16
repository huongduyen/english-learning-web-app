import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useToggleFavoriteMutation } from '../../hooks/useVocabulary';

interface FavoriteButtonProps {
  vocabularyId: string;
  initialIsFavorite?: boolean;
  className?: string;
  id?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  vocabularyId,
  initialIsFavorite = false,
  className = '',
  id,
}) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const toggleMutation = useToggleFavoriteMutation();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const nextState = !isFavorite;
    setIsFavorite(nextState);

    toggleMutation.mutate(vocabularyId, {
      onError: () => {
        // Revert on error
        setIsFavorite(!nextState);
      },
    });
  };

  const buttonId = id || `fav-btn-${vocabularyId}`;

  return (
    <button
      id={buttonId}
      type="button"
      onClick={handleToggle}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      className={`relative inline-flex items-center justify-center rounded-full p-2 transition-all duration-200 active:scale-90 ${
        isFavorite
          ? 'text-rose-500 hover:bg-rose-500/10'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      } ${className}`}
    >
      <Heart
        className={`h-4 w-4 transition-transform duration-200 ${
          isFavorite ? 'scale-110 fill-current' : 'scale-100'
        }`}
      />
    </button>
  );
};

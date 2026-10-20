import React, { useRef } from 'react';
import { GameDefinition } from '../types';
import { Play } from 'lucide-react';
import { OriginalGameArtwork } from './OriginalGameArtwork';

export interface ProfessionalGameCardProps {
  game: GameDefinition;
  onPlay: (game: GameDefinition) => void;
  onClickDetails?: (game: GameDefinition) => void;
  layout?: 'carousel' | 'grid';
  hasActiveAccess?: boolean;
  className?: string;
}

/**
 * GoDigital - Premium Dimensional Game Card
 * Conforming to specification & target reference design:
 * 1. High-definition game artwork with subtle hover zoom.
 * 2. Warm charcoal-brown translucent surface (#352316).
 * 3. Muted bronze border (#81502B) with warm sunset amber focus highlight (#FFAA24).
 * 4. Clear readable title in warm illuminated cream (#FFF0CF) and secondary text in warm subtext (#E6C8A4).
 * 5. Dimensional play affordance in bright sunset amber (#FFAA24 to #F47B20).
 * 6. Preserves debounced click handling to prevent duplicate session launches.
 */
export const ProfessionalGameCard: React.FC<ProfessionalGameCardProps> = ({
  game,
  onPlay,
  onClickDetails,
  layout = 'grid',
  className = '',
}) => {
  // Prevent double-clicks from launching duplicate sessions
  const isLaunchingRef = useRef(false);

  const handleCardClick = () => {
    if (isLaunchingRef.current) return;
    isLaunchingRef.current = true;
    setTimeout(() => {
      isLaunchingRef.current = false;
    }, 700);

    onPlay(game);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCardClick();
  };

  return (
    <div
      id={`game-card-${game.id}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick();
        }
      }}
      className={`group relative rounded-2xl bg-[#352316] border border-[#81502B] hover:border-[#FFAA24]/80 shadow-[0_4px_16px_rgba(24,15,10,0.7)] hover:shadow-[0_8px_24px_rgba(255,170,36,0.2)] transition-all duration-200 overflow-hidden cursor-pointer flex flex-col select-none active:scale-[0.98] ${
        layout === 'carousel'
          ? 'w-[260px] sm:w-[280px] shrink-0 snap-start'
          : 'w-full'
      } ${className}`}
    >
      {/* 1. LARGE HIGH-QUALITY GAME IMAGE CONTAINER (MAIN FOCUS) */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#24170F] shrink-0">
        <OriginalGameArtwork
          gameId={game.id}
          alt={`${game.title} artwork`}
          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
        {/* Subtle bottom gradient scrim into card base */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#352316] via-transparent to-transparent opacity-60 pointer-events-none" />
      </div>

      {/* 2. CARD FOOTER: READABLE TITLE & SIMPLE PLAY AFFORDANCE */}
      <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2.5 bg-[#352316] border-t border-[#81502B]/50">
        <div className="min-w-0 flex-1">
          <h3
            title={game.title}
            className="text-xs sm:text-sm font-black text-[#FFF0CF] tracking-tight leading-snug truncate group-hover:text-[#FFD35A] transition-colors"
          >
            {game.title}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-[#E6C8A4] font-medium truncate mt-0.5">
            {game.category || game.genre || 'Casual'}
          </p>
        </div>

        {/* 3. SIMPLE PLAY AFFORDANCE BUTTON */}
        <button
          type="button"
          onClick={handlePlayClick}
          aria-label={`Play ${game.title}`}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-[#FFAA24] to-[#F47B20] hover:brightness-105 text-[#24170F] flex items-center justify-center shrink-0 shadow-md shadow-[#FFAA24]/30 group-hover:scale-110 active:scale-95 transition-transform border-none cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current stroke-[2.5] ml-0.5" />
        </button>
      </div>
    </div>
  );
};

export default ProfessionalGameCard;

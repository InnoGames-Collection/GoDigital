import React from 'react';
import { GameDefinition } from '../types';
import { Play, Star } from 'lucide-react';
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
 * ProfessionalGameCard
 * 
 * Premium Clean Two-Zone Game Card Architecture:
 * 
 * ZONE 1: Promotional Image Container (.game-card-image)
 * - Fixed 16:9 aspect ratio across all cards
 * - Un-obscured promotional artwork (NO title/rating/description/PLAY overlays)
 * - Smooth top rounded corners matching card radius
 * 
 * ZONE 2: Clean White Information Container (.game-card-info)
 * - Pure white background (#FFFFFF) with subtle border & soft elevation
 * - Dark navy game title (#111827, 17-18px, bold/extrabold)
 * - Compact gold rating pill (★ 4.90 / ★ 4.99)
 * - Green status badge (UNLOCKED / FREE in #16A34A, or COINS)
 * - Readable gray description (#64748B, 13px)
 * - Signature GameON Tele green PLAY button (#8BCB3D) with white icon & text
 * - Guaranteed identical fixed height across all cards for pixel-perfect alignment
 */
export const ProfessionalGameCard: React.FC<ProfessionalGameCardProps> = ({
  game,
  onPlay,
  onClickDetails,
  layout = 'carousel',
  hasActiveAccess = false,
  className = '',
}) => {
  const isFreeDirectGame = game.id === 'candy-blast' || game.id === 'world-legends';
  const isCoinGame = !isFreeDirectGame && (game.accessType === 'COIN' || (!game.isFree && Boolean(game.requiresCoins)));
  const isSubscriptionGame = !isFreeDirectGame && game.accessType === 'SUBSCRIPTION';
  const coinCost = isFreeDirectGame ? 0 : (game.coinCost || 10);

  const handleCardClick = () => {
    if (onClickDetails) {
      onClickDetails(game);
    } else {
      onPlay(game);
    }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay(game);
  };

  // Format rating to standard 2-decimal display (e.g. 4.90, 4.99)
  const formattedRating = Number(game.rating || 4.99).toFixed(2);

  // Status configuration for the dark gaming information panel
  let statusText = 'FREE';
  let statusColor = 'text-[#35D07F]';

  if (hasActiveAccess) {
    statusText = 'UNLOCKED';
    statusColor = 'text-[#35D07F]';
  } else if (isCoinGame) {
    statusText = `🪙 ${coinCost} COINS`;
    statusColor = 'text-[#F5B942]';
  } else if (game.isFree) {
    statusText = 'FREE';
    statusColor = 'text-[#35D07F]';
  } else if (isSubscriptionGame) {
    const dailyPrice = game.subscriptionOptions?.daily?.priceETB || 5;
    statusText = `FROM ${dailyPrice} ETB`;
    statusColor = 'text-[#22D3EE]';
  }

  return (
    <div
      id={`game-card-${game.id}`}
      onClick={handleCardClick}
      className={`game-card group relative rounded-[20px] bg-[#181C29] border border-[#282E3D] hover:border-[#7C3AED]/70 shadow-sm hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-all duration-300 overflow-hidden cursor-pointer flex flex-col select-none ${
        layout === 'carousel'
          ? 'w-[290px] xs:w-[310px] sm:w-[330px] shrink-0 snap-start'
          : 'w-full'
      } ${className}`}
    >
      {/* =========================================================================
          ZONE 1: CLEAN PROMOTIONAL IMAGE CONTAINER (HERO)
          - 16:9 fixed aspect ratio
          - Unaltered, approved promotional key art
          - Zero overlay obstructions
         ========================================================================= */}
      <div className="game-card-image relative w-full aspect-[16/9] overflow-hidden bg-[#121622] shrink-0">
        <OriginalGameArtwork 
          gameId={game.id} 
          alt={`${game.title} promotional key art`}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105" 
        />
      </div>

      {/* =========================================================================
          ZONE 2: DARK INFORMATION PANEL (BELOW ARTWORK)
          - Dark card background (#181C29) with subtle border (#282E3D)
          - Uniform fixed height (124px) ensuring all cards align identically
          - White title, gold rating, themed status, gray description, violet PLAY
         ========================================================================= */}
      <div className="game-card-info flex flex-col justify-between p-3.5 sm:p-4 bg-[#181C29] h-[124px] shrink-0 border-t border-[#282E3D]">
        
        {/* ROW 1: GAME TITLE (WHITE) & RATING BADGE */}
        <div className="flex items-start justify-between gap-2.5 min-w-0">
          <h3 
            title={game.title}
            className="text-[17px] sm:text-[18px] font-extrabold text-white tracking-tight leading-tight line-clamp-1 flex-1 min-w-0"
          >
            {game.title}
          </h3>
          
          {/* Compact Gold Rating Pill */}
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#202536] text-[#AEB6C7] text-xs font-bold shrink-0 border border-[#282E3D] shadow-2xs mt-0.5">
            <Star className="w-3.5 h-3.5 fill-[#F5B942] text-[#F5B942]" />
            <span className="font-bold text-[#AEB6C7] text-[12px]">{formattedRating}</span>
          </div>
        </div>

        {/* ROW 2: STATUS, DESCRIPTION & ELECTRIC VIOLET PLAY BUTTON */}
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1 pr-1 flex flex-col justify-center">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider leading-none mb-1 ${statusColor}`}>
              {statusText}
            </span>
            <p 
              title={game.tagline || game.description}
              className="text-[13px] text-[#AEB6C7] font-normal leading-tight line-clamp-1"
            >
              {game.tagline || game.description}
            </p>
          </div>

          {/* Electric Violet PLAY Action */}
          <button
            type="button"
            onClick={handlePlayClick}
            aria-label={`Play ${game.title}`}
            className="shrink-0 h-[40px] px-4 sm:px-4.5 rounded-[13px] bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] active:scale-95 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-sm shadow-[#7C3AED]/30 transition-all cursor-pointer border-none"
          >
            <Play className="w-3.5 h-3.5 fill-current text-white" />
            <span className="tracking-wider">PLAY</span>
          </button>
        </div>
      </div>
    </div>
  );
};

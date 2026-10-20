/**
 * GoDigital - Category Section Component
 * Conforming to reference design & warm sunset palette:
 * - Golden Gamepad Icon + Crisp Section Title (#FFF0CF)
 * - Warm charcoal-brown surface (#352316) with subtle bronze border (#81502B)
 * - Horizontal carousel with peek and smooth scroll
 */

import React, { useRef } from 'react';
import { GameDefinition } from '../types';
import { GameCard } from './GameCard';
import { ChevronLeft, ChevronRight, Gamepad2 } from 'lucide-react';

interface GameCategorySectionProps {
  category: string;
  games: GameDefinition[];
  onPlayGame: (game: GameDefinition) => void;
  onClickDetails?: (game: GameDefinition) => void;
  onViewAll?: () => void;
  activeEntitlements?: Record<string, boolean>;
}

export const GameCategorySection: React.FC<GameCategorySectionProps> = ({
  category,
  games,
  onPlayGame,
  onClickDetails,
  onViewAll,
  activeEntitlements = {},
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!games || games.length === 0) return null;

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section 
      id={`category-section-${category.toLowerCase().replace(/\s+/g, '-')}`}
      className="space-y-3 py-1"
    >
      {/* Category Header with Title & Action Controls */}
      <div className="flex items-center justify-between px-3.5 sm:px-4">
        <div className="flex items-center gap-2">
          {/* Golden Gamepad Icon matching reference design */}
          <div className="w-7 h-7 rounded-lg bg-[#352316] border border-[#81502B] flex items-center justify-center text-[#FFD35A] shadow-xs">
            <Gamepad2 className="w-4 h-4 stroke-[2.2]" />
          </div>
          <h2 className="text-base sm:text-lg font-black text-[#FFF0CF] tracking-tight">
            {category}
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-[#352316] text-[#E6C8A4] border border-[#81502B] text-[11px] font-bold">
            {games.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="px-2.5 py-1 rounded-full bg-[#352316] hover:bg-[#442C1B] border border-[#81502B] hover:border-[#FFAA24]/60 text-[#E6C8A4] hover:text-[#FFF0CF] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Desktop Carousel Scroll Arrows */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => handleScroll('left')}
              className="w-7 h-7 rounded-full bg-[#352316] hover:bg-[#442C1B] text-[#E6C8A4] hover:text-[#FFF0CF] border border-[#81502B] hover:border-[#FFAA24]/50 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-7 h-7 rounded-full bg-[#352316] hover:bg-[#442C1B] text-[#E6C8A4] hover:text-[#FFF0CF] border border-[#81502B] hover:border-[#FFAA24]/50 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel with Partial Next-Card Peek & Snap Scrolling */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-3.5 overflow-x-auto scrollbar-none px-3.5 sm:px-4 pb-2 snap-x snap-mandatory scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onPlay={onPlayGame}
            onClickDetails={onClickDetails}
            layout="carousel"
            hasActiveAccess={Boolean(activeEntitlements[game.id])}
          />
        ))}
        {/* Trailing spacer for generous right padding */}
        <div className="w-2 shrink-0" />
      </div>
    </section>
  );
};

export default GameCategorySection;

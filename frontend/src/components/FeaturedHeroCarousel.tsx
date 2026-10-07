/**
 * GameON Tele - Top Featured Hero Banner Carousel
 * Features large attractive banners, game titles, category tags, rating,
 * and high-contrast Play & Details action buttons.
 */

import React, { useState, useEffect } from 'react';
import { GameDefinition } from '../types';
import { Play, Info, Star, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface FeaturedHeroCarouselProps {
  featuredGames: GameDefinition[];
  onPlayGame: (game: GameDefinition) => void;
  onClickDetails?: (game: GameDefinition) => void;
  activeEntitlements?: Record<string, boolean>;
}

export const FeaturedHeroCarousel: React.FC<FeaturedHeroCarouselProps> = ({
  featuredGames,
  onPlayGame,
  onClickDetails,
  activeEntitlements = {},
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance banner every 6 seconds if multiple games exist
  useEffect(() => {
    if (featuredGames.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredGames.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredGames.length]);

  if (!featuredGames || featuredGames.length === 0) return null;

  const currentGame = featuredGames[currentIndex] || featuredGames[0];
  const isFreeDirectGame = currentGame.id === 'candy-blast' || currentGame.id === 'world-legends';
  const isCoinGame = !isFreeDirectGame && (currentGame.accessType === 'COIN' || (!currentGame.isFree && Boolean(currentGame.requiresCoins)));
  const hasAccess = isFreeDirectGame || Boolean(activeEntitlements[currentGame.id]);
  const coinCost = isFreeDirectGame ? 0 : (currentGame.coinCost || 10);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? featuredGames.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredGames.length);
  };

  return (
    <div 
      id="home-featured-hero"
      className="relative w-full rounded-3xl overflow-hidden bg-[#181C29] text-white border border-[#282E3D] shadow-md select-none"
    >
      {/* Background Artwork Banner */}
      <div className="relative h-56 sm:h-64 md:h-72 w-full overflow-hidden">
        <img
          src={currentGame.bannerUrl || currentGame.thumbnailUrl}
          alt={currentGame.title}
          className="w-full h-full object-cover opacity-85 transition-all duration-700 ease-out"
        />

        {/* Ambient Multi-Stop Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121622] via-[#121622]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#121622]/80 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#7C3AED] text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span>FEATURED</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#202536]/80 backdrop-blur-xs text-[#AEB6C7] border border-[#282E3D] text-[10px] font-bold uppercase tracking-wider">
              {currentGame.category}
            </span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#202536]/80 backdrop-blur-xs text-[#F5B942] border border-[#282E3D] text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{currentGame.rating}</span>
          </div>
        </div>

        {/* Bottom Game Details & Action CTAs */}
        <div className="absolute bottom-4 left-4 right-4 z-10 space-y-2">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-sm">
              {currentGame.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#AEB6C7] line-clamp-1 max-w-md mt-0.5">
              {currentGame.tagline || currentGame.description}
            </p>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            {/* Play Button */}
            <button
              onClick={() => onPlayGame(currentGame)}
              className="py-2.5 px-5 rounded-[13px] font-black text-xs sm:text-sm transition-all shadow-sm shadow-[#7C3AED]/30 flex items-center gap-2 cursor-pointer active:scale-95 bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] text-white border-none"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {isCoinGame && !hasAccess ? `Play (${coinCost} Coins)` : 'Play Now'}
              </span>
            </button>

            {/* Details Button */}
            {onClickDetails && (
              <button
                onClick={() => onClickDetails(currentGame)}
                className="py-2.5 px-4 rounded-[13px] bg-[#202536] hover:bg-[#282E3D] border border-[#282E3D] text-white font-bold text-xs sm:text-sm backdrop-blur-xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Info className="w-4 h-4 text-[#22D3EE]" />
                <span>Details</span>
              </button>
            )}
          </div>
        </div>

        {/* Prev / Next Slide Chevrons */}
        {featuredGames.length > 1 && (
          <div className="absolute inset-y-0 left-2 right-2 flex items-center justify-between pointer-events-none z-20">
            <button
              onClick={prevSlide}
              className="w-8 h-8 rounded-full bg-[#121622]/80 hover:bg-[#202536] border border-[#282E3D] text-white flex items-center justify-center transition-colors pointer-events-auto cursor-pointer"
              aria-label="Previous featured game"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="w-8 h-8 rounded-full bg-[#121622]/80 hover:bg-[#202536] border border-[#282E3D] text-white flex items-center justify-center transition-colors pointer-events-auto cursor-pointer"
              aria-label="Next featured game"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Pagination Dots */}
      {featuredGames.length > 1 && (
        <div className="py-2 bg-[#121622] border-t border-[#282E3D] flex items-center justify-center gap-1.5">
          {featuredGames.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                currentIndex === idx ? 'w-5 bg-[#7C3AED]' : 'w-1.5 bg-[#282E3D]'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

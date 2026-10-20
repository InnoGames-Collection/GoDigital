/**
 * GoDigital - Featured Hero Banner Carousel
 * Conforming to reference design:
 * - High-impact cinematic banner with warm sunset overlays (#24170F)
 * - Rich Gold / Amber action buttons and accent badges (#FFD35A / #FFAA24)
 * - Embedded tournament rewards card (matching reference design layout)
 * - Subtle bronze borders (#81502B) and warm cream typography (#FFF0CF)
 */

import React, { useState, useEffect } from 'react';
import { GameDefinition } from '../types';
import { Play, Info, Star, ChevronLeft, ChevronRight, Sparkles, Crown, Trophy, Medal } from 'lucide-react';

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
      className="relative w-full rounded-[24px] sm:rounded-[28px] overflow-hidden bg-[#24170F] text-[#FFF0CF] border border-[#81502B] shadow-[0_8px_32px_rgba(36,23,15,0.8)] select-none"
    >
      {/* Background Artwork Banner */}
      <div className="relative h-60 sm:h-72 md:h-80 w-full overflow-hidden">
        <img
          src={currentGame.bannerUrl || currentGame.thumbnailUrl}
          alt={currentGame.title}
          className="w-full h-full object-cover opacity-90 transition-all duration-700 ease-out"
        />

        {/* Ambient Multi-Stop Gradient Overlays (Warm sunset palette) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#24170F] via-[#24170F]/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#24170F]/90 via-[#24170F]/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#FFD35A] to-[#FFAA24] text-[#24170F] text-[10px] font-black uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3 h-3 fill-current" />
              <span>FEATURED</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#352316]/90 backdrop-blur-xs text-[#E6C8A4] border border-[#81502B] text-[10px] font-bold uppercase tracking-wider">
              {currentGame.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#352316]/90 backdrop-blur-xs text-[#FFD35A] border border-[#81502B] text-xs font-black shadow-xs">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{currentGame.rating}</span>
          </div>
        </div>

        {/* Right Embedded Tournament Prize Card */}
        <div className="hidden md:flex absolute top-3.5 right-4 z-10 w-56 rounded-2xl bg-[#352316]/90 backdrop-blur-md border border-[#81502B] p-2.5 flex-col gap-1.5 shadow-lg">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#FFD35A] flex items-center gap-1">
              <Crown className="w-3 h-3 text-[#FFD35A] fill-[#FFD35A]" />
              Tournament Rewards
            </span>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#FFAA24]/15 text-[#FFD35A] border border-[#FFAA24]/30">
              Live
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-[#442C1B]/80 border border-[#FFAA24]/40">
              <span className="font-extrabold text-[#FFD35A] flex items-center gap-1">
                <Crown className="w-3 h-3 fill-[#FFD35A]" /> 1st
              </span>
              <span className="font-black text-[#FFF0CF]">Up to 50,000 ETB</span>
            </div>
            <div className="flex items-center justify-between px-2 py-0.5 rounded-md bg-[#24170F]/60 text-[#E6C8A4]">
              <span className="font-bold flex items-center gap-1"><Trophy className="w-2.5 h-2.5 text-[#E6C8A4]" /> 2nd</span>
              <span className="font-medium text-[10px]">Great Prizes</span>
            </div>
            <div className="flex items-center justify-between px-2 py-0.5 rounded-md bg-[#24170F]/60 text-[#E6C8A4]">
              <span className="font-bold flex items-center gap-1"><Medal className="w-2.5 h-2.5 text-[#C96A22]" /> 3rd</span>
              <span className="font-medium text-[10px]">Great Prizes</span>
            </div>
          </div>

          <div className="text-center pt-0.5">
            <span className="text-[9px] font-extrabold text-[#FFD35A] tracking-wider uppercase">
              ★ Instant telebirr Payouts ★
            </span>
          </div>
        </div>

        {/* Bottom Game Details & Action CTAs */}
        <div className="absolute bottom-4 left-4 right-4 z-10 space-y-2">
          <div className="max-w-md">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#FFF0CF] leading-tight drop-shadow-sm">
              {currentGame.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#E6C8A4] line-clamp-1 mt-0.5">
              {currentGame.tagline || currentGame.description}
            </p>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            {/* Play Button in Rich Gold / Amber */}
            <button
              onClick={() => onPlayGame(currentGame)}
              className="py-2.5 px-5 rounded-[14px] font-black text-xs sm:text-sm transition-all shadow-md shadow-[#FFAA24]/20 flex items-center gap-2 cursor-pointer active:scale-95 bg-gradient-to-r from-[#FFD35A] to-[#FFAA24] text-[#24170F] hover:brightness-110 border-none"
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
                className="py-2.5 px-4 rounded-[14px] bg-[#352316]/90 hover:bg-[#442C1B] border border-[#81502B] hover:border-[#FFAA24]/50 text-[#FFF0CF] font-bold text-xs sm:text-sm backdrop-blur-xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Info className="w-4 h-4 text-[#FFD35A]" />
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
              className="w-8 h-8 rounded-full bg-[#24170F]/80 hover:bg-[#352316] border border-[#81502B] text-[#FFF0CF] flex items-center justify-center transition-colors pointer-events-auto cursor-pointer shadow-md"
              aria-label="Previous featured game"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="w-8 h-8 rounded-full bg-[#24170F]/80 hover:bg-[#352316] border border-[#81502B] text-[#FFF0CF] flex items-center justify-center transition-colors pointer-events-auto cursor-pointer shadow-md"
              aria-label="Next featured game"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Pagination Dots */}
      {featuredGames.length > 1 && (
        <div className="py-2 bg-[#24170F] border-t border-[#81502B] flex items-center justify-center gap-1.5">
          {featuredGames.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                currentIndex === idx 
                  ? 'w-6 bg-[#FFD35A] shadow-[0_0_6px_rgba(255,211,90,0.6)]' 
                  : 'w-1.5 bg-[#81502B] hover:bg-[#E6C8A4]'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

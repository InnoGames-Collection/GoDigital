/**
 * GoDigital - Home Tab
 * 
 * Cinematic, premium landing page conforming to target reference design:
 * 1. Warm sunset-amber gaming identity (#FFAA24, #FFD35A, #81502B, #352316, #24170F)
 * 2. Large promotional hero banner with prize table ("PLAY WIN & GET REWARDED")
 * 3. Two balanced statistics cards (Available Coins & Best Score for Helix Jump)
 * 4. "All Games" preview grid with golden gamepad header & "View All >" button
 * 5. Current Tournament section with live countdown and one-click play
 * 6. Preserves all working functionality, props, handlers, and navigation destinations
 */

import React, { useState, useEffect, useMemo } from 'react';
import { GameDefinition, UserProfile } from '../types';
import { GameRegistry } from '../games/registry';
import { TournamentService, DEFAULT_WEEKLY_TOURNAMENT } from '../services/tournamentService';
import { GameCard } from '../components/GameCard';
import { 
  Trophy, 
  Play, 
  ChevronRight, 
  Flame, 
  Clock, 
  ShieldCheck,
  Plus,
  Gamepad2,
  Crown,
  Sparkles
} from 'lucide-react';

interface HomePageProps {
  games?: GameDefinition[];
  profile?: UserProfile;
  onLaunchGame: (game: GameDefinition) => void;
  onOpenDetails?: (game: GameDefinition) => void;
  onOpenBuyCoins?: () => void;
  onNavigateToGames?: (category?: string) => void;
  onNavigateToTournament?: () => void;
  activeEntitlements?: Record<string, boolean>;
}

export const HomePage: React.FC<HomePageProps> = ({
  games = [],
  profile,
  onLaunchGame,
  onOpenDetails,
  onOpenBuyCoins,
  onNavigateToGames,
  onNavigateToTournament,
  activeEntitlements = {},
}) => {
  // 1. Retrieve Helix Jump game definition
  const helixGame = useMemo(() => {
    return games.find((g) => g.id === 'helix-jump') || GameRegistry.getGameById('helix-jump');
  }, [games]);

  // 2. Real-time Tournament countdown
  const [timeRemaining, setTimeRemaining] = useState(() => TournamentService.getTimeRemaining());
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(TournamentService.getTimeRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 3. User persisted Helix Jump tournament score
  const [bestScore, setBestScore] = useState<number>(() => TournamentService.getHelixTournamentBestScore(profile));
  useEffect(() => {
    setBestScore(TournamentService.getHelixTournamentBestScore(profile));
  }, [profile]);

  // 4. Tournament configuration & summary data
  const tournamentConfig = DEFAULT_WEEKLY_TOURNAMENT;
  const tournamentSummary = useMemo(() => {
    return TournamentService.getTournamentSummary(profile);
  }, [profile]);

  // 5. Coin balance
  const coinsCount = profile?.coins;
  const isCoinsLoading = profile === undefined;

  // 6. Featured games for the "All Games" preview grid
  const previewGames = useMemo(() => {
    return games.slice(0, 6);
  }, [games]);

  return (
    <div className="min-h-screen text-[#FFF0CF] pb-28 select-none relative z-10">
      <div className="max-w-md md:max-w-xl lg:max-w-4xl mx-auto px-3.5 sm:px-4 pt-3 sm:pt-4 space-y-4 sm:space-y-5">
        
        {/* =========================================================================
            SECTION B: ONE LARGE PROMOTIONAL HERO BANNER
            - Cinematic gaming / tournament visual matching reference design
            - Warm sunset amber, golden highlight, and burnished bronze accents
            - Headline: "PLAY WIN & GET REWARDED"
            - Prize Table: 1st Prize Up to 50,000 ETB, 2nd..5th Great Prizes, + Instant Prizes!
            - Clear call to action button
           ========================================================================= */}
        <section 
          id="home-promotional-hero-banner"
          className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#81502B] bg-[#352316] shadow-2xl transition-all"
        >
          {/* Background Artwork with Sunset Cover Cropping */}
          <div className="absolute inset-0 z-0">
            <img
              src="/banners/Helix.png"
              alt="GoDigital Tournament - Helix Jump"
              className="w-full h-full object-cover object-right sm:object-center transform scale-105 opacity-80"
            />
            {/* Scrim Overlay: Deep Warm Brown Scrim on left to transparent on right */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#24170F] via-[#24170F]/90 to-[#24170F]/45 sm:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#24170F] via-transparent to-black/35" />
            
            {/* Warm Golden Glow Accent */}
            <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-gradient-to-br from-[#FFD35A]/25 via-[#FFAA24]/15 to-transparent blur-3xl pointer-events-none" />
          </div>

          {/* Banner Content Container */}
          <div className="relative z-10 p-4.5 sm:p-6 md:p-7 flex flex-col justify-between min-h-[220px] sm:min-h-[250px] md:min-h-[270px]">
            {/* Top Pill: Tournament Status & Sponsor */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#442C1B]/95 border border-[#FFAA24]/50 text-[#FFD35A] text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-sm">
                <Flame className="w-3 h-3 fill-current text-[#FFAA24]" />
                <span>Weekly Championship Cup</span>
              </span>
              <span className="text-[10px] sm:text-xs text-[#E6C8A4] font-medium hidden xs:inline-block">
                • Telebirr & EthioTelecom
              </span>
            </div>

            {/* Middle: Headline, Supporting Sentence, & Prize Table Grid */}
            <div className="my-3 sm:my-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="max-w-sm sm:max-w-md">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#FFF0CF] tracking-tight uppercase leading-tight font-['Fredoka',sans-serif]">
                  PLAY WIN & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD35A] via-[#FFAA24] to-[#F47B20]">GET REWARDED</span>
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-[#E6C8A4] leading-relaxed line-clamp-2">
                  Top 5 Players Win Amazing Prizes! Conquer the Helix Jump tower, set your best score, and compete for your share of the weekly cash prize pool.
                </p>
              </div>

              {/* Prize Table Widget (conforming to reference image) */}
              <div className="hidden sm:flex flex-col bg-[#24170F]/85 backdrop-blur-md rounded-2xl p-3 border border-[#81502B]/80 text-xs shrink-0 w-60 shadow-lg">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#81502B]/50">
                  <div className="flex items-center gap-1.5 font-black text-[#FFD35A]">
                    <Crown className="w-4 h-4 fill-current text-[#FFD35A]" />
                    <span className="text-[11px] uppercase tracking-wider">1st Prize</span>
                  </div>
                  <span className="font-black text-[#FFF0CF] font-mono text-[11px]">Up to 50,000 ETB</span>
                </div>
                <div className="space-y-1 text-[10px] text-[#E6C8A4] font-medium">
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.2 rounded bg-[#442C1B] font-bold text-[#FFD35A]">2</span>
                    <span>2nd Place</span>
                    <span className="text-[#FFF0CF] font-bold">Great Prizes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.2 rounded bg-[#442C1B] font-bold text-[#FFD35A]">3</span>
                    <span>3rd Place</span>
                    <span className="text-[#FFF0CF] font-bold">Great Prizes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.2 rounded bg-[#442C1B] font-bold text-[#E6C8A4]">4-5</span>
                    <span>4th & 5th</span>
                    <span className="text-[#FFF0CF] font-bold">Great Prizes</span>
                  </div>
                </div>
                <div className="mt-2 pt-1 border-t border-[#81502B]/40 text-center">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F] text-[9px] font-black uppercase tracking-wider">
                    + Instant Prizes!
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom: Single Clear Call To Action Button */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                id="home-hero-cta-btn"
                onClick={() => {
                  if (helixGame) {
                    onLaunchGame(helixGame);
                  } else if (onNavigateToTournament) {
                    onNavigateToTournament();
                  }
                }}
                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#FFAA24] to-[#F47B20] hover:brightness-105 text-[#24170F] font-black text-xs sm:text-sm transition-all cursor-pointer active:scale-95 shadow-lg shadow-[#FFAA24]/30 flex items-center gap-2 uppercase tracking-wider"
              >
                <Play className="w-4 h-4 fill-current stroke-[2.5]" />
                <span>ENTER TOURNAMENT</span>
              </button>

              {onNavigateToTournament && (
                <button
                  type="button"
                  onClick={onNavigateToTournament}
                  className="px-3.5 py-2.5 rounded-xl bg-[#442C1B]/90 hover:bg-[#523521] text-[#E6C8A4] hover:text-[#FFF0CF] border border-[#81502B] font-bold text-xs transition-colors cursor-pointer active:scale-95 flex items-center gap-1"
                >
                  <span>Prizes</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION C: TWO BALANCED STATISTICS CARDS
            1. Available Coins — real balance, loading state, tap to top up
            2. Best Score — real persisted Helix Jump tournament score
            - Equal visual importance, consistent dimensions, readable numbers
            - Small meaningful icons, restrained gold accent, clear labels
           ========================================================================= */}
        <section 
          id="home-statistics-cards"
          className="grid grid-cols-2 gap-3 sm:gap-4"
        >
          {/* Card 1: Available Coins */}
          <div
            id="home-stat-card-coins"
            onClick={onOpenBuyCoins}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onOpenBuyCoins?.();
              }
            }}
            className="group bg-[#352316]/90 hover:bg-[#442C1B]/90 border border-[#81502B] hover:border-[#FFAA24]/70 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all cursor-pointer shadow-md active:scale-[0.99] relative overflow-hidden"
          >
            {/* Top row: Label + Small Meaningful Icon */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] sm:text-xs font-bold text-[#E6C8A4] uppercase tracking-wider">
                Available Coins
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#FFAA24]/20 border border-[#FFAA24]/40 flex items-center justify-center text-sm shadow-xs group-hover:scale-110 transition-transform">
                🪙
              </div>
            </div>

            {/* Bottom row: Real Numeric Value + Interactive Prompt */}
            <div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-[#FFF0CF] tracking-tight mb-1">
                {isCoinsLoading ? (
                  <span className="text-sm font-sans text-[#E6C8A4] animate-pulse">Loading...</span>
                ) : (
                  coinsCount?.toLocaleString() ?? '0'
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#FFAA24] group-hover:text-[#FFD35A] transition-colors">
                <Plus className="w-3 h-3 stroke-[3]" />
                <span>Top up coins</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 2: Best Score (Helix Jump Tournament) */}
          <div
            id="home-stat-card-score"
            onClick={() => {
              if (helixGame) {
                onLaunchGame(helixGame);
              } else if (onNavigateToTournament) {
                onNavigateToTournament();
              }
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                if (helixGame) onLaunchGame(helixGame);
              }
            }}
            className="group bg-[#352316]/90 hover:bg-[#442C1B]/90 border border-[#81502B] hover:border-[#FFAA24]/70 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all cursor-pointer shadow-md active:scale-[0.99] relative overflow-hidden"
          >
            {/* Top row: Label + Small Meaningful Icon */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col">
                <span className="text-[11px] sm:text-xs font-bold text-[#E6C8A4] uppercase tracking-wider">
                  Best Score
                </span>
                <span className="text-[10px] text-[#E6C8A4]/70 font-semibold truncate max-w-[100px] sm:max-w-none">
                  Helix Jump Cup
                </span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFAA24]/20 to-[#F47B20]/15 border border-[#FFAA24]/40 flex items-center justify-center text-[#FFD35A] shadow-xs group-hover:scale-110 transition-transform">
                <Trophy className="w-4 h-4 stroke-[2.4]" />
              </div>
            </div>

            {/* Bottom row: Real Numeric Value + Interactive Prompt */}
            <div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-[#FFF0CF] tracking-tight mb-1">
                {bestScore > 0 ? (
                  bestScore.toLocaleString()
                ) : (
                  <span className="text-[#E6C8A4]">0</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#FFAA24] group-hover:text-[#FFD35A] transition-colors">
                <span>{bestScore > 0 ? 'Beat your record' : 'Play first round'}</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION D: ALL GAMES SECTION (MATCHING TARGET REFERENCE IMAGE)
            - Golden gamepad icon + "All Games" in warm cream bold text
            - "View All >" pill button navigating to full Games catalog
            - Responsive 2-column or 3-column preview grid of games
           ========================================================================= */}
        {previewGames.length > 0 && (
          <section id="home-all-games-section" className="space-y-3 pt-1">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#352316] border border-[#81502B] flex items-center justify-center text-[#FFD35A] shadow-xs">
                  <Gamepad2 className="w-4 h-4 stroke-[2.2]" />
                </div>
                <h2 className="text-base sm:text-lg font-black text-[#FFF0CF] tracking-tight">
                  All Games
                </h2>
              </div>

              {onNavigateToGames && (
                <button
                  type="button"
                  id="home-view-all-games-btn"
                  onClick={() => onNavigateToGames('All Games')}
                  className="px-3 py-1 rounded-full bg-[#352316] hover:bg-[#442C1B] border border-[#81502B] hover:border-[#FFAA24]/60 text-[#E6C8A4] hover:text-[#FFF0CF] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {previewGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onPlay={onLaunchGame}
                  onClickDetails={onOpenDetails}
                  layout="grid"
                  hasActiveAccess={Boolean(activeEntitlements[game.id])}
                />
              ))}
            </div>
          </section>
        )}

        {/* =========================================================================
            SECTION E: CURRENT TOURNAMENT SUMMARY SECTION
            "Current Tournament" showing Helix Jump, live countdown, entry fee,
            and action buttons.
           ========================================================================= */}
        <section 
          id="home-current-tournament-section"
          className="space-y-2.5 pt-1"
        >
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black uppercase text-[#E6C8A4] tracking-wider">
                Current Tournament
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#FFD35A] bg-[#442C1B] px-2.5 py-0.5 rounded-full border border-[#81502B] flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#FFAA24]" />
              <span>{timeRemaining.formatted}</span>
            </span>
          </div>

          {/* Tournament Overview Card */}
          <div className="bg-[#352316]/90 border border-[#81502B] rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-md">
            {/* Subtle radial background glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFAA24]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              {/* Left: Thumbnail & Tournament Metadata */}
              <div className="flex items-center gap-3.5">
                <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border border-[#81502B] bg-[#24170F] shrink-0 shadow-sm">
                  <img
                    src="/banners/Helix.png"
                    alt="Helix Jump Championship"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-black text-[#FFD35A] uppercase font-mono">
                    LIVE
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-black text-[#FFAA24] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <span>🏆 {tournamentConfig.title}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-[#FFF0CF] leading-snug">
                    Helix Jump Championship
                  </h3>
                  <p className="text-xs text-[#E6C8A4] mt-0.5 line-clamp-1">
                    Sponsored by {tournamentConfig.sponsor} • 2 Coins Entry
                  </p>
                  <div className="mt-1.5 flex items-center gap-2 text-[11px] font-semibold text-[#E6C8A4]">
                    <span className="flex items-center gap-1">
                      <span className="text-[#FFD35A] font-black">5,000 ETB</span> 1st Place
                    </span>
                    <span>•</span>
                    <span>{tournamentSummary.totalParticipants.toLocaleString()} Competitors</span>
                  </div>
                </div>
              </div>

              {/* Right: Tournament Action Buttons */}
              <div className="flex items-center gap-2 sm:shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#81502B]/60">
                {onNavigateToTournament && (
                  <button
                    type="button"
                    id="home-tournament-view-standings-btn"
                    onClick={onNavigateToTournament}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#442C1B] hover:bg-[#523521] text-[#FFF0CF] border border-[#81502B] font-black text-xs transition-colors cursor-pointer active:scale-95 text-center flex items-center justify-center gap-1.5"
                  >
                    <Trophy className="w-3.5 h-3.5 text-[#FFD35A]" />
                    <span>Leaderboard</span>
                  </button>
                )}

                <button
                  type="button"
                  id="home-tournament-play-now-btn"
                  onClick={() => {
                    if (helixGame) {
                      onLaunchGame(helixGame);
                    } else if (onNavigateToTournament) {
                      onNavigateToTournament();
                    }
                  }}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFAA24] to-[#F47B20] hover:brightness-105 text-[#24170F] font-black text-xs transition-all cursor-pointer active:scale-95 shadow-md shadow-[#FFAA24]/20 text-center flex items-center justify-center gap-1.5 uppercase tracking-wider"
                >
                  <Play className="w-3.5 h-3.5 fill-current stroke-[2.5]" />
                  <span>Play Cup</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Small verified security badge at the bottom */}
        <div className="pt-2 text-center text-[11px] text-[#E6C8A4]/70 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FFAA24]" />
          <span>Official GoDigital Gaming Platform • telebirr SuperApp</span>
        </div>

      </div>
    </div>
  );
};

export default HomePage;

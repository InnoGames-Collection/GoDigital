/**
 * GoDigital - Official Weekly Tournament Page
 * Conforming to specification & target reference design:
 * - Warm sunset amber, golden highlight, and burnished bronze palette
 * - Weekly cycle with real-time countdown timer
 * - Tournament standings, personal best scores, and participating tournament games
 * - Preserves all tournament logic, calculations, and play triggers
 */

import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, GameDefinition } from '../types';
import { TournamentService, OverallTournamentEntry } from '../services/tournamentService';
import { catalogGameToDefinition } from '../games/registry';
import { 
  Swords, 
  Clock, 
  Play, 
  Star,
  ShieldCheck
} from 'lucide-react';

interface TournamentPageProps {
  profile: UserProfile;
  onPlayGame: (game: GameDefinition) => void;
}

export const TournamentPage: React.FC<TournamentPageProps> = ({
  profile,
  onPlayGame,
}) => {
  // 1. Live Countdown ticker and Authoritative Server Sync
  const [ticker, setTicker] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    TournamentService.syncWithBackend();
    const unsubscribe = TournamentService.subscribe(() => {
      setTicker((t) => t + 1);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Tournament Summary
  const summary = useMemo(() => {
    return TournamentService.getTournamentSummary(profile);
  }, [profile, ticker]);

  const {
    config,
    participatingGames,
    topEntries,
    currentUserBestScore,
    currentUserBestGame,
    currentUserRank,
    currentUserScores,
    totalParticipants,
    timeRemaining,
  } = summary;

  return (
    <div className="min-h-screen text-[#FFF0CF] pb-28 select-none relative z-10">
      <div className="max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 sm:px-4 pt-3 space-y-4">
        
        {/* =========================================================================
            1. TOURNAMENT HERO BANNER & TIMER
           ========================================================================= */}
        <div className="relative rounded-2xl bg-gradient-to-br from-[#352316] via-[#442C1B] to-[#352316] border border-[#81502B] text-[#FFF0CF] p-4 sm:p-5 shadow-lg overflow-hidden">
          {/* Subtle background atmosphere glow */}
          <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-36 h-36 bg-[#FFAA24]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute left-1/2 bottom-0 w-44 h-24 bg-[#F47B20]/15 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            {/* Badges row */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F] text-[10px] font-black uppercase tracking-wider shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#24170F] animate-pulse" />
                  <span>WEEKLY TOURNAMENT • LIVE</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#442C1B] border border-[#81502B] text-[#E6C8A4] text-[10px] font-extrabold uppercase">
                  {config.frequency}
                </span>
              </div>

              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#352316] border border-[#81502B] text-[#FFD35A] text-[10px] font-black">
                <Clock className="w-3 h-3 text-[#FFAA24]" />
                <span>{timeRemaining.formatted}</span>
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#FFF0CF] leading-tight tracking-tight">
                {config.title}
              </h1>
              <p className="text-xs text-[#E6C8A4] font-medium mt-1 leading-relaxed">
                Compete in this week's featured tournament. Your ranking is calculated from your highest verified score (Best Score).
              </p>
            </div>

            {/* Quick Stats Pill Bar */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-[#442C1B]/90 backdrop-blur-xs rounded-xl p-2.5 border border-[#81502B]">
                <div className="text-[9px] uppercase font-bold text-[#E6C8A4]">Total Prize Pool</div>
                <div className="text-xs sm:text-sm font-black text-[#FFD35A]">10,000+ ETB</div>
              </div>
              <div className="bg-[#442C1B]/90 backdrop-blur-xs rounded-xl p-2.5 border border-[#81502B]">
                <div className="text-[9px] uppercase font-bold text-[#E6C8A4]">Active Games</div>
                <div className="text-xs sm:text-sm font-black text-[#FFF0CF]">{participatingGames.length} Games</div>
              </div>
              <div className="bg-[#442C1B]/90 backdrop-blur-xs rounded-xl p-2.5 border border-[#81502B]">
                <div className="text-[9px] uppercase font-bold text-[#E6C8A4]">Players Joined</div>
                <div className="text-xs sm:text-sm font-black text-[#FFF0CF]">{totalParticipants.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. PLAYER'S TOURNAMENT STANDING CARD
           ========================================================================= */}
        <div className="rounded-2xl border border-[#81502B] bg-[#352316] p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-[#442C1B] border border-[#81502B] text-[#FFD35A] flex items-center justify-center font-black text-base shadow-sm shrink-0">
                {currentUserBestScore > 0 ? `#${currentUserRank}` : '—'}
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-[#E6C8A4] flex items-center gap-1">
                  <span>Your Rank</span>
                  {currentUserBestScore > 0 && currentUserRank <= 10 && (
                    <span className="px-1.5 py-0.2 rounded bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F] text-[8px] font-black">
                      TOP 10
                    </span>
                  )}
                </div>
                <div className="text-sm font-black text-[#FFF0CF] tracking-wider font-mono">
                  {profile.phoneNumber ? `${profile.phoneNumber.slice(0, 3)}*****${profile.phoneNumber.slice(-3)}` : '091*****890'}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold text-[#E6C8A4] uppercase">
                Best Score
              </div>
              <div className="text-lg font-black text-[#FFD35A] leading-none mt-0.5">
                {currentUserBestScore.toLocaleString()} <span className="text-xs font-semibold text-[#E6C8A4]">pts</span>
              </div>
              {currentUserBestGame && (
                <div className="text-[10px] font-extrabold text-[#FFAA24] mt-0.5">
                  via {currentUserBestGame.gameName}
                </div>
              )}
            </div>
          </div>

          {/* Tournament Games Score Chips */}
          <div className="pt-2 border-t border-[#81502B]">
            <div className="text-[10px] font-bold text-[#E6C8A4] uppercase mb-1.5">
              Your Scores
            </div>
            <div className={`grid gap-1.5 ${participatingGames.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-4'}`}>
              {participatingGames.map((game) => {
                const score = currentUserScores[game.gameId] || 0;
                const isBest = currentUserBestScore > 0 && score === currentUserBestScore;

                return (
                  <div
                    key={game.gameId}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      isBest
                        ? 'bg-[#442C1B] border-[#FFAA24]/90 shadow-md'
                        : 'bg-[#24170F] border-[#81502B]'
                    }`}
                  >
                    <div className="text-[10px] font-extrabold text-[#E6C8A4] truncate">
                      {game.gameName}
                    </div>
                    <div className="text-xs font-black text-[#FFF0CF] mt-0.5">
                      {score.toLocaleString()} <span className="text-[9px] font-medium text-[#E6C8A4]/70">pts</span>
                    </div>
                    {isBest ? (
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F] text-[8px] font-black uppercase tracking-wider">
                        ★ BEST
                      </span>
                    ) : (
                      <span className="inline-block mt-0.5 text-[8px] font-bold text-[#E6C8A4]/60 uppercase">
                        {score > 0 ? 'Recorded' : 'Not Played'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. PARTICIPATING TOURNAMENT GAMES
           ========================================================================= */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-[#FFF0CF] flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-[#FFAA24]" />
                <span>Active Tournament Games ({participatingGames.length})</span>
              </h2>
              <p className="text-[11px] text-[#E6C8A4] font-medium">
                {participatingGames.length === 1
                  ? `Play ${participatingGames[0]?.gameName || 'Helix Jump'} to set your highest tournament score`
                  : 'Play featured games to set your highest single score'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {participatingGames.map((game) => {
              const gameDef = catalogGameToDefinition(game);
              const userScore = currentUserScores[game.gameId] || 0;
              const isBest = currentUserBestScore > 0 && userScore === currentUserBestScore;

              return (
                <div
                  key={game.gameId}
                  id={`tournament-game-${game.gameId}`}
                  className="rounded-2xl border border-[#81502B] bg-[#352316] overflow-hidden shadow-md hover:border-[#FFAA24]/60 transition-all flex flex-col justify-between group"
                >
                  <div className="relative h-28 w-full bg-[#24170F] overflow-hidden">
                    <img
                      src={game.banner}
                      alt={game.gameName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#352316] via-[#352316]/40 to-transparent" />

                    {/* Game Category Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#24170F]/90 border border-[#81502B] text-[#E6C8A4] text-[9px] font-black uppercase tracking-wider shadow-xs">
                        {game.category}
                      </span>
                    </div>

                    {/* Best Game indicator if applicable */}
                    {isBest && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F] text-[9px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>YOUR BEST</span>
                        </span>
                      </div>
                    )}

                    {/* Game Title over image */}
                    <div className="absolute bottom-2 left-2.5 right-2.5">
                      <h3 className="text-base font-black text-[#FFF0CF] leading-tight drop-shadow-sm truncate">
                        {game.gameName}
                      </h3>
                      <p className="text-[10px] text-[#E6C8A4] truncate">
                        {game.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 flex items-center justify-between gap-2 border-t border-[#81502B] bg-[#352316]">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-[#E6C8A4]">
                        Your Game Score
                      </div>
                      <div className="text-sm font-black text-[#FFF0CF]">
                        {userScore.toLocaleString()} <span className="text-[10px] font-normal text-[#E6C8A4]">pts</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onPlayGame(gameDef)}
                      className="py-2 px-3.5 rounded-[12px] bg-gradient-to-r from-[#FFAA24] to-[#F47B20] hover:brightness-105 text-[#24170F] font-black text-xs transition-transform active:scale-95 shadow-md shadow-[#FFAA24]/20 flex items-center gap-1.5 shrink-0 cursor-pointer border-none"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play Now</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TournamentPage;

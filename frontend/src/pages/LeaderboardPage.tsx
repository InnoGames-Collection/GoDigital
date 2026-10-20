/**
 * GoDigital - Official Tournament Leaderboard Page
 * Conforming to specification & target reference design:
 * - Warm sunset amber, golden highlight, and burnished bronze palette
 * - Clear, consolidated Tournament Leaderboard for active tournament: Helix Jump
 * - Podium Top 3 visualization (Gold 1st, Silver 2nd, Bronze 3rd)
 * - Top 10 ranking table with masked MSISDNs, scores, and prize rewards
 * - Sticky personal standing bar when outside top 10 or unranked
 */

import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, GameDefinition } from '../types';
import { TournamentService, OverallTournamentEntry } from '../services/tournamentService';
import { GameRegistry } from '../games/registry';
import { 
  Trophy, 
  Play, 
  Crown, 
  Medal, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight,
  Flame,
  Award,
  Zap,
  Users
} from 'lucide-react';

interface LeaderboardPageProps {
  profile: UserProfile;
  games?: GameDefinition[];
  onPlayGame?: (game: GameDefinition) => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({
  profile,
  games = [],
  onPlayGame,
}) => {
  // 1. Live Countdown ticker (1s interval)
  const [ticker, setTicker] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Authoritative Tournament Summary (Active Game: Helix Jump)
  const summary = useMemo(() => {
    return TournamentService.getTournamentSummary(profile);
  }, [profile, ticker]);

  const {
    config,
    topEntries,
    currentUserBestScore,
    currentUserRank,
    totalParticipants,
    timeRemaining,
  } = summary;

  // 3. Resolve active Helix Jump game definition for direct launch
  const helixJumpGame = useMemo(() => {
    return games.find((g) => g.id === 'helix-jump') || GameRegistry.getGameById('helix-jump');
  }, [games]);

  // Masked phone format for privacy protection
  const maskedPhone = profile.phoneNumber
    ? `${profile.phoneNumber.slice(0, 3)}*****${profile.phoneNumber.slice(-3)}`
    : '091*****890';

  const isUserRanked = currentUserBestScore > 0 && currentUserRank > 0;
  const isUserInTop10 = isUserRanked && currentUserRank <= 10;
  const topThree = topEntries.slice(0, 3);
  const remainingTopEntries = topEntries.slice(3, 10);

  const handleLaunchHelix = () => {
    if (onPlayGame && helixJumpGame) {
      onPlayGame(helixJumpGame);
    }
  };

  return (
    <div className="min-h-screen text-[#FFF0CF] pb-36 select-none font-['Plus_Jakarta_Sans',sans-serif] relative z-10">
      <div className="max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 sm:px-4 pt-3 space-y-4">

        {/* =========================================================================
            1. TOURNAMENT HERO HEADER & COUNTDOWN
           ========================================================================= */}
        <div className="relative rounded-2xl bg-gradient-to-br from-[#352316] via-[#442C1B] to-[#352316] border border-[#81502B] text-[#FFF0CF] p-4 sm:p-5 shadow-lg overflow-hidden">
          {/* Subtle gold atmosphere glow */}
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-40 h-40 bg-[#FFAA24]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 w-36 h-20 bg-[#F47B20]/15 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            {/* Badges row */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F] text-[10px] font-black uppercase tracking-wider shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#24170F] animate-pulse" />
                  <span>WEEKLY TOURNAMENT • LIVE</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#442C1B] border border-[#81502B] text-[#E6C8A4] text-[10px] font-extrabold uppercase">
                  Helix Jump
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
                Tournament Leaderboard
              </h1>
              <p className="text-xs text-[#E6C8A4] font-medium mt-1 leading-relaxed">
                Helix Jump Grand Prix. Compete for the highest tower drop score. Top 10 players win telebirr ETB cash and coin rewards!
              </p>
            </div>

            {/* Quick Stats Pill Bar */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-[#442C1B]/90 backdrop-blur-xs rounded-xl p-2.5 border border-[#81502B]">
                <div className="text-[9px] uppercase font-bold text-[#E6C8A4]">Prize Pool</div>
                <div className="text-xs sm:text-sm font-black text-[#FFD35A]">10,000+ ETB</div>
              </div>
              <div className="bg-[#442C1B]/90 backdrop-blur-xs rounded-xl p-2.5 border border-[#81502B]">
                <div className="text-[9px] uppercase font-bold text-[#E6C8A4]">Active Game</div>
                <div className="text-xs sm:text-sm font-black text-[#FFF0CF]">Helix Jump</div>
              </div>
              <div className="bg-[#442C1B]/90 backdrop-blur-xs rounded-xl p-2.5 border border-[#81502B]">
                <div className="text-[9px] uppercase font-bold text-[#E6C8A4]">Competitors</div>
                <div className="text-xs sm:text-sm font-black text-[#FFF0CF]">{totalParticipants.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. CURRENT PLAYER STANDING SUMMARY CARD
           ========================================================================= */}
        <div className="rounded-2xl border border-[#81502B] bg-[#352316] p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-sm shrink-0 border ${
                isUserRanked
                  ? 'bg-gradient-to-br from-[#442C1B] to-[#352316] border-[#FFAA24] text-[#FFD35A]'
                  : 'bg-[#442C1B] border-[#81502B] text-[#E6C8A4]'
              }`}>
                {isUserRanked ? `#${currentUserRank}` : '—'}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#E6C8A4]">
                    Your Standing
                  </span>
                  {isUserInTop10 && (
                    <span className="px-1.5 py-0.2 rounded bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F] text-[8px] font-black">
                      TOP 10 PRIZE QUALIFIED
                    </span>
                  )}
                  {!isUserRanked && (
                    <span className="px-1.5 py-0.2 rounded bg-[#442C1B] border border-[#81502B] text-[#E6C8A4] text-[8px] font-extrabold uppercase">
                      UNRANKED
                    </span>
                  )}
                </div>
                <div className="text-sm font-black text-[#FFF0CF] tracking-wider font-mono truncate">
                  {maskedPhone}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[10px] font-bold text-[#E6C8A4] uppercase">
                Helix Best Score
              </div>
              <div className="text-lg font-black text-[#FFD35A] leading-none mt-0.5">
                {currentUserBestScore.toLocaleString()} <span className="text-xs font-semibold text-[#E6C8A4]">pts</span>
              </div>
            </div>
          </div>

          {/* Action Row & Qualification Status */}
          <div className="pt-2.5 border-t border-[#81502B] flex items-center justify-between gap-2 flex-wrap">
            <p className="text-[11px] text-[#E6C8A4] font-medium leading-tight">
              {isUserRanked
                ? isUserInTop10
                  ? '🎉 Qualified for weekly prize distribution!'
                  : 'Beat competitors above you to enter the Top 10 prize zone.'
                : 'Play Helix Jump to submit your first score and enter the leaderboard!'}
            </p>

            {onPlayGame && helixJumpGame && (
              <button
                type="button"
                onClick={handleLaunchHelix}
                className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-[#FFAA24] to-[#F47B20] hover:brightness-105 text-[#24170F] font-black text-xs transition-transform active:scale-95 shadow-md shadow-[#FFAA24]/20 flex items-center gap-1.5 shrink-0 cursor-pointer border-none"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isUserRanked ? 'Improve Score' : 'Play Helix Jump'}</span>
              </button>
            )}
          </div>
        </div>

        {/* =========================================================================
            3. PODIUM TOP 3 VISUALIZATION
           ========================================================================= */}
        {topThree.length >= 3 && (
          <div className="rounded-2xl border border-[#81502B] bg-[#352316] p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#FFD35A]" />
                <h2 className="text-xs font-black uppercase tracking-wider text-[#FFF0CF]">
                  Grand Prix Champions • Top 3
                </h2>
              </div>
              <span className="text-[10px] font-bold text-[#FFD35A]">
                Grand Prizes: 9,500 ETB
              </span>
            </div>

            <div className="relative pt-6 pb-2 px-1">
              <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end max-w-xl mx-auto">
                
                {/* ----------------- RANK 2: SILVER (LEFT) ----------------- */}
                <div className="flex flex-col items-center text-center order-1">
                  <div className="relative mb-2">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl p-1 bg-[#442C1B] border ${
                      topThree[1].isCurrentUser ? 'border-[#FFAA24] ring-2 ring-[#FFAA24]/60' : 'border-slate-400/50'
                    } flex items-center justify-center shadow-md`}>
                      <Medal className="w-6 h-6 text-slate-300" />
                    </div>
                    <span className="absolute -bottom-1.5 -right-1 w-5 h-5 rounded-full bg-slate-300 text-slate-950 font-black text-[10px] flex items-center justify-center border-2 border-[#352316] shadow-sm">
                      2
                    </span>
                  </div>

                  <div className="w-full px-1 mb-2">
                    <div className="text-xs font-bold text-[#FFF0CF] truncate">
                      {topThree[1].playerName}
                    </div>
                    <div className="text-[9px] text-[#E6C8A4] font-mono truncate">
                      {topThree[1].playerMasked}
                    </div>
                    <div className="text-xs sm:text-sm font-black text-slate-200 font-mono mt-0.5">
                      {topThree[1].bestScore.toLocaleString()} <span className="text-[9px] text-[#E6C8A4] font-sans">pts</span>
                    </div>
                    <div className="mt-1 inline-block px-1.5 py-0.5 rounded bg-[#442C1B] border border-[#81502B] text-[8px] font-bold text-slate-300 truncate max-w-full">
                      3,000 ETB
                    </div>
                  </div>

                  {/* Pedestal Step */}
                  <div className="w-full h-16 sm:h-20 rounded-t-xl bg-[#442C1B] border-t-2 border-x border-slate-400/40 flex flex-col items-center justify-center p-1.5 shadow-sm">
                    <span className="text-slate-300 font-black text-base sm:text-lg font-mono">2ND</span>
                    <span className="text-[9px] text-[#E6C8A4] font-semibold">Silver</span>
                  </div>
                </div>

                {/* ----------------- RANK 1: GOLD (CENTER - ELEVATED) ----------------- */}
                <div className="flex flex-col items-center text-center order-2 -mt-4">
                  <div className="relative mb-2">
                    <div className="absolute -top-4 inset-x-0 flex justify-center">
                      <Crown className="w-5 h-5 text-[#FFD35A] fill-[#FFD35A]" />
                    </div>
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl p-1 bg-[#442C1B] border-2 ${
                      topThree[0].isCurrentUser ? 'border-[#FFD35A] ring-2 ring-[#FFD35A]' : 'border-[#FFAA24]'
                    } flex items-center justify-center shadow-lg`}>
                      <Trophy className="w-7 h-7 text-[#FFD35A]" />
                    </div>
                    <span className="absolute -bottom-1.5 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F] font-black text-xs flex items-center justify-center border-2 border-[#352316] shadow-sm">
                      1
                    </span>
                  </div>

                  <div className="w-full px-1 mb-2">
                    <div className="text-xs sm:text-sm font-black text-[#FFF0CF] truncate flex items-center justify-center gap-0.5">
                      <span>{topThree[0].playerName}</span>
                      <Sparkles className="w-3 h-3 text-[#FFD35A] fill-[#FFD35A] shrink-0" />
                    </div>
                    <div className="text-[10px] text-[#E6C8A4] font-mono truncate">
                      {topThree[0].playerMasked}
                    </div>
                    <div className="text-sm sm:text-base font-black text-[#FFD35A] font-mono mt-0.5">
                      {topThree[0].bestScore.toLocaleString()} <span className="text-[9px] text-[#E6C8A4] font-sans">pts</span>
                    </div>
                    <div className="mt-1 inline-block px-1.5 py-0.5 rounded bg-[#442C1B] border border-[#FFAA24]/50 text-[9px] font-extrabold text-[#FFD35A] truncate max-w-full">
                      5,000 ETB + 2k Coins
                    </div>
                  </div>

                  {/* Pedestal Step */}
                  <div className="w-full h-24 sm:h-28 rounded-t-xl bg-gradient-to-b from-[#442C1B] to-[#352316] border-t-2 border-x border-[#FFAA24] flex flex-col items-center justify-center p-2 shadow-lg">
                    <span className="text-[#FFD35A] font-black text-lg sm:text-xl font-mono">1ST</span>
                    <span className="text-[10px] text-[#FFAA24] font-black uppercase tracking-wider">Champion</span>
                  </div>
                </div>

                {/* ----------------- RANK 3: BRONZE (RIGHT) ----------------- */}
                <div className="flex flex-col items-center text-center order-3">
                  <div className="relative mb-2">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl p-1 bg-[#442C1B] border ${
                      topThree[2].isCurrentUser ? 'border-[#FFAA24] ring-2 ring-[#FFAA24]/60' : 'border-[#9B4B12]'
                    } flex items-center justify-center shadow-md`}>
                      <Medal className="w-6 h-6 text-[#C96A22]" />
                    </div>
                    <span className="absolute -bottom-1.5 -right-1 w-5 h-5 rounded-full bg-[#9B4B12] text-white font-black text-[10px] flex items-center justify-center border-2 border-[#352316] shadow-sm">
                      3
                    </span>
                  </div>

                  <div className="w-full px-1 mb-2">
                    <div className="text-xs font-bold text-[#FFF0CF] truncate">
                      {topThree[2].playerName}
                    </div>
                    <div className="text-[9px] text-[#E6C8A4] font-mono truncate">
                      {topThree[2].playerMasked}
                    </div>
                    <div className="text-xs sm:text-sm font-black text-[#C96A22] font-mono mt-0.5">
                      {topThree[2].bestScore.toLocaleString()} <span className="text-[9px] text-[#E6C8A4] font-sans">pts</span>
                    </div>
                    <div className="mt-1 inline-block px-1.5 py-0.5 rounded bg-[#442C1B] border border-[#81502B] text-[8px] font-bold text-[#C96A22] truncate max-w-full">
                      1,500 ETB
                    </div>
                  </div>

                  {/* Pedestal Step */}
                  <div className="w-full h-14 sm:h-16 rounded-t-xl bg-[#442C1B] border-t-2 border-x border-[#9B4B12] flex flex-col items-center justify-center p-1.5 shadow-sm">
                    <span className="text-[#C96A22] font-black text-base sm:text-lg font-mono">3RD</span>
                    <span className="text-[9px] text-[#E6C8A4] font-semibold">Bronze</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            4. TOP 10 RANKINGS TABLE
           ========================================================================= */}
        <div className="rounded-2xl border border-[#81502B] overflow-hidden bg-[#352316] shadow-md">
          {/* Header */}
          <div className="px-4 py-3 bg-[#2D1C12] border-b border-[#81502B] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#FFD35A]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#FFF0CF]">
                Helix Jump Tournament • Top 10
              </h3>
            </div>
            <span className="text-[10px] font-bold text-[#E6C8A4]">
              All 10 Ranks Awarded
            </span>
          </div>

          {/* Table Column Headers */}
          <div className="grid grid-cols-12 gap-1 px-3.5 py-2 bg-[#24170F]/80 border-b border-[#81502B] text-[10px] font-black uppercase tracking-wider text-[#E6C8A4]/80">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-4">Player</div>
            <div className="col-span-3 text-right">Best Score</div>
            <div className="col-span-3 text-right">Prize</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[#81502B]">
            {topEntries.map((entry) => {
              const isFirst = entry.rank === 1;
              const isSecond = entry.rank === 2;
              const isThird = entry.rank === 3;
              const isUser = entry.isCurrentUser;

              return (
                <div
                  key={`${entry.playerId}-${entry.rank}`}
                  className={`grid grid-cols-12 gap-1 px-3.5 py-2.5 items-center transition-colors ${
                    isUser
                      ? 'bg-[#442C1B] font-black border-l-4 border-l-[#FFAA24]'
                      : isFirst
                      ? 'bg-[#FFAA24]/10'
                      : 'hover:bg-[#442C1B]/40'
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-2 text-center flex items-center justify-center">
                    {isFirst && <Crown className="w-5 h-5 text-[#FFD35A] fill-[#FFD35A]" />}
                    {isSecond && <Medal className="w-5 h-5 text-slate-300 fill-slate-400" />}
                    {isThird && <Medal className="w-5 h-5 text-[#C96A22] fill-[#9B4B12]" />}
                    {!isFirst && !isSecond && !isThird && (
                      <span className="text-xs font-black text-[#E6C8A4]">#{entry.rank}</span>
                    )}
                  </div>

                  {/* Player info (Masked MSISDN + Name) */}
                  <div className="col-span-4 min-w-0 pr-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-mono font-bold truncate ${isUser ? 'text-[#FFD35A] font-black' : 'text-[#FFF0CF]'}`}>
                        {entry.playerMasked}
                      </span>
                      {isUser && (
                        <span className="px-1.5 py-0.2 rounded-md bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F] text-[8px] font-black shrink-0">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#E6C8A4] truncate">
                      {entry.playerName}
                    </div>
                  </div>

                  {/* Best Score */}
                  <div className="col-span-3 text-right">
                    <div className="text-xs font-black text-[#FFF0CF] font-mono">
                      {entry.bestScore.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-[#E6C8A4]/70 font-medium">pts</div>
                  </div>

                  {/* Prize */}
                  <div className="col-span-3 text-right truncate">
                    <span className="inline-block px-1.5 py-0.5 rounded-md bg-[#442C1B] border border-[#81502B] text-[#FFD35A] text-[9px] font-extrabold truncate max-w-full">
                      {entry.rewardText || '300 ETB'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            5. TOURNAMENT RULES & TIE-BREAKER DISCLOSURE
           ========================================================================= */}
        <div className="rounded-2xl border border-[#81502B] bg-[#352316]/80 p-3.5 space-y-1.5 text-xs text-[#E6C8A4]">
          <div className="flex items-center gap-1.5 text-[#FFF0CF] font-black text-xs uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FFAA24]" />
            <span>Official Tournament Ranking Rules</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed text-[#E6C8A4]">
            <li>Rankings are strictly determined by each player's highest verified score in Helix Jump.</li>
            <li>Subsequent lower-scoring runs will never overwrite or erase your personal high score.</li>
            <li>Ties are resolved deterministically: earlier achievements rank ahead of later achievements.</li>
            <li>Prizes are credited to verified telebirr mobile numbers at the end of the weekly cycle.</li>
          </ul>
        </div>

      </div>

      {/* =========================================================================
          6. STICKY PERSONAL STANDING BAR (VISIBLE WHEN OUTSIDE TOP 10 OR UNRANKED)
         ========================================================================= */}
      {(!isUserInTop10) && (
        <div className="fixed bottom-[68px] sm:bottom-[72px] left-0 right-0 z-30 bg-[#24170F]/95 backdrop-blur-md border-t border-[#FFAA24]/40 shadow-[0_-4px_24px_rgba(24,15,10,0.9)] px-3 py-2.5">
          <div className="max-w-md md:max-w-xl lg:max-w-3xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#442C1B] border border-[#FFAA24]/60 text-[#FFD35A] flex items-center justify-center font-black text-xs shrink-0">
                {isUserRanked ? `#${currentUserRank}` : '—'}
              </div>
              <div className="min-w-0">
                <div className="text-[9px] font-black uppercase tracking-wider text-[#E6C8A4]">
                  {isUserRanked ? `Rank #${currentUserRank}` : 'Unranked'} • {maskedPhone}
                </div>
                <div className="text-xs font-black text-[#FFF0CF] truncate">
                  Score: <span className="text-[#FFD35A]">{currentUserBestScore.toLocaleString()} pts</span>
                </div>
              </div>
            </div>

            {onPlayGame && helixJumpGame && (
              <button
                type="button"
                onClick={handleLaunchHelix}
                className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F] font-black text-xs flex items-center gap-1 shrink-0 active:scale-95 shadow-md border-none cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Play</span>
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default LeaderboardPage;

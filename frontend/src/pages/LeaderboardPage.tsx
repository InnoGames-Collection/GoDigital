/**
 * GameON Tele - Official Game-Specific Leaderboard & Rankings Page
 * 
 * Strict Architecture:
 * - Leaderboard PER GAME where leaderboardEnabled === true
 * - Zero generic mixing of scores across disparate games
 * - Game selector pills: [ Candy Blast ] [ World Legends ] [ Helix Jump ] ...
 * - Player rank & score in the selected game
 * - Top 10 players with masked MSISDN (e.g. 091*****123) for telebirr customer privacy
 * - Rewards in GameON coins
 */

import React, { useState, useMemo } from 'react';
import { UserProfile, GameDefinition } from '../types';
import { GameLeaderboardService } from '../services/gameLeaderboardService';
import { TournamentService } from '../services/tournamentService';
import { catalogGameToDefinition } from '../games/registry';
import { 
  Trophy, 
  Play, 
  Crown, 
  Medal,
  Swords
} from 'lucide-react';

interface LeaderboardPageProps {
  profile: UserProfile;
  games?: GameDefinition[];
  onPlayGame?: (game: GameDefinition) => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({
  profile,
  onPlayGame,
}) => {
  // 1. Exactly 5 leaderboard sections:
  // 1. Crazy Color
  // 2. Fruit Ninja
  // 3. Helix Jump
  // 4. Pop Piano
  // 5. Overall Best
  const tournamentGames = useMemo(() => {
    return TournamentService.getActiveTournamentGames();
  }, []);

  const [selectedTab, setSelectedTab] = useState<string>('overall-best');

  // Individual game leaderboard data if a game is selected
  const isOverall = selectedTab === 'overall-best';
  const activeGame = useMemo(() => {
    return tournamentGames.find((g) => g.gameId === selectedTab) || tournamentGames[0];
  }, [tournamentGames, selectedTab]);

  const individualLeaderboardData = useMemo(() => {
    if (isOverall) return null;
    return GameLeaderboardService.getLeaderboardForGame(activeGame.gameId, profile);
  }, [isOverall, activeGame.gameId, profile]);

  // Overall Best leaderboard data
  const overallSummary = useMemo(() => {
    return TournamentService.getTournamentSummary(profile);
  }, [profile]);

  const maskedUserMsisdn = profile.phoneNumber 
    ? `${profile.phoneNumber.slice(0, 3)}*****${profile.phoneNumber.slice(-3)}` 
    : '091*****890';

  return (
    <div className="min-h-screen bg-[#0B0D14] text-white pb-28 select-none">
      <div className="max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 sm:px-4 pt-3 space-y-4">
        
        {/* =========================================================================
            1. FIVE LEADERBOARD SELECTION PILLS
               1. Crazy Color  2. Fruit Ninja  3. Helix Jump  4. Pop Piano  5. Overall Best
           ========================================================================= */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <div className="text-[11px] font-black uppercase tracking-wider text-[#AEB6C7] flex items-center gap-1">
              <Swords className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>Tournament Leaderboards</span>
            </div>
            <span className="text-[10px] font-bold text-[#70798D]">
              5 Leaderboard Sections
            </span>
          </div>

          <div 
            className="flex gap-2 overflow-x-auto scrollbar-none pb-1 snap-x snap-mandatory"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* First 4: Individual Tournament Games */}
            {tournamentGames.map((g) => {
              const isSelected = selectedTab === g.gameId;
              return (
                <button
                  key={g.gameId}
                  onClick={() => setSelectedTab(g.gameId)}
                  className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs shrink-0 snap-start transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-[#22D3EE] text-black shadow-xs shadow-[#22D3EE]/30 font-black'
                      : 'bg-[#181C29] hover:bg-[#202536] border border-[#282E3D] text-[#AEB6C7] hover:text-white'
                  }`}
                >
                  {g.gameName}
                </button>
              );
            })}

            {/* Fifth: Overall Best */}
            <button
              onClick={() => setSelectedTab('overall-best')}
              className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs shrink-0 snap-start transition-all cursor-pointer active:scale-95 flex items-center gap-1 ${
                selectedTab === 'overall-best'
                  ? 'bg-[#F5B942] text-black shadow-xs shadow-[#F5B942]/30 font-black'
                  : 'bg-[#181C29] border border-[#F5B942]/40 text-[#F5B942] font-black hover:bg-[#202536]'
              }`}
            >
              <span>★ Overall Best</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            2. LEADERBOARD CONTENT VIEW
           ========================================================================= */}
        {isOverall ? (
          /* =========================================================================
              VIEW A: OVERALL BEST LEADERBOARD (Top 10 ranked by highest single score)
             ========================================================================= */
          <div className="space-y-4">
            {/* Header Card */}
            <div className="rounded-2xl bg-gradient-to-r from-[#181C29] via-[#202536] to-[#181C29] border border-[#282E3D] text-white p-4 shadow-sm">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#202536] border border-[#282E3D] text-[#F5B942] text-[9px] font-black uppercase tracking-wider">
                  <Trophy className="w-3 h-3 text-[#F5B942]" />
                  <span>WEEKLY TOURNAMENT SUMMARY</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                  Overall Best Leaderboard
                </h2>
                <p className="text-[11px] text-[#AEB6C7]">
                  Ranked by each player's highest single score across Crazy Color, Fruit Ninja, Helix Jump, or Pop Piano.
                </p>
              </div>
            </div>

            {/* Current User Standing Card */}
            <div className="p-3.5 rounded-2xl bg-[#181C29] border border-[#282E3D] flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#202536] border border-[#282E3D] text-[#F5B942] flex items-center justify-center font-black text-sm shadow-xs">
                  {overallSummary.currentUserBestScore > 0 ? `#${overallSummary.currentUserRank}` : '—'}
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#AEB6C7]">
                    Your Overall Best
                  </div>
                  <div className="text-sm font-black text-white font-mono tracking-wider">
                    {maskedUserMsisdn}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-bold text-[#AEB6C7] uppercase">
                  Best Score
                </div>
                <div className="text-base font-black text-[#F5B942]">
                  {overallSummary.currentUserBestScore.toLocaleString()} pts
                </div>
                {overallSummary.currentUserBestGame && (
                  <div className="text-[10px] font-extrabold text-[#35D07F]">
                    via {overallSummary.currentUserBestGame.gameName}
                  </div>
                )}
              </div>
            </div>

            {/* Overall Best Top 10 Table: Rank | Player | Best Score | Game */}
            <div className="rounded-2xl border border-[#282E3D] overflow-hidden bg-[#181C29] shadow-xs">
              <div className="px-4 py-3 bg-[#121622] border-b border-[#282E3D] flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  Overall Best • Top 10
                </h3>
                <span className="text-[10px] font-bold text-[#AEB6C7]">
                  {overallSummary.totalParticipants.toLocaleString()} Players
                </span>
              </div>

              {/* Table Column Headers */}
              <div className="grid grid-cols-12 gap-1 px-3.5 py-2 bg-[#121622]/60 border-b border-[#282E3D] text-[10px] font-black uppercase tracking-wider text-[#70798D]">
                <div className="col-span-2 text-center">Rank</div>
                <div className="col-span-4">Player</div>
                <div className="col-span-3 text-right">Best Score</div>
                <div className="col-span-3 text-right">Game</div>
              </div>

              <div className="divide-y divide-[#282E3D]">
                {overallSummary.topEntries.slice(0, 10).map((entry) => {
                  const isFirst = entry.rank === 1;
                  const isSecond = entry.rank === 2;
                  const isThird = entry.rank === 3;
                  const isUser = entry.isCurrentUser;

                  return (
                    <div
                      key={entry.rank}
                      className={`grid grid-cols-12 gap-1 px-3.5 py-3 items-center transition-colors ${
                        isUser
                          ? 'bg-[#202536] font-black border-l-4 border-l-[#F5B942]'
                          : isFirst
                          ? 'bg-[#F5B942]/10'
                          : 'hover:bg-[#202536]/40'
                      }`}
                    >
                      {/* Rank */}
                      <div className="col-span-2 text-center flex items-center justify-center">
                        {isFirst && <Crown className="w-5 h-5 text-[#F5B942] fill-[#F5B942]" />}
                        {isSecond && <Medal className="w-5 h-5 text-slate-300 fill-slate-400" />}
                        {isThird && <Medal className="w-5 h-5 text-amber-600 fill-amber-700" />}
                        {!isFirst && !isSecond && !isThird && (
                          <span className="text-xs font-black text-[#AEB6C7]">#{entry.rank}</span>
                        )}
                      </div>

                      {/* Player: Masked MSISDN ONLY */}
                      <div className="col-span-4 min-w-0 pr-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-mono font-bold truncate ${isUser ? 'text-[#F5B942] font-black' : 'text-white'}`}>
                            {entry.playerMasked}
                          </span>
                          {isUser && (
                            <span className="px-1.5 py-0.2 rounded-md bg-[#F5B942] text-black text-[8px] font-black shrink-0">
                              YOU
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Best Score */}
                      <div className="col-span-3 text-right">
                        <div className="text-xs font-black text-white">
                          {entry.bestScore.toLocaleString()}
                        </div>
                        <div className="text-[9px] text-[#70798D] font-medium">pts</div>
                      </div>

                      {/* Game */}
                      <div className="col-span-3 text-right truncate">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-[#202536] border border-[#282E3D] text-[#AEB6C7] text-[10px] font-extrabold truncate max-w-full">
                          {entry.bestGameTitle}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
              VIEW B: INDIVIDUAL GAME LEADERBOARD (Crazy Color, Fruit Ninja, Helix Jump, Pop Piano)
             ========================================================================= */
          individualLeaderboardData && (
            <div className="space-y-4">
              {/* Selected Game Header & Current User Rank Card */}
              <div className="relative rounded-2xl bg-gradient-to-r from-[#181C29] via-[#202536] to-[#181C29] border border-[#282E3D] text-white p-4 shadow-sm overflow-hidden">
                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#202536] border border-[#282E3D] text-[#22D3EE] text-[9px] font-black uppercase tracking-wider">
                      <Trophy className="w-3 h-3 text-[#22D3EE]" />
                      <span>TOURNAMENT GAME RANKINGS</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white leading-tight truncate">
                      {individualLeaderboardData.game.gameName} Leaderboard
                    </h2>
                    <p className="text-[11px] text-[#AEB6C7]">
                      Top 10 single scores recorded in {individualLeaderboardData.game.gameName}.
                    </p>
                  </div>

                  {onPlayGame && (
                    <button
                      onClick={() => onPlayGame(catalogGameToDefinition(individualLeaderboardData.game))}
                      className="py-2 px-3.5 rounded-[12px] bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] text-white font-black text-xs transition-transform active:scale-95 shadow-sm shadow-[#7C3AED]/30 flex items-center gap-1.5 shrink-0 cursor-pointer border-none"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-white" />
                      <span>Play</span>
                    </button>
                  )}
                </div>
              </div>

              {/* User's Standing Card */}
              <div className="p-3.5 rounded-2xl bg-[#181C29] border border-[#282E3D] flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#202536] border border-[#282E3D] text-[#22D3EE] flex items-center justify-center font-black text-sm shadow-xs">
                    #{individualLeaderboardData.userRank}
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-[#AEB6C7]">
                      Your Standing in {individualLeaderboardData.game.gameName}
                    </div>
                    <div className="text-sm font-black text-white font-mono tracking-wider">
                      {maskedUserMsisdn}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-bold text-[#AEB6C7] uppercase">
                    High Score
                  </div>
                  <div className="text-base font-black text-[#22D3EE]">
                    {individualLeaderboardData.userScore.toLocaleString()} pts
                  </div>
                </div>
              </div>

              {/* Top 10 Players Table */}
              <div className="rounded-2xl border border-[#282E3D] overflow-hidden bg-[#181C29] shadow-xs">
                <div className="px-4 py-3 bg-[#121622] border-b border-[#282E3D] flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    Top 10 Players • {individualLeaderboardData.game.gameName}
                  </h3>
                  <span className="text-[10px] font-bold text-[#AEB6C7]">
                    {individualLeaderboardData.totalParticipants.toLocaleString()} Competitors
                  </span>
                </div>

                <div className="divide-y divide-[#282E3D]">
                  {individualLeaderboardData.entries.slice(0, 10).map((entry) => {
                    const isFirst = entry.rank === 1;
                    const isSecond = entry.rank === 2;
                    const isThird = entry.rank === 3;
                    const isUser = entry.isCurrentUser;

                    return (
                      <div
                        key={entry.rank}
                        className={`flex items-center justify-between p-3 transition-colors ${
                          isUser
                            ? 'bg-[#202536] font-black border-l-4 border-l-[#22D3EE]'
                            : isFirst
                            ? 'bg-[#22D3EE]/10'
                            : 'hover:bg-[#202536]/40'
                        }`}
                      >
                        {/* Rank & Player */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 text-center shrink-0">
                            {isFirst && <Crown className="w-5 h-5 text-[#F5B942] mx-auto fill-[#F5B942]" />}
                            {isSecond && <Medal className="w-5 h-5 text-slate-300 mx-auto fill-slate-400" />}
                            {isThird && <Medal className="w-5 h-5 text-amber-600 mx-auto fill-amber-700" />}
                            {!isFirst && !isSecond && !isThird && (
                              <span className="text-xs font-black text-[#AEB6C7]">#{entry.rank}</span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs font-mono font-bold truncate ${isUser ? 'text-[#22D3EE] font-black' : 'text-white'}`}>
                                {entry.playerMasked}
                              </span>
                              {isUser && (
                                <span className="px-1.5 py-0.2 rounded-md bg-[#22D3EE] text-black text-[8px] font-black">
                                  YOU
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-white">
                            {entry.score.toLocaleString()} <span className="text-[10px] font-medium text-[#AEB6C7]">pts</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )
        )}

      </div>
    </div>
  );
};


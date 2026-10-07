/**
 * Color Rush - Real Scores Leaderboard
 * 
 * Complies with strict requirements:
 * - Real player scores only (no fake bots or generated dummy scores)
 * - Allows leaderboard to correspond to the selected level (Levels 1-40)
 * - Clean Back navigation to Color Rush Menu
 */

import React, { useState } from 'react';
import { ArrowLeft, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { ColorRushProgression } from '../types';
import { getRealLevelLeaderboard } from '../leaderboard';
import { ColorRushAudio } from '../colorRushAudio';
import { TOTAL_COLOR_RUSH_LEVELS } from '../levels';

interface ColorRushLeaderboardModalProps {
  progression: ColorRushProgression;
  playerName: string;
  playerAvatar: string;
  selectedLevel: number;
  onBack: () => void;
}

export const ColorRushLeaderboardModal: React.FC<ColorRushLeaderboardModalProps> = ({
  progression,
  playerName,
  playerAvatar,
  selectedLevel,
  onBack,
}) => {
  const [activeLevel, setActiveLevel] = useState<number>(() => {
    return Math.max(1, Math.min(TOTAL_COLOR_RUSH_LEVELS, selectedLevel || 1));
  });

  const { entries, playerRank, playerScore } = getRealLevelLeaderboard({
    level: activeLevel,
    progression,
    playerName,
    playerAvatar,
  });

  const handlePrevLevel = () => {
    ColorRushAudio.playTap();
    setActiveLevel((prev) => Math.max(1, prev - 1));
  };

  const handleNextLevel = () => {
    ColorRushAudio.playTap();
    setActiveLevel((prev) => Math.min(TOTAL_COLOR_RUSH_LEVELS, prev + 1));
  };

  return (
    <div 
      className="relative w-full max-w-md mx-auto flex flex-col items-center select-none rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl min-h-[580px] max-h-[90vh] font-['Plus_Jakarta_Sans',sans-serif] text-slate-100"
      style={{
        background: 'radial-gradient(circle at 50% 15%, #182442 0%, #081126 55%, #02050f 100%)',
      }}
    >
      {/* Header with clean Back button */}
      <div 
        id="color-rush-leaderboard-header"
        className="w-full bg-[#0a152e]/95 backdrop-blur-md px-4 py-3.5 border-b border-[#162752] flex items-center justify-between z-20 shrink-0"
      >
        <button
          id="color-rush-leaderboard-back-btn"
          onClick={() => {
            ColorRushAudio.playTap();
            onBack();
          }}
          className="h-10 px-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 border border-slate-700 flex items-center gap-1.5 text-slate-300 text-xs font-bold transition-all cursor-pointer shadow-xs"
          title="Back to Menu"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-black text-white tracking-wide uppercase">
            LEADERBOARD
          </h2>
        </div>

        <div className="text-xs font-bold font-mono text-amber-400">
          {playerScore > 0 ? `${playerScore} PTS` : '—'}
        </div>
      </div>

      {/* Level Selector: Allows viewing leaderboard per level */}
      <div className="w-full px-4 py-3 bg-[#081229]/80 border-b border-slate-800/80 flex items-center justify-between z-10 shrink-0">
        <button
          id="color-rush-leaderboard-prev-lvl"
          onClick={handlePrevLevel}
          disabled={activeLevel <= 1}
          className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 flex items-center justify-center text-slate-300 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-black font-mono text-white">
            LEVEL {activeLevel}
          </span>
          <select
            id="color-rush-leaderboard-select"
            value={activeLevel}
            onChange={(e) => {
              ColorRushAudio.playTap();
              setActiveLevel(Number(e.target.value));
            }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-300 font-bold focus:outline-none cursor-pointer"
          >
            {Array.from({ length: TOTAL_COLOR_RUSH_LEVELS }, (_, i) => i + 1).map((lvl) => (
              <option key={lvl} value={lvl}>
                Level {lvl}
              </option>
            ))}
          </select>
        </div>

        <button
          id="color-rush-leaderboard-next-lvl"
          onClick={handleNextLevel}
          disabled={activeLevel >= TOTAL_COLOR_RUSH_LEVELS}
          className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 flex items-center justify-center text-slate-300 transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Leaderboard Entries List */}
      <div className="w-full flex-1 overflow-y-auto p-4 space-y-2 z-10">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 mt-12 bg-slate-900/40 rounded-2xl border border-slate-800/60">
            <Trophy className="w-10 h-10 text-slate-600 mb-2" />
            <p className="text-sm font-bold text-slate-300">
              No Scores Yet for Level {activeLevel}
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Complete Level {activeLevel} in the game to establish a real record on this leaderboard!
            </p>
          </div>
        ) : (
          entries.map((entry) => {
            const isTop3 = entry.rank <= 3;
            const rankBadge =
              entry.rank === 1
                ? 'bg-amber-500 text-slate-950 font-black'
                : entry.rank === 2
                ? 'bg-slate-300 text-slate-950 font-black'
                : entry.rank === 3
                ? 'bg-amber-700 text-white font-black'
                : 'bg-slate-800 text-slate-400 font-bold';

            return (
              <div
                key={entry.id}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                  entry.isPlayer
                    ? 'bg-gradient-to-r from-[#1b2b52] to-[#0f1b38] border-amber-400/80 shadow-md shadow-amber-500/10'
                    : 'bg-[#0a152d]/80 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono shrink-0 ${rankBadge}`}
                  >
                    #{entry.rank}
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-base shrink-0 border border-slate-700">
                    {entry.playerAvatar || '⚡'}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black text-white truncate max-w-[140px]">
                      {entry.playerName} {entry.isPlayer && '(You)'}
                    </span>
                    {entry.accuracy !== undefined && (
                      <span className="text-[10px] text-slate-400">
                        {entry.accuracy}% accuracy
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-sm font-black font-mono text-amber-400">
                    {entry.score.toLocaleString()} PTS
                  </span>
                  {entry.maxStreak && entry.maxStreak > 1 ? (
                    <span className="text-[10px] font-bold text-cyan-400">
                      {entry.maxStreak}x streak
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer highlighting user rank if available */}
      {playerRank !== null && (
        <div className="w-full bg-[#0a152e]/95 backdrop-blur-md px-4 py-3 border-t border-[#162752] flex items-center justify-between z-20 shrink-0 text-xs">
          <span className="text-slate-400 font-medium">Your Rank for Level {activeLevel}:</span>
          <span className="font-bold text-amber-400 font-mono">
            #{playerRank} ({playerScore.toLocaleString()} PTS)
          </span>
        </div>
      )}
    </div>
  );
};

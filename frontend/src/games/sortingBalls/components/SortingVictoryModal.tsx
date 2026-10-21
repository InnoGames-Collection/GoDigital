import React from 'react';
import { Trophy, Star, ArrowRight, RotateCcw, Home } from 'lucide-react';
import { LevelScoreBreakdown } from '../types';

interface SortingVictoryModalProps {
  isOpen: boolean;
  level: number;
  totalLevels: number;
  scoreBreakdown: LevelScoreBreakdown;
  cumulativeTotalScore: number;
  isNewBest: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onGoToMenu: () => void;
  onOpenLeaderboard: () => void;
}

export const SortingVictoryModal: React.FC<SortingVictoryModalProps> = ({
  isOpen,
  level,
  totalLevels,
  scoreBreakdown,
  cumulativeTotalScore,
  isNewBest,
  onNextLevel,
  onReplay,
  onGoToMenu,
  onOpenLeaderboard,
}) => {
  if (!isOpen) return null;

  const isFinalLevel = level >= totalLevels;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-start items-center p-4 sm:p-6 overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif]"
      style={{ backgroundColor: '#F3E9D8', color: '#40372F' }}
    >
      <div className="w-full max-w-md mx-auto space-y-4 pb-8 my-auto text-center">
        {/* Trophy Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-[#E6D8C3] border-2 border-[#D58A36] p-1 shadow-md">
            <div className="w-full h-full rounded-[20px] bg-[#F3E9D8] flex items-center justify-center text-[#D58A36]">
              <Trophy className="w-10 h-10" />
            </div>
          </div>
          {isNewBest && (
            <span className="absolute -top-2 -right-4 px-2.5 py-0.5 rounded-full bg-[#648B75] text-white font-black text-[10px] uppercase tracking-wider shadow-sm border border-[#D4C3AA]">
              NEW BEST!
            </span>
          )}
        </div>

        {/* Title & Level */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#40372F] uppercase tracking-tight">
            LEVEL {level} COMPLETED!
          </h2>
          <p className="text-xs text-[#786B5B] font-medium">
            {isFinalLevel
              ? '🏆 Master Grandmaster — All 40 Levels Solved!'
              : 'Exceptional tactical execution.'}
          </p>
        </div>

        {/* 3-Star Rating Animation */}
        <div className="flex items-center justify-center gap-2 py-1">
          {[1, 2, 3].map((star) => (
            <div
              key={star}
              className={`p-2 rounded-2xl border transition-all ${
                star <= scoreBreakdown.stars
                  ? 'bg-[#E6D8C3] border-[#D58A36] text-[#D58A36] scale-110 shadow-xs'
                  : 'bg-[#E6D8C3]/50 border-[#D4C3AA] text-[#D4C3AA]'
              }`}
            >
              <Star
                className={`w-7 h-7 ${
                  star <= scoreBreakdown.stars ? 'fill-[#D58A36]' : ''
                }`}
              />
            </div>
          ))}
        </div>

        {/* Score Breakdown Card */}
        <div className="p-4 rounded-2xl bg-[#E6D8C3] border border-[#D4C3AA] space-y-3 text-left shadow-sm">
          <div className="flex items-center justify-between border-b border-[#D4C3AA] pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#786B5B]">
              Score Breakdown
            </span>
            <span className="text-xs font-mono text-[#40372F] font-bold">
              {scoreBreakdown.moves} Moves • {scoreBreakdown.timeTakenSeconds}s
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            {/* Base Points */}
            <div className="flex justify-between text-[#40372F]">
              <span className="font-sans">Base Level Clearance</span>
              <span className="font-bold">+{scoreBreakdown.basePoints}</span>
            </div>

            {/* Move Par Bonus */}
            <div className="flex justify-between text-[#40372F]">
              <span className="font-sans">
                Move Efficiency Bonus (Par {scoreBreakdown.optimalParMoves})
              </span>
              <span className="text-[#648B75] font-bold">+{scoreBreakdown.moveBonus}</span>
            </div>

            {/* Speed Bonus */}
            <div className="flex justify-between text-[#40372F]">
              <span className="font-sans">Time / Speed Bonus</span>
              <span className="text-[#648B75] font-bold">+{scoreBreakdown.timeBonus}</span>
            </div>

            {/* Penalties if any */}
            {scoreBreakdown.undoPenalty > 0 && (
              <div className="flex justify-between text-rose-700">
                <span className="font-sans">Undo Penalty</span>
                <span className="font-bold">-{scoreBreakdown.undoPenalty}</span>
              </div>
            )}
            {scoreBreakdown.hintPenalty > 0 && (
              <div className="flex justify-between text-rose-700">
                <span className="font-sans">Hint Penalty</span>
                <span className="font-bold">-{scoreBreakdown.hintPenalty}</span>
              </div>
            )}
            {scoreBreakdown.extraTubePenalty > 0 && (
              <div className="flex justify-between text-rose-700">
                <span className="font-sans">Extra Buffer Tube Penalty</span>
                <span className="font-bold">-{scoreBreakdown.extraTubePenalty}</span>
              </div>
            )}

            {/* Total Level Score */}
            <div className="pt-2 border-t border-[#D4C3AA] flex justify-between items-center text-sm font-bold">
              <span className="text-[#40372F] font-sans uppercase">Level Score</span>
              <span className="text-[#D58A36] text-base font-black">
                {scoreBreakdown.totalScore.toLocaleString()} PTS
              </span>
            </div>

            {/* Total Cumulative Score */}
            <div className="pt-1 flex justify-between items-center text-xs">
              <span className="text-[#786B5B] font-sans uppercase">
                Total Tournament Score
              </span>
              <span className="text-[#40372F] font-bold">
                {cumulativeTotalScore.toLocaleString()} PTS
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {!isFinalLevel ? (
            <button
              onClick={onNextLevel}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#D58A36] hover:bg-[#c47b2c] active:scale-[0.98] text-white font-black text-sm uppercase tracking-wider shadow-md border border-[#b87024] flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>NEXT LEVEL</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onOpenLeaderboard}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#D58A36] hover:bg-[#c47b2c] text-white font-black text-sm uppercase tracking-wider shadow-md border border-[#b87024] flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Trophy className="w-5 h-5" />
              <span>VIEW FINAL TOURNAMENT RANK</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReplay}
              className="py-3 px-4 rounded-xl bg-[#E6D8C3] hover:bg-[#d8c8b0] active:scale-[0.98] text-[#40372F] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-[#D4C3AA] flex items-center justify-center gap-2 shadow-xs"
            >
              <RotateCcw className="w-4 h-4 text-[#D58A36]" />
              <span>REPLAY</span>
            </button>

            <button
              onClick={onGoToMenu}
              className="py-3 px-4 rounded-xl bg-[#E6D8C3] hover:bg-[#d8c8b0] active:scale-[0.98] text-[#40372F] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-[#D4C3AA] flex items-center justify-center gap-2 shadow-xs"
            >
              <Home className="w-4 h-4 text-[#786B5B]" />
              <span>MAIN MENU</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

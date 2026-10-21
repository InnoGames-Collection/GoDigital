import React from 'react';
import {
  Play,
  Grid,
  Trophy,
  HelpCircle,
  Award,
  BarChart3,
  Settings,
  Info,
  LogOut,
  Star,
  Zap,
  Flame,
} from 'lucide-react';
import { SortingPlayerProgress } from '../types';

interface SortingMenuModalProps {
  progress: SortingPlayerProgress;
  onPlay: () => void;
  onOpenLevels: () => void;
  onOpenLeaderboard: () => void;
  onOpenHowToPlay: () => void;
  onOpenAchievements: () => void;
  onOpenStatistics: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onExit: () => void;
}

export const SortingMenuModal: React.FC<SortingMenuModalProps> = ({
  progress,
  onPlay,
  onOpenLevels,
  onOpenLeaderboard,
  onOpenHowToPlay,
  onOpenAchievements,
  onOpenStatistics,
  onOpenSettings,
  onOpenAbout,
  onExit,
}) => {
  const currentLvl = progress.unlockedLevel || 1;
  const completedCount = progress.completedLevels?.length || 0;
  const bestLevelScore = progress.highScore || 0;
  const totalCumulativeScore = progress.totalCumulativeScore || 0;

  // Best moves across any level
  const bestMovesValues = (Object.values(progress.bestMoves || {}) as number[]);
  const bestMoves = bestMovesValues.length > 0 ? Math.min(...bestMovesValues) : '--';

  // Best time across any level
  const bestTimeValues = (Object.values(progress.levelBestTimes || {}) as number[]);
  const bestTime =
    bestTimeValues.length > 0
      ? `${Math.min(...bestTimeValues)}s`
      : '--';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-start items-center overflow-y-auto select-none p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]"
      style={{ backgroundColor: '#F3E9D8', color: '#40372F' }}
    >
      <div className="relative w-full max-w-md mx-auto my-auto flex flex-col items-center space-y-4 sm:space-y-5 z-10 py-4">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6D8C3] border border-[#D4C3AA] text-[#786B5B] text-xs font-bold tracking-wide uppercase shadow-xs">
          <Zap className="w-3.5 h-3.5 text-[#D58A36] fill-[#D58A36]" />
          <span>Strategic 3D Puzzle</span>
        </div>

        {/* Title & Description */}
        <div className="text-center space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase drop-shadow-xs flex items-center justify-center gap-2 text-[#40372F]">
            <span>SORTING</span>
            <span className="text-[#D58A36]">BALL</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#786B5B] max-w-xs mx-auto font-medium leading-relaxed">
            Sort the balls, plan every move and complete each level with the highest possible score.
          </p>
        </div>

        {/* Player Summary Stats Card (Real Stored Data) */}
        <div className="w-full rounded-2xl bg-[#E6D8C3] border border-[#D4C3AA] p-3.5 sm:p-4 shadow-md">
          <div className="flex items-center justify-between border-b border-[#D4C3AA] pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#D4C3AA] text-[#D58A36] flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#40372F]">
                Career Summary
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#D58A36] font-bold">
              <Flame className="w-3.5 h-3.5 fill-[#D58A36]" />
              <span>40 Levels</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            {/* Current Level */}
            <div className="p-2 rounded-xl bg-[#F3E9D8] border border-[#D4C3AA]/60">
              <span className="block text-[10px] text-[#786B5B] font-sans font-semibold uppercase tracking-wider">
                Current
              </span>
              <span className="text-base font-black text-[#D58A36]">
                Lvl {currentLvl}
              </span>
            </div>

            {/* Total Cumulative Score */}
            <div className="p-2 rounded-xl bg-[#F3E9D8] border border-[#D4C3AA]/60">
              <span className="block text-[10px] text-[#786B5B] font-sans font-semibold uppercase tracking-wider">
                Total Score
              </span>
              <span className="text-base font-black text-[#40372F]">
                {totalCumulativeScore.toLocaleString()}
              </span>
            </div>

            {/* Best Score */}
            <div className="p-2 rounded-xl bg-[#F3E9D8] border border-[#D4C3AA]/60">
              <span className="block text-[10px] text-[#786B5B] font-sans font-semibold uppercase tracking-wider">
                Best Score
              </span>
              <span className="text-base font-black text-[#648B75]">
                {bestLevelScore.toLocaleString()}
              </span>
            </div>

            {/* Levels Completed */}
            <div className="p-2 rounded-xl bg-[#F3E9D8] border border-[#D4C3AA]/60">
              <span className="block text-[10px] text-[#786B5B] font-sans font-semibold uppercase tracking-wider">
                Cleared
              </span>
              <span className="text-sm font-bold text-[#40372F]">
                {completedCount} / 40
              </span>
            </div>

            {/* Best Moves */}
            <div className="p-2 rounded-xl bg-[#F3E9D8] border border-[#D4C3AA]/60">
              <span className="block text-[10px] text-[#786B5B] font-sans font-semibold uppercase tracking-wider">
                Best Moves
              </span>
              <span className="text-sm font-bold text-[#40372F]">
                {bestMoves}
              </span>
            </div>

            {/* Best Time */}
            <div className="p-2 rounded-xl bg-[#F3E9D8] border border-[#D4C3AA]/60">
              <span className="block text-[10px] text-[#786B5B] font-sans font-semibold uppercase tracking-wider">
                Best Time
              </span>
              <span className="text-sm font-bold text-[#40372F]">
                {bestTime}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Call to Action: PLAY BUTTON */}
        <button
          onClick={onPlay}
          className="w-full py-4 px-6 rounded-2xl bg-[#D58A36] hover:bg-[#c47b2c] active:scale-[0.98] text-white font-black text-base uppercase tracking-wider shadow-[0_6px_20px_rgba(213,138,54,0.35)] border border-[#b87024] flex items-center justify-center gap-3 transition-all cursor-pointer group"
        >
          <Play className="w-6 h-6 fill-white stroke-none group-hover:scale-110 transition-transform" />
          <span>PLAY LEVEL {currentLvl}</span>
        </button>

        {/* Secondary Navigation Buttons Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5">
          {/* Levels */}
          <button
            onClick={onOpenLevels}
            className="py-3 px-3.5 rounded-xl bg-[#E6D8C3] hover:bg-[#d8c8b0] active:scale-[0.98] text-[#40372F] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-[#D4C3AA] flex items-center justify-center gap-2 shadow-xs"
          >
            <Grid className="w-4 h-4 text-[#D58A36]" />
            <span>LEVELS</span>
          </button>

          {/* Leaderboard */}
          <button
            onClick={onOpenLeaderboard}
            className="py-3 px-3.5 rounded-xl bg-[#E6D8C3] hover:bg-[#d8c8b0] active:scale-[0.98] text-[#40372F] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-[#D4C3AA] flex items-center justify-center gap-2 shadow-xs"
          >
            <Trophy className="w-4 h-4 text-[#D58A36]" />
            <span>LEADERBOARD</span>
          </button>

          {/* How to Play */}
          <button
            onClick={onOpenHowToPlay}
            className="py-3 px-3.5 rounded-xl bg-[#E6D8C3] hover:bg-[#d8c8b0] active:scale-[0.98] text-[#40372F] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-[#D4C3AA] flex items-center justify-center gap-2 shadow-xs"
          >
            <HelpCircle className="w-4 h-4 text-[#648B75]" />
            <span>HOW TO PLAY</span>
          </button>

          {/* Achievements */}
          <button
            onClick={onOpenAchievements}
            className="py-3 px-3.5 rounded-xl bg-[#E6D8C3] hover:bg-[#d8c8b0] active:scale-[0.98] text-[#40372F] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-[#D4C3AA] flex items-center justify-center gap-2 shadow-xs"
          >
            <Award className="w-4 h-4 text-[#786B5B]" />
            <span>ACHIEVEMENTS</span>
          </button>

          {/* Statistics */}
          <button
            onClick={onOpenStatistics}
            className="py-3 px-3.5 rounded-xl bg-[#E6D8C3] hover:bg-[#d8c8b0] active:scale-[0.98] text-[#40372F] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-[#D4C3AA] flex items-center justify-center gap-2 shadow-xs"
          >
            <BarChart3 className="w-4 h-4 text-[#786B5B]" />
            <span>STATISTICS</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="py-3 px-3.5 rounded-xl bg-[#E6D8C3] hover:bg-[#d8c8b0] active:scale-[0.98] text-[#40372F] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-[#D4C3AA] flex items-center justify-center gap-2 shadow-xs"
          >
            <Settings className="w-4 h-4 text-[#786B5B]" />
            <span>SETTINGS</span>
          </button>
        </div>

        {/* Utility Buttons: About & Exit */}
        <div className="w-full flex items-center justify-between pt-1">
          <button
            onClick={onOpenAbout}
            className="text-xs text-[#786B5B] hover:text-[#40372F] flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-[#E6D8C3] transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>ABOUT</span>
          </button>

          <button
            onClick={onExit}
            className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>EXIT GAME</span>
          </button>
        </div>
      </div>
    </div>
  );
};

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
  Sparkles,
} from 'lucide-react';
import { EmojiSortingPlayerProgress } from '../types';

interface EmojiSortingMenuModalProps {
  progress: EmojiSortingPlayerProgress;
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

export const EmojiSortingMenuModal: React.FC<EmojiSortingMenuModalProps> = ({
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

  const bestMovesValues = Object.values(progress.bestMoves || {}) as number[];
  const bestMoves = bestMovesValues.length > 0 ? Math.min(...bestMovesValues) : '--';

  const bestTimeValues = Object.values(progress.levelBestTimes || {}) as number[];
  const bestTime = bestTimeValues.length > 0 ? `${Math.min(...bestTimeValues)}s` : '--';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-start items-center overflow-y-auto select-none p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]"
      style={{
        backgroundColor: '#F3E9D8',
        color: '#40372F',
      }}
    >
      <div className="relative w-full max-w-md mx-auto my-auto flex flex-col items-center space-y-4 sm:space-y-5 z-10 py-4">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6D8C3] border border-[#D4C3AA] text-[#786B5B] text-xs font-bold tracking-wide uppercase shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#D58A36] fill-[#D58A36]" />
          <span>3D Emoji Tournament Puzzle</span>
        </div>

        {/* Title & Description */}
        <div className="text-center space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#40372F] uppercase drop-shadow-xs flex items-center justify-center gap-2">
            <span>EMOJI</span>
            <span className="text-[#D58A36]">SORTING BALL</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#786B5B] max-w-xs mx-auto font-medium leading-relaxed">
            Sort stylized 3D emojis into jewel-tinted glass cylinders. Plan every move and master all 40 levels.
          </p>
        </div>

        {/* Player Summary Stats Card */}
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
              <span>40 Championship Levels</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
            <div className="bg-[#F3E9D8] border border-[#D4C3AA]/60 rounded-xl p-2">
              <span className="block text-[10px] uppercase font-bold text-[#786B5B] tracking-wider">Unlocked</span>
              <span className="text-base sm:text-lg font-black text-[#D58A36]">
                Lvl {currentLvl}
              </span>
            </div>
            <div className="bg-[#F3E9D8] border border-[#D4C3AA]/60 rounded-xl p-2">
              <span className="block text-[10px] uppercase font-bold text-[#786B5B] tracking-wider">Cleared</span>
              <span className="text-base sm:text-lg font-black text-[#648B75]">
                {completedCount}/40
              </span>
            </div>
            <div className="bg-[#F3E9D8] border border-[#D4C3AA]/60 rounded-xl p-2">
              <span className="block text-[10px] uppercase font-bold text-[#786B5B] tracking-wider">Best Lvl Pts</span>
              <span className="text-base sm:text-lg font-black text-[#40372F]">
                {bestLevelScore.toLocaleString()}
              </span>
            </div>
            <div className="bg-[#F3E9D8] border border-[#D4C3AA]/60 rounded-xl p-2">
              <span className="block text-[10px] uppercase font-bold text-[#786B5B] tracking-wider">Total Pts</span>
              <span className="text-base sm:text-lg font-black text-[#40372F]">
                {totalCumulativeScore.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Big Action Play Button */}
        <button
          onClick={onPlay}
          className="w-full py-4 px-6 rounded-2xl bg-[#D58A36] hover:bg-[#c47b2c] text-white font-black text-lg tracking-wide uppercase shadow-[0_6px_20px_rgba(213,138,54,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-[#b87024] group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-white" />
          </div>
          <span>{completedCount === 0 ? 'START LEVEL 1' : `CONTINUE LEVEL ${currentLvl}`}</span>
        </button>

        {/* Secondary Grid Navigation */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          <button
            onClick={onOpenLevels}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#E6D8C3] hover:bg-[#d8c8b0] border border-[#D4C3AA] shadow-xs active:scale-95 transition-all text-center group cursor-pointer"
          >
            <Grid className="w-5 h-5 text-[#D58A36] mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-[#40372F]">Level Select</span>
            <span className="text-[10px] text-[#786B5B]">40 Levels</span>
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#E6D8C3] hover:bg-[#d8c8b0] border border-[#D4C3AA] shadow-xs active:scale-95 transition-all text-center group cursor-pointer"
          >
            <Trophy className="w-5 h-5 text-[#D58A36] mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-[#40372F]">Leaderboard</span>
            <span className="text-[10px] text-[#786B5B]">Rankings</span>
          </button>

          <button
            onClick={onOpenHowToPlay}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#E6D8C3] hover:bg-[#d8c8b0] border border-[#D4C3AA] shadow-xs active:scale-95 transition-all text-center group cursor-pointer"
          >
            <HelpCircle className="w-5 h-5 text-[#648B75] mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-[#40372F]">How to Play</span>
            <span className="text-[10px] text-[#786B5B]">Rules & Strategy</span>
          </button>

          <button
            onClick={onOpenAchievements}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#E6D8C3] hover:bg-[#d8c8b0] border border-[#D4C3AA] shadow-xs active:scale-95 transition-all text-center group cursor-pointer"
          >
            <Award className="w-5 h-5 text-[#786B5B] mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-[#40372F]">Awards</span>
            <span className="text-[10px] text-[#786B5B]">Badges</span>
          </button>
        </div>

        {/* Tertiary Utility Buttons */}
        <div className="w-full grid grid-cols-4 gap-2">
          <button
            onClick={onOpenStatistics}
            className="py-2.5 px-2 rounded-xl bg-[#E6D8C3] hover:bg-[#d8c8b0] border border-[#D4C3AA] shadow-xs flex flex-col items-center text-center text-[#40372F] transition-all cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 mb-1 text-[#786B5B]" />
            <span className="text-[10px] font-semibold">Stats</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="py-2.5 px-2 rounded-xl bg-[#E6D8C3] hover:bg-[#d8c8b0] border border-[#D4C3AA] shadow-xs flex flex-col items-center text-center text-[#40372F] transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4 mb-1 text-[#786B5B]" />
            <span className="text-[10px] font-semibold">Audio</span>
          </button>

          <button
            onClick={onOpenAbout}
            className="py-2.5 px-2 rounded-xl bg-[#E6D8C3] hover:bg-[#d8c8b0] border border-[#D4C3AA] shadow-xs flex flex-col items-center text-center text-[#40372F] transition-all cursor-pointer"
          >
            <Info className="w-4 h-4 mb-1 text-[#786B5B]" />
            <span className="text-[10px] font-semibold">About</span>
          </button>

          <button
            onClick={onExit}
            className="py-2.5 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-xs flex flex-col items-center text-center text-rose-700 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 mb-1 text-rose-500" />
            <span className="text-[10px] font-semibold">Exit</span>
          </button>
        </div>
      </div>
    </div>
  );
};

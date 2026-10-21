import React from 'react';
import { BarChart3, X, CheckCircle, Clock, Zap, Undo, HelpCircle, PlusCircle, Trophy } from 'lucide-react';
import { EmojiSortingPlayerProgress } from '../types';

interface EmojiSortingStatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: EmojiSortingPlayerProgress;
}

export const EmojiSortingStatisticsModal: React.FC<EmojiSortingStatisticsModalProps> = ({
  isOpen,
  onClose,
  progress,
}) => {
  if (!isOpen) return null;

  const completedCount = progress.completedLevels?.length || 0;
  const bestMovesValues = Object.values(progress.bestMoves || {}) as number[];
  const bestMoves = bestMovesValues.length > 0 ? Math.min(...bestMovesValues) : '--';

  const bestTimesValues = Object.values(progress.levelBestTimes || {}) as number[];
  const bestTime =
    bestTimesValues.length > 0 ? `${Math.min(...bestTimesValues)}s` : '--';

  const stats = [
    {
      label: 'Levels Completed',
      value: `${completedCount} / 40`,
      icon: <CheckCircle className="w-4 h-4 text-[#648B75]" />,
    },
    {
      label: 'Total Cumulative Score',
      value: (progress.totalCumulativeScore || 0).toLocaleString(),
      icon: <Trophy className="w-4 h-4 text-[#D58A36]" />,
    },
    {
      label: 'Highest Level Score',
      value: (progress.highScore || 0).toLocaleString(),
      icon: <Zap className="w-4 h-4 text-[#D58A36]" />,
    },
    {
      label: 'Total Games Played',
      value: progress.stats?.gamesPlayed || completedCount,
      icon: <BarChart3 className="w-4 h-4 text-[#40372F]" />,
    },
    {
      label: 'Best Move Count',
      value: bestMoves,
      icon: <Zap className="w-4 h-4 text-[#648B75]" />,
    },
    {
      label: 'Best Completion Time',
      value: bestTime,
      icon: <Clock className="w-4 h-4 text-[#648B75]" />,
    },
    {
      label: 'Total Undos Used',
      value: progress.stats?.totalUndosUsed || 0,
      icon: <Undo className="w-4 h-4 text-[#786B5B]" />,
    },
    {
      label: 'Total Hints Used',
      value: progress.stats?.totalHintsUsed || 0,
      icon: <HelpCircle className="w-4 h-4 text-[#786B5B]" />,
    },
    {
      label: 'Total Extra Tubes Used',
      value: progress.stats?.totalExtraTubesUsed || 0,
      icon: <PlusCircle className="w-4 h-4 text-[#D58A36]" />,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-start items-center p-4 sm:p-6 overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif]"
      style={{ backgroundColor: '#F3E9D8', color: '#40372F' }}
    >
      <div className="w-full max-w-lg mx-auto space-y-4 pb-8 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D4C3AA] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6D8C3] border border-[#D4C3AA] flex items-center justify-center text-[#D58A36]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#40372F] uppercase tracking-tight">
                STATISTICS
              </h2>
              <p className="text-xs text-[#786B5B]">
                Detailed Emoji Sorting Career Metrics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-[#E6D8C3] hover:bg-[#d8c8b0] active:scale-95 text-[#40372F] flex items-center justify-center transition-colors cursor-pointer border border-[#D4C3AA]"
            aria-label="Close Statistics"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl border border-[#D4C3AA] bg-[#E6D8C3] flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F3E9D8] border border-[#D4C3AA] flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-xs font-semibold text-[#786B5B]">
                  {item.label}
                </span>
              </div>
              <span className="text-sm font-black font-mono text-[#40372F]">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

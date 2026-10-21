import React, { useState } from 'react';
import { Grid, X, Lock, Star, CheckCircle } from 'lucide-react';
import { SortingPlayerProgress } from '../types';
import { SORTING_LEVELS } from '../levels';

interface SortingLevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: SortingPlayerProgress;
  onSelectLevel: (levelNum: number) => void;
  currentLevel: number;
}

export const SortingLevelSelectModal: React.FC<SortingLevelSelectModalProps> = ({
  isOpen,
  onClose,
  progress,
  onSelectLevel,
  currentLevel,
}) => {
  const [selectedTier, setSelectedTier] = useState<number>(1);

  if (!isOpen) return null;

  const unlockedLvl = progress.unlockedLevel || 1;
  const completedLevels = progress.completedLevels || [];
  const levelScores = progress.levelScores || {};
  const levelStars = progress.levelStars || {};

  const tiers = [
    { id: 1, name: 'Levels 1–10', range: [1, 10], desc: 'Hard & Very Hard' },
    { id: 2, name: 'Levels 11–20', range: [11, 20], desc: 'Expert Tier' },
    { id: 3, name: 'Levels 21–30', range: [21, 30], desc: 'Advanced Expert+' },
    { id: 4, name: 'Levels 31–40', range: [31, 40], desc: 'Extreme & Master' },
  ];

  const currentTierObj = tiers.find((t) => t.id === selectedTier) || tiers[0];
  const [startLvl, endLvl] = currentTierObj.range;

  const tierLevels = Array.from({ length: endLvl - startLvl + 1 }, (_, i) => startLvl + i);

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
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#40372F] uppercase tracking-tight">
                SELECT LEVEL
              </h2>
              <p className="text-xs text-[#786B5B]">
                40 Progressive Championship Puzzles
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-[#E6D8C3] hover:bg-[#d8c8b0] active:scale-95 text-[#40372F] flex items-center justify-center transition-colors cursor-pointer border border-[#D4C3AA]"
            aria-label="Close Level Select"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tier Selector Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-[#E6D8C3] border border-[#D4C3AA]">
          {tiers.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTier(t.id)}
              className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                selectedTier === t.id
                  ? 'bg-[#D58A36] text-white font-black shadow-xs'
                  : 'text-[#786B5B] hover:text-[#40372F] font-semibold'
              }`}
            >
              <div className="text-[11px] leading-none uppercase">
                {t.name.split(' ')[1]}
              </div>
            </button>
          ))}
        </div>

        {/* Tier Description */}
        <div className="flex items-center justify-between px-1 text-xs text-[#786B5B]">
          <span className="font-semibold text-[#40372F]">{currentTierObj.name}</span>
          <span className="text-[#D58A36] font-mono text-[11px] font-bold">{currentTierObj.desc}</span>
        </div>

        {/* 10 Level Cards in Current Tier */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {tierLevels.map((lvl) => {
            const isUnlocked = lvl <= unlockedLvl;
            const isCompleted = completedLevels.includes(lvl);
            const isCurrent = lvl === currentLevel;
            const stars = levelStars[lvl] || 0;
            const bestScore = levelScores[lvl] || 0;
            const optimalMoves = SORTING_LEVELS[lvl - 1]?.optimalMoves || 15;

            return (
              <button
                key={lvl}
                disabled={!isUnlocked}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectLevel(lvl);
                    onClose();
                  }
                }}
                className={`p-3 rounded-2xl flex flex-col items-center justify-between min-h-[96px] transition-all cursor-pointer relative border ${
                  !isUnlocked
                    ? 'bg-[#E6D8C3]/40 border-[#D4C3AA]/40 opacity-45 cursor-not-allowed'
                    : isCurrent
                    ? 'bg-[#E6D8C3] border-2 border-[#D58A36] ring-2 ring-[#D58A36]/30 shadow-md'
                    : isCompleted
                    ? 'bg-[#E6D8C3] border-[#648B75]/50 hover:bg-[#dfd0bb]'
                    : 'bg-[#E6D8C3] border-[#D4C3AA] hover:bg-[#dfd0bb]'
                }`}
              >
                {/* Top: Level Number & Lock / Completed Icon */}
                <div className="w-full flex items-center justify-between">
                  <span className="text-xs font-black font-mono text-[#40372F]">
                    #{lvl}
                  </span>
                  {!isUnlocked ? (
                    <Lock className="w-3.5 h-3.5 text-[#786B5B]" />
                  ) : isCompleted ? (
                    <CheckCircle className="w-3.5 h-3.5 text-[#648B75]" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-[#D58A36] animate-pulse" />
                  )}
                </div>

                {/* Center: Stars */}
                <div className="flex items-center gap-0.5 my-1">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        s <= stars
                          ? 'text-[#D58A36] fill-[#D58A36]'
                          : 'text-[#D4C3AA]'
                      }`}
                    />
                  ))}
                </div>

                {/* Bottom: Score or Par */}
                <div className="text-[10px] font-mono text-[#786B5B] w-full text-center truncate">
                  {bestScore > 0 ? (
                    <span className="text-[#D58A36] font-bold">
                      {bestScore} pts
                    </span>
                  ) : isUnlocked ? (
                    <span className="text-[#786B5B]">Par {optimalMoves}</span>
                  ) : (
                    <span className="text-[#786B5B]/60">Locked</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { ArrowLeft, Lock, Star, Trophy } from 'lucide-react';
import { FlipTileProgress } from './types';
import { FLIP_TILE_LEVELS } from './levels';
import { FlipTileAudio } from './audio';

interface FlipTileLevelSelectProps {
  progress: FlipTileProgress;
  onSelectLevel: (lvlNum: number) => void;
  onBack: () => void;
}

export const FlipTileLevelSelect: React.FC<FlipTileLevelSelectProps> = ({
  progress,
  onSelectLevel,
  onBack,
}) => {
  const handleLevelClick = (lvlNum: number, isUnlocked: boolean) => {
    if (!isUnlocked) {
      FlipTileAudio.playMismatchSound();
      return;
    }
    FlipTileAudio.playFlipSound();
    onSelectLevel(lvlNum);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-start items-center p-4 bg-[#1E1B2E] text-white select-none overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background Accent Glows */}
      <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-between pb-3 pt-1 border-b border-white/10 mb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-black text-amber-300 hover:bg-white/20 active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Back</span>
        </button>

        <h2 className="text-base font-black italic tracking-wide uppercase text-white drop-shadow-xs">
          40 Tournament Levels
        </h2>

        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-xs font-black text-amber-300 shadow-xs">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>{progress.unlockedLevel}/40</span>
        </div>
      </div>

      {/* Grid of 40 Levels */}
      <div className="relative z-10 w-full max-w-md flex-1 overflow-y-auto pr-1 pb-4">
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
          {FLIP_TILE_LEVELS.map((lvl) => {
            const isUnlocked = lvl.levelNumber <= progress.unlockedLevel;
            const isCurrent = lvl.levelNumber === progress.unlockedLevel;
            const rec = progress.records[lvl.levelNumber];
            const stars = rec?.stars ?? 0;

            return (
              <button
                key={lvl.levelNumber}
                onClick={() => handleLevelClick(lvl.levelNumber, isUnlocked)}
                disabled={!isUnlocked}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center p-1 transition-all ${
                  isUnlocked
                    ? isCurrent
                      ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 border-2 border-white shadow-[0_0_15px_rgba(251,191,36,0.6)] text-slate-950 scale-102 cursor-pointer active:scale-95 animate-pulse'
                      : 'bg-[#2A2542] hover:bg-[#342E52] border border-white/20 text-white shadow-xs cursor-pointer active:scale-95'
                    : 'bg-[#181524] border border-white/5 text-slate-600 cursor-not-allowed opacity-50'
                }`}
              >
                {isUnlocked ? (
                  <>
                    <span
                      className={`text-base font-black font-sans ${
                        isCurrent ? 'text-slate-950' : 'text-white'
                      }`}
                    >
                      {lvl.levelNumber}
                    </span>

                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-2.5 h-2.5 ${
                            s <= stars
                              ? 'fill-amber-400 text-amber-300 drop-shadow-xs'
                              : isCurrent
                              ? 'text-amber-800'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-500 mt-1">
                      {lvl.levelNumber}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

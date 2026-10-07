/**
 * Color Rush - Simple Level Screen
 * 
 * Clean 40-level progression list:
 * - Each level shows Level number, Lock/unlock state, Best score if already played
 * - Level 1 is unlocked initially, Levels 2-40 locked until previous is completed
 * - Locked levels visibly show lock and cannot be played
 * - Clean Back navigation to Color Rush Menu
 */

import React from 'react';
import { ArrowLeft, Lock, Play } from 'lucide-react';
import { ColorRushProgression } from '../types';
import { ColorRushAudio } from '../colorRushAudio';
import { TOTAL_COLOR_RUSH_LEVELS } from '../levels';

interface ColorRushLevelSelectModalProps {
  progression: ColorRushProgression;
  selectedLevel: number;
  onSelectLevel: (level: number) => void;
  onBack: () => void;
}

export const ColorRushLevelSelectModal: React.FC<ColorRushLevelSelectModalProps> = ({
  progression,
  selectedLevel,
  onSelectLevel,
  onBack,
}) => {
  const levels = Array.from({ length: TOTAL_COLOR_RUSH_LEVELS }, (_, i) => i + 1);

  const handleLevelClick = (level: number) => {
    if (level > progression.currentUnlockedLevel) {
      ColorRushAudio.playWrong();
      return;
    }
    ColorRushAudio.playTap();
    onSelectLevel(level);
  };

  return (
    <div 
      className="relative w-full max-w-md mx-auto flex flex-col items-center select-none rounded-3xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl min-h-[580px] max-h-[90vh] font-['Plus_Jakarta_Sans',sans-serif] text-slate-100"
      style={{
        background: 'radial-gradient(circle at 50% 15%, #0a254d 0%, #03142e 55%, #010917 100%)',
      }}
    >
      {/* Header with clean Back button */}
      <div 
        id="color-rush-level-header"
        className="w-full bg-[#051c3d]/95 backdrop-blur-md px-4 py-3.5 border-b border-[#0e3b75] flex items-center justify-between z-20 shrink-0"
      >
        <button
          id="color-rush-level-back-btn"
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

        <h2 className="text-lg font-black text-white tracking-wide uppercase">
          LEVELS
        </h2>

        <div className="text-xs font-bold font-mono text-cyan-400">
          {progression.currentUnlockedLevel}/{TOTAL_COLOR_RUSH_LEVELS} Unlocked
        </div>
      </div>

      {/* Clean Grid/List of 40 Level Buttons */}
      <div className="w-full flex-1 overflow-y-auto p-4 space-y-2.5 z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {levels.map((lvl) => {
            const isUnlocked = lvl <= progression.currentUnlockedLevel;
            const isSelected = lvl === selectedLevel;
            const bestScore = progression.levelBestScores[lvl] || 0;

            if (!isUnlocked) {
              return (
                <div
                  key={lvl}
                  id={`color-rush-level-${lvl}-locked`}
                  className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between opacity-50 cursor-not-allowed select-none"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-black font-mono text-slate-400">
                      LEVEL {lvl}
                    </span>
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>LOCKED</span>
                    </span>
                  </div>
                  <Lock className="w-4 h-4 text-slate-600" />
                </div>
              );
            }

            return (
              <button
                key={lvl}
                id={`color-rush-level-${lvl}-btn`}
                onClick={() => handleLevelClick(lvl)}
                className={`p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#0e3b75] to-[#07244c] border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-[#071f3f]/80 hover:bg-[#0b2d5a] border-cyan-500/30'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-black font-mono text-white">
                    LEVEL {lvl}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-cyan-400">
                      PLAYABLE
                    </span>
                    {bestScore > 0 && (
                      <span className="text-xs font-mono text-amber-400 font-semibold">
                        • Best: {bestScore} PTS
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Play className="w-4 h-4 fill-cyan-400 ml-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

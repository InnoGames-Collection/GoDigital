/**
 * Color Rush - Main Menu
 * 
 * Clean, focused menu showing ONLY:
 * COLOR RUSH
 * [ PLAY ]
 * [ LEVEL ]
 * [ LEADERBOARD ]
 * [ SETTINGS ]
 */

import React from 'react';
import { ArrowLeft, Play, Layers, Trophy, Settings } from 'lucide-react';
import { ColorRushAudio } from '../colorRushAudio';
import { ColorRushScreenState } from '../types';

interface ColorRushMainMenuProps {
  selectedLevel: number;
  onPlay: () => void;
  onNavigate: (screen: ColorRushScreenState) => void;
  onExit: () => void;
}

export const ColorRushMainMenu: React.FC<ColorRushMainMenuProps> = ({
  selectedLevel,
  onPlay,
  onNavigate,
  onExit,
}) => {
  const handlePlayClick = () => {
    ColorRushAudio.playTap();
    onPlay();
  };

  const handleLevelClick = () => {
    ColorRushAudio.playTap();
    onNavigate('LEVEL_SELECT');
  };

  const handleLeaderboardClick = () => {
    ColorRushAudio.playTap();
    onNavigate('LEADERBOARD');
  };

  const handleSettingsClick = () => {
    ColorRushAudio.playTap();
    onNavigate('SETTINGS');
  };

  return (
    <div 
      className="relative w-full max-w-md mx-auto flex flex-col items-center justify-between select-none rounded-3xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl min-h-[580px] p-6 font-['Plus_Jakarta_Sans',sans-serif] text-slate-100"
      style={{
        background: 'radial-gradient(circle at 50% 20%, #0a254d 0%, #03142e 55%, #010917 100%)',
      }}
    >
      {/* Dynamic Cyber Glow Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 z-0">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-cyan-500/25 blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-4 w-72 h-72 rounded-full bg-blue-600/20 blur-3xl" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.25) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Top bar with back to portal button */}
      <div className="w-full flex items-center justify-start z-10">
        <button
          id="color-rush-menu-exit-btn"
          onClick={onExit}
          className="h-10 px-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 border border-slate-700 flex items-center gap-1.5 text-slate-300 text-xs font-bold transition-all cursor-pointer shadow-xs"
          title="Exit to Games Portal"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit</span>
        </button>
      </div>

      {/* Centered Main Menu Content */}
      <div className="w-full max-w-xs flex flex-col items-center my-auto z-10 space-y-8">
        {/* Game Title */}
        <div className="flex flex-col items-center text-center">
          <h1 
            id="color-rush-title"
            className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 drop-shadow-md"
          >
            COLOR RUSH
          </h1>
        </div>

        {/* 4 Simple, Clean Menu Options */}
        <div className="w-full flex flex-col gap-3.5">
          {/* 1. PLAY */}
          <button
            id="color-rush-play-btn"
            onClick={handlePlayClick}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:brightness-110 active:scale-[0.98] text-slate-950 font-black text-lg tracking-wider uppercase flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer border border-white/40"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>PLAY</span>
          </button>

          {/* 2. LEVEL */}
          <button
            id="color-rush-level-btn"
            onClick={handleLevelClick}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#09244a] hover:bg-[#0e3366] active:scale-[0.98] text-white font-bold text-base tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all cursor-pointer border border-cyan-500/40 shadow-md"
          >
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>LEVEL</span>
          </button>

          {/* 3. LEADERBOARD */}
          <button
            id="color-rush-leaderboard-btn"
            onClick={handleLeaderboardClick}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#09244a] hover:bg-[#0e3366] active:scale-[0.98] text-white font-bold text-base tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all cursor-pointer border border-cyan-500/40 shadow-md"
          >
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>LEADERBOARD</span>
          </button>

          {/* 4. SETTINGS */}
          <button
            id="color-rush-settings-btn"
            onClick={handleSettingsClick}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#09244a] hover:bg-[#0e3366] active:scale-[0.98] text-white font-bold text-base tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all cursor-pointer border border-cyan-500/40 shadow-md"
          >
            <Settings className="w-5 h-5 text-slate-300" />
            <span>SETTINGS</span>
          </button>
        </div>
      </div>

      {/* Footer indicator showing selected level */}
      <div className="w-full text-center text-xs font-semibold text-cyan-400/80 z-10">
        Current Level: {selectedLevel}
      </div>
    </div>
  );
};

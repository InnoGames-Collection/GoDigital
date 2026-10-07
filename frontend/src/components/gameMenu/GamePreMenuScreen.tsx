import React, { useState } from 'react';
import { ArrowLeft, Play, Grid, Trophy, Settings, HelpCircle } from 'lucide-react';
import { GameLeaderboardModal } from './GameLeaderboardModal';
import { GameSettingsModal } from './GameSettingsModal';
import { GameHowToPlayModal } from './GameHowToPlayModal';

interface GamePreMenuScreenProps {
  gameId: string;
  gameTitle: string;
  tagline?: string;
  unlockedLevel: number;
  totalLevels?: number;
  highScore?: number;
  userPhone?: string;
  soundEnabled: boolean;
  musicEnabled: boolean;
  rules: string[];
  controlsDescription?: string;
  bgGradient?: string;
  primaryAccentHex?: string;
  heroContent?: React.ReactNode;
  onPlayCurrentLevel: () => void;
  onOpenLevelSelect: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onExit: () => void;
}

export const GamePreMenuScreen: React.FC<GamePreMenuScreenProps> = ({
  gameId,
  gameTitle,
  tagline = '40-Stage Tournament Challenge',
  unlockedLevel,
  totalLevels = 40,
  highScore = 0,
  userPhone,
  soundEnabled,
  musicEnabled,
  rules,
  controlsDescription,
  bgGradient = 'from-[#171D2D] via-[#0E1320] to-[#080B13]',
  primaryAccentHex = '#38BDF8',
  heroContent,
  onPlayCurrentLevel,
  onOpenLevelSelect,
  onToggleSound,
  onToggleMusic,
  onExit,
}) => {
  const [modalState, setModalState] = useState<'none' | 'leaderboard' | 'settings' | 'rules'>('none');

  return (
    <div
      className={`relative w-full h-full flex flex-col justify-between items-center p-4 sm:p-6 bg-gradient-to-b ${bgGradient} text-white select-none overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]`}
    >
      {/* Top Header Bar */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-between pt-1">
        {/* Top Back Button: Must say BACK or ← (never GoPlay! Sections 16, 28) */}
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 hover:text-white border border-white/20 text-xs font-black transition-all shadow-md cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>BACK</span>
        </button>

        {/* Level Status Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-black text-amber-300">
          <span>Level {unlockedLevel}/{totalLevels}</span>
        </div>
      </div>

      {/* Hero / Game Identity Center */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center my-auto py-4 text-center">
        {heroContent ? (
          heroContent
        ) : (
          <div className="relative mb-6 flex flex-col items-center">
            <h1 className="text-4xl sm:text-5xl font-black italic tracking-wide uppercase drop-shadow-xl text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-white">
              {gameTitle}
            </h1>
            <p className="text-xs sm:text-sm font-extrabold tracking-widest text-slate-400 uppercase mt-2">
              {tagline}
            </p>
          </div>
        )}

        {/* Play Current Level CTA Button */}
        <button
          onClick={onPlayCurrentLevel}
          style={{ backgroundColor: primaryAccentHex }}
          className="group relative w-full max-w-xs py-4 px-8 rounded-2xl hover:brightness-110 active:scale-95 text-slate-950 font-black text-base sm:text-lg tracking-wider uppercase shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all flex items-center justify-center gap-3 border-2 border-white/40 cursor-pointer mb-5"
        >
          <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
          <span>PLAY LEVEL {unlockedLevel}</span>
        </button>

        {/* 4 Main Options Grid (Section 3: Levels, Leaderboard, Settings, How to Play) */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          {/* 1. LEVELS */}
          <button
            onClick={onOpenLevelSelect}
            className="py-3 px-3 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs tracking-wider uppercase border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Grid className="w-4 h-4 text-amber-400" />
            <span>LEVELS</span>
          </button>

          {/* 2. LEADERBOARD */}
          <button
            onClick={() => setModalState('leaderboard')}
            className="py-3 px-3 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs tracking-wider uppercase border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>LEADERBOARD</span>
          </button>

          {/* 3. SETTINGS */}
          <button
            onClick={() => setModalState('settings')}
            className="py-3 px-3 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs tracking-wider uppercase border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>SETTINGS</span>
          </button>

          {/* 4. HOW TO PLAY */}
          <button
            onClick={() => setModalState('rules')}
            className="py-3 px-3 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs tracking-wider uppercase border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>HOW TO PLAY</span>
          </button>
        </div>
      </div>

      {/* High Score Footer */}
      <div className="relative z-10 w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between text-xs text-slate-400 mb-1">
        <span>High Score: <strong className="text-white">{highScore.toLocaleString()} PTS</strong></span>
        <span>Tournament Tier: <strong className="text-amber-400">Very Hard</strong></span>
      </div>

      {/* Sub-Modals */}
      {modalState === 'leaderboard' && (
        <GameLeaderboardModal
          gameId={gameId}
          gameTitle={gameTitle}
          userScore={highScore}
          userPhone={userPhone}
          onClose={() => setModalState('none')}
        />
      )}

      {modalState === 'settings' && (
        <GameSettingsModal
          gameTitle={gameTitle}
          soundEnabled={soundEnabled}
          musicEnabled={musicEnabled}
          onToggleSound={onToggleSound}
          onToggleMusic={onToggleMusic}
          onClose={() => setModalState('none')}
        />
      )}

      {modalState === 'rules' && (
        <GameHowToPlayModal
          gameTitle={gameTitle}
          rules={rules}
          controlsDescription={controlsDescription}
          onClose={() => setModalState('none')}
        />
      )}
    </div>
  );
};

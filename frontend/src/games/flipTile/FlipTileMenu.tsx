import React, { useState } from 'react';
import { ArrowLeft, Play, Grid, HelpCircle, Volume2, VolumeX, Music, Trophy, Bot, Settings } from 'lucide-react';
import { FlipTileProgress } from './types';
import { FlipTileAudio } from './audio';
import { GameLeaderboardModal, GameSettingsModal } from '../../components/gameMenu';

interface FlipTileMenuProps {
  progress: FlipTileProgress;
  onPlayLevel: () => void;
  onOpenLevelSelect: () => void;
  onExit: () => void;
  isAudioEnabled?: boolean;
}

export const FlipTileMenu: React.FC<FlipTileMenuProps> = ({
  progress,
  onPlayLevel,
  onOpenLevelSelect,
  onExit,
}) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [soundMuted, setSoundMuted] = useState(FlipTileAudio.getSoundMuted());
  const [musicMuted, setMusicMuted] = useState(FlipTileAudio.getMusicMuted());

  const handleToggleSound = () => {
    const muted = FlipTileAudio.toggleSound();
    setSoundMuted(muted);
    if (!muted) FlipTileAudio.playFlipSound();
  };

  const handleToggleMusic = () => {
    const muted = FlipTileAudio.toggleMusic();
    setMusicMuted(muted);
  };

  const handleStart = () => {
    FlipTileAudio.playFlipSound();
    onPlayLevel();
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center p-4 sm:p-6 bg-[#1A162B] text-white select-none overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background Radial Atmosphere */}
      <div className="absolute top-1/4 inset-x-0 h-64 pointer-events-none opacity-30 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(245,166,35,0.4)_0%,transparent_80%)]" />

      {/* Top Header Bar */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-between pt-1">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-black text-amber-300 hover:bg-white/20 active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>GoPlay</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Audio Toggles */}
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-full border text-xs transition-all active:scale-90 cursor-pointer ${
              soundMuted
                ? 'bg-slate-800 border-slate-700 text-slate-500'
                : 'bg-amber-500/20 border-amber-400/40 text-amber-300 shadow-xs'
            }`}
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleToggleMusic}
            className={`p-2 rounded-full border text-xs transition-all active:scale-90 cursor-pointer ${
              musicMuted
                ? 'bg-slate-800 border-slate-700 text-slate-500'
                : 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300 shadow-xs'
            }`}
          >
            <Music className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero / Logo Branding Section */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center my-auto py-4 text-center">
        {/* Animated 3D Floating Tiles Graphic */}
        <div className="relative mb-6 flex items-center justify-center gap-3">
          <div className="w-16 h-20 rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#D97706] border-2 border-white shadow-xl flex items-center justify-center text-3xl transform -rotate-12 animate-pulse">
            🐶
          </div>
          <div className="w-16 h-20 rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#D97706] border-2 border-white shadow-xl flex items-center justify-center text-3xl transform rotate-6">
            🍕
          </div>
          <div className="w-16 h-20 rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#D97706] border-2 border-white shadow-xl flex items-center justify-center text-3xl transform -rotate-6">
            🐟
          </div>
        </div>

        {/* Title Typography */}
        <div className="flex flex-col items-center leading-none mb-2">
          <span className="text-4xl sm:text-5xl font-black italic tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            Flip Tile
          </span>
          <span className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-amber-400 mt-2">
            Turn-Based Memory Duel vs Bot
          </span>
        </div>

        {/* Level Indicator Pill */}
        <div className="my-5 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-black text-amber-300 shadow-xs">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Stage {progress.unlockedLevel} / 40</span>
          <span className="text-white/40">•</span>
          <Bot className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-indigo-300">AI Opponent</span>
        </div>

        {/* Big Start Button */}
        <button
          onClick={handleStart}
          className="group relative w-full max-w-xs py-4 px-8 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 font-black text-lg tracking-wider uppercase shadow-[0_8px_30px_rgba(251,191,36,0.4)] transition-all flex items-center justify-center gap-3 border-2 border-white cursor-pointer mb-3"
        >
          <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
          <span>PLAY STAGE {progress.unlockedLevel}</span>
        </button>

        {/* 4 Main Options Grid: Levels, Leaderboard, Settings, How to Play */}
        <div className="grid grid-cols-2 gap-2.5 w-full max-w-xs">
          {/* 1. LEVELS */}
          <button
            onClick={() => {
              FlipTileAudio.playFlipSound();
              onOpenLevelSelect();
            }}
            className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs tracking-wider uppercase border border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Grid className="w-4 h-4 text-amber-400" />
            <span>LEVELS</span>
          </button>

          {/* 2. LEADERBOARD */}
          <button
            onClick={() => {
              FlipTileAudio.playFlipSound();
              setShowLeaderboard(true);
            }}
            className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-amber-300 font-bold text-xs tracking-wider uppercase border border-amber-400/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>LEADERBOARD</span>
          </button>

          {/* 3. SETTINGS */}
          <button
            onClick={() => {
              FlipTileAudio.playFlipSound();
              setShowSettings(true);
            }}
            className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-cyan-300 font-bold text-xs tracking-wider uppercase border border-cyan-400/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Settings className="w-4 h-4 text-cyan-300" />
            <span>SETTINGS</span>
          </button>

          {/* 4. HOW TO PLAY */}
          <button
            onClick={() => {
              FlipTileAudio.playFlipSound();
              setShowHowToPlay(true);
            }}
            className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-indigo-300 font-bold text-xs tracking-wider uppercase border border-indigo-400/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>HOW TO PLAY</span>
          </button>
        </div>
      </div>

      {/* High Score Footer */}
      <div className="relative z-10 w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between text-xs text-slate-400 mb-1 shadow-xs">
        <div>
          <span>High Score: <strong className="text-amber-400">{progress.totalScore.toLocaleString()} PTS</strong></span>
        </div>
        <div>
          <span>Opponent: <strong className="text-indigo-400">Competitive Bot</strong></span>
        </div>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <GameLeaderboardModal
          gameId="flip-tile"
          gameTitle="Flip Tile"
          userScore={progress.totalScore}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <GameSettingsModal
          gameTitle="Flip Tile"
          soundEnabled={!soundMuted}
          musicEnabled={!musicMuted}
          onToggleSound={handleToggleSound}
          onToggleMusic={handleToggleMusic}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Rules Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#241F3B] border-2 border-amber-400/50 rounded-3xl p-6 text-left shadow-2xl text-white">
            <h3 className="text-lg font-black uppercase text-amber-400 mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              <span>How to Play Flip Tile</span>
            </h3>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <p>
                <strong>1. Turn-Based Duel:</strong> You take turns against a competitive Bot. On your turn, tap any 2 tiles on the board to flip them!
              </p>
              <p>
                <strong>2. Finding Matches:</strong> If both tiles reveal matching icons, you score +1 pair, the tiles vanish from the board, and you get another turn!
              </p>
              <p>
                <strong>3. Bot Strategy:</strong> If your tiles don't match, they flip back and the Bot takes its turn. The Bot remembers previously seen tiles and capitalizes on them!
              </p>
              <p>
                <strong>4. Winning the Match:</strong> Once all tiles are cleared, the side with the most pairs wins!
              </p>
              <p>
                <strong>5. 40 Tournament Levels:</strong> Advance sequentially across 40 stages with escalating bot intelligence, larger boards, and faster plays!
              </p>
            </div>
            <button
              onClick={() => setShowHowToPlay(false)}
              className="mt-5 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Ready to Flip
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Play, RotateCcw, Grid, Star, Trophy } from 'lucide-react';
import { FlipTileAudio } from './audio';

interface FlipTileResultModalProps {
  levelNumber: number;
  playerPairs: number;
  botPairs: number;
  totalPairs: number;
  score: number;
  stars: number;
  isVictory: boolean;
  onNextLevel: () => void;
  onRestart: () => void;
  onLevelSelect: () => void;
}

export const FlipTileResultModal: React.FC<FlipTileResultModalProps> = ({
  levelNumber,
  playerPairs,
  botPairs,
  totalPairs,
  score,
  stars,
  isVictory,
  onNextLevel,
  onRestart,
  onLevelSelect,
}) => {
  const isFinalLevel = levelNumber >= 40;

  const handleNext = () => {
    FlipTileAudio.playFlipSound();
    onNextLevel();
  };

  const handleRestart = () => {
    FlipTileAudio.playFlipSound();
    onRestart();
  };

  const handleLevelSelect = () => {
    FlipTileAudio.playFlipSound();
    onLevelSelect();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in zoom-in-95 duration-200 select-none">
      <div
        className={`relative w-full max-w-xs rounded-3xl p-5 text-center flex flex-col items-center border-4 shadow-2xl ${
          isVictory
            ? 'bg-[#1E1B2E] border-amber-400/80 shadow-[0_0_40px_rgba(251,191,36,0.35)] text-white'
            : 'bg-[#1E1B2E] border-rose-500/80 shadow-[0_0_40px_rgba(244,63,94,0.3)] text-white'
        }`}
      >
        {/* Banner Ribbon */}
        <div
          className={`-mt-9 mb-4 px-6 py-2 rounded-2xl border-2 border-white shadow-md flex items-center gap-1.5 ${
            isVictory
              ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black'
              : 'bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white font-black'
          }`}
        >
          {isVictory ? <Trophy className="w-5 h-5 fill-current" /> : <Star className="w-5 h-5" />}
          <span className="text-base tracking-wider uppercase drop-shadow-xs">
            {isVictory ? 'VICTORY!' : 'DEFEAT'}
          </span>
        </div>

        {/* Stars on Victory */}
        {isVictory && (
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`transform transition-all duration-300 ${
                  s <= stars
                    ? 'scale-110 drop-shadow-[0_0_12px_rgba(250,204,21,0.9)]'
                    : 'scale-90 opacity-25 grayscale'
                }`}
              >
                <Star
                  className={`w-9 h-9 ${
                    s <= stars ? 'fill-amber-400 text-amber-300' : 'fill-slate-600 text-slate-700'
                  }`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Match Breakdown Table */}
        <div className="w-full bg-[#27233B] border border-white/10 rounded-2xl p-4 mb-5 space-y-2 text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center justify-between text-slate-300">
            <span>Your Matches:</span>
            <span className="font-mono text-base font-black text-emerald-400">
              {playerPairs} / {totalPairs}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Bot Matches:</span>
            <span className="font-mono text-base font-black text-rose-400">
              {botPairs} / {totalPairs}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-white/10">
            <span>Level Score:</span>
            <span className="font-mono text-base font-black text-amber-300">
              {score.toLocaleString()} PTS
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-2">
          {isVictory ? (
            <button
              onClick={handleNext}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:brightness-110 active:scale-95 text-slate-950 font-black text-sm tracking-wider uppercase shadow-lg border-2 border-white transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isFinalLevel ? 'CHAMPION FINALE' : `LEVEL ${levelNumber + 1}`}</span>
            </button>
          ) : (
            <button
              onClick={handleRestart}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:brightness-110 active:scale-95 text-white font-black text-sm tracking-wider uppercase shadow-lg border-2 border-white/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              <span>REMATCH</span>
            </button>
          )}

          <button
            onClick={handleLevelSelect}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold text-xs tracking-wider uppercase border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Level Select</span>
          </button>
        </div>
      </div>
    </div>
  );
};

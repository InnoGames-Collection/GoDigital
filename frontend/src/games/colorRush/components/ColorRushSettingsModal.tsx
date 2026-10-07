/**
 * Color Rush - Simple Settings Screen
 * 
 * Supports only settings already supported by the game:
 * - Sound Effects
 * - Haptic Vibration
 * - Reset Progress (Level 1 reset)
 * - Clean Back navigation to Color Rush Menu
 */

import React, { useState } from 'react';
import { Settings, ArrowLeft, Volume2, VolumeX, Vibrate, Trash2, Check, X } from 'lucide-react';
import { ColorRushProgression } from '../types';
import { ColorRushAudio } from '../colorRushAudio';
import { resetProgression } from '../persistence';

interface ColorRushSettingsModalProps {
  progression: ColorRushProgression;
  onUpdateProgression: (p: ColorRushProgression) => void;
  onBack: () => void;
}

export const ColorRushSettingsModal: React.FC<ColorRushSettingsModalProps> = ({
  progression,
  onUpdateProgression,
  onBack,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  const toggleSound = () => {
    const next = !progression.soundEnabled;
    ColorRushAudio.setMuted(!next);
    if (next) ColorRushAudio.playTap();
    onUpdateProgression({
      ...progression,
      soundEnabled: next,
    });
  };

  const toggleHaptics = () => {
    ColorRushAudio.playTap();
    onUpdateProgression({
      ...progression,
      hapticsEnabled: !progression.hapticsEnabled,
    });
  };

  const handleReset = () => {
    ColorRushAudio.playWrong();
    const fresh = resetProgression();
    onUpdateProgression(fresh);
    setConfirmReset(false);
  };

  return (
    <div 
      className="relative w-full max-w-md mx-auto flex flex-col items-center select-none rounded-3xl overflow-hidden border-2 border-slate-700/60 shadow-2xl min-h-[580px] max-h-[90vh] font-['Plus_Jakarta_Sans',sans-serif] text-slate-100"
      style={{
        background: 'radial-gradient(circle at 50% 15%, #151f33 0%, #0c1221 55%, #04070e 100%)',
      }}
    >
      {/* Header with clean Back button */}
      <div 
        id="color-rush-settings-header"
        className="w-full bg-[#0c1424]/95 backdrop-blur-md px-4 py-3.5 border-b border-[#1b2842] flex items-center justify-between z-20 shrink-0"
      >
        <button
          id="color-rush-settings-back-btn"
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

        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-300" />
          <h2 className="text-lg font-black text-white tracking-wide uppercase">
            SETTINGS
          </h2>
        </div>

        <div className="w-16" />
      </div>

      {/* Settings Options */}
      <div className="w-full flex-1 overflow-y-auto p-4 space-y-4 z-10">
        {/* 1. Audio Toggle */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              {progression.soundEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
            </div>
            <div>
              <div className="text-sm font-black text-white">Sound Effects</div>
              <div className="text-xs text-slate-400">Audio feedback during gameplay</div>
            </div>
          </div>

          <button
            id="color-rush-sound-toggle"
            onClick={toggleSound}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              progression.soundEnabled ? 'bg-cyan-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                progression.soundEnabled ? 'left-6.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* 2. Haptics Toggle */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Vibrate className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-white">Haptic Vibration</div>
              <div className="text-xs text-slate-400">Tactile touch click responses</div>
            </div>
          </div>

          <button
            id="color-rush-haptics-toggle"
            onClick={toggleHaptics}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              progression.hapticsEnabled ? 'bg-emerald-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                progression.hapticsEnabled ? 'left-6.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* 3. Reset Progress */}
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-black text-rose-300 uppercase tracking-wider">
                Reset Progress
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Reset unlocked levels back to Level 1 and clear best scores.
          </p>

          {confirmReset ? (
            <div className="flex items-center gap-2">
              <button
                id="color-rush-confirm-reset-btn"
                onClick={handleReset}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Reset</span>
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs uppercase flex items-center justify-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </div>
          ) : (
            <button
              id="color-rush-reset-init-btn"
              onClick={() => setConfirmReset(true)}
              className="w-full py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-700/50 text-rose-300 font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
            >
              Reset to Level 1
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

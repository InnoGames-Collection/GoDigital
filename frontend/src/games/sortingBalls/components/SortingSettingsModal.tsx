import React, { useState } from 'react';
import { Settings, X, Volume2, VolumeX, Smartphone, RotateCcw, AlertTriangle } from 'lucide-react';

interface SortingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetProgress: () => void;
}

export const SortingSettingsModal: React.FC<SortingSettingsModalProps> = ({
  isOpen,
  onClose,
  onResetProgress,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-start items-center p-4 sm:p-6 overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif]"
      style={{ backgroundColor: '#F3E9D8', color: '#40372F' }}
    >
      <div className="w-full max-w-md mx-auto space-y-4 pb-8 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D4C3AA] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6D8C3] border border-[#D4C3AA] flex items-center justify-center text-[#786B5B]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#40372F] uppercase tracking-tight">
                SETTINGS
              </h2>
              <p className="text-xs text-[#786B5B]">Audio & Gameplay Preferences</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-[#E6D8C3] hover:bg-[#d8c8b0] active:scale-95 text-[#40372F] flex items-center justify-center transition-colors cursor-pointer border border-[#D4C3AA]"
            aria-label="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggles */}
        <div className="space-y-2.5">
          {/* Sound FX */}
          <div className="p-3.5 rounded-2xl bg-[#E6D8C3] border border-[#D4C3AA] flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F3E9D8] border border-[#D4C3AA] text-[#D58A36] flex items-center justify-center">
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-xs font-bold text-[#40372F]">Sound Effects</div>
                <div className="text-[11px] text-[#786B5B]">Ball moves, completion chime</div>
              </div>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                soundEnabled ? 'bg-[#D58A36]' : 'bg-[#D4C3AA]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                  soundEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Haptics */}
          <div className="p-3.5 rounded-2xl bg-[#E6D8C3] border border-[#D4C3AA] flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F3E9D8] border border-[#D4C3AA] text-[#648B75] flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#40372F]">Vibration / Haptics</div>
                <div className="text-[11px] text-[#786B5B]">Tactile tap feedback</div>
              </div>
            </div>
            <button
              onClick={() => setHapticsEnabled(!hapticsEnabled)}
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                hapticsEnabled ? 'bg-[#648B75]' : 'bg-[#D4C3AA]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                  hapticsEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Reset Progress Section */}
        <div className="pt-2">
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="w-full py-3 px-4 rounded-xl border border-[#D4C3AA] bg-[#E6D8C3] hover:bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Game Progress</span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-[#E6D8C3] border-2 border-rose-300 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Are you sure you want to reset all 40 levels and scores?</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onResetProgress();
                    setShowConfirmReset(false);
                    onClose();
                  }}
                  className="py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="py-2.5 rounded-lg bg-[#D4C3AA] hover:bg-[#c4b39a] text-[#40372F] text-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

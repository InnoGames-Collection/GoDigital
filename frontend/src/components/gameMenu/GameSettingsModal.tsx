import React from 'react';
import { X, Volume2, VolumeX, Music, Smartphone, Settings } from 'lucide-react';

interface GameSettingsModalProps {
  gameTitle: string;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onClose: () => void;
}

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  gameTitle,
  soundEnabled,
  musicEnabled,
  onToggleSound,
  onToggleMusic,
  onClose,
}) => {
  const [vibrationEnabled, setVibrationEnabled] = React.useState<boolean>(true);

  const handleToggleVibration = () => {
    setVibrationEnabled((prev) => !prev);
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-xs sm:max-w-sm bg-gradient-to-b from-[#1E2433] via-[#151926] to-[#0F131D] border-2 border-slate-700 rounded-3xl p-5 shadow-2xl text-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-wider text-white">
                Settings
              </h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {gameTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-5">
          {/* Sound FX */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-white">Sound Effects (SFX)</span>
                <span className="text-[10px] text-slate-400">Game audio and action chimes</span>
              </div>
            </div>

            <button
              onClick={onToggleSound}
              className={`w-12 h-6.5 rounded-full p-1 transition-all cursor-pointer ${
                soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform ${
                  soundEnabled ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Background Music */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <Music className={`w-5 h-5 ${musicEnabled ? 'text-cyan-400' : 'text-slate-500'}`} />
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-white">Music (BGM)</span>
                <span className="text-[10px] text-slate-400">Background tournament track</span>
              </div>
            </div>

            <button
              onClick={onToggleMusic}
              className={`w-12 h-6.5 rounded-full p-1 transition-all cursor-pointer ${
                musicEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform ${
                  musicEnabled ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Haptics */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <Smartphone
                className={`w-5 h-5 ${vibrationEnabled ? 'text-amber-400' : 'text-slate-500'}`}
              />
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-white">Vibration Feedback</span>
                <span className="text-[10px] text-slate-400">Haptic pulse on critical moves</span>
              </div>
            </div>

            <button
              onClick={handleToggleVibration}
              className={`w-12 h-6.5 rounded-full p-1 transition-all cursor-pointer ${
                vibrationEnabled ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform ${
                  vibrationEnabled ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 font-black text-xs uppercase tracking-wider transition-all cursor-pointer border border-white/10"
        >
          BACK
        </button>
      </div>
    </div>
  );
};

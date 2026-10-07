import React from 'react';
import { X, HelpCircle, CheckCircle2 } from 'lucide-react';

interface GameHowToPlayModalProps {
  gameTitle: string;
  rules: string[];
  controlsDescription?: string;
  onClose: () => void;
}

export const GameHowToPlayModal: React.FC<GameHowToPlayModalProps> = ({
  gameTitle,
  rules,
  controlsDescription,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#1E2433] via-[#151926] to-[#0F131D] border-2 border-emerald-400/40 rounded-3xl p-5 shadow-2xl text-white flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-wider text-emerald-300">
                How to Play
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

        {/* Rules Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 my-2">
          {rules.map((rule, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {rule}
              </p>
            </div>
          ))}

          {controlsDescription && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 mt-3">
              <span className="text-[10px] font-black uppercase text-emerald-300 tracking-wider block mb-1">
                Controls
              </span>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                {controlsDescription}
              </p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-3 w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg"
        >
          BACK
        </button>
      </div>
    </div>
  );
};

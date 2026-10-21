import React from 'react';
import { Info, X, ShieldCheck, Sparkles, Layers } from 'lucide-react';

interface SortingAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SortingAboutModal: React.FC<SortingAboutModalProps> = ({
  isOpen,
  onClose,
}) => {
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
            <div className="w-10 h-10 rounded-xl bg-[#E6D8C3] border border-[#D4C3AA] flex items-center justify-center text-[#D58A36]">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#40372F] uppercase tracking-tight">
                ABOUT SORTING BALL
              </h2>
              <p className="text-xs text-[#786B5B]">Version 2026.4.0 • Championship Edition</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-[#E6D8C3] hover:bg-[#d8c8b0] active:scale-95 text-[#40372F] flex items-center justify-center transition-colors cursor-pointer border border-[#D4C3AA]"
            aria-label="Close About"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 text-xs text-[#786B5B] leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-[#E6D8C3] border border-[#D4C3AA] space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-[#40372F] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D58A36]" />
              <span>Game Overview</span>
            </h3>
            <p className="text-[#40372F]/90">
              <strong>Sorting Ball</strong> is a competitive 3D spatial logic puzzle. Test your tactical planning across 40 progressively demanding championship levels, featuring realistic physical ball dynamics and fluid Three.js graphics.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#E6D8C3] border border-[#D4C3AA] space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-[#40372F] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#648B75]" />
              <span>Controls & Ergonomics</span>
            </h3>
            <p className="text-[#40372F]/90">
              Designed for effortless single-finger touch and desktop mouse interaction. Tap any tube to lift balls, then tap the destination tube to transfer. Smart auto-batching lifts contiguous matching balls together to streamline multi-ball plays.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#E6D8C3] border border-[#D4C3AA] space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-[#40372F] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#648B75]" />
              <span>Strategy Note</span>
            </h3>
            <p className="text-[#40372F]/90">
              Every level is mathematically guaranteed 100% solvable. Focus on freeing up buffer tubes early, keep matching sequences together, and minimize unnecessary back-and-forth moves to maximize your Par Move Efficiency Score.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

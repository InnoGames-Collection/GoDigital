import React from 'react';
import { Info, X, ShieldCheck, Sparkles, Layers } from 'lucide-react';

interface EmojiSortingAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmojiSortingAboutModal: React.FC<EmojiSortingAboutModalProps> = ({
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
            <div className="w-10 h-10 rounded-xl bg-[#E6D8C3] border border-[#D4C3AA] flex items-center justify-center text-[#648B75] shadow-xs">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#40372F] uppercase tracking-tight">
                ABOUT EMOJI SORTING BALL
              </h2>
              <p className="text-xs text-[#786B5B]">Version 2026.1.0 • Tournament Edition</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-[#E6D8C3] hover:bg-[#D4C3AA] active:scale-95 text-[#40372F] flex items-center justify-center transition-colors cursor-pointer border border-[#D4C3AA] shadow-xs"
            aria-label="Close About"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 text-xs text-[#786B5B] leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-[#E6D8C3]/50 border border-[#D4C3AA] shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-[#40372F] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D58A36]" />
              <span>Game Overview</span>
            </h3>
            <p>
              <strong>Emoji Sorting Ball</strong> is a competitive 3D spatial logic puzzle. Test your tactical planning across 40 progressively demanding championship levels, featuring stylized 3D emoji vinyl spheres, authentic physical depth, and fluid Three.js graphics.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#E6D8C3]/50 border border-[#D4C3AA] shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-[#40372F] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#D58A36]" />
              <span>Mandatory Tube Palette & Rendering</span>
            </h3>
            <p>
              Cylinders are rendered in jewel-toned crystal glass using the official tournament palette: Coral Red (#FF6B6B), Aqua Cyan (#22D3EE), Royal Violet (#8B5CF6), Golden Amber (#F59E0B), Emerald (#10B981), Rose Pink (#F472B6), Electric Blue (#3B82F6), and Lime (#84CC16).
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#E6D8C3]/50 border border-[#D4C3AA] shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-[#40372F] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#648B75]" />
              <span>100% Solvable Championship Puzzles</span>
            </h3>
            <p>
              Every single level is mathematically guaranteed solvable. Focus on freeing up buffer tubes early, keep matching sequences together, and minimize unnecessary moves to maximize your Par Move Efficiency Score.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

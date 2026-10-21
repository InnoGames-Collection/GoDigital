import React from 'react';
import { HelpCircle, X, Flame } from 'lucide-react';

interface SortingHowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SortingHowToPlayModal: React.FC<SortingHowToPlayModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const rules = [
    {
      num: 1,
      title: 'Select Ball or Contiguous Group',
      desc: 'Tap any glass tube to lift the top ball. If consecutive matching balls of the same color are on top, they lift together as a strategic group.',
      icon: '👆',
    },
    {
      num: 2,
      title: 'Transfer to Valid Tube',
      desc: 'Tap another tube with available capacity. Balls will smoothly fly and drop into place if the move is legal.',
      icon: '🎯',
    },
    {
      num: 3,
      title: 'Same-Color Matching Rules',
      desc: 'You can only drop a ball onto an existing ball of the exact same color, or into a completely empty buffer tube.',
      icon: '🎨',
    },
    {
      num: 4,
      title: 'Complete Each Tube',
      desc: 'A tube is completed when it holds 4 balls of the exact same color. Complete all color tubes to win the level.',
      icon: '🧪',
    },
    {
      num: 5,
      title: 'Fewer Moves = Higher Score',
      desc: 'Every level has an optimal Par move target. Solving the puzzle with fewer moves awards significant efficiency bonus points.',
      icon: '⭐',
    },
    {
      num: 6,
      title: 'Speed & Time Efficiency',
      desc: 'Active puzzle-solving time is tracked. Fast tactical completion grants generous speed bonuses.',
      icon: '⏱️',
    },
    {
      num: 7,
      title: 'Hint Penalty (-150 PTS)',
      desc: 'Requesting hints highlights the optimal next step, but applies a competitive penalty to your level score.',
      icon: '💡',
    },
    {
      num: 8,
      title: 'Add Tube Penalty (-250 PTS)',
      desc: 'Adding an extra empty buffer tube makes the puzzle easier, but deducts 250 PTS from the final score.',
      icon: '➕',
    },
    {
      num: 9,
      title: 'Cumulative Championship Score',
      desc: 'Your total tournament score is the sum of your best scores across all completed levels. Advance through all 40 levels to dominate the leaderboard!',
      icon: '🏆',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-start items-center p-4 sm:p-6 overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif]"
      style={{ backgroundColor: '#F3E9D8', color: '#40372F' }}
    >
      <div className="w-full max-w-lg mx-auto space-y-4 pb-8 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D4C3AA] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6D8C3] border border-[#D4C3AA] flex items-center justify-center text-[#648B75]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#40372F] uppercase tracking-tight">
                HOW TO PLAY
              </h2>
              <p className="text-xs text-[#786B5B]">
                Official Rules & Competitive Strategy Guide
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-[#E6D8C3] hover:bg-[#d8c8b0] active:scale-95 text-[#40372F] flex items-center justify-center transition-colors cursor-pointer border border-[#D4C3AA]"
            aria-label="Close How To Play"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 9 Rules Cards */}
        <div className="space-y-2.5">
          {rules.map((rule) => (
            <div
              key={rule.num}
              className="p-3 rounded-2xl bg-[#E6D8C3] border border-[#D4C3AA] flex items-start gap-3 hover:bg-[#dfd0bb] transition-all shadow-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-[#F3E9D8] border border-[#D4C3AA] text-[#D58A36] font-black font-mono flex items-center justify-center text-xs shrink-0 mt-0.5">
                {rule.num}
              </div>

              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#40372F] flex items-center gap-1.5">
                  <span>{rule.icon}</span>
                  <span>{rule.title}</span>
                </div>
                <p className="text-[11px] text-[#786B5B] leading-relaxed font-normal">
                  {rule.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pro Tip Callout */}
        <div className="p-3.5 rounded-2xl bg-[#E6D8C3] border-2 border-[#D58A36]/60 flex items-center gap-3 shadow-xs">
          <Flame className="w-5 h-5 text-[#D58A36] shrink-0" />
          <p className="text-[11px] text-[#40372F] leading-normal">
            <strong className="text-[#D58A36]">Pro Tip:</strong> Replaying a completed level with fewer moves or faster time will update your level best and increase your total cumulative score!
          </p>
        </div>
      </div>
    </div>
  );
};

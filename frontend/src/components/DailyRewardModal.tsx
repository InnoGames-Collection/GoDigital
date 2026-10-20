/**
 * 7-Day Daily Login Streak Reward Modal
 */

import React from 'react';
import { UserProfile } from '../types';
import { DAILY_REWARD_LADDER } from '../services/demoData';
import { 
  X, 
  Flame, 
  Coins, 
  Check, 
  Gift, 
  Sparkles, 
  Lock 
} from 'lucide-react';

interface DailyRewardModalProps {
  profile: UserProfile;
  onClose: () => void;
  onClaim: () => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  profile,
  onClose,
  onClaim,
}) => {
  const currentStreakDay = ((profile.streak.current - 1) % 7) + 1;
  const canClaim = !profile.streak.hasClaimedToday;

  return (
    <div className="fixed inset-0 z-50 bg-[#24170F]/85 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-[#352316] rounded-3xl border border-[#81502B] shadow-2xl p-6 relative text-[#FFF0CF]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#442C1B] text-[#E6C8A4] hover:bg-[#523521] hover:text-[#FFF0CF] border border-[#81502B] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#FFD35A] to-[#FFAA24] mx-auto mb-2.5 flex items-center justify-center text-[#24170F] shadow-md">
            <Flame className="w-8 h-8 fill-current" />
          </div>
          <h3 className="text-xl font-black text-[#FFF0CF]">Daily Streak Rewards</h3>
          <p className="text-xs text-[#E6C8A4]">
            Log in every day to claim bonus coins and the Day 7 Grand Walia Chest!
          </p>
        </div>

        {/* 7-Day Ladder Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-6">
          {DAILY_REWARD_LADDER.map((item) => {
            const isPast = item.day < currentStreakDay;
            const isCurrent = item.day === currentStreakDay;

            return (
              <div
                key={item.day}
                className={`relative rounded-xl p-2.5 flex flex-col items-center justify-between border text-center transition-all ${
                  isCurrent
                    ? 'bg-[#442C1B] border-[#FFAA24] ring-2 ring-[#FFAA24]/50 scale-105 shadow-md'
                    : isPast
                    ? 'bg-[#24170F]/70 border-[#81502B] opacity-60'
                    : 'bg-[#24170F]/80 border-[#81502B]'
                } ${item.special ? 'sm:col-span-1 col-span-2' : ''}`}
              >
                <span className="text-[10px] font-bold text-[#E6C8A4]">Day {item.day}</span>

                <div className="my-1.5 flex flex-col items-center">
                  {item.special ? (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-[#FFD35A] to-[#FFAA24] text-[#24170F] flex items-center justify-center font-bold">
                      <Gift className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-[#352316] flex items-center justify-center text-[#FFD35A]">
                      <Coins className="w-4 h-4" />
                    </div>
                  )}
                  <span className="text-xs font-black text-[#FFF0CF] font-mono mt-0.5">
                    +{item.coins}
                  </span>
                </div>

                {isPast ? (
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : isCurrent ? (
                  <span className="text-[9px] font-black text-[#FFD35A] uppercase">Today</span>
                ) : (
                  <Lock className="w-3.5 h-3.5 text-[#E6C8A4]/60" />
                )}
              </div>
            );
          })}
        </div>

        {/* Claim Action */}
        {canClaim ? (
          <button
            onClick={() => {
              onClaim();
              onClose();
            }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFD35A] to-[#FFAA24] hover:opacity-95 text-[#24170F] font-black text-sm active:scale-95 transition-all shadow-md shadow-[#FFAA24]/20 flex items-center justify-center gap-2 cursor-pointer border-none"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>CLAIM DAY {currentStreakDay} REWARD</span>
          </button>
        ) : (
          <div className="text-center py-2 px-4 rounded-xl bg-[#24170F]/80 border border-[#81502B] text-xs text-[#E6C8A4] font-medium">
            You have already claimed today's reward. Streak continues tomorrow!
          </div>
        )}
      </div>
    </div>
  );
};


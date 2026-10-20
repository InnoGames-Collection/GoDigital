/**
 * Podium Top 3 Champions Visualization Component
 * Conforming to reference design & warm sunset palette:
 * - Rank 1 (Center Gold), Rank 2 (Left Silver), Rank 3 (Right Bronze)
 * - Pedestals, crowns, masked MSISDNs, scores, and prize tags
 */

import React from 'react';
import { LeaderboardEntry } from '../types';
import { Crown, Trophy, Medal, Sparkles, MapPin } from 'lucide-react';

interface PodiumTopThreeProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export const PodiumTopThree: React.FC<PodiumTopThreeProps> = ({
  entries,
  currentUserId,
}) => {
  if (entries.length < 3) return null;

  const first = entries[0];
  const second = entries[1];
  const third = entries[2];

  return (
    <div id="competitive-podium" className="relative pt-6 pb-2 px-2">
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-2xl mx-auto">
        {/* ========================================================================= */}
        {/* RANK 2: SILVER PEDESTAL (LEFT) */}
        {/* ========================================================================= */}
        <div
          id="podium-rank-2"
          className="flex flex-col items-center text-center order-1 group"
        >
          {/* Avatar & Rank Token */}
          <div className="relative mb-2">
            <div
              className={`w-13 h-13 sm:w-15 sm:h-15 rounded-xl p-1 bg-[#442C1B] border border-[#81502B] flex items-center justify-center ${
                second.userId === currentUserId ? 'ring-2 ring-[#FFAA24]' : ''
              }`}
            >
              <div className="w-full h-full rounded-lg bg-[#352316] flex items-center justify-center text-[#E6C8A4] font-black text-base">
                <Medal className="w-6 h-6 text-slate-300" />
              </div>
            </div>
            {/* Rank 2 Badge */}
            <span className="absolute -bottom-1.5 -right-1 w-5 h-5 rounded-full bg-slate-300 text-slate-950 font-black text-[11px] flex items-center justify-center border-2 border-[#352316] shadow-sm">
              2
            </span>
          </div>

          {/* Player Info */}
          <div className="w-full px-1 mb-2">
            <div className="text-xs sm:text-sm font-bold text-[#FFF0CF] truncate">
              {second.displayName}
            </div>
            <div className="text-[10px] text-[#E6C8A4] font-mono">
              {second.phoneNumberMasked}
            </div>
            <div className="text-xs sm:text-sm font-black text-slate-200 font-mono mt-0.5">
              {second.score.toLocaleString()} <span className="text-[10px] text-[#E6C8A4]/70 font-sans">pts</span>
            </div>
            {second.reward && (
              <div className="mt-1 inline-block px-1.5 py-0.5 rounded bg-[#442C1B] border border-[#81502B] text-[9px] font-bold text-[#E6C8A4] truncate max-w-full">
                🎁 {second.reward}
              </div>
            )}
          </div>

          {/* Pedestal Step */}
          <div className="w-full h-20 sm:h-24 rounded-t-xl bg-[#352316] border-t-2 border-x border-slate-400/40 flex flex-col items-center justify-center p-2 shadow-sm">
            <div className="text-slate-300 font-black text-lg sm:text-xl font-mono">
              2ND
            </div>
            <div className="text-[10px] text-[#E6C8A4] flex items-center gap-0.5 mt-0.5 font-medium">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{second.region}</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RANK 1: GOLD PEDESTAL (CENTER - ELEVATED) */}
        {/* ========================================================================= */}
        <div
          id="podium-rank-1"
          className="flex flex-col items-center text-center order-2 -mt-6 group"
        >
          {/* Crown & Avatar */}
          <div className="relative mb-2">
            <div className="absolute -top-5 inset-x-0 flex justify-center">
              <Crown className="w-6 h-6 text-[#FFD35A] fill-[#FFD35A]" />
            </div>

            <div
              className={`w-16 h-16 sm:w-18 sm:h-18 rounded-xl p-1 bg-[#442C1B] border-2 border-[#FFAA24] flex items-center justify-center ${
                first.userId === currentUserId ? 'ring-2 ring-[#FFD35A]' : ''
              }`}
            >
              <div className="w-full h-full rounded-lg bg-[#352316] flex items-center justify-center text-[#FFD35A]">
                <Trophy className="w-7 h-7 text-[#FFD35A]" />
              </div>
            </div>

            {/* Rank 1 Badge */}
            <span className="absolute -bottom-1.5 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F] font-black text-xs flex items-center justify-center border-2 border-[#352316] shadow-sm">
              1
            </span>
          </div>

          {/* Player Info */}
          <div className="w-full px-1 mb-2">
            <div className="text-sm font-black text-[#FFF0CF] truncate flex items-center justify-center gap-1">
              <span>{first.displayName}</span>
              <Sparkles className="w-3 h-3 text-[#FFD35A] fill-[#FFD35A] shrink-0" />
            </div>
            <div className="text-[10px] text-[#E6C8A4] font-mono">
              {first.phoneNumberMasked}
            </div>
            <div className="text-sm sm:text-base font-black text-[#FFD35A] font-mono mt-0.5">
              {first.score.toLocaleString()} <span className="text-[10px] text-[#E6C8A4]/70 font-sans">pts</span>
            </div>
            {first.reward && (
              <div className="mt-1 inline-block px-2 py-0.5 rounded bg-[#442C1B] border border-[#FFAA24]/50 text-[10px] font-extrabold text-[#FFD35A] truncate max-w-full">
                🏆 {first.reward}
              </div>
            )}
          </div>

          {/* Pedestal Step (Tallest) */}
          <div className="w-full h-28 sm:h-32 rounded-t-xl bg-gradient-to-b from-[#442C1B] to-[#352316] text-[#FFF0CF] border-t-2 border-x border-[#FFAA24] flex flex-col items-center justify-center p-2 shadow-lg">
            <div className="text-[#FFD35A] font-black text-xl sm:text-2xl font-mono">
              1ST
            </div>
            <div className="text-[10px] text-[#FFAA24] font-bold uppercase tracking-wider flex items-center gap-0.5 mt-0.5">
              <MapPin className="w-3 h-3" />
              <span>{first.region}</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RANK 3: BRONZE PEDESTAL (RIGHT) */}
        {/* ========================================================================= */}
        <div
          id="podium-rank-3"
          className="flex flex-col items-center text-center order-3 group"
        >
          {/* Avatar & Rank Token */}
          <div className="relative mb-2">
            <div
              className={`w-13 h-13 sm:w-15 sm:h-15 rounded-xl p-1 bg-[#442C1B] border border-[#81502B] flex items-center justify-center ${
                third.userId === currentUserId ? 'ring-2 ring-[#FFAA24]' : ''
              }`}
            >
              <div className="w-full h-full rounded-lg bg-[#352316] flex items-center justify-center text-[#C96A22] font-black text-base">
                <Medal className="w-6 h-6 text-[#C96A22]" />
              </div>
            </div>
            {/* Rank 3 Badge */}
            <span className="absolute -bottom-1.5 -right-1 w-5 h-5 rounded-full bg-[#9B4B12] text-white font-black text-[11px] flex items-center justify-center border-2 border-[#352316] shadow-sm">
              3
            </span>
          </div>

          {/* Player Info */}
          <div className="w-full px-1 mb-2">
            <div className="text-xs sm:text-sm font-bold text-[#FFF0CF] truncate">
              {third.displayName}
            </div>
            <div className="text-[10px] text-[#E6C8A4] font-mono">
              {third.phoneNumberMasked}
            </div>
            <div className="text-xs sm:text-sm font-black text-[#C96A22] font-mono mt-0.5">
              {third.score.toLocaleString()} <span className="text-[10px] text-[#E6C8A4]/70 font-sans">pts</span>
            </div>
            {third.reward && (
              <div className="mt-1 inline-block px-1.5 py-0.5 rounded bg-[#442C1B] border border-[#81502B] text-[9px] font-bold text-[#C96A22] truncate max-w-full">
                🎁 {third.reward}
              </div>
            )}
          </div>

          {/* Pedestal Step */}
          <div className="w-full h-16 sm:h-20 rounded-t-xl bg-[#352316] border-t-2 border-x border-[#9B4B12] flex flex-col items-center justify-center p-2 shadow-sm">
            <div className="text-[#C96A22] font-black text-base sm:text-lg font-mono">
              3RD
            </div>
            <div className="text-[10px] text-[#E6C8A4] flex items-center gap-0.5 mt-0.5 font-medium">
              <MapPin className="w-3 h-3 text-[#C96A22]" />
              <span>{third.region}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodiumTopThree;

/**
 * Premium Modern Gaming Portal Bottom Navigation Bar for GoPlay
 * 
 * Strict Requirements:
 * - Exactly 5 items in EXACT order:
 *   1. GAMES
 *   2. TOURNAMENT
 *   3. HOME (physically centered, elevated circular button 56-64px diameter)
 *   4. LEADERBOARD
 *   5. PROFILE
 * - Bar Background: #121622 with top border #282E3D, height ~74-78px + safe-area
 * - Central HOME button:
 *   - Circular, elevated above navigation bar
 *   - Linear gradient from #7C3AED to #22D3EE with soft controlled shadow
 *   - White Home icon (24-28px) + "HOME" label
 * - Active States:
 *   - GAMES: #22D3EE
 *   - TOURNAMENT: #F5B942 (gold)
 *   - HOME: Dominant violet-to-cyan gradient
 *   - LEADERBOARD: #22D3EE
 *   - PROFILE: #7C3AED
 *   - Inactive: #70798D
 *   - Active labels: #FFFFFF
 */

import React from 'react';
import { NavigationTab } from '../types';
import { Home, Gamepad2, Trophy, User } from 'lucide-react';

// Premium Tournament Championship Trophy Cup Icon
const TournamentCupIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    aria-hidden="true"
  >
    <path d="M6 3h12v6c0 3.5-2.5 6-6 6s-6-2.5-6-6V3z" />
    <path d="M6 5H4a2 2 0 0 0-2 2v1a3 3 0 0 0 3 3h1" />
    <path d="M18 5h2a2 2 0 0 1 2 2v1a3 3 0 0 1-3 3h-1" />
    <path d="M12 15v4" />
    <path d="M8 21h8" />
    <path d="M9 19h6" />
    <path d="M12 6.8l.6 1.3 1.4.2-1 1 .3 1.4-1.3-.7-1.3.7.3-1.4-1-1 1.4-.2L12 6.8z" />
  </svg>
);

interface BottomNavProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  labels?: {
    home?: string;
    games?: string;
    tournament?: string;
    leaderboard?: string;
    profile?: string;
  };
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, labels }) => {
  const isHomeSelected = activeTab === 'home';

  return (
    <nav 
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#121622] border-t border-[#282E3D] shadow-[0_-4px_24px_rgba(0,0,0,0.5)] select-none safe-area-bottom"
    >
      <div className="max-w-md md:max-w-xl mx-auto h-[74px] sm:h-[78px] px-1.5 grid grid-cols-5 items-center relative">
        
        {/* 1. GAMES */}
        <button
          id="bottom-nav-games"
          type="button"
          onClick={() => onTabChange('games')}
          className="flex flex-col items-center justify-center py-1.5 px-0.5 transition-all duration-150 cursor-pointer w-full group active:scale-95"
        >
          <Gamepad2 
            className={`w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0 transition-colors ${
              activeTab === 'games' 
                ? 'text-[#22D3EE] stroke-[2.4] drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]' 
                : 'text-[#70798D] group-hover:text-[#AEB6C7] stroke-2'
            }`} 
          />
          <span 
            className={`text-[9px] sm:text-[10px] uppercase tracking-tight text-center truncate w-full mt-1 leading-none transition-colors ${
              activeTab === 'games' ? 'font-black text-white' : 'font-bold text-[#70798D] group-hover:text-[#AEB6C7]'
            }`}
          >
            {labels?.games || 'GAMES'}
          </span>
        </button>

        {/* 2. TOURNAMENT */}
        <button
          id="bottom-nav-tournament"
          type="button"
          onClick={() => onTabChange('tournament')}
          className="flex flex-col items-center justify-center py-1.5 px-0.5 transition-all duration-150 cursor-pointer w-full group active:scale-95"
        >
          <TournamentCupIcon 
            className={`w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0 transition-colors ${
              activeTab === 'tournament' 
                ? 'text-[#F5B942] stroke-[2.4] drop-shadow-[0_0_8px_rgba(245,185,66,0.4)]' 
                : 'text-[#70798D] group-hover:text-[#AEB6C7] stroke-2'
            }`} 
          />
          <span 
            className={`text-[9px] sm:text-[10px] uppercase tracking-tight text-center truncate w-full mt-1 leading-none transition-colors ${
              activeTab === 'tournament' ? 'font-black text-white' : 'font-bold text-[#70798D] group-hover:text-[#AEB6C7]'
            }`}
          >
            {labels?.tournament || 'TOURNAMENT'}
          </span>
        </button>

        {/* 3. HOME (CENTER ELEVATED CIRCULAR BUTTON) */}
        <div className="flex flex-col items-center justify-center relative w-full h-full">
          <button
            id="bottom-nav-home"
            type="button"
            onClick={() => onTabChange('home')}
            className={`-translate-y-4 sm:-translate-y-4.5 w-[58px] h-[58px] sm:w-[62px] sm:h-[62px] rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-200 active:scale-95 p-0.5 ${
              isHomeSelected
                ? 'bg-gradient-to-tr from-[#7C3AED] via-[#6366F1] to-[#22D3EE] shadow-[0_4px_18px_rgba(124,58,237,0.55)] ring-2 ring-[#22D3EE]/40'
                : 'bg-gradient-to-tr from-[#7C3AED]/80 via-[#6366F1]/70 to-[#22D3EE]/80 shadow-[0_4px_14px_rgba(124,58,237,0.35)] opacity-95 hover:opacity-100 hover:scale-102'
            }`}
            aria-label="Home"
          >
            <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-tr from-[#7C3AED] to-[#22D3EE]">
              <Home className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[2.3] drop-shadow-sm" />
            </div>
          </button>
          
          <span 
            className={`-translate-y-3 sm:-translate-y-3.5 text-[9px] sm:text-[10px] uppercase tracking-wider text-center font-black transition-colors leading-none ${
              isHomeSelected ? 'text-white' : 'text-[#AEB6C7]'
            }`}
          >
            {labels?.home || 'HOME'}
          </span>
        </div>

        {/* 4. LEADERBOARD */}
        <button
          id="bottom-nav-leaderboard"
          type="button"
          onClick={() => onTabChange('leaderboard')}
          className="flex flex-col items-center justify-center py-1.5 px-0.5 transition-all duration-150 cursor-pointer w-full group active:scale-95"
        >
          <Trophy 
            className={`w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0 transition-colors ${
              activeTab === 'leaderboard' 
                ? 'text-[#22D3EE] stroke-[2.4] drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]' 
                : 'text-[#70798D] group-hover:text-[#AEB6C7] stroke-2'
            }`} 
          />
          <span 
            className={`text-[9px] sm:text-[10px] uppercase tracking-tight text-center truncate w-full mt-1 leading-none transition-colors ${
              activeTab === 'leaderboard' ? 'font-black text-white' : 'font-bold text-[#70798D] group-hover:text-[#AEB6C7]'
            }`}
          >
            {labels?.leaderboard || 'LEADERBOARD'}
          </span>
        </button>

        {/* 5. PROFILE */}
        <button
          id="bottom-nav-profile"
          type="button"
          onClick={() => onTabChange('profile')}
          className="flex flex-col items-center justify-center py-1.5 px-0.5 transition-all duration-150 cursor-pointer w-full group active:scale-95"
        >
          <User 
            className={`w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0 transition-colors ${
              activeTab === 'profile' 
                ? 'text-[#7C3AED] stroke-[2.4] drop-shadow-[0_0_8px_rgba(124,58,237,0.4)]' 
                : 'text-[#70798D] group-hover:text-[#AEB6C7] stroke-2'
            }`} 
          />
          <span 
            className={`text-[9px] sm:text-[10px] uppercase tracking-tight text-center truncate w-full mt-1 leading-none transition-colors ${
              activeTab === 'profile' ? 'font-black text-white' : 'font-bold text-[#70798D] group-hover:text-[#AEB6C7]'
            }`}
          >
            {labels?.profile || 'PROFILE'}
          </span>
        </button>

      </div>
    </nav>
  );
};


/**
 * GoDigital - 3D Cinematic Bottom Navigation Bar
 * Conforming to specification & target reference design:
 * - 5 Tabs in exact left-to-right order: 1. Game 2. Tournament 3. Home 4. Leaderboard 5. Profile
 * - Unified rounded capsule silhouette with warm charcoal-brown glassmorphism surface (#352316 / #24170F)
 * - Muted bronze outer border (#81502B) with golden-orange illuminated rim highlights (#FFAA24 / #FFD35A)
 * - Central Home tab as the visual centerpiece: raised circular medallion with golden-orange ring,
 *   warm golden dimensional shading, winged metallic brackets, and radiant ambient glow
 * - Professional dimensional styling for active and inactive states across mobile and desktop
 */

import React from 'react';
import { NavigationTab } from '../types';
import { Home, Gamepad2, Trophy, Crown, User } from 'lucide-react';

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
      role="navigation"
      aria-label="Portal Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 select-none pointer-events-none pb-2 sm:pb-3 safe-area-bottom"
    >
      <div className="max-w-md md:max-w-xl lg:max-w-2xl mx-auto px-2.5 sm:px-4 pointer-events-auto">
        <div 
          role="tablist"
          aria-label="Portal Navigation Tabs"
          className="relative rounded-[28px] sm:rounded-[32px] bg-gradient-to-b from-[#352316]/95 via-[#2B1B10]/95 to-[#24170F]/98 backdrop-blur-xl border border-[#81502B]/80 shadow-[0_-8px_32px_rgba(24,15,10,0.85),inset_0_1px_1.5px_rgba(255,211,90,0.4),0_8px_24px_rgba(0,0,0,0.6)] h-[68px] sm:h-[72px] px-1.5 sm:px-3 grid grid-cols-5 items-center"
        >
          
          {/* Decorative Golden Wings flanking central Home medallion */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-36 h-6 pointer-events-none flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 144 24" fill="none">
              <path
                d="M4 22 C26 22 40 12 52 4 C58 0 86 0 92 4 C104 12 118 22 140 22"
                stroke="url(#goldWingGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M14 22 C32 22 44 14 54 7 C60 4 84 4 90 7 C100 14 112 22 130 22"
                stroke="#FFAA24"
                strokeWidth="1.2"
                strokeOpacity="0.8"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="goldWingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#81502B" stopOpacity="0.1" />
                  <stop offset="25%" stopColor="#C96A22" />
                  <stop offset="50%" stopColor="#FFD35A" />
                  <stop offset="75%" stopColor="#FFAA24" />
                  <stop offset="100%" stopColor="#81502B" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* =========================================================================
              1. TAB: GAME (Far Left)
             ========================================================================= */}
          <div className="flex items-center justify-center px-0.5">
            <button
              id="bottom-nav-games"
              data-nav-tab="GAMES"
              role="tab"
              aria-selected={activeTab === 'games'}
              aria-label={labels?.games || 'Game'}
              type="button"
              onClick={() => onTabChange('games')}
              className={`w-full h-[52px] sm:h-[56px] rounded-2xl flex flex-col items-center justify-center py-1 transition-all duration-200 cursor-pointer group active:scale-95 ${
                activeTab === 'games'
                  ? 'bg-gradient-to-b from-[#FFAA24]/30 via-[#D97706]/40 to-[#9B4B12]/50 border border-[#FFAA24] shadow-[0_0_14px_rgba(255,170,36,0.45),inset_0_1px_1px_rgba(255,211,90,0.6)] -translate-y-0.5'
                  : 'bg-[#24170F]/50 border border-[#81502B]/30 hover:border-[#FFAA24]/50 hover:bg-[#352316]/80'
              }`}
            >
              <Gamepad2
                className={`w-5 h-5 shrink-0 transition-all ${
                  activeTab === 'games'
                    ? 'text-[#FFD35A] stroke-[2.4] drop-shadow-[0_0_8px_rgba(255,211,90,0.8)]'
                    : 'text-[#E6C8A4] group-hover:text-[#FFF0CF] stroke-[2]'
                }`}
              />
              <span
                className={`text-[10px] tracking-tight text-center mt-1 transition-colors leading-none ${
                  activeTab === 'games'
                    ? 'font-black text-[#FFF0CF] drop-shadow-sm'
                    : 'font-bold text-[#E6C8A4] group-hover:text-[#FFF0CF]'
                }`}
              >
                {labels?.games || 'Game'}
              </span>
              {activeTab === 'games' && (
                <span className="w-3.5 h-0.5 rounded-full bg-[#FFD35A] mt-1 shadow-[0_0_6px_#FFAA24]" />
              )}
            </button>
          </div>

          {/* =========================================================================
              2. TAB: TOURNAMENT (Second from Left)
             ========================================================================= */}
          <div className="flex items-center justify-center px-0.5">
            <button
              id="bottom-nav-tournament"
              data-nav-tab="TOURNAMENT"
              role="tab"
              aria-selected={activeTab === 'tournament'}
              aria-label={labels?.tournament || 'Tournament'}
              type="button"
              onClick={() => onTabChange('tournament')}
              className={`w-full h-[52px] sm:h-[56px] rounded-2xl flex flex-col items-center justify-center py-1 transition-all duration-200 cursor-pointer group active:scale-95 ${
                activeTab === 'tournament'
                  ? 'bg-gradient-to-b from-[#FFAA24]/30 via-[#D97706]/40 to-[#9B4B12]/50 border border-[#FFAA24] shadow-[0_0_14px_rgba(255,170,36,0.45),inset_0_1px_1px_rgba(255,211,90,0.6)] -translate-y-0.5'
                  : 'bg-[#24170F]/50 border border-[#81502B]/30 hover:border-[#FFAA24]/50 hover:bg-[#352316]/80'
              }`}
            >
              <Trophy
                className={`w-5 h-5 shrink-0 transition-all ${
                  activeTab === 'tournament'
                    ? 'text-[#FFD35A] stroke-[2.4] drop-shadow-[0_0_8px_rgba(255,211,90,0.8)]'
                    : 'text-[#E6C8A4] group-hover:text-[#FFF0CF] stroke-[2]'
                }`}
              />
              <span
                className={`text-[10px] tracking-tight text-center mt-1 transition-colors leading-none truncate max-w-full px-0.5 ${
                  activeTab === 'tournament'
                    ? 'font-black text-[#FFF0CF] drop-shadow-sm'
                    : 'font-bold text-[#E6C8A4] group-hover:text-[#FFF0CF]'
                }`}
              >
                {labels?.tournament || 'Tournament'}
              </span>
              {activeTab === 'tournament' && (
                <span className="w-3.5 h-0.5 rounded-full bg-[#FFD35A] mt-1 shadow-[0_0_6px_#FFAA24]" />
              )}
            </button>
          </div>

          {/* =========================================================================
              3. TAB: HOME (CENTER — RAISED VISUAL CENTERPIECE)
             ========================================================================= */}
          <div className="flex flex-col items-center justify-center relative w-full h-full z-10">
            <button
              id="bottom-nav-home"
              data-nav-tab="HOME"
              role="tab"
              aria-selected={isHomeSelected}
              aria-label={labels?.home || 'Home'}
              type="button"
              onClick={() => onTabChange('home')}
              className={`-translate-y-5 sm:-translate-y-6 w-15 h-15 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-200 active:scale-95 group relative ${
                isHomeSelected
                  ? 'border-[3px] border-[#FFD35A] bg-gradient-to-b from-[#FFF0CF] via-[#FFD35A] to-[#FFAA24] shadow-[0_0_24px_rgba(255,170,36,0.85),0_8px_20px_rgba(24,15,10,0.95),inset_0_2px_3px_rgba(255,255,255,0.7)]'
                  : 'border-[3px] border-[#FFAA24]/80 bg-gradient-to-b from-[#442C1B] via-[#352316] to-[#24170F] shadow-[0_6px_20px_rgba(24,15,10,0.85),inset_0_1px_2px_rgba(255,211,90,0.4)] hover:border-[#FFD35A]'
              }`}
            >
              {/* Outer Golden Glow Aura */}
              <div
                className={`absolute inset-0 rounded-full transition-opacity duration-300 pointer-events-none ${
                  isHomeSelected
                    ? 'bg-gradient-to-tr from-[#FFAA24]/40 to-[#FFD35A]/50 blur-md opacity-100'
                    : 'opacity-0'
                }`}
              />

              <div className="relative flex flex-col items-center justify-center leading-none">
                <Home
                  className={`w-5.5 h-5.5 sm:w-6 sm:h-6 stroke-[2.4] transition-colors ${
                    isHomeSelected ? 'text-[#24170F] drop-shadow-xs' : 'text-[#FFD35A] drop-shadow-sm'
                  }`}
                />
                <span
                  className={`text-[10px] sm:text-[10.5px] font-black tracking-wider uppercase mt-0.5 leading-none ${
                    isHomeSelected ? 'text-[#24170F]' : 'text-[#FFF0CF]'
                  }`}
                >
                  {labels?.home || 'Home'}
                </span>
              </div>
            </button>

            {/* Subtle Amber Glow Accent Bar below Home */}
            <div
              className={`-translate-y-4 h-1 rounded-full transition-all duration-300 ${
                isHomeSelected
                  ? 'w-7 bg-[#FFD35A] shadow-[0_0_10px_rgba(255,211,90,0.9)] opacity-100'
                  : 'w-2 bg-[#81502B]/60 opacity-40'
              }`}
            />
          </div>

          {/* =========================================================================
              4. TAB: LEADERBOARD (Fourth)
             ========================================================================= */}
          <div className="flex items-center justify-center px-0.5">
            <button
              id="bottom-nav-leaderboard"
              data-nav-tab="LEADERBOARD"
              role="tab"
              aria-selected={activeTab === 'leaderboard'}
              aria-label={labels?.leaderboard || 'Leaderboard'}
              type="button"
              onClick={() => onTabChange('leaderboard')}
              className={`w-full h-[52px] sm:h-[56px] rounded-2xl flex flex-col items-center justify-center py-1 transition-all duration-200 cursor-pointer group active:scale-95 ${
                activeTab === 'leaderboard'
                  ? 'bg-gradient-to-b from-[#FFAA24]/30 via-[#D97706]/40 to-[#9B4B12]/50 border border-[#FFAA24] shadow-[0_0_14px_rgba(255,170,36,0.45),inset_0_1px_1px_rgba(255,211,90,0.6)] -translate-y-0.5'
                  : 'bg-[#24170F]/50 border border-[#81502B]/30 hover:border-[#FFAA24]/50 hover:bg-[#352316]/80'
              }`}
            >
              <Crown
                className={`w-5 h-5 shrink-0 transition-all ${
                  activeTab === 'leaderboard'
                    ? 'text-[#FFD35A] stroke-[2.4] drop-shadow-[0_0_8px_rgba(255,211,90,0.8)]'
                    : 'text-[#E6C8A4] group-hover:text-[#FFF0CF] stroke-[2]'
                }`}
              />
              <span
                className={`text-[10px] tracking-tight text-center mt-1 transition-colors leading-none truncate max-w-full px-0.5 ${
                  activeTab === 'leaderboard'
                    ? 'font-black text-[#FFF0CF] drop-shadow-sm'
                    : 'font-bold text-[#E6C8A4] group-hover:text-[#FFF0CF]'
                }`}
              >
                {labels?.leaderboard || 'Leaderboard'}
              </span>
              {activeTab === 'leaderboard' && (
                <span className="w-3.5 h-0.5 rounded-full bg-[#FFD35A] mt-1 shadow-[0_0_6px_#FFAA24]" />
              )}
            </button>
          </div>

          {/* =========================================================================
              5. TAB: PROFILE (Far Right)
             ========================================================================= */}
          <div className="flex items-center justify-center px-0.5">
            <button
              id="bottom-nav-profile"
              data-nav-tab="PROFILE"
              role="tab"
              aria-selected={activeTab === 'profile'}
              aria-label={labels?.profile || 'Profile'}
              type="button"
              onClick={() => onTabChange('profile')}
              className={`w-full h-[52px] sm:h-[56px] rounded-2xl flex flex-col items-center justify-center py-1 transition-all duration-200 cursor-pointer group active:scale-95 ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-b from-[#FFAA24]/30 via-[#D97706]/40 to-[#9B4B12]/50 border border-[#FFAA24] shadow-[0_0_14px_rgba(255,170,36,0.45),inset_0_1px_1px_rgba(255,211,90,0.6)] -translate-y-0.5'
                  : 'bg-[#24170F]/50 border border-[#81502B]/30 hover:border-[#FFAA24]/50 hover:bg-[#352316]/80'
              }`}
            >
              <User
                className={`w-5 h-5 shrink-0 transition-all ${
                  activeTab === 'profile'
                    ? 'text-[#FFD35A] stroke-[2.4] drop-shadow-[0_0_8px_rgba(255,211,90,0.8)]'
                    : 'text-[#E6C8A4] group-hover:text-[#FFF0CF] stroke-[2]'
                }`}
              />
              <span
                className={`text-[10px] tracking-tight text-center mt-1 transition-colors leading-none ${
                  activeTab === 'profile'
                    ? 'font-black text-[#FFF0CF] drop-shadow-sm'
                    : 'font-bold text-[#E6C8A4] group-hover:text-[#FFF0CF]'
                }`}
              >
                {labels?.profile || 'Profile'}
              </span>
              {activeTab === 'profile' && (
                <span className="w-3.5 h-0.5 rounded-full bg-[#FFD35A] mt-1 shadow-[0_0_6px_#FFAA24]" />
              )}
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default BottomNav;

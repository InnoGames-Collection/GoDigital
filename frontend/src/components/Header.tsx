/**
 * GoDigital - Header Component
 * Conforming to reference design & warm sunset palette:
 * - Left: Menu toggle + GoDigital Golden Crown & Brand Wordmark
 * - Right: Coin balance pill with gold coin, notification indicator with warm amber badge
 * - Palette: Deep warm brown #24170F with bronze border #81502B and rich sunset amber #FFAA24 / #FFD35A
 */

import React from 'react';
import { UserProfile } from '../types';
import { Menu, Plus, Bell } from 'lucide-react';
import { GoDigitalLogo } from './GoDigitalLogo';

interface HeaderProps {
  profile?: UserProfile;
  unreadNotificationsCount?: number;
  onOpenBuyCoins: () => void;
  onOpenMenu?: () => void;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  unreadNotificationsCount = 0,
  onOpenBuyCoins,
  onOpenMenu,
  onOpenNotifications,
}) => {
  const coinsCount = profile?.coins ?? 2450;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#24170F]/95 backdrop-blur-md border-b border-[#81502B]/60 shadow-[0_4px_24px_rgba(36,23,15,0.75)] select-none">
      <div className="max-w-md md:max-w-xl lg:max-w-4xl mx-auto px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3 min-h-[60px]">
        
        {/* 1. LEFT: Menu Toggle & Official GoDigital Brand Wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenMenu && (
            <button
              id="header-main-menu-btn"
              type="button"
              onClick={onOpenMenu}
              aria-label="Open GoDigital Menu"
              className="p-1.5 sm:p-2 rounded-xl bg-[#352316] text-[#E6C8A4] hover:text-[#FFF0CF] hover:border-[#FFAA24]/60 active:scale-95 transition-all cursor-pointer border border-[#81502B] shadow-xs"
              title="Menu"
            >
              <Menu className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.2]" />
            </button>
          )}

          <div 
            id="header-godigital-brand"
            className="flex items-center cursor-pointer transition-transform active:scale-98"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title="GoDigital Portal"
          >
            <GoDigitalLogo size="sm" />
          </div>
        </div>

        {/* 2. RIGHT: Coin Balance Pill & Interactive Notification Bell */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Coin Balance Pill (clickable for instant top-up) */}
          <button
            id="header-buy-coins-btn"
            type="button"
            onClick={onOpenBuyCoins}
            aria-label="Buy GoDigital Coins"
            className="group flex items-center gap-1.5 px-2.5 sm:px-3 h-[34px] sm:h-[36px] rounded-full bg-[#352316] hover:bg-[#442C1B] border border-[#81502B] hover:border-[#FFAA24]/70 text-[#FFF0CF] font-black text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-95"
            title="GoDigital Coins Wallet"
          >
            <span className="text-sm">🪙</span>
            <span className="font-mono font-black text-[#FFF0CF] tracking-tight">
              {coinsCount.toLocaleString()}
            </span>
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F] flex items-center justify-center ml-0.5 group-hover:scale-110 transition-transform shadow-xs">
              <Plus className="w-3 h-3 stroke-[3]" />
            </div>
          </button>

          {/* Interactive Notification Bell with Live Unread Badge */}
          <button 
            id="header-notifications-btn"
            type="button"
            onClick={onOpenNotifications}
            aria-label={`Notifications${unreadNotificationsCount > 0 ? ` (${unreadNotificationsCount} unread)` : ''}`}
            className="relative w-[34px] sm:w-[36px] h-[34px] sm:h-[36px] rounded-full bg-[#352316] hover:bg-[#442C1B] border border-[#81502B] hover:border-[#FFAA24]/70 flex items-center justify-center text-[#E6C8A4] hover:text-[#FFAA24] cursor-pointer transition-all shadow-xs active:scale-95"
            title="Notifications"
          >
            <Bell className="w-4 h-4 stroke-[2]" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F] text-[10px] font-black flex items-center justify-center ring-2 ring-[#24170F] shadow-sm animate-pulse">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;

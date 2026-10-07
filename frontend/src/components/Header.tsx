/**
 * GameON Tele - Native telebirr SuperApp Mini-App Header
 * 
 * Strict Layout Rules:
 * - NO EthioTelecom corporate logo in header.
 * - Left: telebirr SuperApp indicator ("telebirr Game Center")
 * - Center: "GAMEON TELE" brand wordmark
 * - Right: Coin balance chip (`🪙 50`) + "BUY COINS" / Add action
 */

import React from 'react';
import { UserProfile } from '../types';
import { Menu, Plus } from 'lucide-react';
import { GoPlayLogo } from './GoPlayLogo';

interface HeaderProps {
  profile?: UserProfile;
  onOpenBuyCoins: () => void;
  onOpenMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenBuyCoins,
  onOpenMenu,
}) => {
  const coinsCount = profile?.coins ?? 50;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#121622]/95 backdrop-blur-md border-b border-[#282E3D] shadow-[0_4px_16px_rgba(0,0,0,0.3)] select-none">
      <div className="max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 min-h-[58px]">
        
        {/* 1. LEFT: Menu button & telebirr Mini-App Brand Indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onOpenMenu && (
            <button
              id="header-main-menu-btn"
              type="button"
              onClick={onOpenMenu}
              aria-label="Open GoPlay Menu"
              className="p-1.5 rounded-xl text-white hover:bg-[#202536] active:scale-95 transition-colors cursor-pointer border border-transparent hover:border-[#282E3D]"
              title="Menu"
            >
              <Menu className="w-5 h-5 stroke-[2.2]" />
            </button>
          )}

          {/* telebirr mini-app badge */}
          <div 
            id="header-telebirr-chip"
            className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-[#202536] border border-[#282E3D] text-[#AEB6C7] cursor-pointer hover:bg-[#282E3D] transition-colors"
            title="telebirr SuperApp Game Center"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-5 h-5 rounded-lg bg-[#7C3AED] text-white font-black text-[11px] flex items-center justify-center leading-none shadow-xs">
              tb
            </div>
            <div className="hidden xs:flex flex-col text-left leading-tight">
              <span className="text-[9px] font-black tracking-tight text-[#22D3EE] uppercase">
                telebirr
              </span>
              <span className="text-[8px] font-semibold text-[#AEB6C7] -mt-0.5">
                Game Center
              </span>
            </div>
          </div>
        </div>

        {/* 2. CENTER: GoPlay Visual Identity */}
        <div 
          id="header-goplay-brand"
          className="flex items-center justify-center text-center cursor-pointer px-1 shrink-0 transition-transform active:scale-98"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="GoPlay"
        >
          <GoPlayLogo size="sm" variant="dark" />
        </div>

        {/* 3. RIGHT: Coins Balance Chip & Instant Topup */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="header-buy-coins-btn"
            type="button"
            onClick={onOpenBuyCoins}
            aria-label="Buy Coins"
            className="group flex items-center gap-1.5 px-2.5 sm:px-3 h-[32px] sm:h-[34px] rounded-full bg-[#202536] hover:bg-[#282E3D] border border-[#282E3D] text-white font-black text-[11px] sm:text-xs transition-all shadow-xs cursor-pointer active:scale-95"
            title="Buy GoPlay Coins"
          >
            <span className="text-sm text-[#F5B942]">🪙</span>
            <span className="font-black text-white">{coinsCount}</span>
            <div className="w-4 h-4 rounded-full bg-[#7C3AED] text-white flex items-center justify-center ml-0.5 group-hover:scale-110 group-hover:bg-[#6D28D9] transition-transform shadow-xs">
              <Plus className="w-3 h-3 stroke-[3]" />
            </div>
          </button>
        </div>

      </div>
    </header>
  );
};

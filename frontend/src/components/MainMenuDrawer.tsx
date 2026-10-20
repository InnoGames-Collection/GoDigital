/**
 * GoDigital - Polished Horizontal Navigation Menu Panel
 * 
 * Strict Requirements:
 * - Wide horizontal multi-column panel anchored to header area
 * - Width: ~88-94% of viewport width on mobile (w-[92vw] sm:w-[90vw] max-w-4xl)
 * - Grid: 4 columns on desktop (2 rows of 4), 3 on tablet, 2 columns on mobile portrait
 * - Height: Compact, max ~60-65% of viewport (max-h-[62vh]), adapts to content
 * - Internal scrolling with overscroll-contain without moving background portal
 * - Preserves portal visibility around panel
 * - Standardized 8 items with exact labels and icons from PORTAL_NAV_ITEMS:
 *   1. Subscription
 *   2. Subscription Pricing
 *   3. My Games
 *   4. My High Scores
 *   5. FAQ
 *   6. Games Help & Support
 *   7. Terms & Conditions
 *   8. Privacy Policy
 * - Closes on backdrop tap, close button, Escape key, or browser Back
 */

import React, { useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { GoDigitalLogo } from './GoDigitalLogo';
import { PORTAL_NAV_ITEMS, PortalSectionId } from '../utils/navigationConfig';

export type MainMenuSection = PortalSectionId;

interface MainMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (section: MainMenuSection) => void;
  activeSection?: string | null;
}

export const MainMenuDrawer: React.FC<MainMenuDrawerProps> = ({
  isOpen,
  onClose,
  onSelectSection,
  activeSection = null,
}) => {
  // Support Escape key to cleanly close menu
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      id="main-menu-overlay"
      className="fixed inset-0 z-50 bg-[#120B07]/70 backdrop-blur-[3px] flex flex-col items-center pt-[max(4.25rem,calc(env(safe-area-inset-top)+3.5rem))] px-3 sm:px-4 pb-20 select-none animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="GoDigital Navigation Menu"
    >
      <div 
        id="main-menu-panel"
        className="w-[92vw] sm:w-[90vw] max-w-4xl max-h-[62vh] sm:max-h-[65vh] bg-[#24170F] border border-[#81502B] rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Panel Header: Brand + Title + Accessible Close Control */}
        <div className="px-3.5 sm:px-5 py-3 bg-[#2D1C12] text-[#FFF0CF] flex items-center justify-between border-b border-[#81502B] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="bg-[#352316] border border-[#81502B] px-2 py-1 rounded-xl shadow-xs flex items-center justify-center shrink-0">
              <GoDigitalLogo size="xs" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black tracking-tight text-[#FFF0CF] truncate">Navigation Menu</h2>
              <span className="text-[10px] text-[#E6C8A4] font-medium block -mt-0.5 truncate">
                Official Gaming Portal Destinations
              </span>
            </div>
          </div>

          <button
            id="main-menu-close-btn"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#352316] hover:bg-[#442C1B] active:scale-95 border border-[#81502B] hover:border-[#FFAA24]/60 flex items-center justify-center text-[#FFF0CF] transition-all cursor-pointer shrink-0"
            title="Close Menu"
            aria-label="Close Menu"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* 2. Responsive Horizontal Grid: 2 columns on mobile, 3 on tablet, 4 on desktop */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {PORTAL_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isSelected = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  id={`main-menu-item-${item.id}`}
                  type="button"
                  onClick={() => {
                    onSelectSection(item.id);
                  }}
                  className={`w-full min-h-[72px] sm:min-h-[78px] p-2.5 sm:p-3 rounded-2xl flex items-center gap-2.5 sm:gap-3 text-left transition-all cursor-pointer group active:scale-[0.98] ${
                    isSelected
                      ? 'bg-[#442C1B] border-2 border-[#FFAA24] text-[#FFF0CF] shadow-md ring-1 ring-[#FFAA24]/40'
                      : 'bg-[#2D1C12]/95 hover:bg-[#3D2517] active:bg-[#4A2D1B] border border-[#81502B]/70 hover:border-[#FFAA24]/70 shadow-xs'
                  }`}
                  aria-label={item.label}
                >
                  {/* Coordinated Gold/Amber Icon Container */}
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F] shadow-xs'
                        : 'bg-[#352316] text-[#FFD35A] group-hover:bg-[#442C1B] group-hover:text-[#FFAA24] border border-[#81502B]'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5 stroke-[2.2]" />
                  </div>

                  {/* Readable Warm-Cream Label with Controlled Natural Multi-Line Wrapping */}
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-xs sm:text-[13px] leading-snug block break-words whitespace-normal transition-colors ${
                        isSelected
                          ? 'font-black text-[#FFD35A]'
                          : 'font-black text-[#FFF0CF] group-hover:text-[#FFD35A]'
                      }`}
                    >
                      {item.label}
                    </span>
                    <span className="text-[10px] text-[#E6C8A4]/75 block truncate mt-0.5 hidden sm:block">
                      {item.description}
                    </span>
                  </div>

                  {/* Subtle chevron indicator */}
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-all shrink-0 hidden xs:block ${
                      isSelected
                        ? 'text-[#FFAA24] translate-x-0.5'
                        : 'text-[#81502B] group-hover:text-[#FFAA24] group-hover:translate-x-0.5'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Panel Footer Status Banner */}
        <div className="px-4 py-2 border-t border-[#81502B] bg-[#2D1C12]/95 text-center shrink-0">
          <span className="text-[10px] text-[#E6C8A4]/80 font-bold tracking-wide">
            GoDigital v2.0 • Official telebirr SuperApp Gaming Portal
          </span>
        </div>
      </div>
    </div>
  );
};

export default MainMenuDrawer;

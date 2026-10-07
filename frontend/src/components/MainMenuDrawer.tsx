/**
 * Main Menu Drawer Component for TelePlus
 * 
 * Strict Requirement:
 * The TelePlus menu must contain these seven sections in this exact order:
 * 1. Games
 * 2. FAQ
 * 3. Help & Support
 * 4. Subscription
 * 5. Pricing
 * 6. Terms & Conditions
 * 7. Privacy Policy
 * 
 * Each menu item is clickable and navigates to its full content page.
 */

import React from 'react';
import { 
  Gamepad2, 
  HelpCircle, 
  Headphones, 
  CreditCard, 
  BadgePercent, 
  FileText, 
  ShieldCheck, 
  X, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { GoPlayLogo } from './GoPlayLogo';

export type MainMenuSection = 
  | 'games'
  | 'faq'
  | 'help_support'
  | 'subscription'
  | 'pricing'
  | 'terms'
  | 'privacy';

interface MainMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (section: MainMenuSection) => void;
}

export const MainMenuDrawer: React.FC<MainMenuDrawerProps> = ({
  isOpen,
  onClose,
  onSelectSection,
}) => {
  if (!isOpen) return null;

  const menuItems: {
    id: MainMenuSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
  }[] = [
    {
      id: 'games',
      label: 'Games',
      icon: Gamepad2,
      accentColor: 'text-[#22D3EE] bg-[#202536] border-[#282E3D]',
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: HelpCircle,
      accentColor: 'text-[#F5B942] bg-[#202536] border-[#282E3D]',
    },
    {
      id: 'help_support',
      label: 'Help & Support',
      icon: Headphones,
      accentColor: 'text-[#22D3EE] bg-[#202536] border-[#282E3D]',
    },
    {
      id: 'subscription',
      label: 'Subscription',
      icon: CreditCard,
      accentColor: 'text-[#7C3AED] bg-[#202536] border-[#282E3D]',
    },
    {
      id: 'pricing',
      label: 'Pricing',
      icon: BadgePercent,
      accentColor: 'text-[#F5B942] bg-[#202536] border-[#282E3D]',
    },
    {
      id: 'terms',
      label: 'Terms & Conditions',
      icon: FileText,
      accentColor: 'text-[#AEB6C7] bg-[#202536] border-[#282E3D]',
    },
    {
      id: 'privacy',
      label: 'Privacy Policy',
      icon: ShieldCheck,
      accentColor: 'text-[#35D07F] bg-[#202536] border-[#282E3D]',
    },
  ];

  return (
    <div 
      id="main-menu-overlay"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        id="main-menu-panel"
        className="w-full max-w-sm bg-[#121622] border-l border-[#282E3D] h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 bg-[#181C29] border-b border-[#282E3D] text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="bg-[#202536] border border-[#282E3D] px-2 py-1 rounded-xl shadow-xs flex items-center justify-center">
              <GoPlayLogo size="xs" variant="dark" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight text-white">GoPlay</h2>
              <span className="text-[10px] text-[#AEB6C7] font-medium">Gaming Portal</span>
            </div>
          </div>

          <button
            id="main-menu-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#202536] hover:bg-[#282E3D] border border-[#282E3D] flex items-center justify-center text-white transition-colors cursor-pointer"
            title="Close Menu"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* 7 Menu Items in Exact Required Order */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="space-y-1.5 pt-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`main-menu-item-${item.id}`}
                  onClick={() => {
                    onSelectSection(item.id);
                    onClose();
                  }}
                  className="w-full p-3 rounded-2xl bg-[#181C29] hover:bg-[#202536] border border-[#282E3D] hover:border-[#7C3AED]/50 shadow-xs flex items-center justify-between gap-3 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${item.accentColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <h3 className="text-sm font-black text-white group-hover:text-[#22D3EE] transition-colors leading-tight">
                      {item.label}
                    </h3>
                  </div>

                  <ChevronRight className="w-4 h-4 text-[#70798D] group-hover:text-[#22D3EE] group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

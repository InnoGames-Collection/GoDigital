/**
 * GoDigital - Customer Profile & Account Page
 * Conforming to reference design & warm sunset palette:
 * - Single consistent GoDigital branding with NO duplicate logo
 * - User Profile Avatar (circular with golden-amber accent)
 * - Warm charcoal-brown palette (#352316 / #442C1B) with subtle bronze borders (#81502B)
 * - Sunset amber (#FFAA24) and golden highlight (#FFD35A) key actions
 * - Standardized 8 Navigation Items synchronized with Main Menu:
 *   1. Subscription
 *   2. Subscription Pricing
 *   3. My Games
 *   4. My High Scores
 *   5. FAQ
 *   6. Games Help & Support
 *   7. Terms & Conditions
 *   8. Privacy Policy
 */

import React, { useState, useMemo } from 'react';
import { 
  UserProfile, 
  GameDefinition, 
  EnergyTransaction, 
  ClaimableReward,
  LanguageCode 
} from '../types';
import { 
  User, 
  Coins, 
  Trophy, 
  ChevronRight, 
  Volume2, 
  VolumeX,
  Plus
} from 'lucide-react';
import { SubscriptionPage } from './content/SubscriptionPage';
import { PricingPage } from './content/PricingPage';
import { MyGamesPage } from './content/MyGamesPage';
import { MyScoresPage } from './content/MyScoresPage';
import { FAQPage } from './content/FAQPage';
import { HelpSupportPage } from './content/HelpSupportPage';
import { TermsPage } from './content/TermsPage';
import { PrivacyPage } from './content/PrivacyPage';
import { TournamentService } from '../services/tournamentService';
import { PORTAL_NAV_ITEMS, PortalSectionId } from '../utils/navigationConfig';

export type ProfileSubView = PortalSectionId | null;

interface ProfilePageProps {
  profile: UserProfile;
  games: GameDefinition[];
  energyTransactions?: EnergyTransaction[];
  claimableRewards?: ClaimableReward[];
  language?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  onOpenEnergyModal?: () => void;
  onOpenSubscriptionModal?: () => void;
  onOpenAuthModal?: () => void;
  onPlayGame: (game: GameDefinition) => void;
  onClaimReward?: (rewardId: string) => void;
  onSignOut?: () => void;
  onOpenBuyCoins?: () => void;
  onProfileUpdate?: (updated: UserProfile) => void;
  onOpenMenu?: () => void;
  onNavigateToSection?: (section: PortalSectionId) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  games,
  language = 'en',
  onLanguageChange,
  onPlayGame,
  onOpenBuyCoins,
  onProfileUpdate,
  onOpenMenu,
  onNavigateToSection,
}) => {
  const [subView, setSubView] = useState<ProfileSubView>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const phone = profile.phoneNumber || '0911234890';
  const maskedMsisdn = `${phone.slice(0, 3)}*****${phone.slice(-3)}`;

  // Authoritative persisted Helix Jump tournament best score
  const bestScore = useMemo(() => {
    return TournamentService.getHelixTournamentBestScore(profile);
  }, [profile]);

  const handleSelectItem = (id: PortalSectionId) => {
    if (onNavigateToSection) {
      onNavigateToSection(id);
    } else {
      setSubView(id);
    }
  };

  // Subview rendering (fallback when onNavigateToSection is not provided or local)
  if (subView === 'subscription') {
    return (
      <SubscriptionPage
        onBack={() => setSubView(null)}
        profile={profile}
        onProfileUpdate={onProfileUpdate}
        showHeader={true}
      />
    );
  }

  if (subView === 'pricing') {
    return (
      <PricingPage
        onBack={() => setSubView(null)}
        onBuyCoins={onOpenBuyCoins}
        showHeader={true}
      />
    );
  }

  if (subView === 'my_games') {
    return (
      <MyGamesPage
        games={games}
        profile={profile}
        onPlayGame={onPlayGame}
        onBack={() => setSubView(null)}
        showHeader={true}
      />
    );
  }

  if (subView === 'my_scores') {
    return (
      <MyScoresPage
        profile={profile}
        onBack={() => setSubView(null)}
        showHeader={true}
      />
    );
  }

  if (subView === 'faq') {
    return (
      <FAQPage
        onBack={() => setSubView(null)}
        showHeader={true}
      />
    );
  }

  if (subView === 'help_support') {
    return (
      <HelpSupportPage
        onBack={() => setSubView(null)}
        showHeader={true}
      />
    );
  }

  if (subView === 'terms') {
    return (
      <TermsPage
        onBack={() => setSubView(null)}
        showHeader={true}
      />
    );
  }

  if (subView === 'privacy') {
    return (
      <PrivacyPage
        onBack={() => setSubView(null)}
        showHeader={true}
      />
    );
  }

  // =========================================================================
  // MAIN PROFILE VIEW
  // =========================================================================
  return (
    <div className="min-h-screen text-[#FFF0CF] pb-28 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 space-y-4 select-none relative z-10">
      
      {/* 1. TOP: Authenticated GoDigital Profile Card */}
      <div 
        id="profile-account-card"
        className="rounded-3xl bg-[#352316] border border-[#81502B] text-[#FFF0CF] p-4.5 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* User Avatar Circle */}
            <div className="w-12 h-12 rounded-full bg-[#442C1B] border-2 border-[#FFAA24]/70 flex items-center justify-center shadow-xs text-[#FFD35A] shrink-0">
              <User className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#E6C8A4] font-black uppercase tracking-wider">
                  GoDigital Account
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F] text-[8px] font-black uppercase tracking-wider">
                  VERIFIED
                </span>
              </div>
              <div className="text-base font-black font-mono tracking-wider text-[#FFF0CF]">
                {maskedMsisdn}
              </div>
            </div>
          </div>

          <button
            id="profile-top-up-btn"
            type="button"
            onClick={onOpenBuyCoins}
            className="px-3.5 py-2 rounded-full bg-gradient-to-r from-[#FFAA24] to-[#F47B20] hover:brightness-110 active:scale-95 text-[#24170F] text-xs font-black flex items-center gap-1 shadow-sm transition-transform cursor-pointer shrink-0 border-none"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Top Up</span>
          </button>
        </div>
      </div>

      {/* 2. STATS: AVAILABLE COINS | BEST SCORE (Two equal-width, balanced cards) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Available Coins */}
        <div 
          id="profile-stat-available-coins"
          onClick={onOpenBuyCoins}
          className="bg-[#352316] rounded-2xl p-4 border border-[#81502B] shadow-xs hover:border-[#FFAA24]/70 transition-all cursor-pointer flex flex-col justify-between h-[96px]"
        >
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#E6C8A4] tracking-wider uppercase">
              Available Coins
            </span>
            <div className="w-6 h-6 rounded-full bg-[#442C1B] border border-[#81502B] flex items-center justify-center shrink-0">
              <Coins className="w-3.5 h-3.5 text-[#FFD35A]" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#FFF0CF] font-mono">
            {(profile.coins ?? 0).toLocaleString()}
          </div>
        </div>

        {/* Best Score (Authoritative Helix Jump Tournament Record) */}
        <div 
          id="profile-stat-best-score"
          onClick={() => handleSelectItem('my_scores')}
          className="bg-[#352316] rounded-2xl p-4 border border-[#81502B] shadow-xs hover:border-[#FFAA24]/70 transition-all cursor-pointer flex flex-col justify-between h-[96px]"
        >
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#E6C8A4] tracking-wider uppercase">
              Best Score
            </span>
            <div className="w-6 h-6 rounded-full bg-[#442C1B] border border-[#81502B] flex items-center justify-center shrink-0">
              <Trophy className="w-3.5 h-3.5 text-[#FFD35A]" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#FFF0CF] font-mono flex items-baseline gap-1">
            <span>{bestScore.toLocaleString()}</span>
            <span className="text-xs font-bold text-[#E6C8A4] font-sans">pts</span>
          </div>
        </div>
      </div>

      {/* 3. PROFILE MENU ITEMS - EXACT 8 ITEMS WITH COMPLETE VISIBLE LABELS */}
      <div className="bg-[#352316] rounded-2xl border border-[#81502B] shadow-xs overflow-hidden divide-y divide-[#81502B]">
        {PORTAL_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`profile-menu-item-${item.id}`}
              type="button"
              onClick={() => handleSelectItem(item.id)}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#442C1B] transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#442C1B] text-[#FFAA24] flex items-center justify-center group-hover:bg-[#FFAA24] group-hover:text-[#24170F] transition-colors border border-[#81502B] shrink-0">
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-black text-[#FFF0CF] group-hover:text-[#FFD35A] transition-colors leading-snug break-words">
                    {item.label}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-[#E6C8A4]/75 block truncate">
                    {item.description}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <ChevronRight className="w-4 h-4 text-[#E6C8A4] group-hover:text-[#FFAA24] transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. Sound & Preference Settings */}
      <div className="p-3.5 rounded-2xl bg-[#352316] border border-[#81502B] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-[#FFD35A]" />
          ) : (
            <VolumeX className="w-4 h-4 text-[#E6C8A4]" />
          )}
          <span className="text-xs font-bold text-[#FFF0CF]">Game Sound Effects</span>
        </div>
        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          aria-label="Toggle Game Sound Effects"
          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
            soundEnabled ? 'bg-gradient-to-r from-[#FFAA24] to-[#F47B20]' : 'bg-[#442C1B] border border-[#81502B]'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-[#24170F] transition-transform absolute top-1 ${
              soundEnabled ? 'left-6' : 'left-1 bg-[#E6C8A4]'
            }`}
          />
        </button>
      </div>

      {/* 5. GoDigital Portal Info Footer */}
      <div className="text-center pt-2 text-[10px] text-[#E6C8A4]/80 font-bold space-y-0.5">
        <div>GoDigital v2.0 • Gaming Edition</div>
        <div>Official telebirr SuperApp Gaming Portal</div>
      </div>

    </div>
  );
};

export default ProfilePage;

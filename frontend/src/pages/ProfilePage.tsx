/**
 * GameON Tele - Customer Profile & Account Page
 * 
 * Compliant with GameON Tele guidelines:
 * - NO customer login screen: User is pre-authenticated by telebirr SuperApp
 * - telebirr Identity: MSISDN, telebirr balance, GameON coin balance
 * - In-app Coin Topup & All-Access Subscription Management
 * - Game History & Personal High Scores
 * - Clean, responsive UI with zero shortcode dependencies
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
  Phone, 
  Coins, 
  Gamepad2, 
  Trophy, 
  Gift, 
  Crown, 
  CreditCard, 
  Headphones, 
  HelpCircle, 
  Settings as SettingsIcon, 
  Info, 
  FileText, 
  ShieldCheck, 
  ArrowLeft, 
  ChevronRight, 
  Sparkles, 
  Volume2, 
  VolumeX,
  Plus
} from 'lucide-react';
import { GamesContentPage } from './content/GamesContentPage';
import { PricingPage } from './content/PricingPage';
import { FAQPage } from './content/FAQPage';
import { HelpSupportPage } from './content/HelpSupportPage';
import { SubscriptionPage } from './content/SubscriptionPage';
import { TermsPage } from './content/TermsPage';
import { PrivacyPage } from './content/PrivacyPage';
import { EntitlementService } from '../services/entitlementService';
import { GameCatalog } from '../services/gameCatalog';
import { catalogGameToDefinition } from '../games/registry';
import { GoPlayLogo } from '../components/GoPlayLogo';
import { TournamentService } from '../services/tournamentService';

export type ProfileSubView =
  | null
  | 'games'
  | 'pricing'
  | 'my_games'
  | 'my_scores'
  | 'my_rewards'
  | 'my_rank'
  | 'subscriptions'
  | 'help_support'
  | 'faq'
  | 'settings'
  | 'about'
  | 'terms'
  | 'privacy';

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
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  games,
  language = 'en',
  onLanguageChange,
  onPlayGame,
  onOpenBuyCoins,
  onProfileUpdate,
}) => {
  const [subView, setSubView] = useState<ProfileSubView>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const phone = profile.phoneNumber || '0911234890';
  const maskedMsisdn = `${phone.slice(0, 3)}*****${phone.slice(-3)}`;

  // Real highest valid competitive game score from existing system
  const bestScore = useMemo(() => {
    const scores = Object.values(profile.highScores || {}) as number[];
    const maxProfileScore = scores.length > 0 ? Math.max(...scores) : 0;
    const tournamentSummary = TournamentService.getTournamentSummary(profile);
    const tournamentBest = tournamentSummary.currentUserBestScore || 0;
    return Math.max(maxProfileScore, tournamentBest);
  }, [profile]);

  // Played or unlocked games
  const recentlyPlayedIds = EntitlementService.getRecentlyPlayedIds();
  const myGamesList = GameCatalog.getRecentlyPlayed(recentlyPlayedIds).map(catalogGameToDefinition);

  // Active subscriptions count
  const activeSubsCount = EntitlementService.getActiveSubscriptionsList().length;

  // Subview rendering
  if (subView === 'subscriptions') {
    return (
      <SubscriptionPage
        onBack={() => setSubView(null)}
        profile={profile}
        onProfileUpdate={onProfileUpdate}
      />
    );
  }

  if (subView === 'pricing') {
    return (
      <PricingPage
        onBack={() => setSubView(null)}
        onBuyCoins={onOpenBuyCoins}
      />
    );
  }

  if (subView === 'games') {
    return (
      <GamesContentPage
        onBack={() => setSubView(null)}
        onPlayGame={onPlayGame}
      />
    );
  }

  if (subView === 'terms') {
    return <TermsPage onBack={() => setSubView(null)} />;
  }

  if (subView === 'privacy') {
    return <PrivacyPage onBack={() => setSubView(null)} />;
  }

  if (subView === 'faq') {
    return <FAQPage onBack={() => setSubView(null)} />;
  }

  if (subView === 'help_support') {
    return <HelpSupportPage onBack={() => setSubView(null)} />;
  }

  if (subView === 'my_games') {
    const allAvailableGames = GameCatalog.getAll().map(catalogGameToDefinition);

    return (
      <div className="min-h-screen bg-[#0B0D14] text-white pb-28 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none space-y-4">
        <div className="flex items-center justify-between gap-3 bg-[#181C29] border border-[#282E3D] text-white p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSubView(null)}
              className="w-8 h-8 rounded-xl bg-[#202536] hover:bg-[#282E3D] border border-[#282E3D] flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <h1 className="text-base font-black tracking-tight">My Games</h1>
          </div>
          <span className="text-xs font-bold text-[#AEB6C7]">
            {allAvailableGames.length} Games
          </span>
        </div>

        <div className="space-y-2.5">
          {allAvailableGames.map((g) => {
            const personalHighScore = profile.highScores?.[g.id] ?? 0;
            return (
              <div
                key={g.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#181C29] border border-[#282E3D] hover:border-[#7C3AED]/60 transition-all shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={g.thumbnailUrl || g.bannerUrl}
                    alt={g.title}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-900 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-white truncate">{g.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-[#AEB6C7] capitalize">{g.category}</span>
                      <span className="text-[10px] text-[#70798D]">•</span>
                      <span className="text-[11px] font-extrabold text-[#22D3EE]">
                        Best: {personalHighScore > 0 ? `${personalHighScore.toLocaleString()} pts` : '-'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onPlayGame(g)}
                  className="px-3.5 py-1.5 rounded-[11px] bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-95 text-white text-xs font-black shrink-0 transition-transform cursor-pointer shadow-xs border-none"
                >
                  Play
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (subView === 'my_scores') {
    return (
      <div className="min-h-screen bg-[#0B0D14] text-white pb-28 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none space-y-4">
        <div className="flex items-center justify-between gap-3 bg-[#181C29] border border-[#282E3D] text-white p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSubView(null)}
              className="w-8 h-8 rounded-xl bg-[#202536] hover:bg-[#282E3D] border border-[#282E3D] flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <h1 className="text-base font-black tracking-tight">My Scores</h1>
          </div>
        </div>

        <div className="rounded-2xl border border-[#282E3D] overflow-hidden bg-[#181C29] shadow-xs divide-y divide-[#282E3D]">
          {Object.entries(profile.highScores || {}).map(([gameId, score]) => {
            const catalogGame = GameCatalog.getById(gameId);
            return (
              <div key={gameId} className="p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-white">
                    {catalogGame?.gameName || gameId}
                  </div>
                  <div className="text-[10px] text-[#AEB6C7] capitalize">
                    {catalogGame?.category || 'Standard Game'}
                  </div>
                </div>
                <div className="text-sm font-black text-[#22D3EE] font-mono">
                  {score.toLocaleString()} pts
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN PROFILE VIEW
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#0B0D14] text-white pb-28 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 space-y-4 select-none">
      
      {/* Official GoPlay Profile Brand Header */}
      <div className="flex flex-col items-center justify-center py-2">
        <GoPlayLogo size="lg" variant="dark" />
      </div>

      {/* 1. TOP: Authenticated GoPlay Profile Card */}
      <div 
        id="profile-account-card"
        className="rounded-3xl bg-[#181C29] border border-[#282E3D] text-white p-4.5 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#202536] border border-[#282E3D] p-1.5 flex items-center justify-center shadow-xs shrink-0">
              <GoPlayLogo size="xs" variant="dark" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#AEB6C7] font-black uppercase tracking-wider">
                  GoPlay Account
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-[#35D07F] text-black text-[8px] font-black uppercase tracking-wider">
                  VERIFIED
                </span>
              </div>
              <div className="text-base font-black font-mono tracking-wider text-white">
                {maskedMsisdn}
              </div>
            </div>
          </div>

          <button
            id="profile-top-up-btn"
            type="button"
            onClick={onOpenBuyCoins}
            className="px-3.5 py-2 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-black flex items-center gap-1 shadow-sm shadow-[#7C3AED]/30 transition-transform active:scale-95 cursor-pointer shrink-0 border-none"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Top Up</span>
          </button>
        </div>
      </div>

      {/* 2. STATS: AVAILABLE COINS | BEST SCORE (Two equal-width professional cards) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Available Coins */}
        <div 
          id="profile-stat-available-coins"
          onClick={onOpenBuyCoins}
          className="bg-[#181C29] rounded-2xl p-4 border border-[#282E3D] shadow-xs hover:border-[#F5B942]/60 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#AEB6C7] tracking-wider uppercase">
              Available Coins
            </span>
            <div className="w-6 h-6 rounded-full bg-[#202536] border border-[#282E3D] flex items-center justify-center shrink-0">
              <Coins className="w-3.5 h-3.5 text-[#F5B942]" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {(profile.coins ?? 50).toLocaleString()}
          </div>
        </div>

        {/* Best Score */}
        <div 
          id="profile-stat-best-score"
          onClick={() => setSubView('my_scores')}
          className="bg-[#181C29] rounded-2xl p-4 border border-[#282E3D] shadow-xs hover:border-[#7C3AED]/60 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#AEB6C7] tracking-wider uppercase">
              Best Score
            </span>
            <div className="w-6 h-6 rounded-full bg-[#202536] border border-[#282E3D] flex items-center justify-center shrink-0">
              <Trophy className="w-3.5 h-3.5 text-[#7C3AED]" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono flex items-baseline gap-1">
            <span>{bestScore.toLocaleString()}</span>
            <span className="text-xs font-bold text-[#70798D] font-sans">pts</span>
          </div>
        </div>
      </div>

      {/* 3. PROFILE MENU ITEMS */}
      <div className="bg-[#181C29] rounded-2xl border border-[#282E3D] shadow-xs overflow-hidden divide-y divide-[#282E3D]">
        {[
          { id: 'subscriptions', label: 'Subscription', icon: CreditCard },
          { id: 'pricing', label: 'Pricing', icon: Coins },
          { id: 'my_games', label: 'My Games', icon: Gamepad2 },
          { id: 'my_scores', label: 'My High Scores', icon: Trophy },
          { id: 'faq', label: 'FAQ', icon: HelpCircle },
          { id: 'help_support', label: 'Help & Support', icon: Headphones },
          { id: 'terms', label: 'Terms & Conditions', icon: FileText },
          { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`profile-menu-item-${item.id}`}
              onClick={() => setSubView(item.id as ProfileSubView)}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#202536] transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#202536] text-[#7C3AED] flex items-center justify-center group-hover:bg-[#7C3AED] group-hover:text-white transition-colors border border-[#282E3D]">
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-xs sm:text-sm font-black text-white group-hover:text-[#22D3EE] transition-colors">
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-[#70798D] group-hover:text-[#22D3EE] transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Sound & Preference Settings */}
      <div className="p-3.5 rounded-2xl bg-[#181C29] border border-[#282E3D] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-[#22D3EE]" />
          ) : (
            <VolumeX className="w-4 h-4 text-[#70798D]" />
          )}
          <span className="text-xs font-bold text-white">Game Sound Effects</span>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
            soundEnabled ? 'bg-[#7C3AED]' : 'bg-[#282E3D]'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
              soundEnabled ? 'left-6' : 'left-1'
            }`}
          />
        </button>
      </div>

      {/* GoPlay Info */}
      <div className="text-center pt-2 text-[10px] text-[#70798D] font-bold space-y-0.5">
        <div>GoPlay v2.0 • Gaming Edition</div>
        <div>Official Gaming Portal</div>
      </div>

    </div>
  );
};

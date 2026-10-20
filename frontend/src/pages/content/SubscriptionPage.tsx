/**
 * GameON Tele - Telebirr SuperApp In-App Subscription & Passes
 * 
 * Compliant with GameON Tele specifications:
 * - NO SMS shortcode flows, no 977, no "Send OK".
 * - Direct in-app telebirr SuperApp wallet billing.
 * - Manages active game subscriptions and passes with expiration tracking.
 */

import React from 'react';
import { UserProfile, SubscriptionPlan } from '../../types';
import { 
  CreditCard, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Wallet, 
  Sparkles
} from 'lucide-react';

interface SubscriptionPageProps {
  onBack?: () => void;
  showHeader?: boolean;
  profile?: UserProfile;
  onProfileUpdate?: (updated: UserProfile) => void;
}

const ALL_ACCESS_PASSES = [
  {
    id: 'daily' as SubscriptionPlan,
    name: 'Daily',
    priceETB: 5,
    period: '24 Hours',
    features: [
      'Full game access for 24 hours',
    ],
  },
  {
    id: 'weekly' as SubscriptionPlan,
    name: 'Weekly',
    priceETB: 20,
    period: '7 Days',
    features: [
      'Full game access for 7 days',
    ],
  },
  {
    id: 'monthly' as SubscriptionPlan,
    name: 'Monthly',
    priceETB: 50,
    period: '30 Days',
    features: [
      'Full game access for 30 days',
    ],
  },
];

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({
  onBack,
  showHeader = true,
  profile,
}) => {
  return (
    <div className="min-h-screen bg-transparent text-[#FFF0CF] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none">
      {/* 1. Header with Back Button */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#352316] to-[#442C1B] border border-[#81502B] text-[#FFF0CF] p-3.5 rounded-2xl shadow-md mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="subscription-back-btn"
                onClick={onBack}
                className="w-8 h-8 rounded-xl bg-[#24170F]/80 hover:bg-[#442C1B] border border-[#81502B] flex items-center justify-center text-[#FFF0CF] transition-colors cursor-pointer shrink-0"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#FFD35A] shrink-0" />
              <h1 className="text-base font-black tracking-tight">Subscription</h1>
            </div>
          </div>
        </div>
      )}

      {/* 3. Active Subscriptions Overview */}
      {profile?.subscription?.isActive && (
        <div className="p-4 rounded-2xl bg-[#352316]/90 border border-[#81502B] shadow-md mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFD35A]" />
              <span className="text-xs font-black text-[#FFF0CF] uppercase tracking-wide">
                Current Active Subscription
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FFD35A] to-[#FFAA24] text-[#24170F] text-[9px] font-black uppercase tracking-wider">
              ACTIVE
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <h3 className="text-base font-black text-[#FFF0CF] capitalize">
                {profile.subscription.plan} Subscription
              </h3>
              <p className="text-[11px] text-[#E6C8A4]">
                Billed directly via telebirr SuperApp
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-[#E6C8A4] font-bold uppercase">Auto-Renew</div>
              <div className="text-xs font-black text-[#FFD35A]">Enabled</div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Telebirr Wallet Balance Summary */}
      {profile && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#24170F]/80 border border-[#81502B] text-xs mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#FFD35A]" />
            <span className="font-bold text-[#E6C8A4]">telebirr Wallet Balance</span>
          </div>
          <span className="font-black text-[#FFD35A]">
            {profile.telebirrBalance.toFixed(2)} ETB
          </span>
        </div>
      )}

      {/* 5. Available Packages */}
      <div className="space-y-3">
        <div className="text-xs font-black uppercase text-[#E6C8A4] tracking-wider px-1">
          Subscription Packages
        </div>

        {ALL_ACCESS_PASSES.map((pass) => (
          <div
            key={pass.id}
            className="p-4 rounded-2xl border border-[#81502B] bg-[#352316]/90 shadow-md transition-all relative"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <h4 className="text-base font-black text-[#FFF0CF]">{pass.name}</h4>
                <span className="text-[11px] text-[#E6C8A4] font-medium">{pass.period}</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-[#FFD35A]">{pass.priceETB} Birr</span>
              </div>
            </div>

            <ul className="mt-2.5 space-y-1 text-xs text-[#E6C8A4]">
              {pass.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FFAA24] shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {profile?.subscription?.isActive && profile.subscription.plan === pass.id ? (
              <div
                aria-disabled="true"
                className="mt-3.5 w-full py-2.5 rounded-xl bg-[#442C1B] border border-[#FFAA24]/60 text-[#FFD35A] font-black text-xs flex items-center justify-center gap-1.5 select-none pointer-events-none shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-[#FFD35A]" />
                <span>Active Subscription Plan</span>
              </div>
            ) : (
              <div
                aria-disabled="true"
                className="mt-3.5 w-full py-2.5 rounded-xl bg-[#24170F]/80 border border-[#81502B] text-[#E6C8A4] font-bold text-xs flex items-center justify-center gap-1.5 select-none pointer-events-none cursor-default opacity-85"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#E6C8A4]" />
                <span>Managed via telebirr</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-[#E6C8A4]/80 font-bold text-center">
        <ShieldCheck className="w-3.5 h-3.5 text-[#FFD35A] shrink-0" />
        <span>GoDigital gaming subscriptions are managed directly through your telebirr SuperApp account</span>
      </div>
    </div>
  );
};

/**
 * GameON Tele - Telebirr SuperApp In-App Subscription & Passes
 * 
 * Compliant with GameON Tele specifications:
 * - NO SMS shortcode flows, no 977, no "Send OK".
 * - Direct in-app telebirr SuperApp wallet billing.
 * - Manages active game subscriptions and passes with expiration tracking.
 */

import React, { useState } from 'react';
import { UserProfile, SubscriptionPlan } from '../../types';
import { EntitlementService } from '../../services/entitlementService';
import { StorageService } from '../../services/storageService';
import { 
  CreditCard, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Wallet, 
  Calendar,
  AlertCircle,
  Sparkles,
  Zap
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
  onProfileUpdate,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeSubs = EntitlementService.getActiveSubscriptionsList();

  const handleSubscribe = (pass: typeof ALL_ACCESS_PASSES[0]) => {
    if (!profile) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (profile.telebirrBalance < pass.priceETB) {
      setErrorMsg(`Insufficient telebirr balance (${profile.telebirrBalance.toFixed(2)} ETB). Required: ${pass.priceETB} ETB.`);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      let durationMs = 24 * 60 * 60 * 1000;
      if (pass.id === 'weekly') durationMs = 7 * 24 * 60 * 60 * 1000;
      if (pass.id === 'monthly') durationMs = 30 * 24 * 60 * 60 * 1000;

      const updated: UserProfile = {
        ...profile,
        telebirrBalance: Math.max(0, profile.telebirrBalance - pass.priceETB),
        coins: profile.coins,
        subscription: {
          plan: pass.id,
          isActive: true,
          expiresAt: Date.now() + durationMs,
          autoRenew: true,
        },
      };

      StorageService.saveProfile(updated);
      if (onProfileUpdate) {
        onProfileUpdate(updated);
      }

      setIsProcessing(false);
      setSuccessMsg(`Successfully activated ${pass.name} subscription via telebirr!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-white text-[#17202A] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none">
      {/* 1. Header with Back Button */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-[#1688C9] text-white p-3.5 rounded-2xl shadow-xs mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="subscription-back-btn"
                onClick={onBack}
                className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#8BCB3D] shrink-0" />
              <h1 className="text-base font-black tracking-tight">Subscription</h1>
            </div>
          </div>
        </div>
      )}

      {/* 2. Messages */}
      {errorMsg && (
        <div className="p-3 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 mb-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 3. Active Subscriptions Overview */}
      {profile?.subscription?.isActive && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                Current Active Subscription
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider">
              ACTIVE
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <h3 className="text-base font-black text-emerald-950 capitalize">
                {profile.subscription.plan} Subscription
              </h3>
              <p className="text-[11px] text-emerald-700">
                Billed directly via telebirr SuperApp
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-emerald-700 font-bold uppercase">Auto-Renew</div>
              <div className="text-xs font-black text-emerald-900">Enabled</div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Telebirr Wallet Balance Summary */}
      {profile && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#1688C9]" />
            <span className="font-bold text-slate-700">telebirr Wallet Balance</span>
          </div>
          <span className="font-black text-[#17202A]">
            {profile.telebirrBalance.toFixed(2)} ETB
          </span>
        </div>
      )}

      {/* 5. Available Packages */}
      <div className="space-y-3">
        <div className="text-xs font-black uppercase text-slate-400 tracking-wider px-1">
          Subscription Packages
        </div>

        {ALL_ACCESS_PASSES.map((pass) => (
          <div
            key={pass.id}
            className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs transition-all relative"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <h4 className="text-base font-black text-[#17202A]">{pass.name}</h4>
                <span className="text-[11px] text-slate-500 font-medium">{pass.period}</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-[#1688C9]">{pass.priceETB} Birr</span>
              </div>
            </div>

            <ul className="mt-2.5 space-y-1 text-xs text-slate-600">
              {pass.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8BCB3D] shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(pass)}
              disabled={isProcessing}
              className="mt-3.5 w-full py-2.5 rounded-xl bg-[#8BCB3D] hover:bg-[#7cb934] text-white font-black text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Subscribe for {pass.priceETB} Birr</span>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold">
        <ShieldCheck className="w-3.5 h-3.5 text-[#8BCB3D]" />
        <span>Direct telebirr SuperApp billing • Instant access with zero SMS delays</span>
      </div>
    </div>
  );
};

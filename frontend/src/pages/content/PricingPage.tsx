/**
 * GoDigital - Subscription Pricing Page
 * 
 * Sourced directly from GoDigital specifications:
 * - Subscription Passes: Daily (5 Birr / 24h), Weekly (20 Birr / 7d), Monthly (50 Birr / 30d)
 * - Coin Top-Up Packages: 10 Birr = 10 Coins, 25 Birr = 25 Coins, 50 Birr = 50 Coins
 * - Direct telebirr SuperApp instant wallet billing
 * - Consistent destination header with Back button & warm sunset theme
 */

import React from 'react';
import { 
  ArrowLeft, 
  Coins, 
  CreditCard,
  ShieldCheck, 
  Sparkles,
  Check,
  Zap
} from 'lucide-react';
import { TELEPLUS_SUBSCRIPTION_PACKAGES, TELEPLUS_COIN_PRICING } from '../../data/teleplusContent';

interface PricingPageProps {
  onBack?: () => void;
  showHeader?: boolean;
  onBuyCoins?: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  onBack,
  showHeader = true,
  onBuyCoins,
}) => {
  return (
    <div className="min-h-screen text-[#FFF0CF] pb-28 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none space-y-4 relative z-10">
      
      {/* 1. Header with Back Button */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-[#352316] border border-[#81502B] text-[#FFF0CF] p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="pricing-back-btn"
                type="button"
                onClick={onBack}
                className="w-8 h-8 rounded-xl bg-[#442C1B] hover:bg-[#352316] border border-[#81502B] hover:border-[#FFAA24]/60 flex items-center justify-center text-[#FFF0CF] transition-colors cursor-pointer shrink-0"
                title="Go Back"
                aria-label="Go Back"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#FFD35A] shrink-0" />
              <h1 className="text-base font-black tracking-tight text-[#FFF0CF]">Subscription Pricing</h1>
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#E6C8A4] bg-[#442C1B] px-2.5 py-0.5 rounded-full border border-[#81502B]">
            telebirr Direct
          </span>
        </div>
      )}

      {/* 2. Overview Banner */}
      <div className="p-4 rounded-2xl bg-[#352316] border border-[#81502B] shadow-xs text-xs text-[#E6C8A4] leading-relaxed space-y-1">
        <div className="flex items-center gap-2 text-sm font-black text-[#FFF0CF]">
          <Sparkles className="w-4 h-4 text-[#FFD35A]" />
          <span>All-Access Passes & Coin Bundles</span>
        </div>
        <p className="text-[11px] text-[#E6C8A4]">
          Choose an all-access pass for unlimited daily play, or top up coins for tournament challenges. Direct debit from your telebirr SuperApp balance with zero hidden fees.
        </p>
      </div>

      {/* 3. Subscription Passes Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <CreditCard className="w-4 h-4 text-[#FFAA24]" />
          <h2 className="text-xs sm:text-sm font-black uppercase text-[#E6C8A4] tracking-wider">
            All-Access Subscription Passes
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {TELEPLUS_SUBSCRIPTION_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`p-4 rounded-2xl border transition-all ${
                pkg.id === 'weekly'
                  ? 'bg-gradient-to-br from-[#3D2517] to-[#352316] border-[#FFAA24] shadow-md relative'
                  : 'bg-[#352316] border-[#81502B] shadow-xs'
              }`}
            >
              {pkg.id === 'weekly' && (
                <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#FFD35A] to-[#FFAA24] text-[#24170F] text-[9px] font-black uppercase tracking-wider shadow-xs">
                  MOST POPULAR
                </span>
              )}

              <div className="flex items-baseline justify-between gap-2 pb-2 border-b border-[#81502B]/60">
                <div>
                  <h3 className="text-base font-black text-[#FFF0CF]">{pkg.name}</h3>
                  <span className="text-[11px] font-bold text-[#E6C8A4]">{pkg.period} Unlimited Access</span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black font-mono text-[#FFD35A]">
                    {pkg.priceETB} <span className="text-xs font-sans font-bold text-[#FFF0CF]">ETB</span>
                  </div>
                  <span className="text-[10px] text-[#E6C8A4]">telebirr billing</span>
                </div>
              </div>

              <p className="text-xs text-[#E6C8A4] pt-2 pb-2.5 leading-relaxed">
                {pkg.description}
              </p>

              <div className="space-y-1.5 pt-1">
                {pkg.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2 text-xs text-[#FFF0CF]">
                    <div className="w-4 h-4 rounded-full bg-[#442C1B] text-[#FFD35A] flex items-center justify-center shrink-0 border border-[#81502B]">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Coin Packages Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#FFAA24]" />
            <h2 className="text-xs sm:text-sm font-black uppercase text-[#E6C8A4] tracking-wider">
              Coin Top-Up Bundles
            </h2>
          </div>
          {onBuyCoins && (
            <button
              id="pricing-open-coins-btn"
              type="button"
              onClick={onBuyCoins}
              className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F] text-xs font-black hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-xs border-none"
            >
              Top Up Coins
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {TELEPLUS_COIN_PRICING.map((pack) => (
            <div
              key={pack.coins}
              onClick={onBuyCoins}
              className="p-3.5 rounded-2xl bg-[#352316] border border-[#81502B] hover:border-[#FFAA24]/70 transition-all text-center space-y-1 cursor-pointer active:scale-98 shadow-xs"
            >
              <div className="text-base sm:text-lg font-black text-[#FFF0CF]">
                🪙 {pack.coins}
              </div>
              <span className="text-[10px] text-[#E6C8A4] block uppercase font-bold">Coins</span>
              <div className="text-xs sm:text-sm font-black font-mono text-[#FFD35A] pt-1 border-t border-[#81502B]/50">
                {pack.priceETB} Birr
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Telebirr Transparency & Management Footer */}
      <div className="p-3.5 rounded-2xl bg-[#352316] border border-[#81502B] text-xs text-[#E6C8A4] leading-relaxed space-y-2">
        <div className="flex items-center gap-2 text-[#FFF0CF] font-bold">
          <Zap className="w-3.5 h-3.5 text-[#FFD35A]" />
          <span>Subscription Management & Transparency</span>
        </div>
        <p className="text-[11px]">
          Subscriptions can be managed or canceled at any time from your Profile &gt; Subscription tab. Disabling auto-renewal stops subsequent billing while keeping your pass active until its expiration date.
        </p>
        <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-[#E6C8A4]/70 font-bold border-t border-[#81502B]/60">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FFD35A]" />
          <span>telebirr SuperApp Instant Settlement • Secure &amp; Transparent</span>
        </div>
      </div>

    </div>
  );
};

export default PricingPage;

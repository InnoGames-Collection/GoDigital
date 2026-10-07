/**
 * GameON Tele - Pricing
 * Direct telebirr SuperApp instant billing for game coins.
 */

import React from 'react';
import { 
  ArrowLeft, 
  Coins, 
  ShieldCheck
} from 'lucide-react';

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
  const COIN_PACKS = [
    { birr: 10, coins: 10 },
    { birr: 25, coins: 25 },
    { birr: 50, coins: 50 },
  ];

  return (
    <div className="min-h-screen bg-white text-[#17202A] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none">
      {/* Header with Back Button */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-[#1688C9] text-white p-3.5 rounded-2xl shadow-xs mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="pricing-back-btn"
                onClick={onBack}
                className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-300 shrink-0" />
              <h1 className="text-base font-black tracking-tight">Pricing</h1>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Coin Title & Packages */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-black text-[#17202A]">
              Coin
            </h2>
            {onBuyCoins && (
              <button
                onClick={onBuyCoins}
                className="px-3 py-1 rounded-xl bg-[#8BCB3D] text-white text-xs font-black hover:bg-[#7cb934] transition-colors cursor-pointer"
              >
                Buy Coins
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {COIN_PACKS.map((item) => (
              <div
                key={item.birr}
                onClick={onBuyCoins}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#8BCB3D] hover:shadow-xs transition-all text-center space-y-1 cursor-pointer"
              >
                <div className="text-xl font-black text-[#17202A]">
                  🪙 {item.coins} Coins
                </div>
                <div className="text-sm font-black text-[#1688C9]">
                  {item.birr} Birr
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="pt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#8BCB3D]" />
          <span>telebirr SuperApp Instant Settlement • Secure & Transparent</span>
        </div>
      </div>
    </div>
  );
};


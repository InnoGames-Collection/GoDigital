/**
 * GoPlay - Coin Purchase Wallet
 * Simplified clean purchase interface for GoPlay Coins.
 */

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { StorageService } from '../services/storageService';
import { 
  X, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface CoinTopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onProfileUpdate: (updated: UserProfile) => void;
}

const COIN_PACKAGES = [
  { coins: 10, priceETB: 10 },
  { coins: 25, priceETB: 25 },
  { coins: 50, priceETB: 50 },
];

export const CoinTopupModal: React.FC<CoinTopupModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdate,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedPack = COIN_PACKAGES[selectedIdx];

  const handlePurchase = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (profile.telebirrBalance < selectedPack.priceETB) {
      setErrorMsg(`Insufficient balance (${profile.telebirrBalance.toFixed(2)} ETB available). Required: ${selectedPack.priceETB} ETB.`);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const updated: UserProfile = {
        ...profile,
        coins: profile.coins + selectedPack.coins,
        telebirrBalance: Math.max(0, profile.telebirrBalance - selectedPack.priceETB),
      };
      StorageService.saveProfile(updated);
      StorageService.recordCoinTransaction({
        id: 'CTX_' + Date.now().toString(36).toUpperCase(),
        type: 'TELEBIRR_PURCHASE',
        amount: selectedPack.coins,
        description: `Purchased ${selectedPack.coins} GoPlay Coins (${selectedPack.priceETB} ETB)`,
        timestamp: new Date().toISOString(),
      });

      onProfileUpdate(updated);
      setIsProcessing(false);
      setSuccessMsg(`Successfully credited ${selectedPack.coins} GoPlay Coins!`);

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1000);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 select-none">
      <div 
        className="w-full max-w-md bg-[#181C29] rounded-t-3xl sm:rounded-3xl border border-[#282E3D] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#121622] border-b border-[#282E3D] text-white p-4 sm:p-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black tracking-tight text-white">GoPlay Coins</h3>
            <p className="text-xs text-[#AEB6C7] font-medium mt-0.5">
              Choose a package
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#202536] hover:bg-[#282E3D] border border-[#282E3D] text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-[#FF5577]/50 text-[#FF5577] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#FF5577]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-[#35D07F]/50 text-[#35D07F] text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#35D07F]" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 3 Clean Selectable Packages */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {COIN_PACKAGES.map((pkg, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <button
                  key={pkg.coins}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? 'border-[#7C3AED] bg-[#7C3AED]/20 shadow-md ring-2 ring-[#7C3AED] -translate-y-0.5'
                      : 'border-[#282E3D] hover:border-[#7C3AED]/40 bg-[#202536] shadow-2xs'
                  }`}
                >
                  <div className="text-2xl sm:text-3xl mb-1 text-[#F5B942]">🪙</div>
                  <div className="text-xs sm:text-sm font-black text-white tracking-tight uppercase">
                    {pkg.priceETB} BIRR
                  </div>
                  <div className="text-[11px] sm:text-xs font-bold text-[#AEB6C7] mt-0.5 uppercase">
                    {pkg.coins} COINS
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dynamic Purchase Action */}
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-[14px] bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] active:scale-[0.99] text-white font-black text-sm tracking-wide transition-all shadow-sm shadow-[#7C3AED]/30 flex items-center justify-center cursor-pointer uppercase border-none"
          >
            {isProcessing ? (
              <span className="inline-block animate-pulse">Processing Purchase...</span>
            ) : (
              <span>BUY {selectedPack.coins} COINS</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

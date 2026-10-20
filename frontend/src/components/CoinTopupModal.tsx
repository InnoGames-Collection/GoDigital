/**
 * GoDigital - Coin Purchase Wallet
 * Conforming to reference design & warm sunset palette:
 * - Surface #352316 with subtle bronze border #81502B
 * - Golden-orange highlight #FFD35A / #FFAA24
 * - Warm illuminated cream #FFF0CF
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
        description: `Purchased ${selectedPack.coins} GoDigital Coins (${selectedPack.priceETB} ETB)`,
        timestamp: new Date().toISOString(),
      });

      onProfileUpdate(updated);
      setIsProcessing(false);
      setSuccessMsg(`Successfully credited ${selectedPack.coins} GoDigital Coins!`);

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1000);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 select-none">
      <div 
        className="w-full max-w-md bg-[#352316] rounded-t-3xl sm:rounded-3xl border border-[#81502B] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#2D1C12] border-b border-[#81502B] text-[#FFF0CF] p-4 sm:p-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black tracking-tight text-[#FFF0CF]">GoDigital Coins</h3>
            <p className="text-xs text-[#E6C8A4] font-medium mt-0.5">
              Choose a package
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#442C1B] hover:bg-[#523521] border border-[#81502B] text-[#FFF0CF] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-[#F47B20]/70 text-[#FFAA24] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#FFAA24]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-[#FFD35A]/50 text-[#FFD35A] text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#FFD35A]" />
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
                      ? 'border-[#FFAA24] bg-gradient-to-br from-[#442C1B] to-[#352316] shadow-md shadow-[#FFAA24]/20 ring-2 ring-[#FFAA24] -translate-y-0.5'
                      : 'border-[#81502B] hover:border-[#FFAA24]/50 bg-[#24170F]/80 shadow-xs'
                  }`}
                >
                  <div className="text-2xl sm:text-3xl mb-1 text-[#FFD35A]">🪙</div>
                  <div className="text-xs sm:text-sm font-black text-[#FFF0CF] tracking-tight uppercase">
                    {pkg.priceETB} BIRR
                  </div>
                  <div className="text-[11px] sm:text-xs font-bold text-[#E6C8A4] mt-0.5 uppercase">
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
            className="w-full py-3.5 px-4 rounded-[14px] bg-gradient-to-r from-[#FFAA24] to-[#F47B20] hover:brightness-105 active:scale-[0.99] text-[#24170F] font-black text-sm tracking-wide transition-all shadow-md shadow-[#FFAA24]/20 flex items-center justify-center cursor-pointer uppercase border-none"
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

export default CoinTopupModal;

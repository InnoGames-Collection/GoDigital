/**
 * TelePlus Ethiopia - Clean Buy Coins Screen & Compact Confirmation Dialog
 * 
 * Strict Specification:
 * - Title: BUY COINS
 * - Exactly 3 packages:
 *   1. 3 Birr  →  5 Coins
 *   2. 5 Birr  → 10 Coins
 *   3. 10 Birr → 25 Coins
 * - Clean cards, clear typography, professional coin graphics
 * - Compact confirmation dialog:
 *   "Buy X Coins for Y Birr?"
 *   [Cancel]  [Confirm]
 * - ZERO unnecessary marketing text, billing descriptions, MSISDN display, or metadata.
 */

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, Coins as CoinsIcon, Check } from 'lucide-react';

export interface CoinPackage {
  id: string;
  coins: number;
  priceBirr: number;
}

export const COIN_PACKAGES: CoinPackage[] = [
  { id: 'pkg_5', coins: 5, priceBirr: 3 },
  { id: 'pkg_10', coins: 10, priceBirr: 5 },
  { id: 'pkg_25', coins: 25, priceBirr: 10 },
];

interface EnergyModalProps {
  profile?: UserProfile;
  onClose: () => void;
  onPurchasePackage: (coinsAmount: number, costETB: number) => Promise<{ success: boolean; message: string }>;
  onWatchAd?: () => void;
  onOpenVIP?: () => void;
  onOpenAuth?: () => void;
}

export const EnergyModal: React.FC<EnergyModalProps> = ({
  onClose,
  onPurchasePackage,
}) => {
  const [selectedPkg, setSelectedPkg] = useState<CoinPackage>(COIN_PACKAGES[0]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenConfirm = (pkg: CoinPackage) => {
    setSelectedPkg(pkg);
    setShowConfirmDialog(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPkg) return;
    setIsProcessing(true);
    try {
      await onPurchasePackage(selectedPkg.coins, selectedPkg.priceBirr);
      setShowConfirmDialog(false);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#24170F]/85 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in select-none">
      <div 
        id="buy-coins-sheet"
        className="w-full max-w-sm bg-[#352316] text-[#FFF0CF] rounded-t-2xl sm:rounded-2xl border border-[#81502B] shadow-2xl p-5 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#81502B]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#FFD35A] to-[#FFAA24] text-[#24170F] flex items-center justify-center shadow-xs">
              <CoinsIcon className="w-4 h-4 fill-current" />
            </div>
            <h3 className="text-base font-black text-[#FFF0CF] uppercase tracking-wide">
              BUY COINS
            </h3>
          </div>

          <button
            id="close-buy-coins-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#442C1B] hover:bg-[#523521] border border-[#81502B] text-[#FFF0CF] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* The 3 Clean Packages */}
        <div className="space-y-2.5 py-4">
          {COIN_PACKAGES.map((pkg) => {
            const isSelected = selectedPkg.id === pkg.id;
            return (
              <button
                key={pkg.id}
                id={`coin-pkg-${pkg.coins}`}
                onClick={() => setSelectedPkg(pkg)}
                className={`w-full p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-[#442C1B] border-[#FFAA24] ring-1 ring-[#FFAA24] shadow-md'
                    : 'bg-[#24170F]/80 border-[#81502B] hover:border-[#FFAA24]/40'
                }`}
              >
                {/* Left: Price */}
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${
                    isSelected ? 'bg-gradient-to-r from-[#FFD35A] to-[#FFAA24] text-[#24170F]' : 'bg-[#352316] text-[#E6C8A4]'
                  }`}>
                    {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <CoinsIcon className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-black text-[#FFF0CF] font-mono">
                    {pkg.priceBirr} Birr
                  </span>
                </div>

                {/* Right: Coins */}
                <div className="flex items-center gap-1.5 font-mono font-black text-sm text-[#FFD35A]">
                  <CoinsIcon className="w-4 h-4 text-[#FFD35A] fill-current" />
                  <span>{pkg.coins} Coins</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Primary Action Button */}
        <button
          id="proceed-buy-coins-btn"
          onClick={() => handleOpenConfirm(selectedPkg)}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFD35A] to-[#FFAA24] hover:opacity-95 active:scale-95 text-[#24170F] font-black text-xs uppercase tracking-wider shadow-md shadow-[#FFAA24]/20 flex items-center justify-center gap-2 transition-all cursor-pointer border-none"
        >
          <CoinsIcon className="w-4 h-4 fill-current" />
          <span>Buy {selectedPkg.coins} Coins ({selectedPkg.priceBirr} Birr)</span>
        </button>

        {/* =========================================================================
            COMPACT CONFIRMATION DIALOG
           ========================================================================= */}
        {showConfirmDialog && (
          <div className="fixed inset-0 z-60 bg-[#24170F]/85 backdrop-blur-xs flex items-center justify-center p-4">
            <div 
              id="coin-purchase-confirm-dialog"
              className="w-full max-w-xs bg-[#352316] text-[#FFF0CF] rounded-2xl p-5 border border-[#81502B] shadow-2xl text-center space-y-4 animate-in zoom-in-95"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#FFD35A] to-[#FFAA24] text-[#24170F] flex items-center justify-center mx-auto shadow-sm">
                <CoinsIcon className="w-6 h-6 fill-current" />
              </div>

              <div>
                <h4 className="text-base font-black text-[#FFF0CF] leading-tight">
                  Buy {selectedPkg.coins} Coins for {selectedPkg.priceBirr} Birr?
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  id="confirm-dialog-cancel-btn"
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={isProcessing}
                  className="py-2.5 px-3 rounded-xl bg-[#442C1B] hover:bg-[#523521] border border-[#81502B] text-[#FFF0CF] font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  id="confirm-dialog-confirm-btn"
                  onClick={handleConfirmPurchase}
                  disabled={isProcessing}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#FFD35A] to-[#FFAA24] hover:opacity-95 text-[#24170F] font-black text-xs transition-all shadow-md shadow-[#FFAA24]/20 cursor-pointer disabled:opacity-50 border-none"
                >
                  {isProcessing ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

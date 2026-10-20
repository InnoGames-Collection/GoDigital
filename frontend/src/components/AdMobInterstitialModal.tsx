/**
 * Google AdMob Interstitial Ad Modal Component
 * 
 * Compliant interstitial display:
 * - Only triggered at natural game-over breaks
 * - Clear 3-second countdown before skip is enabled
 * - Never blocks controls or gameplay
 */

import React, { useState, useEffect } from 'react';
import { InterstitialAdState } from '../types';
import { X, Tv, ExternalLink, ShieldCheck } from 'lucide-react';

interface AdMobInterstitialModalProps {
  adState: InterstitialAdState;
  onClose: () => void;
}

export const AdMobInterstitialModal: React.FC<AdMobInterstitialModalProps> = ({
  adState,
  onClose,
}) => {
  const [canSkipInSeconds, setCanSkipInSeconds] = useState(3);

  useEffect(() => {
    if (canSkipInSeconds <= 0) return;

    const timer = setInterval(() => {
      setCanSkipInSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [canSkipInSeconds]);

  return (
    <div
      id="admob-interstitial-modal"
      className="fixed inset-0 z-50 bg-[#24170F]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
    >
      <div className="w-full max-w-lg bg-[#352316] text-[#FFF0CF] rounded-2xl border border-[#81502B] shadow-2xl overflow-hidden relative flex flex-col">
        {/* Top Controls */}
        <div className="px-4 py-3 bg-[#442C1B] border-b border-[#81502B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#24170F] border border-[#81502B] text-[#FFD35A] text-[10px] font-mono font-bold uppercase">
              Ad • Google AdMob
            </span>
            <span className="text-xs font-bold text-[#FFF0CF]">EthioTelecom Sponsor</span>
          </div>

          <div>
            {canSkipInSeconds > 0 ? (
              <span className="text-xs font-mono font-bold text-[#E6C8A4] px-2.5 py-1 bg-[#24170F] rounded-lg border border-[#81502B]">
                Skip in {canSkipInSeconds}s
              </span>
            ) : (
              <button
                id="skip-interstitial-ad-btn"
                onClick={onClose}
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#FFD35A] to-[#FFAA24] text-[#24170F] font-black text-xs transition-colors flex items-center gap-1 shadow-sm"
              >
                <span>Skip Ad</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sponsor Banner Area */}
        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#442C1B] border border-[#81502B] flex items-center justify-center text-[#FFD35A] shadow-sm mb-4">
            <Tv className="w-10 h-10" />
          </div>

          <h3 className="text-xl font-black text-[#FFF0CF] mb-2">
            {adState.brand || 'EthioTelecom TeleCloud & 5G'}
          </h3>
          <p className="text-xs sm:text-sm text-[#E6C8A4] max-w-sm mb-6 leading-relaxed">
            Power your business and digital lifestyle with high-speed 5G network coverage and unlimited fiber connectivity.
          </p>

          <a
            href="https://www.ethiotelecom.et"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFD35A] to-[#FFAA24] text-[#24170F] font-black text-xs sm:text-sm active:scale-95 transition-all shadow-lg shadow-[#FFAA24]/20 flex items-center gap-2 uppercase tracking-wider"
          >
            <span>Explore Official Packages</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#24170F] border-t border-[#81502B] text-[11px] text-[#E6C8A4] text-center flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FFD35A]" />
          <span>EthioTelecom Value Added Services FairPlay Advertising Standard</span>
        </div>
      </div>
    </div>
  );
};


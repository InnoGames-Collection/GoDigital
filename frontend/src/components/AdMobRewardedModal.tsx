/**
 * Google AdMob Rewarded Video Modal Component
 * 
 * Enforces compliance:
 * - Upfront explicit reward contract: "+20 Coins"
 * - Clear non-deceptive video simulator container
 * - Timer countdown with completion callback
 * - Never can be closed prematurely to bypass reward logic
 */

import React, { useState, useEffect } from 'react';
import { RewardedAdState } from '../types';
import { 
  X, 
  Tv, 
  Coins, 
  Sparkles, 
  CheckCircle2, 
  Volume2, 
  VolumeX
} from 'lucide-react';

interface AdMobRewardedModalProps {
  adState: RewardedAdState;
  onClose: () => void;
}

export const AdMobRewardedModal: React.FC<AdMobRewardedModalProps> = ({
  adState,
  onClose,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(adState.durationSeconds || 5);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      setIsCompleted(true);
      adState.onRewardClaimed();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, adState]);

  const progressPercent = Math.min(
    100,
    ((adState.durationSeconds - secondsRemaining) / adState.durationSeconds) * 100
  );

  return (
    <div
      id="admob-rewarded-modal"
      className="fixed inset-0 z-50 bg-[#24170F]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
    >
      <div className="w-full max-w-md bg-[#352316] text-[#FFF0CF] rounded-2xl border border-[#81502B] shadow-2xl overflow-hidden relative flex flex-col">
        {/* Top Header Bar */}
        <div className="px-4 py-3 bg-[#442C1B] border-b border-[#81502B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#24170F] border border-[#81502B] text-[#FFD35A] text-[10px] font-mono font-black uppercase tracking-wider">
              Rewarded Ad
            </span>
            <span className="text-xs font-bold text-[#FFF0CF] truncate max-w-[160px]">
              {adState.brand || 'EthioTelecom Sponsor'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg bg-[#24170F] border border-[#81502B] text-[#E6C8A4] hover:text-[#FFF0CF]"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {isCompleted ? (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-gradient-to-r from-[#FFD35A] to-[#FFAA24] text-[#24170F] hover:opacity-95 font-black shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-xs font-mono font-black text-[#FFD35A] px-2 py-1 bg-[#24170F] rounded-lg border border-[#81502B]">
                Reward in {secondsRemaining}s
              </span>
            )}
          </div>
        </div>

        {/* Reward Contract Notice Banner */}
        <div className="bg-[#442C1B] px-4 py-2 border-b border-[#81502B] flex items-center justify-between text-xs font-black">
          <div className="flex items-center gap-1.5 text-[#E6C8A4]">
            <Sparkles className="w-4 h-4 text-[#FFD35A]" />
            <span>Guaranteed Reward:</span>
          </div>
          <span className="text-[#FFD35A] font-mono font-extrabold flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 fill-current text-[#FFD35A]" /> +{adState.rewardAmount || 20} Coins
          </span>
        </div>

        {/* Video Canvas Container */}
        <div className="relative aspect-video bg-[#24170F] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-[#442C1B] border border-[#81502B] flex items-center justify-center text-[#FFD35A] shadow-md mb-2">
            <Tv className="w-8 h-8" />
          </div>

          <h3 className="text-base font-black text-[#FFF0CF] mb-1">
            {adState.brand || 'TeleBirr SuperApp'}
          </h3>
          <p className="text-xs text-[#E6C8A4] max-w-xs">
            Send money to anyone across Ethiopia with 0% service charge using your verified phone number.
          </p>

          {/* Progress bar at bottom of video */}
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-[#352316]">
            <div
              className="h-full bg-gradient-to-r from-[#FFD35A] to-[#FFAA24] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Completion Action Bar */}
        <div className="p-4 bg-[#24170F] border-t border-[#81502B]">
          {isCompleted ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs font-black text-[#FFD35A]">
                <CheckCircle2 className="w-5 h-5 text-[#FFD35A]" />
                <span>Reward unlocked & credited to your account!</span>
              </div>
              <button
                id="claim-rewarded-ad-close-btn"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FFD35A] to-[#FFAA24] text-[#24170F] font-black text-sm active:scale-95 transition-all shadow-lg shadow-[#FFAA24]/20 uppercase tracking-wider"
              >
                Collect & Return to Game
              </button>
            </div>
          ) : (
            <div className="text-center text-xs text-[#E6C8A4] font-medium">
              Please watch the full sponsor message ({secondsRemaining}s remaining) to receive your reward.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


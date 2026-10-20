/**
 * GoDigital - Game Access & Entitlement Modal
 * Handles Free instant access, Coin deduction confirmations, and telebirr Subscription authorizations.
 * Compliant with GoDigital spec: No shortcodes, no SMS, direct in-app telebirr authorization.
 * Conforming to reference design & warm sunset palette.
 */

import React, { useState } from 'react';
import { CatalogGame } from '../services/gameCatalog';
import { UserProfile } from '../types';
import { EntitlementService, GameEntitlement } from '../services/entitlementService';
import { 
  Coins, 
  Wallet, 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Play
} from 'lucide-react';

interface GameAccessModalProps {
  game: CatalogGame | null;
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onAuthorizedPlay: (game: CatalogGame, entitlement?: GameEntitlement) => void;
  onOpenCoinTopup: () => void;
  onProfileUpdate: (updated: UserProfile) => void;
}

export const GameAccessModal: React.FC<GameAccessModalProps> = ({
  game,
  profile,
  isOpen,
  onClose,
  onAuthorizedPlay,
  onOpenCoinTopup,
  onProfileUpdate,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !game) return null;

  // Bypass modal entirely for Candy Crush, Word Legend, and all Free games
  if (game.gameId === 'candy-blast' || game.gameId === 'world-legends' || game.isFree || game.accessType === 'FREE' || !game.requiresCoins) {
    onAuthorizedPlay(game);
    onClose();
    return null;
  }

  const costCoins = game.coinCost || 10;
  const hasEnoughCoins = profile.coins >= costCoins;

  // Handle Coin Access Confirmation
  const handleConfirmCoinPlay = () => {
    setErrorMsg(null);
    setIsProcessing(true);

    setTimeout(() => {
      const res = EntitlementService.grantCoinAccess(game, profile);
      setIsProcessing(false);

      if (res.success) {
        onProfileUpdate(res.updatedProfile);
        onAuthorizedPlay(game, res.entitlement);
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to authorize coin access');
      }
    }, 250);
  };

  // Handle Subscription Access Confirmation
  const handleConfirmSubscriptionPlay = () => {
    setErrorMsg(null);
    const subOpts = game.subscriptionOptions;
    const option = subOpts?.[selectedPeriod];
    const priceETB = option?.priceETB || 5;

    if (profile.telebirrBalance < priceETB) {
      setErrorMsg(`Insufficient telebirr balance (${profile.telebirrBalance.toFixed(2)} ETB). Required: ${priceETB.toFixed(2)} ETB.`);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const res = EntitlementService.grantSubscriptionAccess(game, selectedPeriod, priceETB, profile);
      setIsProcessing(false);

      if (res.success) {
        onProfileUpdate(res.updatedProfile);
        onAuthorizedPlay(game, res.entitlement);
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to authorize telebirr subscription');
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 select-none">
      <div 
        className="w-full max-w-md bg-[#352316] rounded-t-3xl sm:rounded-3xl border border-[#81502B] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Artwork Banner */}
        <div className="relative h-44 w-full bg-[#24170F] shrink-0 overflow-hidden">
          <img 
            src={game.banner || game.thumbnail} 
            alt={game.gameName}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#352316] via-[#352316]/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#24170F]/80 hover:bg-[#442C1B] border border-[#81502B] text-[#FFF0CF] flex items-center justify-center transition-colors cursor-pointer z-10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-[#442C1B] border border-[#81502B] text-[#E6C8A4] text-[10px] font-black uppercase tracking-wider">
              {game.category}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#352316]/90 border border-[#81502B] text-[#FFD35A] text-[9.5px] font-bold">
              ★ {game.rating}
            </span>
          </div>

          {/* Title & Tagline */}
          <div className="absolute bottom-3 left-4 right-4 text-[#FFF0CF]">
            <h3 className="text-xl font-black leading-tight drop-shadow-sm text-[#FFF0CF]">
              {game.gameName}
            </h3>
            <p className="text-xs text-[#E6C8A4] line-clamp-1 mt-0.5">
              {game.tagline}
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-[#F47B20]/60 text-[#FFAA24] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#FFAA24]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* =========================================================================
              COIN ACCESS FLOW
             ========================================================================= */}
          {game.accessType === 'COIN' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#442C1B] border border-[#81502B]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F] flex items-center justify-center shadow-xs">
                    <Coins className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-[#FFF0CF] uppercase tracking-wide">
                      Coin Game Access
                    </div>
                    <div className="text-xs font-bold text-[#E6C8A4]">
                      Entry: <span className="font-black text-[#FFD35A]">{costCoins} Coins</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-[#E6C8A4] font-bold uppercase">
                    Your Coins
                  </div>
                  <div className={`text-sm font-black ${hasEnoughCoins ? 'text-[#FFD35A]' : 'text-rose-400'}`}>
                    🪙 {profile.coins}
                  </div>
                </div>
              </div>

              {/* What you get */}
              <div className="space-y-1.5 px-1 text-xs text-[#E6C8A4]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FFAA24] shrink-0" />
                  <span>Unlimited plays and match retries for 2 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FFAA24] shrink-0" />
                  <span>Rank on the official national {game.gameName} leaderboard</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2">
                {hasEnoughCoins ? (
                  <button
                    onClick={handleConfirmCoinPlay}
                    disabled={isProcessing}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FFAA24] to-[#F47B20] hover:brightness-105 text-[#24170F] font-black text-sm transition-all shadow-md shadow-[#FFAA24]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] border-none"
                  >
                    {isProcessing ? (
                      <span className="inline-block animate-pulse">Authorizing Entry...</span>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current text-[#24170F]" />
                        <span>Unlock & Play ({costCoins} Coins)</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenCoinTopup();
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-[#442C1B] hover:bg-[#523521] border border-[#FFAA24]/50 text-[#FFD35A] font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      <Coins className="w-4 h-4 text-[#FFD35A]" />
                      <span>Get More Coins via telebirr</span>
                    </button>
                    <p className="text-[11px] text-center text-[#E6C8A4]/70">
                      You need {costCoins - profile.coins} more coins to unlock this game.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              SUBSCRIPTION ACCESS FLOW (Display ONLY configured periods)
             ========================================================================= */}
          {game.accessType === 'SUBSCRIPTION' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-[#FFF0CF]">
                Choose Access Period (Paid via telebirr):
              </div>

              {/* Only show configured options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {game.subscriptionOptions?.daily?.enabled && (
                  <button
                    type="button"
                    onClick={() => setSelectedPeriod('daily')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedPeriod === 'daily'
                        ? 'border-[#FFAA24] bg-[#442C1B] shadow-md ring-1 ring-[#FFAA24]'
                        : 'border-[#81502B] hover:border-[#FFAA24]/50 bg-[#24170F]'
                    }`}
                  >
                    <div className="text-[10px] font-black uppercase tracking-wider text-[#E6C8A4]">
                      Daily Pass
                    </div>
                    <div className="text-base font-black text-[#FFD35A] mt-0.5">
                      {game.subscriptionOptions.daily.priceETB} ETB
                    </div>
                    <div className="text-[10px] text-[#E6C8A4]">24 hours access</div>
                  </button>
                )}

                {game.subscriptionOptions?.weekly?.enabled && (
                  <button
                    type="button"
                    onClick={() => setSelectedPeriod('weekly')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedPeriod === 'weekly'
                        ? 'border-[#FFAA24] bg-[#442C1B] shadow-md ring-1 ring-[#FFAA24]'
                        : 'border-[#81502B] hover:border-[#FFAA24]/50 bg-[#24170F]'
                    }`}
                  >
                    <div className="text-[10px] font-black uppercase tracking-wider text-[#E6C8A4]">
                      Weekly Pass
                    </div>
                    <div className="text-base font-black text-[#FFD35A] mt-0.5">
                      {game.subscriptionOptions.weekly.priceETB} ETB
                    </div>
                    <div className="text-[10px] text-[#E6C8A4]">7 days access</div>
                  </button>
                )}

                {game.subscriptionOptions?.monthly?.enabled && (
                  <button
                    type="button"
                    onClick={() => setSelectedPeriod('monthly')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedPeriod === 'monthly'
                        ? 'border-[#FFAA24] bg-[#442C1B] shadow-md ring-1 ring-[#FFAA24]'
                        : 'border-[#81502B] hover:border-[#FFAA24]/50 bg-[#24170F]'
                    }`}
                  >
                    <div className="text-[10px] font-black uppercase tracking-wider text-[#E6C8A4]">
                      Monthly Pass
                    </div>
                    <div className="text-base font-black text-[#FFD35A] mt-0.5">
                      {game.subscriptionOptions.monthly.priceETB} ETB
                    </div>
                    <div className="text-[10px] text-[#E6C8A4]">30 days access</div>
                  </button>
                )}
              </div>

              {/* Telebirr Balance Card */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#24170F] border border-[#81502B] text-xs">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#FFAA24]" />
                  <span className="font-bold text-[#E6C8A4]">telebirr Wallet Balance</span>
                </div>
                <span className="font-black text-[#FFD35A]">
                  {profile.telebirrBalance.toFixed(2)} ETB
                </span>
              </div>

              {/* Pay via telebirr button */}
              <button
                onClick={handleConfirmSubscriptionPlay}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FFAA24] to-[#F47B20] hover:brightness-105 text-[#24170F] font-black text-sm transition-all shadow-md shadow-[#FFAA24]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] border-none"
              >
                {isProcessing ? (
                  <span className="inline-block animate-pulse">Processing telebirr Authorization...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#24170F]" />
                    <span>
                      Pay via telebirr ({game.subscriptionOptions?.[selectedPeriod]?.priceETB || 5} ETB)
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Secure Mini-App Footer Notice */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#E6C8A4]/70 font-bold pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FFAA24]" />
            <span>Authorized securely via telebirr SuperApp • No SMS shortcodes required</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameAccessModal;

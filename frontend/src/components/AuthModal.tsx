/**
 * EthioTelecom Authentication Modal (Phase 2 Specification)
 * Matches the exact professional EthioTelecom gaming login screen layout:
 * - WHITE background
 * - Bold gear Settings icon
 * - Promotional banner
 * - Compact white Sign In card
 * - Fields: Phone Number, OTP / 6-digit code, GET CODE, SIGN IN (disabled until 6 digits entered)
 * - Secondary Action: Subscribe button (WHITE bg, GREEN border, GREEN text)
 * - NO "Register Here", NO "VIP", NO "Energy"
 */

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { AuthService } from '../services/authService';
import { 
  X, 
  Phone, 
  KeyRound, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Settings as SettingsIcon
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
  onOpenSubscribe?: () => void;
  showToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, desc?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  onClose, 
  onSuccess, 
  onOpenSubscribe,
  showToast 
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [demoCodeHint, setDemoCodeHint] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleGetCode = async () => {
    if (!phoneNumber || phoneNumber.trim().length < 9) {
      showToast('error', 'Invalid Phone', 'Please enter a valid EthioTelecom mobile number.');
      return;
    }

    setIsRequestingOtp(true);
    const res = await AuthService.requestOtp(phoneNumber);
    setIsRequestingOtp(false);

    if (res.success) {
      setOtpSent(true);
      setDemoCodeHint(res.demoOtp || null);
      setCountdown(60);
      showToast('info', 'Verification Code Sent', res.message);
    } else {
      showToast('error', 'Request Failed', res.message);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length !== 6) {
      showToast('warning', 'Invalid OTP', 'Please enter the complete 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    const res = await AuthService.verifyOtp(phoneNumber, otpCode.trim());
    setIsVerifying(false);

    if (res.success && res.profile) {
      showToast('success', 'Logged In', res.message);
      onSuccess(res.profile);
      onClose();
    } else {
      showToast('error', 'Authentication Failed', res.message);
    }
  };

  const isSignInDisabled = isVerifying || otpCode.trim().length !== 6;

  return (
    <div className="fixed inset-0 z-50 bg-[#24170F]/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto select-none">
      <div className="w-full max-w-md bg-[#352316] text-[#FFF0CF] rounded-3xl border border-[#81502B] shadow-2xl p-5 sm:p-6 relative my-6 font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#442C1B] text-[#E6C8A4] hover:bg-[#523521] hover:text-[#FFF0CF] border border-[#81502B] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-r from-[#FFD35A] to-[#FFAA24] text-[#24170F] flex items-center justify-center font-black text-xs shadow-xs">
            GD
          </div>
          <div>
            <span className="font-black text-sm text-[#FFF0CF]">GoDigital</span>
            <span className="text-[9px] ml-1.5 px-1.5 py-0.2 rounded bg-[#442C1B] border border-[#81502B] text-[#FFD35A] font-black uppercase">
              Portal
            </span>
          </div>
        </div>

        {/* Promotional Banner */}
        <div className="relative rounded-2xl bg-gradient-to-r from-[#442C1B] to-[#352316] text-[#FFF0CF] p-4 shadow-md overflow-hidden border border-[#81502B] mb-4">
          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FFD35A] to-[#FFAA24] text-[#24170F] text-[9px] font-black uppercase tracking-wider">
              <Sparkles className="w-2.5 h-2.5" />
              <span>GODIGITAL GAMING</span>
            </div>
            <h3 className="text-base font-black text-[#FFF0CF]">
              Play & Win Tournament Rewards
            </h3>
            <p className="text-[11px] text-[#E6C8A4]">
              Join weekly tournaments and climb the national leaderboard.
            </p>
          </div>
        </div>

        {/* Compact Sign In Card */}
        <form onSubmit={handleSignIn} className="space-y-3.5">
          <div className="space-y-1">
            <h2 className="text-base font-black text-[#FFF0CF]">Sign In</h2>
            <p className="text-[11px] text-[#E6C8A4]">
              Enter your phone number to continue.
            </p>
          </div>

          {/* Phone Field */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-[#E6C8A4] uppercase tracking-wider">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[#E6C8A4] font-bold text-xs">
                <Phone className="w-3.5 h-3.5 text-[#FFD35A]" />
                <span>+251</span>
              </div>
              <input
                type="tel"
                value={phoneNumber.replace(/^\+251\s?/, '')}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="91 123 4567"
                required
                className="w-full pl-16 pr-3 py-2.5 bg-[#24170F] border border-[#81502B] rounded-xl text-[#FFF0CF] font-mono text-sm font-semibold focus:border-[#FFAA24] focus:outline-none"
              />
            </div>
          </div>

          {/* OTP Field with GET CODE */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold text-[#E6C8A4] uppercase tracking-wider">
                OTP / 6-Digit Code
              </label>
              {otpSent && countdown > 0 && (
                <span className="text-[10px] text-[#FFD35A] font-mono">
                  {countdown}s
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#E6C8A4]" />
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit code"
                  className="w-full pl-8 pr-2 py-2.5 bg-[#24170F] border border-[#81502B] rounded-xl text-[#FFF0CF] font-mono text-sm font-bold tracking-widest text-center focus:border-[#FFAA24] focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleGetCode}
                disabled={isRequestingOtp || countdown > 0}
                className="px-3.5 py-2.5 bg-gradient-to-r from-[#FFD35A] to-[#FFAA24] hover:opacity-95 disabled:opacity-40 text-[#24170F] font-black text-xs rounded-xl transition-colors shrink-0 cursor-pointer border-none"
              >
                {isRequestingOtp ? '...' : countdown > 0 ? `${countdown}s` : 'GET CODE'}
              </button>
            </div>

            {demoCodeHint && (
              <div className="p-2 rounded-lg bg-[#442C1B] border border-[#FFAA24]/40 text-[#FFF0CF] text-[11px] font-semibold flex items-center justify-between">
                <span>Code: <strong className="text-[#FFD35A]">{demoCodeHint}</strong></span>
                <button
                  type="button"
                  onClick={() => setOtpCode(demoCodeHint)}
                  className="text-[#FFD35A] underline text-[10px] font-black cursor-pointer"
                >
                  Auto-Fill
                </button>
              </div>
            )}
          </div>

          {/* SIGN IN */}
          <button
            type="submit"
            disabled={isSignInDisabled}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFD35A] to-[#FFAA24] hover:opacity-95 disabled:opacity-40 text-[#24170F] font-black text-xs active:scale-[0.98] transition-all shadow-md shadow-[#FFAA24]/20 flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer border-none"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isVerifying ? 'VERIFYING...' : 'SIGN IN'}</span>
          </button>

          {/* Secondary Action: Subscribe Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenSubscribe) onOpenSubscribe();
            }}
            className="w-full py-2.5 rounded-xl bg-[#442C1B] border border-[#FFAA24]/40 text-[#FFD35A] hover:bg-[#523521] font-black text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
          >
            <span>SUBSCRIBE TO GAMING PASS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-[#81502B] flex items-center justify-center gap-1.5 text-[10px] text-[#E6C8A4]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FFD35A]" />
          <span>Secured by EthioTelecom Mobile ID Gateway</span>
        </div>
      </div>
    </div>
  );
};

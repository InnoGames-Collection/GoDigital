/**
 * Terms of Service, Privacy Policy & Data Safety Modal - GoDigital
 * Compliant with Ethiopian Communications Authority (ECA) & EthioTelecom VAS Guidelines.
 * Conforming to reference design & warm sunset palette.
 */

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Lock, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2
} from 'lucide-react';

interface TermsAndPrivacyModalProps {
  initialTab?: 'terms' | 'privacy' | 'datasafety' | 'delete_account';
  onClose: () => void;
  onConfirmDeleteAccount: () => void;
}

export const TermsAndPrivacyModal: React.FC<TermsAndPrivacyModalProps> = ({
  initialTab = 'terms',
  onClose,
  onConfirmDeleteAccount,
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'datasafety' | 'delete_account'>(initialTab);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    if (deleteConfirmationInput.trim().toUpperCase() !== 'DELETE') return;
    setIsDeleting(true);
    setTimeout(() => {
      onConfirmDeleteAccount();
      setIsDeleting(false);
      onClose();
    }, 600);
  };

  return (
    <div
      id="terms-privacy-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none"
    >
      <div className="w-full max-w-2xl bg-[#352316] text-[#FFF0CF] rounded-2xl border border-[#81502B] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#2D1C12] border-b border-[#81502B] text-[#FFF0CF] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#FFAA24] to-[#F47B20] flex items-center justify-center text-[#24170F]">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#FFF0CF]">GoDigital Legal & Trust Center</h3>
              <p className="text-[11px] text-[#E6C8A4]">GoDigital Platform Compliance & Privacy</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#442C1B] hover:bg-[#523521] text-[#FFF0CF] border border-[#81502B] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 bg-[#2D1C12] border-b border-[#81502B] text-xs font-bold p-1 gap-1">
          {[
            { id: 'terms', label: 'Terms', icon: FileText },
            { id: 'privacy', label: 'Privacy', icon: Lock },
            { id: 'datasafety', label: 'Data Safety', icon: ShieldCheck },
            { id: 'delete_account', label: 'Delete Data', icon: Trash2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-[11px] sm:text-xs cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F] font-black shadow-md'
                    : 'text-[#E6C8A4] hover:text-[#FFF0CF]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#E6C8A4] leading-relaxed max-h-[60vh]">
          {/* TAB 1: TERMS & CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="space-y-3">
              <h4 className="text-sm font-black text-[#FFF0CF]">1. Service Acceptance & GoDigital Platform Rules</h4>
              <p>
                By accessing GoDigital via mobile browser, EthioTelecom SuperApp integration, or USSD gateway (*999#), you agree to be bound by these Terms of Service. GoDigital is an official Value-Added Service (VAS) operated in partnership with EthioTelecom.
              </p>

              <h4 className="text-sm font-black text-[#FFF0CF]">2. Direct Carrier Billing & TeleBirr Wallets</h4>
              <p>
                All purchases, including Coin Packages (10 Coins / 10 ETB) and Gaming Subscriptions (Daily, Weekly, Monthly passes), are billed directly via your linked TeleBirr balance or EthioTelecom airtime. Charges are explicitly authorized with transparent pricing.
              </p>

              <h4 className="text-sm font-black text-[#FFF0CF]">3. Tournament Rules & FairPlay Verification</h4>
              <p>
                Leaderboards and tournament prizes disbursed in ETB require server-authoritative score verification. Attempting to manipulate gameplay physics, reverse engineer payloads, or submit duplicate fraudulent tokens will result in immediate prize forfeiture and account suspension.
              </p>

              <h4 className="text-sm font-black text-[#FFF0CF]">4. Cancellation & Auto-Renewal</h4>
              <p>
                You may cancel your recurring subscription anytime directly from the Profile Settings tab without penalty. Unused tournament buy-ins remain valid until the expiration of the tournament cycle.
              </p>
            </div>
          )}

          {/* TAB 2: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <h4 className="text-sm font-black text-[#FFF0CF]">1. Masked Identity & MSISDN Protection</h4>
              <p>
                Your phone number (MSISDN) is strictly confidential. In accordance with telecommunications privacy directives, your number is permanently masked across all public leaderboards (e.g. <span className="font-mono text-[#FFD35A] font-bold">+251 91 **** 456</span>). Your full MSISDN is never publicly exposed.
              </p>

              <h4 className="text-sm font-black text-[#FFF0CF]">2. Information We Collect</h4>
              <ul className="list-disc pl-5 space-y-1 text-[#E6C8A4]">
                <li>EthioTelecom MSISDN (used exclusively for session authentication and TeleBirr prize disbursements).</li>
                <li>In-game high scores, match timestamps, and level achievements.</li>
                <li>Local preference configurations (language selection, audio effects, low data mode).</li>
              </ul>

              <h4 className="text-sm font-black text-[#FFF0CF]">3. No Unnecessary Permissions</h4>
              <p>
                GoDigital operates with zero invasive device permissions. We never request access to your camera, microphone, device contacts, or external storage.
              </p>
            </div>
          )}

          {/* TAB 3: DATA SAFETY */}
          {activeTab === 'datasafety' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#442C1B] border border-[#81502B] flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-[#FFD35A] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-black text-[#FFF0CF]">Data Encrypted in Transit</div>
                  <div className="text-[11px] text-[#E6C8A4]">All score submissions and TeleBirr disbursements utilize TLS 1.3 encryption.</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#442C1B] border border-[#81502B] flex items-start gap-3">
                <Lock className="w-6 h-6 text-[#FFD35A] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-black text-[#FFF0CF]">Zero Third-Party Data Selling</div>
                  <div className="text-[11px] text-[#E6C8A4]">Your profile and gaming data are never sold or shared with unauthorized third-party advertisers.</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#442C1B] border border-[#81502B] flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#FFD35A] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-black text-[#FFF0CF]">Right to Erasure (Account Deletion)</div>
                  <div className="text-[11px] text-[#E6C8A4]">You retain full authority to wipe all locally stored profile credentials, coin ledgers, and match records at any moment.</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DELETE ACCOUNT / DATA WIPE */}
          {activeTab === 'delete_account' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-rose-300 uppercase tracking-wide">Danger Zone • Account & Data Wipe</h4>
                  <p className="text-[11px] text-rose-200 mt-1">
                    This action will permanently erase your local player profile, high scores, coins history, and stored preferences. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#FFF0CF]">
                  Type <span className="font-mono text-rose-400 font-black">DELETE</span> to confirm data wipe:
                </label>
                <input
                  type="text"
                  value={deleteConfirmationInput}
                  onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-[#24170F] border border-[#81502B] focus:border-rose-500 text-[#FFF0CF] rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:outline-none"
                />
              </div>

              <button
                id="confirm-account-wipe-btn"
                disabled={deleteConfirmationInput.trim().toUpperCase() !== 'DELETE' || isDeleting}
                onClick={handleDelete}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:hover:bg-rose-600 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Erasing Data...' : 'Permanently Wipe My Data'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#2D1C12] border-t border-[#81502B] flex items-center justify-between">
          <span className="text-[10px] text-[#E6C8A4] font-mono">
            EthioTelecom Regulatory Ref: ET-VAS-2026-08
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#442C1B] hover:bg-[#523521] border border-[#81502B] text-[#FFF0CF] font-bold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndPrivacyModal;

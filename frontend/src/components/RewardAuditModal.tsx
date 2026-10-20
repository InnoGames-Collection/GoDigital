/**
 * Reward Audit Log Modal
 * Displays confirmed server-side reward transaction records,
 * idempotency audit hashes, MSISDN identifiers, timestamps, and disbursement status.
 */

import React from 'react';
import { RewardTransaction } from '../types';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  FileText
} from 'lucide-react';

interface RewardAuditModalProps {
  transactions: RewardTransaction[];
  onClose: () => void;
}

export const RewardAuditModal: React.FC<RewardAuditModalProps> = ({
  transactions,
  onClose,
}) => {
  return (
    <div
      id="reward-audit-modal"
      className="fixed inset-0 z-50 bg-[#24170F]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="w-full max-w-2xl bg-[#352316] rounded-2xl border border-[#81502B] shadow-2xl p-5 sm:p-6 relative my-6 max-h-[90vh] flex flex-col text-[#FFF0CF]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-[#442C1B]/80 text-[#E6C8A4] hover:text-[#FFF0CF] hover:bg-[#442C1B] border border-[#81502B] transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-[#FFD35A]" />
            <h3 className="text-lg sm:text-xl font-black text-[#FFF0CF]">
              Reward Audit & Transaction Log
            </h3>
          </div>
          <p className="text-xs text-[#E6C8A4]">
            Idempotent server-verified disbursement ledger. Real rewards are only issued upon verified server-side validation.
          </p>
        </div>

        {/* Notice Badge */}
        <div className="p-3 rounded-xl bg-[#442C1B] border border-[#81502B] text-[11px] text-[#E6C8A4] mb-4 flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-[#FFD35A] shrink-0" />
          <span>
            <strong className="text-[#FFF0CF]">Server-Authoritative Payout Engine:</strong> All prize distributions use deterministic idempotency keys to prevent duplicate payout transactions.
          </span>
        </div>

        {/* Transaction Records List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {transactions.length === 0 ? (
            <div className="p-8 text-center bg-[#24170F]/80 rounded-xl border border-[#81502B] text-[#E6C8A4] text-xs">
              <FileText className="w-8 h-8 text-[#E6C8A4]/40 mx-auto mb-2" />
              No prize transactions logged yet. Play in live tournaments to qualify for verified TeleBirr distributions!
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 rounded-xl bg-[#442C1B] border border-[#81502B] hover:border-[#FFAA24]/40 transition-colors space-y-2 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#81502B] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[#24170F] border border-[#81502B] text-[#FFD35A] text-xs font-mono font-black flex items-center justify-center">
                      #{tx.rank}
                    </span>
                    <span className="text-xs font-extrabold text-[#FFF0CF]">
                      {tx.gameTitle}
                    </span>
                    <span className="text-[10px] text-[#E6C8A4] font-mono">
                      (Score: {tx.score.toLocaleString()})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        tx.status === 'DISBURSED' || tx.status === 'CONFIRMED'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                          : 'bg-[#FFAA24]/15 text-[#FFD35A] border border-[#FFAA24]/30'
                      }`}
                    >
                      {tx.status}
                    </span>
                    <span className="text-[10px] text-[#E6C8A4] font-mono">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#E6C8A4]">Recipient Identifier: </span>
                    <span className="text-[#FFF0CF] font-mono font-bold">{tx.msisdnMasked}</span>
                  </div>
                  <div>
                    <span className="text-[#E6C8A4]">Allocated Reward: </span>
                    <span className="text-[#FFD35A] font-bold">{tx.reward}</span>
                  </div>
                </div>

                {/* Audit Hashes */}
                <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[9px] text-[#E6C8A4] font-mono bg-[#24170F] p-2 rounded-lg border border-[#81502B]">
                  <div className="truncate max-w-[280px]">
                    <span className="text-[#E6C8A4]/70">IDEMP:</span> {tx.idempotencyKey}
                  </div>
                  <div className="flex items-center gap-1 text-[#E6C8A4]">
                    <ShieldCheck className="w-3 h-3 text-[#FFD35A]" />
                    <span>AUDIT HASH: {tx.auditHash}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-[#81502B] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#442C1B] hover:bg-[#523521] text-[#E6C8A4] hover:text-[#FFF0CF] border border-[#81502B] font-bold text-xs transition-colors"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};


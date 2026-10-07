import React, { useState } from 'react';
import { Eye, ShieldAlert, X } from 'lucide-react';
import { Player } from '../types';

interface UnmaskModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onUnmasked: (unmaskedPhone: string) => void;
  onUnmaskSubmit: (playerId: string, reason: string) => Promise<string>;
}

export const UnmaskModal: React.FC<UnmaskModalProps> = ({
  player,
  isOpen,
  onClose,
  onUnmasked,
  onUnmaskSubmit,
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !player) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 5) {
      setError('Please provide a specific justification reason of at least 5 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const fullPhone = await onUnmaskSubmit(player.id, reason.trim());
      onUnmasked(fullPhone);
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to unmask player MSISDN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Eye size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Unmask Player MSISDN</h3>
            <p className="text-xs text-slate-400 font-mono">{player.display_name} ({player.phone})</p>
          </div>
        </div>

        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4 flex items-start gap-2.5 text-xs text-amber-200">
          <ShieldAlert size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Zero-Trust Audit Enforcement:</span> This unmask lookup will be permanently logged to the immutable audit ledger with your administrator ID, timestamp, and justification reason.
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mandatory Business Justification / Dispute Ticket ID:
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Telebirr charge dispute ticket #TB-88914 verification with customer care."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 border border-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-600/20 transition disabled:opacity-50"
            >
              {loading ? 'Logging & Unmasking...' : 'Confirm & Unmask'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

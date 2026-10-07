import React, { useState } from 'react';
import { Coins, X, ArrowRight } from 'lucide-react';
import { Player } from '../types';

interface AdjustBalanceModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCoins: number) => void;
  onAdjustSubmit: (playerId: string, deltaCoins: number, reason: string) => Promise<number>;
}

export const AdjustBalanceModal: React.FC<AdjustBalanceModalProps> = ({
  player,
  isOpen,
  onClose,
  onSuccess,
  onAdjustSubmit,
}) => {
  const [deltaCoins, setDeltaCoins] = useState<number>(50);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !player) return null;

  const currentCoins = player.coins;
  const projectedCoins = Math.max(0, currentCoins + deltaCoins);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deltaCoins === 0) {
      setError('Adjustment amount cannot be zero.');
      return;
    }
    if (reason.trim().length < 5) {
      setError('Please provide a descriptive reason of at least 5 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const newBalance = await onAdjustSubmit(player.id, deltaCoins, reason.trim());
      onSuccess(newBalance);
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to adjust wallet balance.');
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
            <Coins size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Adjust Player Coins</h3>
            <p className="text-xs text-slate-400">{player.display_name} ({player.phone})</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">Current Balance:</span>
              <div className="text-base font-bold text-white mt-0.5">{currentCoins} Coins</div>
            </div>
            <ArrowRight size={16} className="text-slate-600" />
            <div>
              <span className="text-slate-400">Projected Balance:</span>
              <div className="text-base font-bold text-amber-400 mt-0.5">{projectedCoins} Coins</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Adjustment Delta (Positive to add, Negative to deduct):
            </label>
            <input
              type="number"
              step={1}
              required
              value={deltaCoins}
              onChange={(e) => setDeltaCoins(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-sky-500"
            />
            <div className="flex gap-2 mt-2">
              {[25, 50, 100, -25, -50].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => setDeltaCoins(quick)}
                  className="px-2 py-1 rounded-md bg-slate-800 text-[11px] font-mono text-slate-300 hover:bg-slate-700"
                >
                  {quick > 0 ? `+${quick}` : quick}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Reason / Operations Memo:
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Telebirr VIP bonus compensation for connection interruption during round."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-sky-500"
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
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 transition disabled:opacity-50"
            >
              {loading ? 'Saving Adjustment...' : 'Commit Balance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

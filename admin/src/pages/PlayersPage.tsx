import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  Coins,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Player, AdminRole } from '../types';
import { UnmaskModal } from '../components/UnmaskModal';
import { AdjustBalanceModal } from '../components/AdjustBalanceModal';
import { api } from '../services/api';

interface PlayersPageProps {
  currentRole: AdminRole;
}

export const PlayersPage: React.FC<PlayersPageProps> = ({ currentRole }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');

  // Unmasked cache for row-level display
  const [unmaskedPhones, setUnmaskedPhones] = useState<Record<string, string>>({});

  // Modals
  const [unmaskTarget, setUnmaskTarget] = useState<Player | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<Player | null>(null);

  const canUnmask = ['SUPER_ADMIN', 'OPERATIONS_MANAGER'].includes(currentRole);
  const canAdjustBalance = ['SUPER_ADMIN', 'OPERATIONS_MANAGER'].includes(currentRole);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const res = await api.getPlayers({ page, pageSize: 15, search: search || undefined });
      setPlayers(res.items);
      setTotalPages(res.pagination.totalPages);
      setTotalCount(res.pagination.total);
    } catch (err) {
      console.error('Failed to load players:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPlayers();
  };

  const handleUnmaskSubmit = async (playerId: string, reason: string): Promise<string> => {
    const res = await api.unmaskPlayerPii(playerId, reason);
    setUnmaskedPhones(prev => ({ ...prev, [playerId]: res.unmaskedPhone }));
    return res.unmaskedPhone;
  };

  const handleAdjustSubmit = async (playerId: string, deltaCoins: number, reason: string): Promise<number> => {
    const res = await api.adjustPlayerBalance(playerId, deltaCoins, reason);
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, coins: res.newCoins } : p));
    return res.newCoins;
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Players & Wallet Operations</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Server-side parameterized pagination ({totalCount} verified accounts) with zero-trust PII masking and audited balance controls.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="min-w-[280px]">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by phone or player name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-sky-500"
            />
          </div>
        </form>
      </div>

      {/* Players Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="p-3.5 font-semibold">Player Identity</th>
                <th className="p-3.5 font-semibold">Masked MSISDN</th>
                <th className="p-3.5 font-semibold">Wallet Coins</th>
                <th className="p-3.5 font-semibold">XP & Level</th>
                <th className="p-3.5 font-semibold">Matches Played</th>
                <th className="p-3.5 font-semibold">Trophies</th>
                <th className="p-3.5 font-semibold">Registered</th>
                <th className="p-3.5 font-semibold text-right">Zero-Trust Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Loading verified player records...
                  </td>
                </tr>
              ) : players.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No players found matching query.
                  </td>
                </tr>
              ) : (
                players.map((p) => {
                  const isUnmasked = !!unmaskedPhones[p.id];
                  const displayPhone = unmaskedPhones[p.id] || p.masked_phone || p.phone;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-white">{p.display_name}</td>
                      <td className="p-3.5 font-mono">
                        <span className={`px-2 py-0.5 rounded-md ${
                          isUnmasked ? 'bg-amber-500/15 text-amber-300 font-bold' : 'text-slate-300'
                        }`}>
                          {displayPhone}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-amber-400">
                        {p.coins} Coins
                      </td>
                      <td className="p-3.5 font-mono text-slate-300">
                        Lvl {p.level} ({p.xp} XP)
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">{p.matches_played}</td>
                      <td className="p-3.5 font-mono text-slate-400">{p.trophies_count}</td>
                      <td className="p-3.5 font-mono text-slate-500">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right flex items-center justify-end gap-2">
                        {/* Unmask Button */}
                        <button
                          disabled={!canUnmask || isUnmasked}
                          onClick={() => setUnmaskTarget(p)}
                          title={!canUnmask ? 'PII Unmasking restricted to Operations and Super Admin' : 'Unmask phone number'}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                            isUnmasked
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : canUnmask
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                              : 'opacity-40 cursor-not-allowed bg-slate-900 text-slate-600 border-slate-800'
                          }`}
                        >
                          <Eye size={12} />
                          <span>{isUnmasked ? 'Audited' : 'Unmask'}</span>
                        </button>

                        {/* Adjust Coins Button */}
                        <button
                          disabled={!canAdjustBalance}
                          onClick={() => setAdjustTarget(p)}
                          title={!canAdjustBalance ? 'Wallet adjustments restricted to Operations Manager and Super Admin' : 'Adjust coin balance'}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                            canAdjustBalance
                              ? 'bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border-sky-500/30'
                              : 'opacity-40 cursor-not-allowed bg-slate-900 text-slate-600 border-slate-800'
                          }`}
                        >
                          <Coins size={12} />
                          <span>Coins</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing Page <span className="text-white font-bold">{page}</span> of{' '}
            <span className="text-white font-bold">{totalPages || 1}</span> ({totalCount} verified accounts)
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage(page - 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 transition"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage(page + 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 transition"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Unmask Modal */}
      <UnmaskModal
        player={unmaskTarget}
        isOpen={!!unmaskTarget}
        onClose={() => setUnmaskTarget(null)}
        onUnmasked={(full) => {
          if (unmaskTarget) {
            setUnmaskedPhones(prev => ({ ...prev, [unmaskTarget.id]: full }));
          }
        }}
        onUnmaskSubmit={handleUnmaskSubmit}
      />

      {/* Adjust Balance Modal */}
      <AdjustBalanceModal
        player={adjustTarget}
        isOpen={!!adjustTarget}
        onClose={() => setAdjustTarget(null)}
        onSuccess={(newCoins) => {
          if (adjustTarget) {
            setPlayers(prev => prev.map(p => p.id === adjustTarget.id ? { ...p, coins: newCoins } : p));
          }
        }}
        onAdjustSubmit={handleAdjustSubmit}
      />
    </div>
  );
};

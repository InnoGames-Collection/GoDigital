import React, { useState, useEffect } from 'react';
import { Trophy, ShieldCheck, ToggleLeft, ToggleRight, CheckCircle2, XCircle } from 'lucide-react';
import { Tournament, AdminRole } from '../types';
import { Badge } from '../components/Badge';
import { api } from '../services/api';

interface TournamentsPageProps {
  currentRole: AdminRole;
}

export const TournamentsPage: React.FC<TournamentsPageProps> = ({ currentRole }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const canToggle = ['SUPER_ADMIN', 'CONTENT_CREATOR'].includes(currentRole);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, gRes] = await Promise.all([
        api.getTournaments(),
        api.getGames(),
      ]);
      setTournaments(tRes.tournaments);
      setGames(gRes);
    } catch (err) {
      console.error('Failed to load tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleGame = async (gameId: string) => {
    try {
      await api.toggleGame(gameId);
      setGames(games.map(g => g.game_id === gameId ? { ...g, is_enabled: !g.is_enabled } : g));
    } catch (err: any) {
      alert(err.message || 'Failed to toggle game.');
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Tournaments & Game Engine Controllers</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Live competitive tournament pools, prize distribution parameters, and catalog killswitches.
        </p>
      </div>

      {/* Tournaments List */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Active Tournaments</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{tournaments.length} Competitive Pools</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="p-3.5 font-semibold">Tournament Name</th>
                <th className="p-3.5 font-semibold">Target Game</th>
                <th className="p-3.5 font-semibold">Prize Pool</th>
                <th className="p-3.5 font-semibold">Start Date</th>
                <th className="p-3.5 font-semibold">End Date</th>
                <th className="p-3.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading tournaments...
                  </td>
                </tr>
              ) : tournaments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No active tournament pools in database.
                  </td>
                </tr>
              ) : (
                tournaments.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-bold text-white">{t.title}</td>
                    <td className="p-3.5 font-mono text-sky-400">{t.game_id}</td>
                    <td className="p-3.5 font-mono font-bold text-amber-400">
                      ETB {t.prize_pool_etb?.toLocaleString()}
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">
                      {new Date(t.start_date).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">
                      {new Date(t.end_date).toLocaleDateString()}
                    </td>
                    <td className="p-3.5">
                      <Badge status={t.status} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Catalog Killswitches */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Game Engine Availability & Anti-Cheat Thresholds
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{games.length} Configured Titles</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="p-3.5 font-semibold">Game Title</th>
                <th className="p-3.5 font-semibold">Category</th>
                <th className="p-3.5 font-semibold">Anti-Cheat Max/Sec</th>
                <th className="p-3.5 font-semibold">Score Cap</th>
                <th className="p-3.5 font-semibold">Engine State</th>
                {canToggle && <th className="p-3.5 font-semibold text-right">Killswitch</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {games.map((g) => (
                <tr key={g.game_id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-bold text-white">{g.title}</td>
                  <td className="p-3.5 capitalize text-slate-400">{g.category}</td>
                  <td className="p-3.5 font-mono text-slate-300">{g.max_score_per_sec || 50}/s</td>
                  <td className="p-3.5 font-mono text-slate-300">{(g.max_score || 50000).toLocaleString()}</td>
                  <td className="p-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      g.is_enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {g.is_enabled ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {g.is_enabled ? 'Online' : 'Disabled'}
                    </span>
                  </td>
                  {canToggle && (
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleToggleGame(g.game_id)}
                        className="text-slate-400 hover:text-white transition"
                        title={g.is_enabled ? 'Disable game' : 'Enable game'}
                      >
                        {g.is_enabled ? (
                          <ToggleRight size={24} className="text-sky-400" />
                        ) : (
                          <ToggleLeft size={24} className="text-slate-600" />
                        )}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Coins,
  Calendar,
  Gamepad2,
  ArrowRight,
  Receipt,
  AlertOctagon,
} from 'lucide-react';
import { DashboardStats, NavPage } from '../types';
import { Badge } from '../components/Badge';
import { api } from '../services/api';

interface DashboardPageProps {
  stats: DashboardStats | null;
  onNavigate: (page: NavPage) => void;
  onRefresh?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  onNavigate,
}) => {
  const [revenueData, setRevenueData] = useState<{ summary: any[]; recentOrders: any[] } | null>(null);

  useEffect(() => {
    api.getRevenueAnalytics()
      .then(setRevenueData)
      .catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading GoDigital live operational telemetry...</span>
        </div>
      </div>
    );
  }

  const { kpis, todayChallenge, recentAuditLogs, lastRefreshedAt } = stats;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Critical KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Subscribers */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Subscribers</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {kpis.activeSubscribers.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Shortcode 9898
            </span>
            <span className="text-[11px] text-slate-400 font-mono">2 ETB/day</span>
          </div>
        </div>

        {/* Registered Players */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Players</span>
            <Gamepad2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {kpis.totalPlayers.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
              Telebirr Profiles
            </span>
            <span className="text-[11px] text-slate-400">{kpis.retentionRatePercent}% Retention</span>
          </div>
        </div>

        {/* Telebirr Settled Revenue */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Telebirr Revenue</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 tracking-tight">
            ETB {kpis.totalRevenueBirr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono">
            Today: <span className="text-emerald-400 font-bold">ETB {kpis.todayRevenueBirr.toLocaleString()}</span> (C2B Settled)
          </div>
        </div>

        {/* Anti-Cheat Fraud Blocked */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Anti-Cheat Fraud</span>
            <AlertOctagon className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {kpis.fraudIncidentsBlocked.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              Zero Tamper
            </span>
            <span className="text-[11px] text-slate-400">Rate Limiter Active</span>
          </div>
        </div>
      </div>

      {/* Secondary Operational Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Daily Brain Challenge */}
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Calendar size={15} className="text-sky-400" />
                Today's Daily Challenge
              </span>
              <Badge status={todayChallenge ? todayChallenge.status : 'NOT_CONFIGURED'} size="sm" />
            </div>

            {todayChallenge ? (
              <div className="space-y-3">
                <h4 className="text-base font-bold text-white">{todayChallenge.title}</h4>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="font-mono text-sky-400">{todayChallenge.game_id}</span>
                  <span>•</span>
                  <Badge status={todayChallenge.difficulty} size="sm" />
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Bonus Reward:</span>
                    <div className="font-bold text-amber-400 mt-0.5">+{todayChallenge.bonus_coins} Coins</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Target Score:</span>
                    <div className="font-bold text-white mt-0.5">{todayChallenge.target_score} pts</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Time Limit:</span>
                    <div className="font-bold text-white mt-0.5">{todayChallenge.time_limit_seconds}s</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-6 text-center">
                No daily challenge scheduled for today.
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('DAILY_CHALLENGES')}
            className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
          >
            <span>Manage Daily Challenge Calendar</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Puzzle Catalog Status */}
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Gamepad2 size={15} className="text-emerald-400" />
                Skill Catalog Status
              </span>
              <span className="text-xs text-slate-400 font-mono">{kpis.activePuzzleGames} Active Titles</span>
            </div>

            <div className="space-y-3">
              <div className="text-3xl font-black text-white">
                {kpis.totalPuzzles} <span className="text-sm font-normal text-slate-400">Total Levels</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Active progression curves across Royal Water Sort, Emoji IQ, Bubble Shooter, and Helix Jump with server-authoritative move validation.
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-500">Active Tournaments:</span>
                  <div className="font-bold text-white mt-0.5">{kpis.activeTournaments} Pools</div>
                </div>
                <div>
                  <span className="text-slate-500">Hint Coin Pricing:</span>
                  <div className="font-bold text-amber-400 mt-0.5">5 - 15 Coins</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('PUZZLES')}
            className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
          >
            <span>Tune Progression Curves & Pricing</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Live Zero-Mock Audit Trail Preview */}
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <ShieldCheck size={15} className="text-indigo-400" />
                Recent Audit Trail
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">IMMUTABLE</span>
            </div>

            <div className="space-y-2.5">
              {recentAuditLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/60 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-sky-400 truncate max-w-[150px]">{log.action}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 truncate">
                    {log.reason || `By ${log.admin_email}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('AUDIT_LOGS')}
            className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
          >
            <span>Inspect Full Audit Ledger</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Telebirr Revenue Reconciliation Breakdown */}
      {revenueData && revenueData.summary.length > 0 && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt size={16} className="text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Telebirr C2B Revenue Reconciliation by Item Class
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">PostgreSQL Live Sync</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5 font-semibold">Item Category</th>
                  <th className="p-3.5 font-semibold">Successful Transactions</th>
                  <th className="p-3.5 font-semibold text-right">Settled Amount (ETB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {revenueData.summary.map((row) => (
                  <tr key={row.item_type} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-bold text-white">{row.item_type}</td>
                    <td className="p-3.5 text-slate-300 font-mono">{row.count.toLocaleString()}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-amber-400">
                      ETB {parseFloat(row.total_amount_etb).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Probe Time */}
      <div className="text-right text-[11px] text-slate-500 font-mono">
        Telemetry synced from GCP VM PostgreSQL at {new Date(lastRefreshedAt).toLocaleTimeString()}
      </div>
    </div>
  );
};

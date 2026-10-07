import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { AuditLogEntry } from '../types';
import { Badge } from '../components/Badge';
import { api } from '../services/api';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs({
        page,
        pageSize: 15,
        action: actionFilter || undefined,
        adminEmail: adminEmail || undefined,
      });
      setLogs(res.items);
      setTotalPages(res.pagination.totalPages);
      setTotalCount(res.pagination.total);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Immutable Audit Security Ledger</span>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
            COMPLIANCE GRADE
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Tamper-evident record of all administrative operations, PII lookups, difficulty curve tuning, and balance corrections.
        </p>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[220px]">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by admin email..."
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-sky-500"
            />
          </div>
        </form>

        <div className="flex items-center gap-2 text-xs">
          <Filter size={14} className="text-slate-500" />
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-hidden focus:border-sky-500"
          >
            <option value="">All Administrative Actions</option>
            <option value="ADMIN_LOGIN_SUCCESS">ADMIN_LOGIN_SUCCESS</option>
            <option value="ADMIN_LOGIN_FAILED">ADMIN_LOGIN_FAILED</option>
            <option value="PII_PLAYER_MSISDN_UNMASKED">PII_PLAYER_MSISDN_UNMASKED</option>
            <option value="PLAYER_BALANCE_ADJUSTED">PLAYER_BALANCE_ADJUSTED</option>
            <option value="PUZZLE_LEVEL_CREATED">PUZZLE_LEVEL_CREATED</option>
            <option value="PUZZLE_LEVEL_UPDATED">PUZZLE_LEVEL_UPDATED</option>
            <option value="PUZZLE_BULK_IMPORTED">PUZZLE_BULK_IMPORTED</option>
            <option value="DAILY_CHALLENGE_SCHEDULED">DAILY_CHALLENGE_SCHEDULED</option>
            <option value="GAME_STATUS_TOGGLED">GAME_STATUS_TOGGLED</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="p-3.5 font-semibold">Timestamp</th>
                <th className="p-3.5 font-semibold">Admin Identity</th>
                <th className="p-3.5 font-semibold">Role</th>
                <th className="p-3.5 font-semibold">Action Triggered</th>
                <th className="p-3.5 font-semibold">Resource</th>
                <th className="p-3.5 font-semibold">Reason / Detail</th>
                <th className="p-3.5 font-semibold text-right">State Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading immutable audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  const hasDiff = log.previous_state || log.new_state;

                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="p-3.5 font-semibold text-white">{log.admin_email}</td>
                        <td className="p-3.5">
                          <Badge status={log.admin_role} size="sm" />
                        </td>
                        <td className="p-3.5 font-mono font-bold text-sky-400">{log.action}</td>
                        <td className="p-3.5 font-mono text-slate-400">
                          {log.resource_type} {log.resource_id ? `(${log.resource_id.slice(0, 8)}...)` : ''}
                        </td>
                        <td className="p-3.5 text-slate-300 max-w-xs truncate" title={log.reason}>
                          {log.reason || '—'}
                        </td>
                        <td className="p-3.5 text-right">
                          {hasDiff && (
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : log.id)}
                              className="text-xs text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 font-mono"
                            >
                              <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          )}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-slate-950/80 border-b border-slate-800">
                          <td colSpan={7} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                                <div className="text-slate-400 mb-1 font-bold">PREVIOUS STATE:</div>
                                <pre className="text-rose-400 overflow-x-auto text-[11px] whitespace-pre-wrap">
                                  {log.previous_state ? JSON.stringify(log.previous_state, null, 2) : 'null'}
                                </pre>
                              </div>
                              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                                <div className="text-slate-400 mb-1 font-bold">NEW STATE:</div>
                                <pre className="text-emerald-400 overflow-x-auto text-[11px] whitespace-pre-wrap">
                                  {log.new_state ? JSON.stringify(log.new_state, null, 2) : 'null'}
                                </pre>
                              </div>
                            </div>
                            <div className="mt-2 text-[10px] text-slate-500 font-mono">
                              IP: {log.ip_address || 'Internal'} | Client: {log.user_agent || 'Unknown'}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
            <span className="text-white font-bold">{totalPages || 1}</span> ({totalCount} immutable records)
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
    </div>
  );
};

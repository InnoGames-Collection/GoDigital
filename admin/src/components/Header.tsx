import React from 'react';
import { RefreshCw, ShieldCheck, Database } from 'lucide-react';
import { AdminUser, NavPage } from '../types';
import { Badge } from './Badge';

interface HeaderProps {
  currentPage: NavPage;
  currentAdmin: AdminUser | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  currentAdmin,
  isRefreshing,
  onRefresh,
}) => {
  const getPageInfo = (): { title: string; subtitle: string } => {
    switch (currentPage) {
      case 'DASHBOARD':
        return {
          title: 'Operations & Revenue Dashboard',
          subtitle: 'Live Telebirr revenue reconciliation, active subscribers, and skill progression telemetry.',
        };
      case 'PUZZLES':
        return {
          title: 'Skill Catalog & Level Progression Curves',
          subtitle: 'Manage puzzle configurations, min moves, par time, and hint coin pricing with transactional versioning.',
        };
      case 'BULK_IMPORT':
        return {
          title: 'Bulk Level Importer',
          subtitle: 'Transactional bulk import of puzzle level definitions with schema validation and atomic rollbacks.',
        };
      case 'DAILY_CHALLENGES':
        return {
          title: 'Daily Brain Challenges Scheduler',
          subtitle: 'Schedule daily brain-training streaks, reward coin bonuses, and set target qualification scores.',
        };
      case 'PLAYERS':
        return {
          title: 'Player Profiles & Wallet Operations',
          subtitle: 'Server-side parameterized pagination, zero-trust PII masking, and audited wallet balance adjustments.',
        };
      case 'TOURNAMENTS':
        return {
          title: 'Competitive Tournaments & Anti-Cheat',
          subtitle: 'Live tournament leaderboards and anti-cheat telemetry inspection.',
        };
      case 'AUDIT_LOGS':
        return {
          title: 'Immutable Audit Security Ledger',
          subtitle: 'Cryptographically ordered audit trails tracking all administrative mutations and PII lookups.',
        };
      case 'ADMIN_USERS':
        return {
          title: 'Enterprise Access Control & RBAC',
          subtitle: 'Manage administrative roles (SUPER_ADMIN, CONTENT_CREATOR, OPERATIONS_MANAGER, AUDITOR) and lockout defense.',
        };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <header className="h-18 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-8 flex items-center justify-between shrink-0 sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <span>{title}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* System Probe Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
          <Database size={13} className="text-emerald-400" />
          <span className="text-slate-300 font-medium">PostgreSQL 16:</span>
          <span className="text-emerald-400 font-mono font-semibold">LIVE</span>
        </div>

        {/* Current Admin Pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
          <ShieldCheck size={14} className="text-sky-400" />
          <span className="font-semibold text-slate-200">{currentAdmin?.name || 'Administrator'}</span>
          <Badge status={currentAdmin?.role} size="sm" />
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
        >
          <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>
    </header>
  );
};

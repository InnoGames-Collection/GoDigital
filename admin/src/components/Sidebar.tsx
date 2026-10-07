import React, { useState } from 'react';
import {
  LayoutDashboard,
  Gamepad2,
  UploadCloud,
  CalendarDays,
  Users,
  Trophy,
  ClipboardList,
  ShieldCheck,
  LogOut,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { NavPage, AdminUser, AdminRole } from '../types';
import { Badge } from './Badge';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  currentAdmin: AdminUser | null;
  availableAdmins: AdminUser[];
  onSwitchAdmin: (adminId: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  currentAdmin,
  availableAdmins,
  onSwitchAdmin,
  onLogout,
}) => {
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const navItems: { page: NavPage; label: string; icon: React.ReactNode; roles?: AdminRole[] }[] = [
    { page: 'DASHBOARD', label: 'Operations Dashboard', icon: <LayoutDashboard size={18} /> },
    { page: 'PUZZLES', label: 'Puzzle Catalog & Curves', icon: <Gamepad2 size={18} /> },
    { page: 'BULK_IMPORT', label: 'Bulk Level Importer', icon: <UploadCloud size={18} />, roles: ['SUPER_ADMIN', 'CONTENT_CREATOR'] },
    { page: 'DAILY_CHALLENGES', label: 'Daily Brain Challenges', icon: <CalendarDays size={18} /> },
    { page: 'PLAYERS', label: 'Players & Wallets', icon: <Users size={18} /> },
    { page: 'TOURNAMENTS', label: 'Tournaments & Anti-Cheat', icon: <Trophy size={18} /> },
    { page: 'AUDIT_LOGS', label: 'Immutable Audit Ledger', icon: <ClipboardList size={18} />, roles: ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'AUDITOR'] },
    { page: 'ADMIN_USERS', label: 'Admin Access & RBAC', icon: <ShieldCheck size={18} />, roles: ['SUPER_ADMIN'] },
  ];

  const currentRole = currentAdmin?.role || 'AUDITOR';

  return (
    <aside className="w-68 bg-slate-950 text-slate-100 flex flex-col h-screen shrink-0 border-r border-slate-800 select-none z-20">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-sky-500/20">
            GD
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-wide text-white flex items-center gap-1.5">
              <span>GoDigital</span>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1 py-0.2 rounded font-mono font-normal">
                ENTERPRISE
              </span>
            </div>
            <div className="text-[11px] text-emerald-400 font-mono font-medium flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>TELEBIRR & 9898 VAS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Identity & Role Switcher */}
      <div className="p-3 border-b border-slate-800/60 bg-slate-900/40 relative">
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="text-xs font-bold text-slate-200 truncate">{currentAdmin?.name || 'Administrator'}</div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">{currentAdmin?.email || 'admin@godigital.et'}</div>
            <div className="mt-1.5">
              <Badge status={currentAdmin?.role} size="sm" />
            </div>
          </div>
          {availableAdmins.length > 1 && (
            <button
              onClick={() => setShowAdminMenu(!showAdminMenu)}
              title="Switch role identity for staging/audit"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <ChevronDown size={16} />
            </button>
          )}
        </div>

        {/* Identity Selector Menu */}
        {showAdminMenu && availableAdmins.length > 1 && (
          <div className="absolute top-full left-2 right-2 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
              Switch Admin Role Identity:
            </div>
            {availableAdmins.map((adm) => (
              <button
                key={adm.id}
                onClick={() => {
                  onSwitchAdmin(adm.id);
                  setShowAdminMenu(false);
                }}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                  adm.id === currentAdmin?.id
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="truncate">
                  <div className="truncate">{adm.name}</div>
                  <div className="text-[10px] opacity-75">{adm.role}</div>
                </div>
                {adm.id === currentAdmin?.id && <UserCheck size={14} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          // Check role visibility
          if (item.roles && !item.roles.includes(currentRole)) {
            return null;
          }

          const isActive = currentPage === item.page;

          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950 flex items-center justify-between">
        <div className="text-[11px] text-slate-400">
          <div>PostgreSQL 16 & Valkey 8</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Port 3703 / API 3702</div>
        </div>
        <button
          onClick={onLogout}
          title="Sign out & blacklist session"
          className="p-2 text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-lg transition"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

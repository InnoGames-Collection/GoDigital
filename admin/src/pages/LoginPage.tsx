import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { AdminUser, AdminRole } from '../types';
import { api } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (admin: AdminUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('superadmin');
  const [password, setPassword] = useState('AdminPass@2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email.trim(), password);
      if (res.admin) {
        onLoginSuccess(res.admin);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickRoles = [
    { role: 'SUPER_ADMIN' as AdminRole, label: 'Super Admin', email: 'superadmin', password: 'AdminPass@2026' },
    { role: 'AUDITOR' as AdminRole, label: 'Financial Auditor', email: 'godigital_auditor', password: 'AdminPass@2026' },
    { role: 'CONTENT_CREATOR' as AdminRole, label: 'Bethlehem (Content)', email: 'creator@godigital.et', password: 'Admin@GoDigital2026!' },
    { role: 'OPERATIONS_MANAGER' as AdminRole, label: 'Yonas (Ops Manager)', email: 'ops@godigital.et', password: 'Admin@GoDigital2026!' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-100">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 items-center justify-center font-black text-white text-2xl shadow-xl shadow-sky-500/20 mb-4">
            GD
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">GoDigital Admin Console</h1>
          <p className="text-xs text-slate-400 mt-1">
            Telebirr SuperApp & Ethio Telecom VAS Operations Gateway
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck size={18} className="text-sky-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Zero-Trust Administrator Sign-In
            </h2>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 mb-6 flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Administrative Username or Email:
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="superadmin or admin@godigital.innopulseplatform.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Master Security Password:
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/25 transition disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating with Vault...' : 'Authenticate & Access Portal'}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Quick Identity Profiles (Staging / Dev Quick Switch) */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              <KeyRound size={13} className="text-sky-400" />
              <span>Select Seeded Role Persona:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quickRoles.map((r) => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => {
                    setEmail(r.email);
                    setPassword(r.password);
                  }}
                  className="text-left p-2 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-[11px] transition"
                >
                  <div className="font-semibold text-white truncate">{r.label}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{r.role}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500 mt-6 font-mono">
          Telebirr & Shortcode 9898 Security Gateway | Port 3703
        </div>
      </div>
    </div>
  );
};

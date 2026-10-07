import { useState, useEffect } from 'react';
import { UserPlus, Lock, CheckCircle2, XCircle, X } from 'lucide-react';
import { AdminUser, AdminRole } from '../types';
import { Badge } from '../components/Badge';
import { api } from '../services/api';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminRole>('CONTENT_CREATOR');
  const [department, setDepartment] = useState('Game Operations');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminUsers();
      setUsers(res.users);
    } catch (err) {
      console.error('Failed to load admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.createAdminUser({ email, name, password, role, department });
      setIsModalOpen(false);
      setEmail('');
      setName('');
      setPassword('');
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to create admin user.');
    } finally {
      setSaving(false);
    }
  };

  const handleUnlock = async (id: string) => {
    try {
      await api.updateAdminUserStatus(id, { unlockAccount: true });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to unlock account.');
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await api.updateAdminUserStatus(id, { isActive: !currentActive });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user active status.');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Enterprise Access Control & RBAC</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Role-based access permissions, zero-trust privilege boundaries, and account lockout management.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition self-start"
        >
          <UserPlus size={15} />
          <span>Provision Admin User</span>
        </button>
      </div>

      {/* Role Matrix Explainer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30">
          <Badge status="SUPER_ADMIN" size="sm" />
          <div className="text-xs font-bold text-white mt-2">Super Admin</div>
          <p className="text-[11px] text-slate-400 mt-1">Full access to RBAC provisioning, financial settlements, and audit logs.</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30">
          <Badge status="CONTENT_CREATOR" size="sm" />
          <div className="text-xs font-bold text-white mt-2">Content Creator</div>
          <p className="text-[11px] text-slate-400 mt-1">Manages puzzles, bulk import, and daily challenges. Forbidden from wallet & financial tasks.</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30">
          <Badge status="OPERATIONS_MANAGER" size="sm" />
          <div className="text-xs font-bold text-white mt-2">Operations Manager</div>
          <p className="text-[11px] text-slate-400 mt-1">Player wallet balance adjustments, tournament settlement, and audited PII unmasking.</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30">
          <Badge status="AUDITOR" size="sm" />
          <div className="text-xs font-bold text-white mt-2">Compliance Auditor</div>
          <p className="text-[11px] text-slate-400 mt-1">Strict read-only zero-trust role for inspecting audit ledgers, masked telemetry, and revenue.</p>
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="p-3.5 font-semibold">Administrator Name</th>
                <th className="p-3.5 font-semibold">Corporate Email</th>
                <th className="p-3.5 font-semibold">Role Tier</th>
                <th className="p-3.5 font-semibold">Department</th>
                <th className="p-3.5 font-semibold">Account Status</th>
                <th className="p-3.5 font-semibold">Lockout Defense</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading admin accounts...
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isLocked = u.locked_until && new Date(u.locked_until) > new Date();

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-white">{u.name}</td>
                      <td className="p-3.5 font-mono text-slate-300">{u.email}</td>
                      <td className="p-3.5">
                        <Badge status={u.role} size="sm" />
                      </td>
                      <td className="p-3.5 text-slate-400">{u.department}</td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          u.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {u.is_active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {u.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono">
                        {isLocked ? (
                          <span className="text-rose-400 flex items-center gap-1 font-bold">
                            <Lock size={12} />
                            Locked (until {new Date(u.locked_until!).toLocaleTimeString()})
                          </span>
                        ) : (
                          <span className="text-slate-500">Normal</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right flex items-center justify-end gap-2">
                        {isLocked && (
                          <button
                            onClick={() => handleUnlock(u.id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition"
                          >
                            Release Lock
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleActive(u.id, !!u.is_active)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-semibold transition"
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
                <UserPlus size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Provision Admin User</h3>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email:</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Temporary Password (min 8 chars):</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">RBAC Role:</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminRole)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-sky-500"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Full Privileges)</option>
                  <option value="CONTENT_CREATOR">CONTENT_CREATOR (Puzzles & Challenges Only)</option>
                  <option value="OPERATIONS_MANAGER">OPERATIONS_MANAGER (Wallets & PII Operations)</option>
                  <option value="AUDITOR">AUDITOR (Read-Only Compliance)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department / Organization:</label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 border border-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 transition disabled:opacity-50"
                >
                  {saving ? 'Provisioning...' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

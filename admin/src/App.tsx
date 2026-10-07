import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { PuzzleCatalogPage } from './pages/PuzzleCatalogPage';
import { BulkImportPage } from './pages/BulkImportPage';
import { DailyChallengePage } from './pages/DailyChallengePage';
import { PlayersPage } from './pages/PlayersPage';
import { TournamentsPage } from './pages/TournamentsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { LoginPage } from './pages/LoginPage';
import { api, getAdminToken } from './services/api';
import { AdminUser, DashboardStats, NavPage } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('DASHBOARD');
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [availableAdmins, setAvailableAdmins] = useState<AdminUser[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const initApp = async () => {
    const token = getAdminToken();
    if (!token) {
      setCurrentAdmin(null);
      setInitialLoading(false);
      return;
    }

    try {
      setIsRefreshing(true);
      const [authData, statsData] = await Promise.all([
        api.getAuthMe(),
        api.getDashboardStats(),
      ]);
      setCurrentAdmin(authData.currentAdmin);
      setAvailableAdmins(authData.availableAdmins);
      setDashboardStats(statsData);
    } catch (err) {
      console.warn('Session verification failed, requesting login:', err);
      setCurrentAdmin(null);
    } finally {
      setIsRefreshing(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    initApp();
  }, []);

  const handleLoginSuccess = async (admin: AdminUser) => {
    setCurrentAdmin(admin);
    await initApp();
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentAdmin(null);
  };

  const handleSwitchAdmin = async (adminId: string) => {
    try {
      setIsRefreshing(true);
      const res = await api.switchAdmin(adminId);
      setCurrentAdmin(res.currentAdmin);
      await initApp();
    } catch (err: any) {
      alert(err.message || 'Failed to switch admin profile.');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-slate-100">
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying administrative session...</span>
        </div>
      </div>
    );
  }

  if (!currentAdmin) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        currentAdmin={currentAdmin}
        availableAdmins={availableAdmins}
        onSwitchAdmin={handleSwitchAdmin}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <Header
          currentPage={currentPage}
          currentAdmin={currentAdmin}
          isRefreshing={isRefreshing}
          onRefresh={initApp}
        />

        <main className="flex-1 overflow-y-auto">
          {currentPage === 'DASHBOARD' && (
            <DashboardPage
              stats={dashboardStats}
              onNavigate={setCurrentPage}
              onRefresh={initApp}
            />
          )}

          {currentPage === 'PUZZLES' && (
            <PuzzleCatalogPage currentRole={currentAdmin.role} />
          )}

          {currentPage === 'BULK_IMPORT' && (
            <BulkImportPage />
          )}

          {currentPage === 'DAILY_CHALLENGES' && (
            <DailyChallengePage currentRole={currentAdmin.role} />
          )}

          {currentPage === 'PLAYERS' && (
            <PlayersPage currentRole={currentAdmin.role} />
          )}

          {currentPage === 'TOURNAMENTS' && (
            <TournamentsPage currentRole={currentAdmin.role} />
          )}

          {currentPage === 'AUDIT_LOGS' && (
            <AuditLogPage />
          )}

          {currentPage === 'ADMIN_USERS' && (
            <AdminUsersPage />
          )}
        </main>
      </div>
    </div>
  );
}

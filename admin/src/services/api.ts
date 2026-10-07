import {
  AdminUser,
  DashboardStats,
  PuzzleLevel,
  DailyChallenge,
  Player,
  AuditLogEntry,
  Tournament,
  PaginatedResult,
} from '../types';

const API_BASE = '/api';
const TOKEN_KEY = 'godigital_admin_token';

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export function clearAdminToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as any) || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData?.message || errorData?.error) {
        errorMsg = errorData.message || errorData.error;
      }
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // ── Authentication & RBAC ──────────────────────────────────────────────────
  async login(email: string, password: string): Promise<{ success: boolean; token: string; admin: AdminUser }> {
    const res = await request<any>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) {
      setAdminToken(res.token);
    }
    return res;
  },

  async logout(): Promise<void> {
    try {
      await request('/admin/auth/logout', { method: 'POST' });
    } catch {}
    clearAdminToken();
  },

  async getAuthMe(): Promise<{ currentAdmin: AdminUser; availableAdmins: AdminUser[] }> {
    return request('/admin/auth/me');
  },

  async switchAdmin(targetAdminId: string): Promise<{ success: boolean; token: string; currentAdmin: AdminUser }> {
    const res = await request<any>('/admin/auth/switch', {
      method: 'POST',
      body: JSON.stringify({ targetAdminId }),
    });
    if (res.token) {
      setAdminToken(res.token);
    }
    return res;
  },

  // ── Telemetry & Revenue ───────────────────────────────────────────────────
  async getDashboardStats(): Promise<DashboardStats> {
    return request('/admin/dashboard');
  },

  async getLevelAnalytics(gameId?: string): Promise<{ levels: any[] }> {
    const query = gameId ? `?gameId=${encodeURIComponent(gameId)}` : '';
    return request(`/admin/analytics/levels${query}`);
  },

  async getRevenueAnalytics(): Promise<{ summary: any[]; recentOrders: any[] }> {
    return request('/admin/analytics/revenue');
  },

  // ── Puzzle Catalog ────────────────────────────────────────────────────────
  async getPuzzles(params: {
    page?: number;
    pageSize?: number;
    gameId?: string;
    difficulty?: string;
    search?: string;
  } = {}): Promise<PaginatedResult<PuzzleLevel>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.gameId) searchParams.append('gameId', params.gameId);
    if (params.difficulty) searchParams.append('difficulty', params.difficulty);
    if (params.search) searchParams.append('search', params.search);

    return request(`/admin/puzzles?${searchParams.toString()}`);
  },

  async createPuzzle(puzzle: Partial<PuzzleLevel>): Promise<{ success: boolean; puzzle: PuzzleLevel }> {
    return request('/admin/puzzles', {
      method: 'POST',
      body: JSON.stringify(puzzle),
    });
  },

  async updatePuzzle(id: string, updates: Partial<PuzzleLevel>): Promise<{ success: boolean; puzzle: PuzzleLevel }> {
    return request(`/admin/puzzles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async bulkImportPuzzles(levels: any[], overwriteExisting: boolean = true): Promise<{
    success: boolean;
    message: string;
    summary: { totalReceived: number; inserted: number; updated: number };
  }> {
    return request('/admin/puzzles/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ levels, overwriteExisting }),
    });
  },

  // ── Daily Challenges ──────────────────────────────────────────────────────
  async getDailyChallenges(month?: string): Promise<{ challenges: DailyChallenge[] }> {
    const query = month ? `?month=${encodeURIComponent(month)}` : '';
    return request(`/admin/daily-challenges${query}`);
  },

  async createDailyChallenge(challenge: Partial<DailyChallenge>): Promise<{ success: boolean; challenge: DailyChallenge }> {
    return request('/admin/daily-challenges', {
      method: 'POST',
      body: JSON.stringify(challenge),
    });
  },

  // ── Player Management & Zero-Trust PII ────────────────────────────────────
  async getPlayers(params: { page?: number; pageSize?: number; search?: string } = {}): Promise<PaginatedResult<Player>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.search) searchParams.append('search', params.search);

    return request(`/admin/players?${searchParams.toString()}`);
  },

  async unmaskPlayerPii(playerId: string, reason: string): Promise<{
    success: boolean;
    playerId: string;
    displayName: string;
    unmaskedPhone: string;
    maskedPhone: string;
    auditedAt: string;
  }> {
    return request(`/admin/players/${playerId}/unmask`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async adjustPlayerBalance(playerId: string, deltaCoins: number, reason: string): Promise<{
    success: boolean;
    previousCoins: number;
    newCoins: number;
    delta: number;
    reason: string;
  }> {
    return request(`/admin/players/${playerId}/adjust-balance`, {
      method: 'POST',
      body: JSON.stringify({ deltaCoins, reason }),
    });
  },

  // ── Audit Logs ────────────────────────────────────────────────────────────
  async getAuditLogs(params: {
    page?: number;
    pageSize?: number;
    action?: string;
    adminEmail?: string;
  } = {}): Promise<PaginatedResult<AuditLogEntry>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.action) searchParams.append('action', params.action);
    if (params.adminEmail) searchParams.append('adminEmail', params.adminEmail);

    return request(`/admin/audit-logs?${searchParams.toString()}`);
  },

  // ── Admin Users Management ────────────────────────────────────────────────
  async getAdminUsers(): Promise<{ users: AdminUser[] }> {
    return request('/admin/users');
  },

  async createAdminUser(user: { email: string; password: string; name: string; role: string; department: string }): Promise<{ success: boolean; user: AdminUser }> {
    return request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },

  async updateAdminUserStatus(id: string, updates: { isActive?: boolean; unlockAccount?: boolean }): Promise<{ success: boolean; user: AdminUser }> {
    return request(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // ── Games & Tournaments ───────────────────────────────────────────────────
  async getGames(): Promise<any[]> {
    return request('/admin/games');
  },

  async toggleGame(gameId: string): Promise<{ success: boolean; game: any }> {
    return request(`/admin/games/${gameId}/toggle`, { method: 'POST' });
  },

  async getTournaments(): Promise<{ tournaments: Tournament[] }> {
    return request('/admin/tournaments');
  },
};

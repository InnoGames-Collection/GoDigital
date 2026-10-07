export type AdminRole = 'SUPER_ADMIN' | 'CONTENT_CREATOR' | 'OPERATIONS_MANAGER' | 'AUDITOR';

export type NavPage =
  | 'DASHBOARD'
  | 'PUZZLES'
  | 'BULK_IMPORT'
  | 'DAILY_CHALLENGES'
  | 'PLAYERS'
  | 'TOURNAMENTS'
  | 'AUDIT_LOGS'
  | 'ADMIN_USERS';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  department: string;
  active?: boolean;
  is_active?: boolean;
  failed_login_attempts?: number;
  locked_until?: string | null;
  lastLogin?: string;
  last_login_at?: string;
  createdAt?: string;
  created_at?: string;
}

export interface DashboardKPIs {
  activeSubscribers: number;
  totalPlayers: number;
  activeTournaments: number;
  fraudIncidentsBlocked: number;
  totalRevenueBirr: number;
  todayRevenueBirr: number;
  totalPuzzles: number;
  activePuzzleGames: number;
  retentionRatePercent: number;
}

export interface DashboardStats {
  kpis: DashboardKPIs;
  todayChallenge: DailyChallenge | null;
  recentAuditLogs: AuditLogEntry[];
  systemMode: 'DEMO' | 'PRODUCTION';
  lastRefreshedAt: string;
}

export type PuzzleDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
export type PuzzleStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface PuzzleLevel {
  id: string;
  game_id: string;
  level_number: number;
  title: string;
  category: string;
  difficulty: PuzzleDifficulty;
  puzzle_data: Record<string, any>;
  solution_data?: Record<string, any>;
  min_moves: number;
  par_time_seconds: number;
  hint_cost_coins: number;
  stars_to_unlock: number;
  status: PuzzleStatus;
  version: number;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  // joined analytics
  attempts?: number;
  completions?: number;
  avg_duration?: number;
  drop_off_rate?: number;
  hints_used?: number;
}

export type ChallengeStatus = 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface DailyChallenge {
  id: string;
  challenge_date: string;
  game_id: string;
  puzzle_level_id?: string;
  title: string;
  difficulty: PuzzleDifficulty;
  bonus_coins: number;
  target_score: number;
  time_limit_seconds: number;
  status: ChallengeStatus;
  participants_count: number;
  completions_count: number;
  top_score: number;
  created_at?: string;
  updated_at?: string;
}

export interface Player {
  id: string;
  phone: string;
  masked_phone: string;
  display_name: string;
  coins: number;
  xp: number;
  level: number;
  energy: number;
  matches_played: number;
  trophies_count: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  admin_id?: string;
  admin_email: string;
  admin_role: AdminRole;
  action: string;
  resource_type: string;
  resource_id?: string;
  previous_state?: any;
  new_state?: any;
  reason?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface Tournament {
  id: string;
  title: string;
  game_id: string;
  start_date: string;
  end_date: string;
  prize_pool_etb: number;
  status: 'UPCOMING' | 'ACTIVE' | 'FINALIZED';
  created_at?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

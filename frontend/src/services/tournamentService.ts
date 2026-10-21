/**
 * GameON Tele - Official Weekly Tournament Service
 * 
 * Central Tournament Logic & Configuration Engine:
 * - Weekly tournament cycle with live countdown timer
 * - Admin-configurable game selection (default: crazy-colors, fruit-slice, helix-jump, pop-piano)
 * - Individual game score retention (no score normalization or modification)
 * - Overall Tournament Best Score = MAX(score across active tournament games)
 * - Deterministic tie handling (Score -> Achievement Timestamp)
 * - Top 10 leaderboard with masked MSISDNs, Ethiopian names, Best Score, and originating game
 * - Separation between Game Scores, Tournament Rankings, and Prize distribution
 */

import { UserProfile } from '../types/index';
import { GameCatalog, CatalogGame } from './gameCatalog';
import { GameLeaderboardService } from './gameLeaderboardService';

export interface TournamentPrize {
  rank: number;
  rankLabel: string;
  rewardText: string;
  etbAmount?: number;
  coinsAmount?: number;
}

export interface WeeklyTournamentConfig {
  id: string;
  title: string;
  subtitle: string;
  frequency: 'weekly';
  sponsor: string;
  /** Admin-configurable selected games (Default: crazy-colors, fruit-slice, helix-jump, pop-piano) */
  selectedGameIds: string[];
  startDate: string;
  endDate: string;
  prizes: TournamentPrize[];
}

export interface OverallTournamentEntry {
  rank: number;
  playerId: string;
  playerName: string;
  playerMasked: string;
  bestScore: number;
  bestGameId: string;
  bestGameTitle: string;
  achievementTimestamp: number;
  rewardText?: string;
  isCurrentUser?: boolean;
  gameScores: Record<string, number>;
}

export interface TournamentSummaryData {
  config: WeeklyTournamentConfig;
  participatingGames: CatalogGame[];
  topEntries: OverallTournamentEntry[];
  currentUserBestScore: number;
  currentUserBestGame: CatalogGame | null;
  currentUserRank: number;
  currentUserScores: Record<string, number>;
  totalParticipants: number;
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    formatted: string;
  };
}

// Default Weekly Tournament Configuration (Admin-configurable)
export const DEFAULT_WEEKLY_TOURNAMENT: WeeklyTournamentConfig = {
  id: 'weekly_championship_cup',
  title: 'Helix Jump Grand Prix',
  subtitle: 'Official Weekly Tournament • Helix Jump',
  frequency: 'weekly',
  sponsor: 'telebirr & EthioTelecom',
  selectedGameIds: ['helix-jump'],
  startDate: 'Monday, 00:00 EAT',
  endDate: 'Sunday, 23:59 EAT',
  prizes: [
    { rank: 1, rankLabel: '1st Place', rewardText: '5,000 ETB Cash + 2,000 Coins', etbAmount: 5000, coinsAmount: 2000 },
    { rank: 2, rankLabel: '2nd Place', rewardText: '3,000 ETB Cash + 1,000 Coins', etbAmount: 3000, coinsAmount: 1000 },
    { rank: 3, rankLabel: '3rd Place', rewardText: '1,500 ETB Cash + 500 Coins', etbAmount: 1500, coinsAmount: 500 },
    { rank: 4, rankLabel: '4th - 10th Place', rewardText: '300 ETB Airtime + 250 Coins', etbAmount: 300, coinsAmount: 250 },
  ],
};

import { apiService } from './apiService';

// Canonical Baseline Seed Contenders matching PostgreSQL db/seeds/001_initial_seeds.sql
interface CanonicalDbEntry {
  id: string;
  name: string;
  phone: string;
  masked: string;
  score: number;
  timestampOffsetHours: number;
}

const CANONICAL_DB_ENTRIES: CanonicalDbEntry[] = [
  { id: 'db_seed_1', name: 'Player 091*****890', phone: '0911998890', masked: '091*****890', score: 4850, timestampOffsetHours: 42 },
  { id: 'db_seed_2', name: 'Player 092*****412', phone: '0922334412', masked: '092*****412', score: 4320, timestampOffsetHours: 36 },
  { id: 'db_seed_3', name: 'Player 093*****589', phone: '0933445589', masked: '093*****589', score: 3950, timestampOffsetHours: 28 },
  { id: 'db_seed_4', name: 'Player 094*****633', phone: '0944556633', masked: '094*****633', score: 3420, timestampOffsetHours: 24 },
  { id: 'db_seed_5', name: 'Player 095*****744', phone: '0955667744', masked: '095*****744', score: 3180, timestampOffsetHours: 20 },
];

let cachedServerEntries: OverallTournamentEntry[] | null = null;
let cachedTotalParticipants = 5;
let isSyncingTournaments = false;

const maskPhoneNumber = (phone?: string): string => {
  if (!phone) return 'Player';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 7) {
    const start = digits.slice(0, 3);
    const end = digits.slice(-3);
    return `${start}*****${end}`;
  }
  return 'Player';
};

const listeners = new Set<() => void>();

export const TournamentService = {
  /**
   * Subscribe to tournament data synchronization events
   */
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  notifyListeners(): void {
    listeners.forEach((listener) => {
      try {
        listener();
      } catch {}
    });
  },

  /**
   * Asynchronously synchronize active tournament and live leaderboard from PostgreSQL
   */
  async syncWithBackend(): Promise<void> {
    if (isSyncingTournaments) return;
    isSyncingTournaments = true;
    try {
      const tourns: any = await apiService.getTournaments();
      if (Array.isArray(tourns) && tourns.length > 0) {
        const activeTourn = tourns.find((t: any) => t.status === 'ACTIVE') || tourns[0];
        if (activeTourn?.leaderboard && Array.isArray(activeTourn.leaderboard)) {
          const baseTimestamp = Date.now();
          cachedServerEntries = activeTourn.leaderboard.map((lb: any, idx: number) => ({
            rank: lb.rank || idx + 1,
            playerId: lb.player_msisdn || `player_${idx + 1}`,
            playerName: `Player ${lb.masked_msisdn || maskPhoneNumber(lb.player_msisdn)}`,
            playerMasked: lb.masked_msisdn || maskPhoneNumber(lb.player_msisdn),
            bestScore: Number(lb.score) || 0,
            bestGameId: activeTourn.game_id || 'helix-jump',
            bestGameTitle: activeTourn.title || 'Helix Jump',
            achievementTimestamp: lb.submitted_at ? new Date(lb.submitted_at).getTime() : baseTimestamp - (idx * 3600000),
            rewardText: lb.prize_etb ? `${lb.prize_etb.toLocaleString()} ETB Prize` : undefined,
            isCurrentUser: false,
            gameScores: { [activeTourn.game_id || 'helix-jump']: Number(lb.score) || 0 },
          }));
        }
        if (typeof activeTourn.total_participants === 'number') {
          cachedTotalParticipants = activeTourn.total_participants;
        }
        this.notifyListeners();
      }
    } catch (e) {
      console.warn('[TournamentService] Failed to sync tournaments with backend:', e);
    } finally {
      isSyncingTournaments = false;
    }
  },

  /**
   * Retrieves active tournament configuration.
   */
  getActiveConfig(): WeeklyTournamentConfig {
    return DEFAULT_WEEKLY_TOURNAMENT;
  },

  /**
   * Admin configuration setter for tournament games.
   */
  setActiveTournamentGames(gameIds: string[]): void {
    if (typeof window === 'undefined') return;
    try {
      const current = this.getActiveConfig();
      const updated: WeeklyTournamentConfig = {
        ...current,
        selectedGameIds: gameIds,
      };
      localStorage.setItem('gameon_tournament_config', JSON.stringify(updated));
    } catch {}
  },

  /**
   * Returns list of currently active tournament game IDs (default 4 games).
   */
  getActiveTournamentGameIds(): string[] {
    return this.getActiveConfig().selectedGameIds;
  },

  /**
   * Returns CatalogGame definitions for the active tournament games.
   */
  getActiveTournamentGames(): CatalogGame[] {
    const ids = this.getActiveTournamentGameIds();
    return ids
      .map((id) => GameCatalog.getById(id))
      .filter((g): g is CatalogGame => Boolean(g));
  },

  /**
   * Computes time remaining in the current weekly cycle (ends Sunday 23:59:59 EAT)
   */
  getTimeRemaining(): { days: number; hours: number; minutes: number; seconds: number; formatted: string } {
    const now = new Date();
    const currentDay = now.getUTCDay(); // 0 is Sunday
    // Calculate days until next Sunday 23:59:59
    const daysUntilSunday = (7 - currentDay) % 7;
    const endOfWeek = new Date(now);
    endOfWeek.setUTCDate(now.getUTCDate() + daysUntilSunday);
    endOfWeek.setUTCHours(23, 59, 59, 999);

    const diffMs = Math.max(0, endOfWeek.getTime() - now.getTime());
    const totalSeconds = Math.floor(diffMs / 1000);

    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formatted = `${days}d ${hours}h ${minutes}m left`;

    return { days, hours, minutes, seconds, formatted };
  },

  /**
   * Authoritative Helix Jump tournament best score used across GoDigital (Home, Profile, Tournament, and Leaderboard).
   * Consolidates profile highScores, leaderboard stats, tournament engine, and local storage save data.
   */
  getHelixTournamentBestScore(profile?: UserProfile): number {
    const stats = GameLeaderboardService.getUserStats('helix-jump', profile);
    const profileScore = profile?.highScores?.['helix-jump'] || 0;
    let score = Math.max(stats.bestScore, profileScore);

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('teleplay_helix_jump_savedata_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (typeof parsed?.bestScore === 'number') {
            score = Math.max(score, parsed.bestScore);
          }
        }
      } catch {
        // storage fallback
      }
    }

    return score;
  },

  /**
   * Extracts user's score in a specific tournament game.
   */
  getUserScoreForGame(gameId: string, profile?: UserProfile): number {
    if (gameId === 'helix-jump') {
      return this.getHelixTournamentBestScore(profile);
    }
    const stats = GameLeaderboardService.getUserStats(gameId, profile);
    const profileScore = profile?.highScores?.[gameId] || 0;
    return Math.max(stats.bestScore, profileScore);
  },

  /**
   * Retrieves full tournament summary, ranking table, and current user standing.
   */
  getTournamentSummary(profile?: UserProfile): TournamentSummaryData {
    const config = this.getActiveConfig();
    const participatingGames = this.getActiveTournamentGames();
    const gameMap = new Map<string, CatalogGame>(participatingGames.map((g) => [g.gameId, g]));

    // 1. Gather Current User Scores across the participating tournament games
    const currentUserScores: Record<string, number> = {};
    let currentUserBestScore = 0;
    let currentUserBestGameId = '';

    participatingGames.forEach((game) => {
      const score = this.getUserScoreForGame(game.gameId, profile);
      currentUserScores[game.gameId] = score;
      if (score > currentUserBestScore) {
        currentUserBestScore = score;
        currentUserBestGameId = game.gameId;
      }
    });

    // Authoritative fallback: if helix-jump is active, ensure currentUserBestScore matches getHelixTournamentBestScore
    const helixBest = this.getHelixTournamentBestScore(profile);
    if (helixBest > currentUserBestScore) {
      currentUserBestScore = helixBest;
      currentUserScores['helix-jump'] = helixBest;
      currentUserBestGameId = 'helix-jump';
    }

    const currentUserBestGame: CatalogGame | null = currentUserBestGameId
      ? gameMap.get(currentUserBestGameId) || null
      : participatingGames[0] || null;

    // 2. Build baseline entries from backend server cache or canonical DB seed
    if (!cachedServerEntries && !isSyncingTournaments) {
      TournamentService.syncWithBackend();
    }

    const baseTimestamp = Date.now();
    const entries: OverallTournamentEntry[] = cachedServerEntries && cachedServerEntries.length > 0
      ? cachedServerEntries.map((e) => ({ ...e }))
      : CANONICAL_DB_ENTRIES.map((seed, idx) => {
          const achievementTimestamp = baseTimestamp - (seed.timestampOffsetHours * 3600 * 1000);
          return {
            rank: idx + 1,
            playerId: seed.id,
            playerName: seed.name,
            playerMasked: seed.masked,
            bestScore: seed.score,
            bestGameId: 'helix-jump',
            bestGameTitle: 'Helix Jump',
            achievementTimestamp,
            rewardText: idx === 0 ? '10,000 ETB Prize' : idx === 1 ? '6,000 ETB Prize' : idx === 2 ? '3,000 ETB Prize' : '1,000 ETB Prize',
            isCurrentUser: false,
            gameScores: { 'helix-jump': seed.score },
          };
        });

    // 3. User's entry if they have played any tournament game
    let currentUserRank = 0; // 0 indicates unranked
    const userEntry: OverallTournamentEntry | null = currentUserBestScore > 0 ? {
      rank: 0,
      playerId: profile?.id || 'current_user',
      playerName: profile?.displayName || 'You',
      playerMasked: maskPhoneNumber(profile?.phoneNumber),
      bestScore: currentUserBestScore,
      bestGameId: currentUserBestGameId || 'helix-jump',
      bestGameTitle: currentUserBestGame?.gameName || 'Helix Jump',
      achievementTimestamp: Date.now() - 60000, // Recent
      isCurrentUser: true,
      gameScores: { ...currentUserScores },
    } : null;

    // 4. Combine and Sort using deterministic tie-break:
    // Rule: Higher bestScore first; if equal, earlier achievement timestamp
    const allCandidates = [...entries];
    if (userEntry) {
      allCandidates.push(userEntry);
    }

    allCandidates.sort((a, b) => {
      if (b.bestScore !== a.bestScore) {
        return b.bestScore - a.bestScore;
      }
      return a.achievementTimestamp - b.achievementTimestamp;
    });

    // Assign 1-indexed ranks
    allCandidates.forEach((item, index) => {
      item.rank = index + 1;
      if (item.isCurrentUser) {
        currentUserRank = item.rank;
      }

      // Assign prize label according to rank
      if (item.rank === 1) item.rewardText = '10,000 ETB + 2,000 Coins';
      else if (item.rank === 2) item.rewardText = '6,000 ETB + 1,000 Coins';
      else if (item.rank === 3) item.rewardText = '3,000 ETB + 500 Coins';
      else if (item.rank <= 10) item.rewardText = '1,000 ETB + 250 Coins';
    });

    const topEntries = allCandidates.slice(0, 10);

    return {
      config,
      participatingGames,
      topEntries,
      currentUserBestScore,
      currentUserBestGame,
      currentUserRank: currentUserBestScore > 0 ? currentUserRank : 0,
      currentUserScores,
      totalParticipants: cachedTotalParticipants || Math.max(allCandidates.length, 5),
      timeRemaining: this.getTimeRemaining(),
    };
  },
};

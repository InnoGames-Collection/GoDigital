/**
 * GameON Tele - Game-Specific Leaderboard Engine
 * Provides independent, game-specific rankings, scores, and masked MSISDN top players.
 */

import { UserProfile } from '../types';
import { GameCatalog, CatalogGame } from './gameCatalog';

export interface GameLeaderboardEntry {
  rank: number;
  playerMasked: string;
  playerName: string;
  score: number;
  rewardText?: string;
  isCurrentUser?: boolean;
}

export interface GameLeaderboardResult {
  game: CatalogGame;
  entries: GameLeaderboardEntry[];
  userRank: number;
  userScore: number;
  totalParticipants: number;
}

import { apiService } from './apiService';

const serverLeaderboardCache: Record<string, { timestamp: number; entries: GameLeaderboardEntry[] }> = {};
let isFetchingLeaderboard: Record<string, boolean> = {};

export const maskPhone = (phone?: string): string => {
  const digits = (phone || '0911428890').replace(/\D/g, '');
  if (digits.length >= 9) {
    const start = digits.slice(0, 3);
    const end = digits.slice(-3);
    return `${start}*****${end}`;
  }
  return '091*****890';
};

export interface UserGameStats {
  matchesPlayed: number;
  bestScore: number;
  bestLevel: number;
  totalPlaytimeSeconds: number;
  lastPlayedTimestamp: number;
}

export const GameLeaderboardService = {
  getGamesWithLeaderboards(): CatalogGame[] {
    return GameCatalog.getAll().filter((g) => g.leaderboardEnabled);
  },

  getUserStats(gameId: string, profile?: UserProfile): UserGameStats {
    let localSaved: Partial<UserGameStats> = {};
    try {
      const raw = localStorage.getItem(`teleplay_stats_${gameId}`);
      if (raw) localSaved = JSON.parse(raw);
    } catch {}

    const profileScore = profile?.highScores?.[gameId] || 0;
    const bestScore = Math.max(localSaved.bestScore || 0, profileScore);
    const matchesPlayed = Math.max(localSaved.matchesPlayed || (bestScore > 0 ? 1 : 0), 0);
    const bestLevel = Math.max(localSaved.bestLevel || 1, 1);
    const totalPlaytimeSeconds = localSaved.totalPlaytimeSeconds || (matchesPlayed * 90);
    const lastPlayedTimestamp = localSaved.lastPlayedTimestamp || Date.now();

    return {
      matchesPlayed,
      bestScore,
      bestLevel,
      totalPlaytimeSeconds,
      lastPlayedTimestamp,
    };
  },

  recordScore(gameId: string, score: number, playerNameOrLevel?: string | number, level?: number | string): { isNewBest: boolean; bestScore: number } {
    if (typeof window === 'undefined') return { isNewBest: false, bestScore: score };
    try {
      const currentStats = this.getUserStats(gameId);
      const isNewBest = score > currentStats.bestScore;
      const updatedBest = Math.max(currentStats.bestScore, score);
      const updatedLevel = Math.max(currentStats.bestLevel, Number(level) || 1);
      
      const newStats: UserGameStats = {
        matchesPlayed: currentStats.matchesPlayed + 1,
        bestScore: updatedBest,
        bestLevel: updatedLevel,
        totalPlaytimeSeconds: currentStats.totalPlaytimeSeconds + 60,
        lastPlayedTimestamp: Date.now(),
      };
      localStorage.setItem(`teleplay_stats_${gameId}`, JSON.stringify(newStats));
      localStorage.setItem(`teleplay_lb_${gameId}`, updatedBest.toString());

      return { isNewBest, bestScore: updatedBest };
    } catch {
      return { isNewBest: false, bestScore: score };
    }
  },

  /**
   * Asynchronously fetch game high scores leaderboard from PostgreSQL
   */
  async fetchGameLeaderboard(gameId: string): Promise<GameLeaderboardEntry[]> {
    if (isFetchingLeaderboard[gameId]) {
      return serverLeaderboardCache[gameId]?.entries || [];
    }
    isFetchingLeaderboard[gameId] = true;
    try {
      const res = await apiService.getGameLeaderboard(gameId);
      if (Array.isArray(res)) {
        const mapped: GameLeaderboardEntry[] = res.map((item: any, idx: number) => ({
          rank: item.rank || idx + 1,
          playerMasked: item.playerMasked || (item.phone ? maskPhone(item.phone) : '091*****890'),
          playerName: item.playerName || `Player ${item.playerMasked || ''}`,
          score: Number(item.score) || 0,
          rewardText: item.rewardText || (idx === 0 ? '500 Coins' : idx === 1 ? '300 Coins' : idx === 2 ? '200 Coins' : idx < 5 ? '100 Coins' : undefined),
          isCurrentUser: false,
        }));
        serverLeaderboardCache[gameId] = { timestamp: Date.now(), entries: mapped };
        return mapped;
      }
    } catch (e) {
      console.warn(`[GameLeaderboardService] Failed to load leaderboard for ${gameId}:`, e);
    } finally {
      isFetchingLeaderboard[gameId] = false;
    }
    return serverLeaderboardCache[gameId]?.entries || [];
  },

  getLeaderboardForGame(gameId: string, profile?: UserProfile): GameLeaderboardResult | null {
    const game = GameCatalog.getById(gameId);
    if (!game || !game.leaderboardEnabled) {
      return null;
    }

    // Trigger backend fetch if not cached or expired (15 seconds)
    const cached = serverLeaderboardCache[gameId];
    if (!cached || Date.now() - cached.timestamp > 15000) {
      this.fetchGameLeaderboard(gameId);
    }

    const stats = this.getUserStats(gameId, profile);
    const userScore = stats.bestScore;

    // Use cached server entries if available
    const entries: GameLeaderboardEntry[] = cached?.entries ? cached.entries.map((e) => ({ ...e })) : [];

    // Find rank for current user
    let userRank = 0;
    if (userScore > 0) {
      userRank = 1;
      for (const entry of entries) {
        if (userScore < entry.score) {
          userRank++;
        }
      }

      const existingIndex = entries.findIndex((e) => e.isCurrentUser);
      if (existingIndex >= 0) {
        entries[existingIndex].score = Math.max(entries[existingIndex].score, userScore);
      } else if (userRank <= 10) {
        entries.splice(userRank - 1, 0, {
          rank: userRank,
          playerMasked: maskPhone(profile?.phoneNumber),
          playerName: profile?.displayName || 'You',
          score: userScore,
          rewardText: userRank <= 3 ? `${500 - (userRank - 1) * 150} Coins` : '100 Coins',
          isCurrentUser: true,
        });
        if (entries.length > 10) {
          entries.pop();
        }
      }
      entries.forEach((e, i) => {
        e.rank = i + 1;
      });
    }

    return {
      game,
      entries: entries.slice(0, 10),
      userRank: userScore > 0 ? userRank : 0,
      userScore,
      totalParticipants: Math.max(entries.length + (userScore > 0 && !entries.some((e) => e.isCurrentUser) ? 1 : 0), 1),
    };
  },
};

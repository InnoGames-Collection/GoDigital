/**
 * Color Rush - Real Player Leaderboard Engine
 * 
 * Complies with strict tournament criteria:
 * - Uses real player scores exclusively
 * - No fake users or simulated bots
 * - Supports per-level leaderboard corresponding to the selected level
 */

import { ColorRushProgression } from './types';

export interface RealLevelScoreRecord {
  id: string;
  level: number;
  playerName: string;
  playerAvatar: string;
  score: number;
  accuracy?: number;
  maxStreak?: number;
  timestamp: number;
}

const REAL_SCORES_STORAGE_KEY = 'teleplay_color_rush_real_level_scores_v1';

export function loadRealScores(): RealLevelScoreRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REAL_SCORES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to load Color Rush real scores', e);
    return [];
  }
}

export function saveRealLevelScore(record: {
  level: number;
  playerName: string;
  playerAvatar: string;
  score: number;
  accuracy?: number;
  maxStreak?: number;
}): void {
  if (typeof window === 'undefined' || record.score <= 0) return;

  try {
    const all = loadRealScores();
    const cleanName = (record.playerName || 'Player').trim();
    const existingIndex = all.findIndex(
      (r) => r.level === record.level && r.playerName.toLowerCase() === cleanName.toLowerCase()
    );

    if (existingIndex >= 0) {
      if (record.score >= all[existingIndex].score) {
        all[existingIndex] = {
          ...all[existingIndex],
          score: record.score,
          accuracy: record.accuracy ?? all[existingIndex].accuracy,
          maxStreak: record.maxStreak ?? all[existingIndex].maxStreak,
          playerAvatar: record.playerAvatar || all[existingIndex].playerAvatar,
          timestamp: Date.now(),
        };
      }
    } else {
      all.push({
        id: `cr_rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        level: record.level,
        playerName: cleanName,
        playerAvatar: record.playerAvatar || '⚡',
        score: record.score,
        accuracy: record.accuracy,
        maxStreak: record.maxStreak,
        timestamp: Date.now(),
      });
    }

    localStorage.setItem(REAL_SCORES_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn('Failed to save Color Rush real score', e);
  }
}

export function getRealLevelLeaderboard(params: {
  level: number;
  progression?: ColorRushProgression;
  playerName?: string;
  playerAvatar?: string;
}): {
  level: number;
  entries: (RealLevelScoreRecord & { rank: number; isPlayer?: boolean })[];
  playerRank: number | null;
  playerScore: number;
} {
  const { level, progression, playerName, playerAvatar } = params;
  const all = loadRealScores();
  const levelRecords = all.filter((r) => r.level === level);

  const cleanName = (playerName || 'Player').trim();
  const playerLevelBest = progression?.levelBestScores?.[level] || 0;

  // If the active player has a best score for this level in progression, ensure it is represented
  if (playerLevelBest > 0) {
    const foundIdx = levelRecords.findIndex(
      (r) => r.playerName.toLowerCase() === cleanName.toLowerCase()
    );
    if (foundIdx >= 0) {
      if (playerLevelBest > levelRecords[foundIdx].score) {
        levelRecords[foundIdx].score = playerLevelBest;
      }
    } else {
      levelRecords.push({
        id: `cr_active_${Date.now()}`,
        level,
        playerName: cleanName,
        playerAvatar: playerAvatar || '⚡',
        score: playerLevelBest,
        timestamp: Date.now(),
      });
    }
  }

  // Sort descending by score
  levelRecords.sort((a, b) => b.score - a.score);

  const entries = levelRecords.map((rec, idx) => ({
    ...rec,
    rank: idx + 1,
    isPlayer: rec.playerName.toLowerCase() === cleanName.toLowerCase(),
  }));

  const playerEntry = entries.find((e) => e.isPlayer);
  const playerRank = playerEntry ? playerEntry.rank : null;
  const playerScore = playerEntry ? playerEntry.score : playerLevelBest;

  return {
    level,
    entries,
    playerRank,
    playerScore,
  };
}

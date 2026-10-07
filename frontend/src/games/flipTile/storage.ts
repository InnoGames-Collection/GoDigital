import { FlipTileProgress, LevelRecord } from './types';

const STORAGE_KEY = 'goplay_flip_tile_progress_v1';

const DEFAULT_PROGRESS: FlipTileProgress = {
  unlockedLevel: 1,
  records: {},
  totalScore: 0,
};

export function loadFlipTileProgress(): FlipTileProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      unlockedLevel: Math.min(40, Math.max(1, parsed.unlockedLevel || 1)),
      records: parsed.records || {},
      totalScore: typeof parsed.totalScore === 'number' ? parsed.totalScore : 0,
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveFlipTileProgress(progress: FlipTileProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save Flip Tile progress:', e);
  }
}

export function saveLevelResult(
  levelNumber: number,
  score: number,
  playerPairs: number,
  botPairs: number,
  isVictory: boolean
): { progress: FlipTileProgress; isNewLevelUnlocked: boolean; stars: number } {
  const current = loadFlipTileProgress();

  let stars = 0;
  if (isVictory) {
    if (playerPairs >= botPairs + 4) stars = 3;
    else if (playerPairs > botPairs) stars = 2;
    else stars = 1;
  }

  const prevRec = current.records[levelNumber];
  const updatedRecord: LevelRecord = {
    completed: isVictory || (prevRec?.completed ?? false),
    stars: Math.max(stars, prevRec?.stars ?? 0),
    bestScore: Math.max(score, prevRec?.bestScore ?? 0),
    playerPairs: Math.max(playerPairs, prevRec?.playerPairs ?? 0),
    botPairs,
  };

  const nextLevel = Math.min(40, levelNumber + 1);
  const isNewLevelUnlocked = isVictory && nextLevel > current.unlockedLevel;
  const newUnlocked = isVictory ? Math.max(current.unlockedLevel, nextLevel) : current.unlockedLevel;

  const totalScore = Object.values({ ...current.records, [levelNumber]: updatedRecord }).reduce(
    (sum, r) => sum + (r?.bestScore || 0),
    0
  );

  const updated: FlipTileProgress = {
    unlockedLevel: newUnlocked,
    records: {
      ...current.records,
      [levelNumber]: updatedRecord,
    },
    totalScore: Math.max(current.totalScore, totalScore),
  };

  saveFlipTileProgress(updated);
  return { progress: updated, isNewLevelUnlocked, stars };
}

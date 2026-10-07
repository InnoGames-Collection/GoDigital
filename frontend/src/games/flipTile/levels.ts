import { FlipTileLevel } from './types';

// Emoji sets by theme
const ANIMAL_ICONS = ['🐶', '🐱', '🐻', '🦁', '🐸', '🦊', '🐼', '🐨', '🐰', '🐯', '🐵', '🦄', '🐧', '🦉', '🦋', '🐝', '🐙', '🐬'];
const FOOD_ICONS = ['🍕', '🍎', '🍩', '🥑', '🍔', '🌮', '🍦', '🍓', '🍉', '🍇', '🍒', '🍍', '🥐', '🧁', '🍿', '🍣', '🥞', '🥨'];
const NATURE_ICONS = ['🍃', '🌸', '🌙', '🐚', '🐟', '⭐', '☀️', '🌈', '🍀', '🌴', '🌻', '🍁', '🌊', '🍄', '🌺', '🌵', '❄️', '🔥'];
const TREASURE_ICONS = ['💎', '👑', '🚀', '⚡', '🔔', '🎯', '🎲', '🏆', '🎈', '🎁', '🎸', '⚽', '🚗', '✈️', '⚓', '🔮', '🔑', '🛡️'];

// Generate 40 Tournament Levels with progressive difficulty
export const FLIP_TILE_LEVELS: FlipTileLevel[] = Array.from({ length: 40 }, (_, idx) => {
  const levelNumber = idx + 1;

  // Grid sizing
  let rows = 4;
  let cols = 4;
  if (levelNumber >= 6 && levelNumber <= 15) {
    rows = 5;
    cols = 4; // 20 tiles = 10 pairs
  } else if (levelNumber >= 16 && levelNumber <= 25) {
    rows = 6;
    cols = 4; // 24 tiles = 12 pairs (exact board from reference video!)
  } else if (levelNumber >= 26 && levelNumber <= 35) {
    rows = 6;
    cols = 5; // 30 tiles = 15 pairs
  } else if (levelNumber >= 36) {
    rows = 6;
    cols = 6; // 36 tiles = 18 pairs
  }

  // Difficulty label
  let difficultyLabel: FlipTileLevel['difficultyLabel'] = 'NORMAL';
  if (levelNumber >= 5 && levelNumber < 15) difficultyLabel = 'HARD';
  else if (levelNumber >= 15 && levelNumber < 25) difficultyLabel = 'VERY HARD';
  else if (levelNumber >= 25 && levelNumber < 32) difficultyLabel = 'EXPERT';
  else if (levelNumber >= 32 && levelNumber < 38) difficultyLabel = 'TOURNAMENT';
  else if (levelNumber >= 38) difficultyLabel = 'MASTER';

  // Bot memory rate scales from 0.50 up to 1.0 (perfect photographic memory at Master tier)
  const botMemoryRate = Math.min(1.0, 0.5 + (levelNumber - 1) * 0.013);

  // Bot thinking speed (faster and sharper at high levels)
  const botThinkingSpeedMs = Math.max(450, 750 - levelNumber * 7);

  // Palettes (Cycling color variations per level)
  const tilePalettes = [
    { back: '#F5A623', border: '#D97706' }, // Mustard/Gold (Video exact)
    { back: '#3B82F6', border: '#1D4ED8' }, // Cobalt Blue
    { back: '#10B981', border: '#047857' }, // Emerald Green
    { back: '#8B5CF6', border: '#6D28D9' }, // Royal Purple
    { back: '#EC4899', border: '#BE185D' }, // Candy Pink
    { back: '#F97316', border: '#C2410C' }, // Tangerine Orange
    { back: '#06B6D4', border: '#0E7490' }, // Vivid Cyan
    { back: '#E11D48', border: '#9F1239' }, // Ruby Red
  ];
  const palette = tilePalettes[idx % tilePalettes.length];

  // Theme sets cycling
  const themePools = [NATURE_ICONS, FOOD_ICONS, ANIMAL_ICONS, TREASURE_ICONS];
  const icons = themePools[idx % themePools.length];

  return {
    levelNumber,
    name: `Arena Stage ${levelNumber}`,
    difficultyLabel,
    rows,
    cols,
    botMemoryRate,
    botThinkingSpeedMs,
    tileBackColor: palette.back,
    tileBackBorder: palette.border,
    playerBgColor: '#FFAAA6', // Soft Coral/Pink on Player Turn (exact from video)
    botBgColor: '#A5B4FC', // Soft Lavender/Indigo on Bot Turn (exact from video)
    icons,
  };
});

export function getFlipTileLevel(levelNum: number): FlipTileLevel {
  const lvl = FLIP_TILE_LEVELS.find((l) => l.levelNumber === levelNum);
  return lvl || FLIP_TILE_LEVELS[0];
}

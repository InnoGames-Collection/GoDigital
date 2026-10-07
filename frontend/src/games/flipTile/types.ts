export type FlipTileScreen = 'menu' | 'level-select' | 'gameplay';

export type TurnOwner = 'player' | 'bot';

export interface TileItem {
  id: number;
  pairId: number;
  icon: string; // Emoji / Symbol
  isFlipped: boolean;
  isMatched: boolean;
  flippedBy?: TurnOwner;
}

export interface FlipTileLevel {
  levelNumber: number;
  name: string;
  difficultyLabel: 'NORMAL' | 'HARD' | 'VERY HARD' | 'EXPERT' | 'TOURNAMENT' | 'MASTER';
  rows: number;
  cols: number; // e.g. 4x4=16, 4x5=20, 4x6=24, 5x6=30, 6x6=36
  botMemoryRate: number; // 0.45 to 1.0 (probability of remembering seen tiles)
  botThinkingSpeedMs: number; // 500ms - 800ms
  tileBackColor: string; // Color of tile back face
  tileBackBorder: string;
  playerBgColor: string; // Turn background
  botBgColor: string;
  icons: string[];
}

export interface LevelRecord {
  completed: boolean;
  stars: number;
  bestScore: number;
  playerPairs: number;
  botPairs: number;
}

export interface FlipTileProgress {
  unlockedLevel: number;
  records: Record<number, LevelRecord>;
  totalScore: number;
}

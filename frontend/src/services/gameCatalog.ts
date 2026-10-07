/**
 * GameON Tele - Data-Driven Game Catalog (Designed for 100+ Games)
 * Scalable Game Discovery, Category Classification, and Access Models.
 */

import { getGameArtworkUrl } from './gameArtwork';

export type GameAccessType = 'FREE' | 'COIN' | 'SUBSCRIPTION' | 'PURCHASE' | 'TRIAL';

export interface GameSubscriptionOptions {
  daily?: { enabled: boolean; priceETB: number };
  weekly?: { enabled: boolean; priceETB: number };
  monthly?: { enabled: boolean; priceETB: number };
}

export interface CatalogGame {
  gameId: string;
  gameName: string;
  titleAmharic: string;
  category: 'Action' | 'Arcade' | 'Puzzle' | 'Racing' | 'Sports' | 'Adventure' | 'Board' | 'Music' | 'Casual' | 'Strategy' | 'Other';
  genre: string;
  tagline: string;
  description: string;
  thumbnail: string;
  banner: string;
  accessType: GameAccessType;
  price?: number; // for ONE-TIME PURCHASE
  billingPeriod?: ('daily' | 'weekly' | 'monthly')[];
  isFeatured: boolean;
  isActive: boolean;
  isNew: boolean;
  isRecommended?: boolean;
  isFree: boolean;
  requiresCoins: boolean;
  coinCost: number;
  subscriptionOptions?: GameSubscriptionOptions;
  leaderboardEnabled: boolean;
  sortOrder: number;
  providerId?: string;
  providerName?: string;
  rating: number;
  playsCount: number;
  instructions: string[];
  controlsDescription: string;
  primaryColor: string;
  secondaryColor: string;
}

export const ALL_STANDARD_CATEGORIES = [
  'All Games',
  'Action',
  'Arcade',
  'Puzzle',
  'Racing',
  'Sports',
  'Adventure',
  'Board',
  'Music',
  'Casual',
  'Strategy',
  'Other',
] as const;

export const MANDATORY_CATALOG_ORDER = [
  'helix-jump', // 1
  'bubble-shooter', // 2
  'emoji-iq', // 3
  'royal-water-sort', // 4
  'hill-rider', // 5
  'sorting-balls', // 6
  'puzzle-block', // 7
  'memory-match', // 8
  'color-rush', // 9
  'solitaire', // 10
  'emoji-sorting-ball', // 11
  'flip-tile', // 12
] as const;

export const INITIAL_GAME_CATALOG: CatalogGame[] = [
  {
    gameId: 'helix-jump',
    gameName: 'Helix Jump',
    titleAmharic: 'ሄሊክስ ጃምፕ',
    category: 'Arcade',
    genre: '3D Cylinder Tower Drop Arcade',
    tagline: 'Rotate the central tower, drop through gaps, and conquer 40 levels!',
    description: 'The definitive 40-level 3D Helix Jump experience. Swipe horizontally to rotate the cylindrical tower, guide the bouncing ball through open gaps, land on safe sectors, and trigger fiery multi-level combo smashes.',
    thumbnail: getGameArtworkUrl('helix-jump'),
    banner: getGameArtworkUrl('helix-jump'),
    accessType: 'COIN',
    isFree: false,
    requiresCoins: true,
    coinCost: 2,
    isFeatured: true,
    isRecommended: true,
    isActive: true,
    isNew: true,
    leaderboardEnabled: true,
    sortOrder: 0,
    providerId: 'prv_goplay_core',
    providerName: 'GoPlay Studios',
    rating: 4.99,
    playsCount: 620000,
    primaryColor: '#0284c7',
    secondaryColor: '#f59e0b',
    instructions: [
      'Swipe or drag left and right on the screen to rotate the central helix tower',
      'Align open gaps directly underneath the bouncing ball to descend through the rings',
      'Avoid red or orange danger platform sectors that shatter the ball',
    ],
    controlsDescription: 'Swipe left/right to rotate tower. Drag finger or mouse horizontally.',
  },
  {
    gameId: 'bubble-shooter',
    gameName: 'Bubble Shooter',
    titleAmharic: 'ባብል ሹተር',
    category: 'Puzzle',
    genre: 'Hexagonal Bubble Match',
    tagline: 'Aim, reflect wall bank shots, and pop dense glossy bubble clusters!',
    description: 'The tournament edition of the classic Bubble Shooter. Aim the precision dotted laser guide, calculate tactical wall bank shots, trigger satisfying cluster drop cascades, and conquer 40 progressive stages.',
    thumbnail: getGameArtworkUrl('bubble-shooter'),
    banner: getGameArtworkUrl('bubble-shooter'),
    accessType: 'FREE',
    isFree: true,
    requiresCoins: false,
    coinCost: 0,
    isFeatured: false,
    isRecommended: false,
    isActive: true,
    isNew: false,
    leaderboardEnabled: true,
    sortOrder: 1,
    providerId: 'prv_goplay_core',
    providerName: 'GoPlay Studios',
    rating: 4.98,
    playsCount: 230000,
    primaryColor: '#1788E8',
    secondaryColor: '#071626',
    instructions: [
      'Touch and drag in the lower area to aim the dotted trajectory guide',
      'Bounce shots off side walls to reach concealed high-value color clusters',
      'Connect 3 or more matching bubbles to pop them and drop unsupported clusters',
    ],
    controlsDescription: 'Drag to aim, release to shoot. Tap swap button to exchange next bubble.',
  },
  {
    gameId: 'emoji-iq',
    gameName: 'EMOJI IQ',
    titleAmharic: 'ኢሞጂ አይኪው',
    category: 'Puzzle',
    genre: 'Tournament Emoji & Number Calculation Challenge',
    tagline: 'Master 40 stages of emoji equations, logical calculations & tournament scoring!',
    description: 'The official EMOJI IQ tournament arena. Solve 12 unique emoji equation puzzle categories across 40 progressive stages with multi-step calculations, order of operations, changed quantities, visual differences, combos, hints, lives, store, and competitive leaderboard.',
    thumbnail: getGameArtworkUrl('emoji-iq'),
    banner: getGameArtworkUrl('emoji-iq'),
    accessType: 'FREE',
    isFree: true,
    requiresCoins: false,
    coinCost: 0,
    isFeatured: true,
    isRecommended: true,
    isActive: true,
    isNew: true,
    leaderboardEnabled: true,
    sortOrder: 2,
    providerId: 'prv_goplay_core',
    providerName: 'GoPlay Studios',
    rating: 4.99,
    playsCount: 380000,
    primaryColor: '#6C5CE7',
    secondaryColor: '#00B8D9',
    instructions: [
      'Deduce the numerical values of emojis from the clue equations',
      'Mind the order of operations (PEMDAS): calculate multiplication and division first',
      'Watch for changes in emoji quantity (pairs vs singles) and visual differences',
      'Answer quickly without hints to claim +30% speed bonuses and ⭐ PERFECT! badges',
    ],
    controlsDescription: 'Tap the correct numerical answer tile.',
  },
  {
    gameId: 'royal-water-sort',
    gameName: 'Royal Water Sort',
    titleAmharic: 'ሮያል ወተር ሶርት',
    category: 'Puzzle',
    genre: '3D Royal Glass Water Sort Puzzle',
    tagline: 'Pour glossy liquid into 3D glass bottles, unlock golden corks, and conquer 40 Championship levels!',
    description: 'The premier 3D glass liquid sorting puzzle experience. Select crystal vials, pour vibrant liquid layers, plan complex multi-color transfers, use Undo, Shuffle & Extra Tube boosters, and conquer 40 Very Difficult royal championship levels.',
    thumbnail: getGameArtworkUrl('royal-water-sort'),
    banner: getGameArtworkUrl('royal-water-sort'),
    accessType: 'FREE',
    isFree: true,
    requiresCoins: false,
    coinCost: 0,
    isFeatured: true,
    isRecommended: true,
    isActive: true,
    isNew: true,
    leaderboardEnabled: true,
    sortOrder: 3,
    providerId: 'prv_goplay_core',
    providerName: 'GoPlay Studios',
    rating: 4.99,
    playsCount: 310000,
    primaryColor: '#38BDF8',
    secondaryColor: '#FFD54F',
    instructions: [
      'Tap a glass bottle to lift and select it',
      'Tap another bottle to tilt and pour its top matching liquid group',
      'Fill each bottle with a single pure color to lock its golden cork and complete the level',
    ],
    controlsDescription: 'Tap source bottle, then tap destination bottle to pour.',
  },
  {
    gameId: 'hill-rider',
    gameName: 'Hill Climb',
    titleAmharic: 'ሂል ክላይምብ',
    category: 'Racing',
    genre: 'Highland Physics Driving',
    tagline: 'Conquer steep highland ridges and rugged mountain terrains!',
    description: 'Physics-based 2D hill climbing driving game. Control acceleration and vehicle pitch balance over steep highland hills, rocky gorges, and suspension bridges to reach the summit.',
    thumbnail: getGameArtworkUrl('hill-rider'),
    banner: getGameArtworkUrl('hill-rider'),
    accessType: 'FREE',
    isFree: true,
    requiresCoins: false,
    coinCost: 0,
    isFeatured: false,
    isRecommended: true,
    isActive: true,
    isNew: false,
    leaderboardEnabled: true,
    sortOrder: 4,
    providerId: 'prv_goplay_core',
    providerName: 'GoPlay Studios',
    rating: 4.7,
    playsCount: 119800,
    primaryColor: '#0B3B70',
    secondaryColor: '#70C922',
    instructions: [
      'Hold Gas (Right) to accelerate uphill and release on steep drops to maintain traction',
      'Use Brake / Tilt (Left) to slow down and stabilize buggy balance mid-air',
      'Collect fuel jerrycans along the track before your vehicle engine runs dry',
    ],
    controlsDescription: 'Tap/hold Gas (Right) & Brake (Left) on screen, or use Arrow keys.',
  },
  {
    gameId: 'sorting-balls',
    gameName: 'Sorting Ball',
    titleAmharic: 'ሶርቲንግ ቦል',
    category: 'Puzzle',
    genre: '3D Color Sorting Puzzle',
    tagline: 'Sort vibrant glossy 3D spheres into glass cylinders across 40 mind-bending levels!',
    description: 'A beautifully relaxing and cerebral 3D color sorting puzzle. Strategically transfer colored spheres between glass cylinders until each tube contains exclusively identical colors.',
    thumbnail: getGameArtworkUrl('sorting-balls'),
    banner: getGameArtworkUrl('sorting-balls'),
    accessType: 'FREE',
    isFree: true,
    requiresCoins: false,
    coinCost: 0,
    isFeatured: false,
    isRecommended: true,
    isActive: true,
    isNew: false,
    leaderboardEnabled: true,
    sortOrder: 5,
    providerId: 'prv_goplay_core',
    providerName: 'GoPlay Studios',
    rating: 4.99,
    playsCount: 215000,
    primaryColor: '#FF8A00',
    secondaryColor: '#171B26',
    instructions: [
      'Tap any tube to select its top ball, then tap another valid tube to transfer it',
      'A ball can only be placed into an empty tube or on top of a matching color',
      'Sort all balls of each color into their dedicated tubes to solve the puzzle',
    ],
    controlsDescription: 'Tap source tube to lift ball, tap destination tube to drop.',
  },
  {
    gameId: 'puzzle-block',
    gameName: 'Block',
    titleAmharic: 'ብሎክ',
    category: 'Puzzle',
    genre: '10x10 Wooden Block Puzzle',
    tagline: 'Place polyomino blocks on the 10x10 wooden board and clear full rows and columns!',
    description: 'The definitive 10x10 wooden block puzzle experience. Features 40 progressive championship levels, real drag & drop with touch-elevation offset, wood/ice/stone blockers, bomb blocks, and multi-line combo feedback.',
    thumbnail: getGameArtworkUrl('puzzle-block'),
    banner: getGameArtworkUrl('puzzle-block'),
    accessType: 'FREE',
    isFree: true,
    requiresCoins: false,
    coinCost: 0,
    isFeatured: true,
    isRecommended: true,
    isActive: true,
    isNew: true,
    leaderboardEnabled: true,
    sortOrder: 6,
    providerId: 'prv_goplay_core',
    providerName: 'GoPlay Studios',
    rating: 4.99,
    playsCount: 520000,
    primaryColor: '#8a3f20',
    secondaryColor: '#f59e0b',
    instructions: [
      'Touch and drag block shapes from the bottom 3-piece tray onto the 10x10 board',
      'Fill complete 10-cell horizontal rows or vertical columns to collapse them',
      'Clear multiple lines simultaneously to trigger massive combo multipliers',
    ],
    controlsDescription: 'Touch and drag pieces onto the 10x10 board. Release over valid cells to place.',
  },
  {
    gameId: 'memory-match',
    gameName: 'Memory Match',
    titleAmharic: 'ሜሞሪ ማች',
    category: 'Puzzle',
    genre: '3D Memory Card Pair Matching',
    tagline: 'Test your photographic memory and uncover legendary matching relics!',
    description: 'A premium, high-stakes memory matching experience. Flip beautifully beveled 3D cards, remember mysterious symbols and ancient artifacts, and uncover matching pairs across challenging stages.',
    thumbnail: getGameArtworkUrl('memory-match'),
    banner: getGameArtworkUrl('memory-match'),
    accessType: 'FREE',
    isFree: true,
    requiresCoins: false,
    coinCost: 0,
    isFeatured: false,
    isRecommended: false,
    isActive: true,
    isNew: false,
    leaderboardEnabled: true,
    sortOrder: 7,
    providerId: 'prv_goplay_core',
    providerName: 'GoPlay Studios',
    rating: 4.95,
    playsCount: 142000,
    primaryColor: '#0B3B70',
    secondaryColor: '#8BCB3D',
    instructions: [
      'Tap face-down cards to reveal their hidden ancient symbol',
      'Find and match identical pairs to clear the board before time runs out',
      'Build consecutive match streaks to multiply your score and earn 3 gold stars',
    ],
    controlsDescription: 'Tap or click any card to flip.',
  },
  {
    gameId: 'color-rush',
    gameName: 'Color Rush',
    titleAmharic: 'ከለር ረሽ',
    category: 'Arcade',
    genre: 'Reflex Speed Timing Arcade',
    tagline: 'Test your lightning-fast reflex timing against the chromatic rush!',
    description: 'High-speed reflex reaction test. Match incoming chromatic neon pulses and rotating color gates before the countdown runs out. Speed increases with every successful combo!',
    thumbnail: getGameArtworkUrl('color-rush'),
    banner: getGameArtworkUrl('color-rush'),
    accessType: 'FREE',
    isFree: true,
    requiresCoins: false,
    coinCost: 0,
    isFeatured: false,
    isRecommended: true,
    isActive: true,
    isNew: false,
    leaderboardEnabled: true,
    sortOrder: 8,
    providerId: 'prv_goplay_core',
    providerName: 'GoPlay Studios',
    rating: 4.8,
    playsCount: 132600,
    primaryColor: '#70C922',
    secondaryColor: '#0B3B70',
    instructions: [
      'Watch the target color flash on screen and tap the matching color paddle immediately',
      'Keep your reaction streak alive to trigger the 3x Multiplier Fever mode',
      'Avoid incorrect taps which instantly break your combo streak and cost a life',
    ],
    controlsDescription: 'Tap color buttons or press Arrow keys in rapid sequence.',
  },
  {
    gameId: 'solitaire',
    gameName: 'Solitaire',
    titleAmharic: 'ሶሊቴር',
    category: 'Puzzle',
    genre: 'Classic Klondike Solitaire',
    tagline: 'Master authentic 52-card Klondike Solitaire across 40 championship levels!',
    description: 'The definitive Klondike Solitaire experience. Features Draw 1 and Draw 3 modes, authentic playing card artwork, deep emerald felt table acoustics, 40 progressive levels, daily challenge deals, unlimited undo, smart hints, and auto-complete.',
    thumbnail: getGameArtworkUrl('solitaire'),
    banner: getGameArtworkUrl('solitaire'),
    accessType: 'FREE',
    isFree: true,
    requiresCoins: false,
    coinCost: 0,
    isFeatured: true,
    isRecommended: true,
    isActive: true,
    isNew: false,
    leaderboardEnabled: true,
    sortOrder: 9,
    providerId: 'prv_goplay_core',
    providerName: 'GoPlay Studios',
    rating: 4.99,
    playsCount: 485000,
    primaryColor: '#007a40',
    secondaryColor: '#ffd54f',
    instructions: [
      'Stack cards in descending order (King down to Ace) in alternating red and black suits',
      'Build the 4 foundation piles from Ace to King by suit',
      'Draw from the stock pile to discover new strategic cards',
    ],
    controlsDescription: 'Tap any card to auto-move, or drag and place freely. Tap stock to draw.',
  },
  {
    gameId: 'emoji-sorting-ball',
    gameName: 'EMOJI SORTING BALL',
    titleAmharic: 'ኢሞጂ ሶርቲንግ ቦል',
    category: 'Puzzle',
    genre: '3D Emoji Sorting Tournament Puzzle',
    tagline: 'Sort stylized 3D emoji vinyl spheres into color-coded crystal tubes across 40 levels!',
    description: 'The premier 3D Emoji Sorting tournament challenge. Transfer identical emoji spheres between vibrant tubes, utilize sequential multi-ball transfers, manage undos, hints, and buffer tubes, and maximize your tournament par efficiency.',
    thumbnail: getGameArtworkUrl('emoji-sorting-ball'),
    banner: getGameArtworkUrl('emoji-sorting-ball'),
    accessType: 'FREE',
    isFree: true,
    requiresCoins: false,
    coinCost: 0,
    isFeatured: true,
    isRecommended: true,
    isActive: true,
    isNew: true,
    leaderboardEnabled: true,
    sortOrder: 10,
    providerId: 'prv_goplay_core',
    providerName: 'GoPlay Studios',
    rating: 4.99,
    playsCount: 280000,
    primaryColor: '#8B5CF6',
    secondaryColor: '#F472B6',
    instructions: [
      'Tap any tube to lift top emoji ball(s), then tap destination tube with matching emoji or empty space',
      'Contiguous matching emojis transfer together in a coordinated sequential wave',
      'Finish each puzzle in minimum moves to earn 3 stars and tournament Par bonus score',
      'Use Undo (-50 PTS), Hints (-150 PTS), or Add Extra Tube (-250 PTS) when stuck',
    ],
    controlsDescription: 'Tap source tube to select emoji, tap destination tube to transfer.',
  },
  {
    gameId: 'flip-tile',
    gameName: 'Flip Tile',
    titleAmharic: 'ፍሊፕ ታይል',
    category: 'Puzzle',
    genre: 'Turn-Based Memory Duel',
    tagline: 'Flip matching tiles, outsmart the AI opponent, and conquer 40 levels!',
    description: 'Turn-based tile memory duel featuring 40 handcrafted tournament stages with strategic AI bot, dynamic board palettes, and progressive difficulty.',
    thumbnail: getGameArtworkUrl('flip-tile'),
    banner: getGameArtworkUrl('flip-tile'),
    accessType: 'FREE',
    isFree: true,
    requiresCoins: false,
    coinCost: 0,
    isFeatured: true,
    isRecommended: true,
    isActive: true,
    isNew: true,
    leaderboardEnabled: true,
    sortOrder: 11,
    providerId: 'prv_godigital_core',
    providerName: 'GoDigital Studios',
    rating: 4.95,
    playsCount: 280000,
    primaryColor: '#f59e0b',
    secondaryColor: '#d97706',
    instructions: [
      'Tap any face-down tile to flip and reveal its icon',
      'Match 2 identical icons to claim the pair and remove them from the board',
      'Claiming a pair gives you an immediate extra turn',
      'The player with the most matching pairs when the board clears wins the stage',
    ],
    controlsDescription: 'Tap any face-down tile to flip. 100% mobile touch and desktop mouse responsive.',
  }
];

export const GameCatalog = {
  getAll(): CatalogGame[] {
    const orderIndexMap = new Map(MANDATORY_CATALOG_ORDER.map((id, idx) => [id, idx]));
    return INITIAL_GAME_CATALOG.filter((g) => g.isActive)
      .sort((a, b) => (orderIndexMap.get(a.gameId as any) ?? 999) - (orderIndexMap.get(b.gameId as any) ?? 999))
      .map((g) => {
        const art = getGameArtworkUrl(g.gameId);
        return art ? { ...g, thumbnail: art, banner: art } : g;
      });
  },

  getById(gameId: string): CatalogGame | undefined {
    const g = INITIAL_GAME_CATALOG.find((g) => g.gameId === gameId);
    if (!g) return undefined;
    const art = getGameArtworkUrl(g.gameId);
    return art ? { ...g, thumbnail: art, banner: art } : g;
  },

  getByCategory(category: string): CatalogGame[] {
    if (category === 'All Games') {
      return this.getAll();
    }
    return this.getAll().filter((g) => g.category.toLowerCase() === category.toLowerCase());
  },

  /**
   * Only return categories that currently contain active games, with 'All Games' first
   */
  getCategoriesWithGames(): string[] {
    const categoriesSet = new Set<string>();
    this.getAll().forEach((game) => {
      categoriesSet.add(game.category);
    });

    // Ensure order conforms to ALL_STANDARD_CATEGORIES
    const ordered = ALL_STANDARD_CATEGORIES.filter(
      (cat) => cat === 'All Games' || categoriesSet.has(cat)
    );
    return ordered as unknown as string[];
  },

  getFeatured(): CatalogGame[] {
    return this.getAll().filter((g) => g.isFeatured);
  },

  getRecommended(): CatalogGame[] {
    return this.getAll().filter((g) => g.isRecommended);
  },

  getRecentlyPlayed(ids: string[]): CatalogGame[] {
    if (!ids || ids.length === 0) return [];
    return ids
      .map((id) => this.getById(id))
      .filter((g): g is CatalogGame => Boolean(g));
  },

  search(query: string): CatalogGame[] {
    if (!query.trim()) return this.getAll();
    const q = query.toLowerCase().trim();
    return this.getAll().filter(
      (g) =>
        g.gameName.toLowerCase().includes(q) ||
        g.titleAmharic.includes(query) ||
        g.category.toLowerCase().includes(q) ||
        g.tagline.toLowerCase().includes(q) ||
        g.genre.toLowerCase().includes(q)
    );
  },
};

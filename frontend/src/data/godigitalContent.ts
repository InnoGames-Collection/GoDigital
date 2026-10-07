/**
 * Canonical Content Source of Truth - GODIGITAL_GAMES_CONTENT
 * Supplies text and structured rule breakdowns for all 12 games.
 */

export interface GameContentDetails {
  id: string;
  name: string;
  genre: string;
  competitionCycle: 'weekly' | 'monthly';
  overview: string;
  howToPlay: string[];
  skillFocus: string[];
  gameDuration?: string;
  gameDurationNotes?: string[];
  difficultyProgression?: { range: string; activeBalloons: string; speed: string; diameter: string }[];
  balloonColors?: { name: string; hex: string }[];
  visualDirection?: string;
  visualRule?: string;
  importantRules?: string[];
}

export const GODIGITAL_GAMES_CONTENT: GameContentDetails[] = [
  {
    id: 'helix-jump',
    name: 'Helix Jump',
    genre: 'Arcade',
    competitionCycle: 'weekly',
    overview: 'The definitive 40-level 3D Helix Jump experience. Swipe horizontally to rotate the cylindrical tower, guide the bouncing ball through open gaps, land on safe sectors, and trigger fiery multi-level combo smashes.',
    howToPlay: [
      'Launch the game from the portal.',
      'Master the touch or mouse controls to conquer challenges.',
      'Achieve high scores to claim tournament prizes and top the leaderboards.'
    ],
    skillFocus: ['Hand-eye coordination', 'Reflex timing', 'Strategy', 'Precision']
  },
  {
    id: 'bubble-shooter',
    name: 'Bubble Shooter',
    genre: 'Puzzle',
    competitionCycle: 'weekly',
    overview: 'The tournament edition of the classic Bubble Shooter. Aim the precision dotted laser guide, calculate tactical wall bank shots, trigger satisfying cluster drop cascades, and conquer 40 progressive stages.',
    howToPlay: [
      'Launch the game from the portal.',
      'Master the touch or mouse controls to conquer challenges.',
      'Achieve high scores to claim tournament prizes and top the leaderboards.'
    ],
    skillFocus: ['Hand-eye coordination', 'Reflex timing', 'Strategy', 'Precision']
  },
  {
    id: 'emoji-iq',
    name: 'EMOJI IQ',
    genre: 'Puzzle',
    competitionCycle: 'weekly',
    overview: 'The official EMOJI IQ tournament arena. Solve 12 unique emoji equation puzzle categories across 40 progressive stages with multi-step calculations, order of operations, changed quantities, visual differences, combos, hints, lives, store, and competitive leaderboard.',
    howToPlay: [
      'Launch the game from the portal.',
      'Master the touch or mouse controls to conquer challenges.',
      'Achieve high scores to claim tournament prizes and top the leaderboards.'
    ],
    skillFocus: ['Hand-eye coordination', 'Reflex timing', 'Strategy', 'Precision']
  },
  {
    id: 'royal-water-sort',
    name: 'Royal Water Sort',
    genre: 'Puzzle',
    competitionCycle: 'weekly',
    overview: 'The premier 3D glass liquid sorting puzzle experience. Select crystal vials, pour vibrant liquid layers, plan complex multi-color transfers, use Undo, Shuffle & Extra Tube boosters, and conquer 40 Very Difficult royal championship levels.',
    howToPlay: [
      'Launch the game from the portal.',
      'Master the touch or mouse controls to conquer challenges.',
      'Achieve high scores to claim tournament prizes and top the leaderboards.'
    ],
    skillFocus: ['Hand-eye coordination', 'Reflex timing', 'Strategy', 'Precision']
  },
  {
    id: 'hill-rider',
    name: 'Hill Climb',
    genre: 'Racing',
    competitionCycle: 'weekly',
    overview: 'Physics-based 2D hill climbing driving game. Control acceleration and vehicle pitch balance over steep highland hills, rocky gorges, and suspension bridges to reach the summit.',
    howToPlay: [
      'Launch the game from the portal.',
      'Master the touch or mouse controls to conquer challenges.',
      'Achieve high scores to claim tournament prizes and top the leaderboards.'
    ],
    skillFocus: ['Hand-eye coordination', 'Reflex timing', 'Strategy', 'Precision']
  },
  {
    id: 'sorting-balls',
    name: 'Sorting Ball',
    genre: 'Puzzle',
    competitionCycle: 'weekly',
    overview: 'A beautifully relaxing and cerebral 3D color sorting puzzle. Strategically transfer colored spheres between glass cylinders until each tube contains exclusively identical colors.',
    howToPlay: [
      'Launch the game from the portal.',
      'Master the touch or mouse controls to conquer challenges.',
      'Achieve high scores to claim tournament prizes and top the leaderboards.'
    ],
    skillFocus: ['Hand-eye coordination', 'Reflex timing', 'Strategy', 'Precision']
  },
  {
    id: 'puzzle-block',
    name: 'Block',
    genre: 'Puzzle',
    competitionCycle: 'weekly',
    overview: 'The definitive 10x10 wooden block puzzle experience. Features 40 progressive championship levels, real drag & drop with touch-elevation offset, wood/ice/stone blockers, bomb blocks, and multi-line combo feedback.',
    howToPlay: [
      'Launch the game from the portal.',
      'Master the touch or mouse controls to conquer challenges.',
      'Achieve high scores to claim tournament prizes and top the leaderboards.'
    ],
    skillFocus: ['Hand-eye coordination', 'Reflex timing', 'Strategy', 'Precision']
  },
  {
    id: 'memory-match',
    name: 'Memory Match',
    genre: 'Puzzle',
    competitionCycle: 'weekly',
    overview: 'A premium, high-stakes memory matching experience. Flip beautifully beveled 3D cards, remember mysterious symbols and ancient artifacts, and uncover matching pairs across challenging stages.',
    howToPlay: [
      'Launch the game from the portal.',
      'Master the touch or mouse controls to conquer challenges.',
      'Achieve high scores to claim tournament prizes and top the leaderboards.'
    ],
    skillFocus: ['Hand-eye coordination', 'Reflex timing', 'Strategy', 'Precision']
  },
  {
    id: 'color-rush',
    name: 'Color Rush',
    genre: 'Arcade',
    competitionCycle: 'weekly',
    overview: 'High-speed reflex reaction test. Match incoming chromatic neon pulses and rotating color gates before the countdown runs out. Speed increases with every successful combo!',
    howToPlay: [
      'Launch the game from the portal.',
      'Master the touch or mouse controls to conquer challenges.',
      'Achieve high scores to claim tournament prizes and top the leaderboards.'
    ],
    skillFocus: ['Hand-eye coordination', 'Reflex timing', 'Strategy', 'Precision']
  },
  {
    id: 'solitaire',
    name: 'Solitaire',
    genre: 'Puzzle',
    competitionCycle: 'weekly',
    overview: 'The definitive Klondike Solitaire experience. Features Draw 1 and Draw 3 modes, authentic playing card artwork, deep emerald felt table acoustics, 40 progressive levels, daily challenge deals, unlimited undo, smart hints, and auto-complete.',
    howToPlay: [
      'Launch the game from the portal.',
      'Master the touch or mouse controls to conquer challenges.',
      'Achieve high scores to claim tournament prizes and top the leaderboards.'
    ],
    skillFocus: ['Hand-eye coordination', 'Reflex timing', 'Strategy', 'Precision']
  },
  {
    id: 'emoji-sorting-ball',
    name: 'EMOJI SORTING BALL',
    genre: 'Puzzle',
    competitionCycle: 'weekly',
    overview: 'The premier 3D Emoji Sorting tournament challenge. Transfer identical emoji spheres between vibrant tubes, utilize sequential multi-ball transfers, manage undos, hints, and buffer tubes, and maximize your tournament par efficiency.',
    howToPlay: [
      'Launch the game from the portal.',
      'Master the touch or mouse controls to conquer challenges.',
      'Achieve high scores to claim tournament prizes and top the leaderboards.'
    ],
    skillFocus: ['Hand-eye coordination', 'Reflex timing', 'Strategy', 'Precision']
  },
  {
    id: 'flip-tile',
    name: 'Flip Tile',
    genre: 'Puzzle',
    competitionCycle: 'weekly',
    overview: 'Turn-based tile memory duel featuring 40 handcrafted tournament stages with strategic AI bot, dynamic board palettes, and progressive difficulty.',
    howToPlay: [
      'Launch the game from the portal.',
      'Master the touch or mouse controls to conquer challenges.',
      'Achieve high scores to claim tournament prizes and top the leaderboards.'
    ],
    skillFocus: ['Hand-eye coordination', 'Reflex timing', 'Strategy', 'Precision']
  }
];

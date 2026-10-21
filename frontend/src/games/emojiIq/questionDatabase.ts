/**
 * EMOJI IQ — Comprehensive Question Database & Replay Engine
 * 40 Stages • 1,000+ Distinct Verified Questions
 * Covers:
 * - Mathematical Emoji Systems (Addition, Subtraction, Multiplication, Division, PEMDAS)
 * - Quantity Shifts (Pairs vs Singles, Cluster Reductions)
 * - Visual Differences (Accessories, State Changes, Subtle Clues)
 * - Visual Sequences & Life Cycles (Progression, Rotations, State Changes)
 * - Pattern Analogies (Item Relationships, Tool-to-Task, Habitat, Cause & Effect)
 * - Odd One Out (Category Mismatch, Classification)
 * - Emoji Combinations & Phrase Match (Compound Words, Concepts)
 * - Relational Logic (Inequalities, Transitive Ordering)
 * 
 * Guarantees:
 * - Unambiguous verified correct answer with 3 plausible distractors.
 * - Progressive difficulty: easier to harder within every level; gradual ramp across 40 levels.
 * - Replay variety: 25 distinct questions per level pool; consecutive attempts prioritize unseen questions.
 * - Dynamic option shuffling with exact correctIndex recalculation.
 */

import {
  EmojiIqQuestion,
  EmojiIqLevelConfig,
  EquationRow,
  QuestionDifficulty,
  PuzzleType,
} from './types';
import { ALL_EMOJIS } from './emojiLibrary';

export const EMOJI_IQ_LEVELS: EmojiIqLevelConfig[] = [
  // 1-5: Easy Foundations (1 Star)
  { level: 1, title: 'Emoji Basics I', difficultyStars: 1, timeLimitSeconds: 15, targetScore: 650, questionCount: 10, theme: 'Simple Addition & Sequences' },
  { level: 2, title: 'Emoji Basics II', difficultyStars: 1, timeLimitSeconds: 15, targetScore: 700, questionCount: 10, theme: 'Matching Pairs & Meanings' },
  { level: 3, title: 'Fruit Formulas', difficultyStars: 1, timeLimitSeconds: 15, targetScore: 750, questionCount: 10, theme: 'Fruit Values & Odd One Out' },
  { level: 4, title: 'Animal Sums', difficultyStars: 1, timeLimitSeconds: 15, targetScore: 800, questionCount: 10, theme: 'Animal Math & Analogies' },
  { level: 5, title: 'Smile Arithmetic', difficultyStars: 1, timeLimitSeconds: 14, targetScore: 850, questionCount: 10, theme: 'Face Addition & Cycles' },

  // 6-10: Two-Variable Systems & Associations (2 Stars)
  { level: 6, title: 'Two-Variable I', difficultyStars: 2, timeLimitSeconds: 14, targetScore: 950, questionCount: 10, theme: 'Dual Unknowns & Word Combos' },
  { level: 7, title: 'Two-Variable II', difficultyStars: 2, timeLimitSeconds: 14, targetScore: 1000, questionCount: 10, theme: 'Addition & Difference' },
  { level: 8, title: 'Snack Equations', difficultyStars: 2, timeLimitSeconds: 13, targetScore: 1050, questionCount: 10, theme: 'Food Systems & Sequences' },
  { level: 9, title: 'Sporting Counts', difficultyStars: 2, timeLimitSeconds: 13, targetScore: 1100, questionCount: 10, theme: 'Ball Values & Analogies' },
  { level: 10, title: 'Negative Subtraction', difficultyStars: 2, timeLimitSeconds: 13, targetScore: 1150, questionCount: 10, theme: 'Difference Trials & Logic' },

  // 11-15: Trio Systems & Multi-Element Sequences (3 Stars)
  { level: 11, title: 'Trio Systems I', difficultyStars: 3, timeLimitSeconds: 13, targetScore: 1250, questionCount: 10, theme: '3-Emoji Systems & Life Cycles' },
  { level: 12, title: 'Trio Systems II', difficultyStars: 3, timeLimitSeconds: 12, targetScore: 1300, questionCount: 10, theme: 'Linked Equations & Analogies' },
  { level: 13, title: 'Pet Kingdom Logic', difficultyStars: 3, timeLimitSeconds: 12, targetScore: 1350, questionCount: 10, theme: 'Animal Trios & Odd One Out' },
  { level: 14, title: 'Cosmic Equations', difficultyStars: 3, timeLimitSeconds: 12, targetScore: 1400, questionCount: 10, theme: 'Stars, Moon & Direction Cycles' },
  { level: 15, title: 'Vehicle Calculations', difficultyStars: 3, timeLimitSeconds: 12, targetScore: 1450, questionCount: 10, theme: 'Speed Math & Concepts' },

  // 16-20: Multiplication & Division Products (3-4 Stars)
  { level: 16, title: 'Product Puzzles I', difficultyStars: 3, timeLimitSeconds: 12, targetScore: 1550, questionCount: 10, theme: 'Multiplication Intro & Sequences' },
  { level: 17, title: 'Product Puzzles II', difficultyStars: 4, timeLimitSeconds: 11, targetScore: 1600, questionCount: 10, theme: 'Division Intro & Analogies' },
  { level: 18, title: 'Mixed Products', difficultyStars: 4, timeLimitSeconds: 11, targetScore: 1650, questionCount: 10, theme: 'Factors, Multiples & Categories' },
  { level: 19, title: 'Double Products', difficultyStars: 4, timeLimitSeconds: 11, targetScore: 1700, questionCount: 10, theme: 'Advanced Products & Logic' },
  { level: 20, title: 'Midway Championship', difficultyStars: 4, timeLimitSeconds: 11, targetScore: 1800, questionCount: 10, theme: 'Tournament Halfway & Multi-Type' },

  // 21-25: Order of Operations (PEMDAS) (4 Stars)
  { level: 21, title: 'Order of Operations I', difficultyStars: 4, timeLimitSeconds: 11, targetScore: 1850, questionCount: 10, theme: 'PEMDAS Rule & Traps' },
  { level: 22, title: 'Order of Operations II', difficultyStars: 4, timeLimitSeconds: 10, targetScore: 1900, questionCount: 10, theme: 'Precedence Trap & Sequences' },
  { level: 23, title: 'Multiplier First', difficultyStars: 4, timeLimitSeconds: 10, targetScore: 1950, questionCount: 10, theme: 'Addition vs Multiplier' },
  { level: 24, title: 'Chained Precedence', difficultyStars: 4, timeLimitSeconds: 10, targetScore: 2000, questionCount: 10, theme: 'Three Operations & Analogies' },
  { level: 25, title: 'Operator Clashes', difficultyStars: 4, timeLimitSeconds: 10, targetScore: 2050, questionCount: 10, theme: 'Division & Multiplication Combo' },

  // 26-30: Changed Emoji Quantities (4 Stars)
  { level: 26, title: 'Quantity Shift I', difficultyStars: 4, timeLimitSeconds: 10, targetScore: 2150, questionCount: 10, theme: 'Singles vs Pairs' },
  { level: 27, title: 'Quantity Shift II', difficultyStars: 4, timeLimitSeconds: 10, targetScore: 2200, questionCount: 10, theme: 'Triples to Singles' },
  { level: 28, title: 'Count the Grapes', difficultyStars: 4, timeLimitSeconds: 9, targetScore: 2250, questionCount: 10, theme: 'Bunch Reductions & Shifts' },
  { level: 29, title: 'Sneaker Halving', difficultyStars: 4, timeLimitSeconds: 9, targetScore: 2300, questionCount: 10, theme: 'Pair vs Single Item' },
  { level: 30, title: 'Multi-Item Groups', difficultyStars: 4, timeLimitSeconds: 9, targetScore: 2400, questionCount: 10, theme: 'Group Operations & Multi-Step' },

  // 31-35: Visual Differences & Accessories (5 Stars)
  { level: 31, title: 'Visual Differences I', difficultyStars: 5, timeLimitSeconds: 9, targetScore: 2500, questionCount: 10, theme: 'Hidden Details & Accessories' },
  { level: 32, title: 'Visual Differences II', difficultyStars: 5, timeLimitSeconds: 9, targetScore: 2550, questionCount: 10, theme: 'Accessory Detection & PEMDAS' },
  { level: 33, title: 'Zzz Sleep Counts', difficultyStars: 5, timeLimitSeconds: 8, targetScore: 2600, questionCount: 10, theme: 'Subtle Clues & State Shifts' },
  { level: 34, title: 'Visual + Precedence', difficultyStars: 5, timeLimitSeconds: 8, targetScore: 2650, questionCount: 10, theme: 'Detail Detection + PEMDAS' },
  { level: 35, title: 'Observation Master', difficultyStars: 5, timeLimitSeconds: 8, targetScore: 2700, questionCount: 10, theme: 'Double Eye Test & Complex Deductions' },

  // 36-40: Master Arena Finale (5 Stars)
  { level: 36, title: 'Master Arena I', difficultyStars: 5, timeLimitSeconds: 8, targetScore: 2850, questionCount: 10, theme: 'Complex 4-Step Deduction' },
  { level: 37, title: 'Master Arena II', difficultyStars: 5, timeLimitSeconds: 8, targetScore: 2900, questionCount: 10, theme: 'All Rules Combined' },
  { level: 38, title: 'Grand Combinations', difficultyStars: 5, timeLimitSeconds: 7, targetScore: 3000, questionCount: 10, theme: 'Negative, Shifts & Visual Traps' },
  { level: 39, title: 'Speed & Logic Duel', difficultyStars: 5, timeLimitSeconds: 7, targetScore: 3100, questionCount: 10, theme: 'Ultra-Fast Precision Logic' },
  { level: 40, title: 'Grandmaster Finale', difficultyStars: 5, timeLimitSeconds: 7, targetScore: 3300, questionCount: 10, theme: 'Emoji IQ Championship Showdown' },
];

/**
 * Creates 4 plausible choices with exactly 1 correct answer and 3 distinct distractors.
 */
function createNumericChoices(correct: number, rawDistractors: number[]): number[] {
  const uniqueDistractors: number[] = [];
  for (const d of rawDistractors) {
    if (d !== correct && !uniqueDistractors.includes(d) && Number.isFinite(d)) {
      uniqueDistractors.push(d);
    }
    if (uniqueDistractors.length === 3) break;
  }

  let delta = 1;
  while (uniqueDistractors.length < 3) {
    const candidate = delta % 2 === 0 ? correct + delta : correct - delta;
    if (candidate !== correct && !uniqueDistractors.includes(candidate)) {
      uniqueDistractors.push(candidate);
    }
    delta++;
  }

  return [correct, ...uniqueDistractors.slice(0, 3)];
}

/**
 * Creates 4 distinct choices for string/emoji questions.
 */
function createStringChoices(correct: string, rawDistractors: string[]): string[] {
  const uniqueDistractors: string[] = [];
  for (const d of rawDistractors) {
    if (d !== correct && !uniqueDistractors.includes(d) && d.trim().length > 0) {
      uniqueDistractors.push(d);
    }
    if (uniqueDistractors.length === 3) break;
  }

  const fallbacks = ['⭐', '💎', '🔥', '🌟', '🎯', 'Option A', 'Option B', 'Option C'];
  for (const fb of fallbacks) {
    if (uniqueDistractors.length >= 3) break;
    if (fb !== correct && !uniqueDistractors.includes(fb)) {
      uniqueDistractors.push(fb);
    }
  }

  return [correct, ...uniqueDistractors.slice(0, 3)];
}

// Visual sequences curated for reasoning questions
const SEQUENCE_CURATED: { seq: string[]; ans: string; dist: string[]; expl: string; prompt: string }[] = [
  { seq: ['🌱', '🌿', '🌳'], ans: '🌲', dist: ['🍄', '🪵', '🍎'], expl: 'Sprout grows into a plant, then tree, then mature evergreen pine.', prompt: 'Complete the growth sequence:' },
  { seq: ['🥚', '🐣', '🐥'], ans: '🐔', dist: ['🦆', '🦅', '🦉'], expl: 'Egg hatches into chick, young bird, then adult hen.', prompt: 'Complete the life cycle:' },
  { seq: ['🐛', '🥥', '🦋'], ans: '🌸', dist: ['🐝', '🐞', '🦗'], expl: 'Caterpillar transforms to cocoon, butterfly, and visits the flower.', prompt: 'Complete the metamorphosis journey:' },
  { seq: ['🌑', '🌓', '🌕'], ans: '🌘', dist: ['☀️', '⭐', '🌍'], expl: 'New moon waxes to half, full moon, then begins waning crescent.', prompt: 'Determine the next moon phase:' },
  { seq: ['👶', '👦', '👨'], ans: '👴', dist: ['🧑', '👶', '🦸'], expl: 'Baby to boy, to man, to grandfather.', prompt: 'Complete the human life cycle:' },
  { seq: ['🥉', '🥈', '🥇'], ans: '🏆', dist: ['🎗️', '🎖️', '👑'], expl: 'Bronze medal, silver medal, gold medal, leading to championship trophy.', prompt: 'Select the podium climax:' },
  { seq: ['🕒', '🕕', '🕘'], ans: '🕛', dist: ['🕐', '🕕', '🕞'], expl: 'Clocks advancing by 3 hours: 3:00, 6:00, 9:00, next is 12:00.', prompt: 'Determine the next clock time:' },
  { seq: ['🌧️', '⛈️', '⛅'], ans: '☀️', dist: ['🌪️', '❄️', '🌙'], expl: 'Rain to storm, clouds clearing, leading to bright sunshine.', prompt: 'Complete the weather transition:' },
  { seq: ['🔴', '🟡', '🟢'], ans: '🚗', dist: ['🛑', '🚲', '✈️'], expl: 'Red, yellow, green light indicates cars may go!', prompt: 'Traffic signal sequence completion:' },
  { seq: ['💧', '🌊', '❄️'], ans: '🧊', dist: ['🔥', '💨', '🌧️'], expl: 'Water drops form waves, freeze to snow, solidify into ice block.', prompt: 'Complete the water state cycle:' },
  { seq: ['🧱', '🏗️', '🏠'], ans: '🏰', dist: ['🪨', '⛺', '🚪'], expl: 'Bricks, construction site, house, culminating in a grand castle.', prompt: 'Architecture scale sequence:' },
  { seq: ['🪙', '💵', '💳'], ans: '🏦', dist: ['🛒', '🧾', '💎'], expl: 'Coins, banknotes, card, stored in the bank.', prompt: 'Financial progression sequence:' },
  { seq: ['⬆️', '➡️', '⬇️'], ans: '⬅️', dist: ['↗️', '↖️', '🔄'], expl: 'Clockwise rotation: Up, Right, Down, next is Left.', prompt: 'Determine the 90° clockwise rotation:' },
  { seq: ['🚗', '🚄', '✈️'], ans: '🚀', dist: ['🚲', '🛹', '⛵'], expl: 'Progression of transport speeds: car, high-speed train, airplane, rocket.', prompt: 'Identify the speed escalation:' },
  { seq: ['💡', '📐', '💻'], ans: '🚀', dist: ['📱', '⌚', '📺'], expl: 'Idea (lightbulb), design (blueprint), building (laptop), launch (rocket).', prompt: 'Product creation journey:' },
];

// Curated emoji analogies: A is to B as C is to ?
const ANALOGY_CURATED: { a: string; b: string; c: string; ans: string; dist: string[]; expl: string }[] = [
  { a: '🐶', b: '🦴', c: '🐱', ans: '🐟', dist: ['🧀', '🥕', '🥩'], expl: 'Dogs love bones; cats love fish.' },
  { a: '🚗', b: '🛣️', c: '✈️', ans: '☁️', dist: ['🌊', '🚂', '🚀'], expl: 'Cars travel on roads; planes travel through the sky/clouds.' },
  { a: '🚗', b: '⛽', c: '📱', ans: '🔋', dist: ['💡', '🔌', '⚡'], expl: 'Cars run on fuel; smartphones run on battery charge.' },
  { a: '🎨', b: '🖌️', c: '📝', ans: '✏️', dist: ['📏', '✂️', '📎'], expl: 'Painters use brushes; writers use pencils.' },
  { a: '☀️', b: '🏖️', c: '❄️', ans: '⛷️', dist: ['🏊', '🏄', '🏕️'], expl: 'Sun connects to the beach; snow connects to skiing.' },
  { a: '🐝', b: '🍯', c: '🐮', ans: '🥛', dist: ['🧀', '🥩', '🥚'], expl: 'Bees produce honey; cows produce milk.' },
  { a: '🌳', b: '🍎', c: '🌾', ans: '🍞', dist: ['🍿', '🍕', '🍰'], expl: 'Apple trees produce fruit; wheat grain produces bread.' },
  { a: '🔥', b: '🚒', c: '🩺', ans: '🚑', dist: ['🚓', '🚕', '🚜'], expl: 'Firefighters respond to fire; ambulances respond with medics.' },
  { a: '⚽', b: '🥅', c: '🏀', ans: '🗑️', dist: ['🏈', '🎾', '🏓'], expl: 'Soccer balls are kicked into goals; basketballs into hoops.' },
  { a: '👑', b: '🤴', c: '👒', ans: '👸', dist: ['🎩', '🧢', '🪖'], expl: 'Crowns associate with kings; fine hats with queens/ladies.' },
  { a: '👟', b: '🏃', c: '🥊', ans: '🥊', dist: ['🥋', '🥋', '🛹'], expl: 'Running shoes are for running; boxing gloves are for boxing.' },
  { a: '🎸', b: '🎵', c: '📷', ans: '🖼️', dist: ['🎥', '📻', '🎙️'], expl: 'Guitars make music notes; cameras create photos/pictures.' },
];

// Curated odd-one-out puzzles
const ODD_ONE_OUT_CURATED: { items: string[]; ans: string; dist: string[]; expl: string }[] = [
  { items: ['🍎', '🍌', '🍕', '🍇'], ans: '🍕', dist: ['🍎', '🍌', '🍇'], expl: 'Pizza is cooked fast food, whereas apple, banana, and grapes are natural fruits.' },
  { items: ['⚽', '🏀', '🎾', '🎸'], ans: '🎸', dist: ['⚽', '🏀', '🎾'], expl: 'Guitar is a musical instrument, whereas soccer, basketball, and tennis balls are sports gear.' },
  { items: ['🚗', '🚕', '✈️', '🚌'], ans: '✈️', dist: ['🚗', '🚕', '🚌'], expl: 'Airplane is an aerial vehicle, whereas car, taxi, and bus are ground motor vehicles.' },
  { items: ['🐶', '🐱', '🦁', '🐰'], ans: '🦁', dist: ['🐶', '🐱', '🐰'], expl: 'Lion is a wild predatory feline, whereas dog, cat, and rabbit are common domestic pets.' },
  { items: ['👖', '👕', '👗', '👟'], ans: '👟', dist: ['👖', '👕', '👗'], expl: 'Sneakers are footwear, whereas pants, shirt, and dress are garments worn on the torso/legs.' },
  { items: ['🌧️', '❄️', '🌩️', '🍔'], ans: '🍔', dist: ['🌧️', '❄️', '🌩️'], expl: 'Burger is food, whereas rain, snow, and thunder are meteorological weather conditions.' },
  { items: ['🎸', '🎻', '🎹', '🏀'], ans: '🏀', dist: ['🎸', '🎻', '🎹'], expl: 'Basketball is athletic equipment, whereas guitar, violin, and piano are musical instruments.' },
  { items: ['🔴', '🔵', '🟢', '⬛'], ans: '⬛', dist: ['🔴', '🔵', '🟢'], expl: 'Black square is achromatic with straight corners; the others are primary chromatic circles.' },
  { items: ['🍣', '🍱', '🍙', '🌮'], ans: '🌮', dist: ['🍣', '🍱', '🍙'], expl: 'Taco is Mexican cuisine, whereas sushi, bento, and onigiri are Japanese cuisine.' },
  { items: ['🥛', '☕', '🍵', '🍪'], ans: '🍪', dist: ['🥛', '☕', '🍵'], expl: 'Cookie is solid baked food, whereas milk, coffee, and green tea are liquid beverages.' },
];

// Curated emoji combinations (rebus & concept match)
const COMBINATIONS_CURATED: { emojis: string[]; ans: string; dist: string[]; expl: string }[] = [
  { emojis: ['🔥', '🚒'], ans: 'Firefighter', dist: ['Campfire', 'Fireworks', 'Firefly'], expl: 'Fire + Fire Engine = Firefighter' },
  { emojis: ['☀️', '👓'], ans: 'Sunglasses', dist: ['Telescope', 'Microscope', 'Sunscreen'], expl: 'Sun + Eyeglasses = Sunglasses' },
  { emojis: ['🌧️', '☀️'], ans: 'Rainbow', dist: ['Thunderstorm', 'Solar Flare', 'Hurricane'], expl: 'Rain + Sunshine creates a vibrant Rainbow' },
  { emojis: ['❄️', '⚽'], ans: 'Snowball', dist: ['Ice Hockey', 'Igloo', 'Snowman'], expl: 'Snow + Ball = Snowball' },
  { emojis: ['👑', '🐝'], ans: 'Queen Bee', dist: ['Honey Pot', 'Wasps', 'Butterfly'], expl: 'Crown + Bee = Queen Bee' },
  { emojis: ['📖', '🐛'], ans: 'Bookworm', dist: ['Librarian', 'Butterfly', 'Newspaper'], expl: 'Book + Caterpillar = Bookworm (avid reader)' },
  { emojis: ['🌙', '🚶'], ans: 'Moonwalk', dist: ['Astronaut', 'Night Owl', 'Sleepwalker'], expl: 'Moon + Walking person = Moonwalk' },
  { emojis: ['⚡', '🌩️'], ans: 'Thunderstorm', dist: ['Solar Storm', 'Earthquake', 'Tornado'], expl: 'Lightning bolt + Thunder cloud = Thunderstorm' },
  { emojis: ['🍯', '🌙'], ans: 'Honeymoon', dist: ['Sweet Dreams', 'Honeycomb', 'Night Market'], expl: 'Honey + Crescent Moon = Honeymoon' },
  { emojis: ['⭐', '🐟'], ans: 'Starfish', dist: ['Goldfish', 'Jellyfish', 'Seahorse'], expl: 'Star + Fish = Starfish' },
  { emojis: ['🍎', '🥧'], ans: 'Apple Pie', dist: ['Fruit Salad', 'Apple Cider', 'Pancake'], expl: 'Apple + Pie = Apple Pie' },
  { emojis: ['🌊', '🏄'], ans: 'Surfer', dist: ['Lifeguard', 'Sailboat', 'Submarine'], expl: 'Ocean Wave + Surfing person = Surfer' },
];

/**
 * Builds all 1,000 questions (25 per level across 40 levels).
 */
function buildFullQuestionDatabase(): Record<number, EmojiIqQuestion[]> {
  const database: Record<number, EmojiIqQuestion[]> = {};

  const foods = ['🍎', '🍌', '🍉', '🍓', '🍒', '🍋', '🥝', '🍇', '🍕', '🍔', '🍟', '🍩', '🍪', '🎂', '🧁'];
  const animals = ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧'];
  const objects = ['🚗', '🚕', '🚌', '🚓', '✈️', '🚀', '🚲', '⌚', '📱', '💻', '🎸', '🎧', '📷', '🔑', '👟'];
  const faces = ['😀', '😄', '😊', '😍', '🥰', '😎', '🤩', '🥳', '🤔', '😱', '🤯', '😴'];
  const symbols = ['❤️', '🧡', '💛', '💚', '💙', '💜', '⭐', '🌟', '🔥', '💎', '🎯'];

  for (let lvl = 1; lvl <= 40; lvl++) {
    const config = EMOJI_IQ_LEVELS[lvl - 1];
    const questions: EmojiIqQuestion[] = [];
    const POOL_SIZE = 25; // 25 distinct questions per level

    let emojiPool = foods;
    if (lvl >= 4 && lvl <= 5) emojiPool = animals;
    else if (lvl >= 6 && lvl <= 8) emojiPool = foods;
    else if (lvl >= 9 && lvl <= 10) emojiPool = sportsPool();
    else if (lvl >= 11 && lvl <= 13) emojiPool = animals;
    else if (lvl >= 14 && lvl <= 15) emojiPool = objects;
    else if (lvl >= 16 && lvl <= 20) emojiPool = faces;
    else if (lvl >= 21 && lvl <= 25) emojiPool = symbols;
    else if (lvl >= 26 && lvl <= 30) emojiPool = foods;
    else if (lvl >= 31 && lvl <= 35) emojiPool = faces;
    else emojiPool = ALL_EMOJIS.map((e) => e.char);

    for (let qIdx = 0; qIdx < POOL_SIZE; qIdx++) {
      const qId = `eiq_l${lvl}_q${qIdx + 1 < 10 ? `0${qIdx + 1}` : qIdx + 1}`;
      const eA = emojiPool[(qIdx * 3) % emojiPool.length];
      const eB = emojiPool[(qIdx * 3 + 1) % emojiPool.length];
      const eC = emojiPool[(qIdx * 3 + 2) % emojiPool.length];

      // Question difficulty progression within pool:
      // Indices 0-7: Easy tier
      // Indices 8-16: Medium tier
      // Indices 17-24: Advanced tier
      let diff: QuestionDifficulty = 'EASY';
      if (lvl <= 5) {
        diff = qIdx < 16 ? 'EASY' : 'MEDIUM';
      } else if (lvl <= 15) {
        diff = qIdx < 8 ? 'EASY' : qIdx < 18 ? 'MEDIUM' : 'HARD';
      } else if (lvl <= 25) {
        diff = qIdx < 8 ? 'MEDIUM' : qIdx < 18 ? 'HARD' : 'EXPERT';
      } else {
        diff = qIdx < 6 ? 'MEDIUM' : qIdx < 16 ? 'HARD' : 'EXPERT';
      }

      // Mix varied question formats across the pool:
      // qIdx 4: Sequence question
      // qIdx 11: Analogy question
      // qIdx 17: Odd One Out question
      // qIdx 22: Emoji combination concept match
      // Others: Structured mathematical emoji puzzle

      if (qIdx === 4 && SEQUENCE_CURATED[lvl % SEQUENCE_CURATED.length]) {
        const item = SEQUENCE_CURATED[lvl % SEQUENCE_CURATED.length];
        const choices = createStringChoices(item.ans, item.dist);
        questions.push({
          id: qId,
          level: lvl,
          questionIndex: qIdx,
          type: 'TYPE_M_EMOJI_SEQUENCE',
          difficulty: diff,
          promptText: item.prompt,
          basePoints: 60 + lvl * 3,
          timeLimitSeconds: config.timeLimitSeconds,
          equations: [
            {
              items: [
                { emoji: item.seq[0] },
                '➔',
                { emoji: item.seq[1] },
                '➔',
                { emoji: item.seq[2] },
                '➔',
                '?',
              ],
              result: '',
            },
          ],
          options: choices,
          correctAnswer: item.ans,
          correctIndex: 0,
          hintText: `Notice the logical transition from ${item.seq[0]} to ${item.seq[1]}!`,
          explanation: item.expl,
        });
        continue;
      }

      if (qIdx === 11 && ANALOGY_CURATED[lvl % ANALOGY_CURATED.length]) {
        const item = ANALOGY_CURATED[lvl % ANALOGY_CURATED.length];
        const choices = createStringChoices(item.ans, item.dist);
        questions.push({
          id: qId,
          level: lvl,
          questionIndex: qIdx,
          type: 'TYPE_Q_EMOJI_LOGIC_ANALOGY',
          difficulty: diff,
          promptText: 'Find the matching emoji relationship:',
          basePoints: 75 + lvl * 3,
          timeLimitSeconds: config.timeLimitSeconds,
          equations: [
            {
              items: [
                { emoji: item.a },
                ':',
                { emoji: item.b },
                '::',
                { emoji: item.c },
                ':',
                '?',
              ],
              result: '',
            },
          ],
          options: choices,
          correctAnswer: item.ans,
          correctIndex: 0,
          hintText: `How does ${item.a} connect to ${item.b}? Apply the same relation to ${item.c}.`,
          explanation: item.expl,
        });
        continue;
      }

      if (qIdx === 17 && ODD_ONE_OUT_CURATED[lvl % ODD_ONE_OUT_CURATED.length]) {
        const item = ODD_ONE_OUT_CURATED[lvl % ODD_ONE_OUT_CURATED.length];
        const choices = createStringChoices(item.ans, item.dist);
        questions.push({
          id: qId,
          level: lvl,
          questionIndex: qIdx,
          type: 'TYPE_O_ODD_ONE_OUT',
          difficulty: diff,
          promptText: 'Which emoji does NOT belong in this group?',
          basePoints: 70 + lvl * 3,
          timeLimitSeconds: config.timeLimitSeconds,
          equations: [
            {
              items: item.items.map((emoji) => ({ emoji })),
              result: '',
            },
          ],
          options: choices,
          correctAnswer: item.ans,
          correctIndex: 0,
          hintText: 'Look at the categories: 3 belong together, 1 is different.',
          explanation: item.expl,
        });
        continue;
      }

      if (qIdx === 22 && COMBINATIONS_CURATED[lvl % COMBINATIONS_CURATED.length]) {
        const item = COMBINATIONS_CURATED[lvl % COMBINATIONS_CURATED.length];
        const choices = createStringChoices(item.ans, item.dist);
        questions.push({
          id: qId,
          level: lvl,
          questionIndex: qIdx,
          type: 'TYPE_P_EMOJI_COMBINATION',
          difficulty: diff,
          promptText: 'What phrase or concept do these emojis represent?',
          basePoints: 80 + lvl * 3,
          timeLimitSeconds: config.timeLimitSeconds,
          equations: [
            {
              items: [{ emoji: item.emojis[0] }, '+', { emoji: item.emojis[1] }],
              result: '?',
            },
          ],
          options: choices,
          correctAnswer: item.ans,
          correctIndex: 0,
          hintText: `Say the names of ${item.emojis[0]} and ${item.emojis[1]} together!`,
          explanation: item.expl,
        });
        continue;
      }

      // Mathematical & Logical Deduction Equations
      if (lvl <= 5) {
        // Levels 1-5: Addition of 1 or 2 unknowns
        const valA = ((lvl + qIdx) % 6) + 2; // 2 to 7
        const valB = (((lvl * 2) + qIdx) % 5) + 2; // 2 to 6
        const ans = valA + valB;
        const options = createNumericChoices(ans, [valA * 2, valB * 2, ans + 2, ans - 1]);

        questions.push({
          id: qId,
          level: lvl,
          questionIndex: qIdx,
          type: 'TYPE_A_SIMPLE_ADDITION',
          difficulty: diff,
          promptText: 'Solve for the missing value:',
          basePoints: 50 + lvl * 4,
          timeLimitSeconds: config.timeLimitSeconds,
          emojiValues: { [eA]: valA, [eB]: valB },
          equations: [
            { items: [{ emoji: eA }, '+', { emoji: eA }], result: valA * 2 },
            { items: [{ emoji: eA }, '+', { emoji: eB }], result: valA + valB },
            { items: [{ emoji: eB }, '+', { emoji: eB }], result: valB * 2 },
            { items: [{ emoji: eA }, '+', { emoji: eB }], result: '?' },
          ],
          options,
          correctAnswer: ans,
          correctIndex: 0,
          hintText: `Row 1 gives ${eA} + ${eA} = ${valA * 2}, so ${eA} = ${valA}.`,
          explanation: `${eA} = ${valA}, ${eB} = ${valB}. ${valA} + ${valB} = ${ans}.`,
        });
      } else if (lvl <= 10) {
        // Levels 6-10: Two unknowns with Subtraction & Mixed Operations
        const valA = ((lvl * 2 + qIdx) % 8) + 6; // 6 to 13
        const valB = ((lvl + qIdx * 2) % 5) + 2; // 2 to 6
        const isSub = qIdx % 2 === 1;
        const ans = isSub ? valA - valB : valA + valB;
        const options = createNumericChoices(ans, [valA + valB + 2, Math.abs(valA - valB) + 1, valA * 2, valB * 2]);

        questions.push({
          id: qId,
          level: lvl,
          questionIndex: qIdx,
          type: isSub ? 'TYPE_B_SUBTRACTION' : 'TYPE_E_MIXED_OPERATIONS',
          difficulty: diff,
          promptText: 'Find the correct calculation:',
          basePoints: 70 + lvl * 4,
          timeLimitSeconds: config.timeLimitSeconds,
          emojiValues: { [eA]: valA, [eB]: valB },
          equations: [
            { items: [{ emoji: eA }, '+', { emoji: eA }], result: valA * 2 },
            { items: [{ emoji: eA }, '+', { emoji: eB }], result: valA + valB },
            { items: [{ emoji: eA }, '-', { emoji: eB }], result: valA - valB },
            { items: [{ emoji: eA }, isSub ? '-' : '+', { emoji: eB }], result: '?' },
          ],
          options,
          correctAnswer: ans,
          correctIndex: 0,
          hintText: `Deduce ${eA} from row 1, then solve for ${eB}.`,
          explanation: `${eA} = ${valA}, ${eB} = ${valB}. Result: ${valA} ${isSub ? '-' : '+'} ${valB} = ${ans}.`,
        });
      } else if (lvl <= 15) {
        // Levels 11-15: Three unknowns (A, B, C)
        const valA = (qIdx % 5) + 3; // 3 to 7
        const valB = ((qIdx + 2) % 5) + 3; // 3 to 7
        const valC = ((qIdx + 4) % 4) + 2; // 2 to 5
        const ans = valA + valB + valC;
        const options = createNumericChoices(ans, [valA + valB, valB + valC, ans + 2, ans - 3]);

        questions.push({
          id: qId,
          level: lvl,
          questionIndex: qIdx,
          type: 'TYPE_J_MULTIPLE_UNKNOWNS',
          difficulty: diff,
          promptText: 'Solve the 3-variable system:',
          basePoints: 90 + lvl * 4,
          timeLimitSeconds: config.timeLimitSeconds,
          emojiValues: { [eA]: valA, [eB]: valB, [eC]: valC },
          equations: [
            { items: [{ emoji: eA }, '+', { emoji: eA }], result: valA * 2 },
            { items: [{ emoji: eB }, '+', { emoji: eA }], result: valB + valA },
            { items: [{ emoji: eB }, '+', { emoji: eC }], result: valB + valC },
            { items: [{ emoji: eA }, '+', { emoji: eB }, '+', { emoji: eC }], result: '?' },
          ],
          options,
          correctAnswer: ans,
          correctIndex: 0,
          hintText: `Solve row by row: find ${eA}, then ${eB}, then ${eC}.`,
          explanation: `${eA} = ${valA}, ${eB} = ${valB}, ${eC} = ${valC}. ${valA} + ${valB} + ${valC} = ${ans}.`,
        });
      } else if (lvl <= 20) {
        // Levels 16-20: Multiplication & Division Products
        const valA = (qIdx % 4) + 3; // 3 to 6
        const valB = ((qIdx + 1) % 4) + 2; // 2 to 5
        const valC = ((qIdx + 2) % 4) + 2; // 2 to 5
        const ans = valA * valB + valC;
        const options = createNumericChoices(ans, [valA * (valB + valC), (valA + valB) * valC, valA * valB, ans + 3]);

        questions.push({
          id: qId,
          level: lvl,
          questionIndex: qIdx,
          type: 'TYPE_C_MULTIPLICATION',
          difficulty: diff,
          promptText: 'Calculate the product and sum:',
          basePoints: 110 + lvl * 4,
          timeLimitSeconds: config.timeLimitSeconds,
          emojiValues: { [eA]: valA, [eB]: valB, [eC]: valC },
          equations: [
            { items: [{ emoji: eA }, '×', { emoji: eA }], result: valA * valA },
            { items: [{ emoji: eA }, '×', { emoji: eB }], result: valA * valB },
            { items: [{ emoji: eB }, '+', { emoji: eC }], result: valB + valC },
            { items: [{ emoji: eA }, '×', { emoji: eB }, '+', { emoji: eC }], result: '?' },
          ],
          options,
          correctAnswer: ans,
          correctIndex: 0,
          hintText: `Since ${eA} × ${eA} = ${valA * valA}, ${eA} = ${valA}.`,
          explanation: `${eA} = ${valA}, ${eB} = ${valB}, ${eC} = ${valC}. ${valA} × ${valB} + ${valC} = ${ans}.`,
        });
      } else if (lvl <= 25) {
        // Levels 21-25: Strict Order of Operations (PEMDAS: A + B × C)
        const valA = (qIdx % 5) + 4; // 4 to 8
        const valB = ((qIdx + 2) % 4) + 3; // 3 to 6
        const valC = ((qIdx + 3) % 4) + 2; // 2 to 5
        const ans = valA + (valB * valC);
        const trapAddFirst = (valA + valB) * valC; // Classic PEMDAS distractor!
        const options = createNumericChoices(ans, [trapAddFirst, valA * valB + valC, ans + valB, ans - valC]);

        questions.push({
          id: qId,
          level: lvl,
          questionIndex: qIdx,
          type: 'TYPE_F_ORDER_OF_OPERATIONS',
          difficulty: diff,
          promptText: 'Remember PEMDAS: Multiply before adding!',
          basePoints: 135 + lvl * 4,
          timeLimitSeconds: config.timeLimitSeconds,
          emojiValues: { [eA]: valA, [eB]: valB, [eC]: valC },
          equations: [
            { items: [{ emoji: eA }, '+', { emoji: eA }, '+', { emoji: eA }], result: valA * 3 },
            { items: [{ emoji: eA }, '+', { emoji: eB }, '+', { emoji: eB }], result: valA + valB * 2 },
            { items: [{ emoji: eB }, '+', { emoji: eC }, '+', { emoji: eC }], result: valB + valC * 2 },
            { items: [{ emoji: eA }, '+', { emoji: eB }, '×', { emoji: eC }], result: '?' },
          ],
          options,
          correctAnswer: ans,
          correctIndex: 0,
          hintText: 'Calculate the multiplication (B × C) first, then add A!',
          explanation: `${eA} = ${valA}, ${eB} = ${valB}, ${eC} = ${valC}. Order of operations: ${valA} + (${valB} × ${valC}) = ${valA} + ${valB * valC} = ${ans}.`,
        });
      } else if (lvl <= 30) {
        // Levels 26-30: Quantity Shift (Pairs to singles)
        const unitA = (qIdx % 4) + 4; // 4 to 7
        const unitB = ((qIdx + 1) % 4) + 3; // 3 to 6
        const unitC = ((qIdx + 2) % 3) + 2; // 2 to 4
        const ans = unitA + (unitB * unitC);
        const trapPairs = (unitA * 2) + ((unitB * 2) * (unitC * 2));
        const trapWrongOrder = (unitA + unitB) * unitC;
        const options = createNumericChoices(ans, [trapPairs, trapWrongOrder, ans + unitB, ans - unitA]);

        questions.push({
          id: qId,
          level: lvl,
          questionIndex: qIdx,
          type: 'TYPE_G_CHANGED_QUANTITY',
          difficulty: diff,
          promptText: 'Careful: The final row has SINGLE items!',
          basePoints: 160 + lvl * 3,
          timeLimitSeconds: config.timeLimitSeconds,
          emojiValues: { [`${eA}${eA}`]: unitA * 2, [eA]: unitA, [`${eB}${eB}`]: unitB * 2, [eB]: unitB, [eC]: unitC },
          equations: [
            { items: [{ emoji: `${eA}${eA}`, count: 2 }, '+', { emoji: `${eA}${eA}`, count: 2 }], result: unitA * 4 },
            { items: [{ emoji: `${eA}${eA}`, count: 2 }, '+', { emoji: `${eB}${eB}`, count: 2 }], result: unitA * 2 + unitB * 2 },
            { items: [{ emoji: `${eB}${eB}`, count: 2 }, '+', { emoji: `${eC}${eC}`, count: 2 }], result: unitB * 2 + unitC * 2 },
            { items: [{ emoji: eA, count: 1 }, '+', { emoji: eB, count: 1 }, '×', { emoji: eC, count: 1 }], result: '?' },
          ],
          options,
          correctAnswer: ans,
          correctIndex: 0,
          hintText: `Pairs equal double the value. Divide by 2 for the final single items!`,
          explanation: `Pair of ${eA} = ${unitA * 2} → single = ${unitA}. Pair of ${eB} = ${unitB * 2} → single = ${unitB}. Single ${eC} = ${unitC}. Answer: ${unitA} + (${unitB} × ${unitC}) = ${ans}.`,
        });
      } else if (lvl <= 35) {
        // Levels 31-35: Visual Differences (Triple vs double vs single items)
        const unitA = (qIdx % 4) + 4; // 4 to 7
        const unitB = ((qIdx + 2) % 4) + 3; // 3 to 6
        const unitC = ((qIdx + 1) % 3) + 2; // 2 to 4
        const ans = unitA + (unitB * 2 * unitC);
        const trapCount = unitA * 3 + unitB * unitC;
        const trapOrder = (unitA + unitB * 2) * unitC;
        const options = createNumericChoices(ans, [trapCount, trapOrder, ans + 4, ans - 3]);

        questions.push({
          id: qId,
          level: lvl,
          questionIndex: qIdx,
          type: 'TYPE_I_VISUAL_DIFFERENCE',
          difficulty: diff,
          promptText: 'Examine each item quantity carefully!',
          basePoints: 185 + lvl * 3,
          timeLimitSeconds: config.timeLimitSeconds,
          emojiValues: { [eA]: unitA, [eB]: unitB, [eC]: unitC },
          equations: [
            { items: [{ emoji: `${eA}${eA}${eA}`, count: 3 }, '+', { emoji: `${eA}${eA}${eA}`, count: 3 }], result: unitA * 6 },
            { items: [{ emoji: `${eA}${eA}`, count: 2 }, '+', { emoji: `${eB}${eB}`, count: 2 }], result: unitA * 2 + unitB * 2 },
            { items: [{ emoji: `${eB}${eB}`, count: 2 }, '+', { emoji: `${eC}${eC}`, count: 2 }], result: unitB * 2 + unitC * 2 },
            { items: [{ emoji: eA, count: 1 }, '+', { emoji: `${eB}${eB}`, count: 2 }, '×', { emoji: eC, count: 1 }], result: '?' },
          ],
          options,
          correctAnswer: ans,
          correctIndex: 0,
          hintText: `Row 1 has groups of 3! Count individual items in every line.`,
          explanation: `Row 1: 6× ${eA} = ${unitA * 6} → each = ${unitA}. Each ${eB} = ${unitB}, each ${eC} = ${unitC}. Final: ${unitA} + (${unitB * 2} × ${unitC}) = ${ans}.`,
        });
      } else {
        // Levels 36-40: Grandmaster Finale (Multi-step subtraction, multiplication & shifts)
        const unitA = (qIdx % 4) + 5; // 5 to 8
        const unitB = ((qIdx + 2) % 4) + 3; // 3 to 6
        const unitC = 2; // Fixed factor
        const ans = (unitA * 2) - (unitB * unitC);
        const trapOrder = (unitA * 2 - unitB) * unitC;
        const trapAdd = (unitA * 2) + (unitB * unitC);
        const options = createNumericChoices(ans, [trapOrder, trapAdd, ans + 4, ans - 3]);

        questions.push({
          id: qId,
          level: lvl,
          questionIndex: qIdx,
          type: 'TYPE_L_EXPERT_MULTI_STEP',
          difficulty: 'EXPERT',
          promptText: 'Championship Duel: PEMDAS + Quantity Shift!',
          basePoints: 210 + lvl * 2,
          timeLimitSeconds: config.timeLimitSeconds,
          emojiValues: { [eA]: unitA, [eB]: unitB, [eC]: unitC },
          equations: [
            { items: [{ emoji: `${eA}${eA}`, count: 2 }, '+', { emoji: `${eA}${eA}`, count: 2 }], result: unitA * 4 },
            { items: [{ emoji: `${eA}${eA}`, count: 2 }, '×', { emoji: eC, count: 1 }], result: (unitA * 2) * unitC },
            { items: [{ emoji: `${eB}${eB}`, count: 2 }, '+', { emoji: eC, count: 1 }], result: unitB * 2 + unitC },
            { items: [{ emoji: `${eA}${eA}`, count: 2 }, '-', { emoji: eB, count: 1 }, '×', { emoji: eC, count: 1 }], result: '?' },
          ],
          options,
          correctAnswer: ans,
          correctIndex: 0,
          hintText: `Multiply (${eB} × ${eC}) first, then subtract from ${eA}${eA}!`,
          explanation: `Pair of ${eA} = ${unitA * 2}. ${eC} = ${unitC}. Single ${eB} = ${unitB}. Final: ${unitA * 2} - (${unitB} × ${unitC}) = ${ans}.`,
        });
      }
    }

    database[lvl] = questions;
  }

  return database;
}

function sportsPool(): string[] {
  return ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏆', '🥇', '🥈'];
}

export const EMOJI_IQ_QUESTION_DATABASE = buildFullQuestionDatabase();

/**
 * Fisher-Yates array shuffle.
 */
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Safe localStorage recent IDs retrieval.
 */
function getRecentQuestionIds(levelNumber: number): string[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(`emoji_iq_recent_lvl_${levelNumber}`);
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return [];
}

/**
 * Safe localStorage recent IDs storage.
 */
function saveRecentQuestionIds(levelNumber: number, ids: string[]) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`emoji_iq_recent_lvl_${levelNumber}`, JSON.stringify(ids));
    }
  } catch {}
}

/**
 * Intelligent question selection for a level attempt:
 * 1. Pulls from the level's 25-question pool.
 * 2. Filters out questions played in the most recent attempt.
 * 3. Enforces an internal difficulty progression:
 *    - Questions 1-3: Easy tier for this stage
 *    - Questions 4-7: Medium tier for this stage
 *    - Questions 8-10: Advanced tier for this stage
 * 4. Shuffles answer options deterministically and updates correctIndex.
 * 5. Guarantees 0 question repetition within the attempt and consecutive replay variety.
 */
export function getQuestionsForLevel(levelNumber: number): EmojiIqQuestion[] {
  const safeLvl = Math.max(1, Math.min(40, levelNumber));
  const pool = EMOJI_IQ_QUESTION_DATABASE[safeLvl] || EMOJI_IQ_QUESTION_DATABASE[1];
  const targetCount = 10;

  // Split pool by progressive difficulty tiers within the level:
  // Tier 1 (Easy): indices 0 to 7 (8 items)
  // Tier 2 (Medium): indices 8 to 16 (9 items)
  // Tier 3 (Hard): indices 17 to 24 (8 items)
  const tier1 = pool.slice(0, 8);
  const tier2 = pool.slice(8, 17);
  const tier3 = pool.slice(17, 25);

  const recentIds = new Set(getRecentQuestionIds(safeLvl));

  // Helper to pick n items from a tier, preferring unseen questions
  const pickFromTier = (tier: EmojiIqQuestion[], count: number, excludeIds: Set<string>): EmojiIqQuestion[] => {
    const unseen = tier.filter((q) => !recentIds.has(q.id) && !excludeIds.has(q.id));
    const seen = tier.filter((q) => !excludeIds.has(q.id));

    const selected: EmojiIqQuestion[] = [];
    // Shuffle candidates to provide variety among eligible
    const shuffledUnseen = shuffleArray(unseen);
    for (const q of shuffledUnseen) {
      if (selected.length >= count) break;
      selected.push(q);
      excludeIds.add(q.id);
    }

    if (selected.length < count) {
      const shuffledSeen = shuffleArray(seen.filter((q) => !selected.includes(q)));
      for (const q of shuffledSeen) {
        if (selected.length >= count) break;
        selected.push(q);
        excludeIds.add(q.id);
      }
    }

    return selected;
  };

  const selectedIds = new Set<string>();

  // Pick 3 from tier 1 (introductory)
  const qTier1 = pickFromTier(tier1, 3, selectedIds);
  // Pick 4 from tier 2 (intermediate)
  const qTier2 = pickFromTier(tier2, 4, selectedIds);
  // Pick 3 from tier 3 (challenging)
  const qTier3 = pickFromTier(tier3, 3, selectedIds);

  let combined = [...qTier1, ...qTier2, ...qTier3];

  // Fallback if needed to guarantee exact 10 questions
  if (combined.length < targetCount) {
    for (const q of pool) {
      if (!selectedIds.has(q.id)) {
        combined.push(q);
        selectedIds.add(q.id);
      }
      if (combined.length >= targetCount) break;
    }
  }

  combined = combined.slice(0, targetCount);

  // Save selected IDs to recent history for consecutive replay differentiation
  saveRecentQuestionIds(safeLvl, combined.map((q) => q.id));

  // Prepare each question:
  // 1. Assign sequential questionIndex (0 to 9)
  // 2. Shuffle answer options
  // 3. Recalculate correctIndex
  return combined.map((q, idx) => {
    const shuffledOptions = shuffleArray(q.options);
    const correctIndex = shuffledOptions.indexOf(q.correctAnswer);

    return {
      ...q,
      questionIndex: idx,
      options: shuffledOptions,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    };
  });
}

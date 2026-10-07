-- ==============================================================================
-- GoDigital — Authoritative Puzzle Catalog Seeds
-- Seeds: 002_puzzle_levels_seeds.sql
-- Eliminates static hardcoded level banks in frontend.
-- ==============================================================================

-- 1. SEED PUZZLE LEVELS FOR SORTING-BALLS (Water & Ball Sort)
INSERT INTO puzzle_levels (game_id, level_number, difficulty_tier, optimal_moves, par_moves, time_limit_seconds, min_time_seconds, config, scoring_matrix)
VALUES
(
    'sorting-balls', 1, 'STARTER', 11, 14, 60, 2.5,
    '{"capacity": 4, "tubes": [["yellow", "yellow", "cyan", "cyan"], ["blue", "blue", "yellow", "red"], ["yellow", "blue", "cyan", "red"], ["red", "blue", "cyan", "red"], [], []]}'::jsonb,
    '{"base_points": 1000, "move_bonus": 500, "speed_bonus_max": 400}'::jsonb
),
(
    'sorting-balls', 2, 'STARTER', 12, 15, 65, 3.0,
    '{"capacity": 4, "tubes": [["yellow", "red", "yellow", "blue"], ["cyan", "yellow", "red", "red"], ["blue", "yellow", "cyan", "cyan"], ["red", "blue", "cyan", "blue"], [], []]}'::jsonb,
    '{"base_points": 1050, "move_bonus": 520, "speed_bonus_max": 400}'::jsonb
),
(
    'sorting-balls', 3, 'STARTER', 14, 17, 70, 3.5,
    '{"capacity": 4, "tubes": [["cyan", "red", "yellow", "cyan"], ["yellow", "blue", "red", "cyan"], ["blue", "yellow", "red", "yellow"], ["blue", "red", "blue", "cyan"], [], []]}'::jsonb,
    '{"base_points": 1100, "move_bonus": 540, "speed_bonus_max": 400}'::jsonb
),
(
    'sorting-balls', 4, 'EASY', 15, 19, 75, 3.8,
    '{"capacity": 4, "tubes": [["blue", "cyan", "yellow", "red"], ["cyan", "red", "yellow", "blue"], ["red", "yellow", "cyan", "blue"], ["yellow", "blue", "red", "cyan"], [], []]}'::jsonb,
    '{"base_points": 1150, "move_bonus": 560, "speed_bonus_max": 400}'::jsonb
),
(
    'sorting-balls', 5, 'EASY', 16, 20, 80, 4.0,
    '{"capacity": 4, "tubes": [["red", "cyan", "blue", "yellow"], ["blue", "red", "yellow", "cyan"], ["cyan", "yellow", "red", "blue"], ["yellow", "blue", "cyan", "red"], [], []]}'::jsonb,
    '{"base_points": 1200, "move_bonus": 580, "speed_bonus_max": 400}'::jsonb
)
ON CONFLICT (game_id, level_number) DO UPDATE SET
    config = EXCLUDED.config,
    optimal_moves = EXCLUDED.optimal_moves,
    par_moves = EXCLUDED.par_moves;

-- 2. SEED PUZZLE LEVELS FOR MEMORY-MATCH
INSERT INTO puzzle_levels (game_id, level_number, difficulty_tier, optimal_moves, par_moves, time_limit_seconds, min_time_seconds, config, scoring_matrix)
VALUES
(
    'memory-match', 1, 'STARTER', 6, 8, 50, 2.0,
    '{"pairsCount": 6, "totalCards": 12, "cols": 3, "rows": 4, "cardSymbols": ["star", "heart", "moon", "diamond", "shield", "crown"]}'::jsonb,
    '{"base_points": 1000, "accuracy_multiplier": 1.2, "speed_bonus_max": 300}'::jsonb
),
(
    'memory-match', 2, 'STARTER', 7, 10, 52, 2.5,
    '{"pairsCount": 7, "totalCards": 14, "cols": 4, "rows": 4, "cardSymbols": ["star", "heart", "moon", "diamond", "shield", "crown", "bolt"]}'::jsonb,
    '{"base_points": 1100, "accuracy_multiplier": 1.2, "speed_bonus_max": 320}'::jsonb
),
(
    'memory-match', 3, 'EASY', 8, 11, 55, 3.0,
    '{"pairsCount": 8, "totalCards": 16, "cols": 4, "rows": 4, "cardSymbols": ["star", "heart", "moon", "diamond", "shield", "crown", "bolt", "fire"]}'::jsonb,
    '{"base_points": 1200, "accuracy_multiplier": 1.2, "speed_bonus_max": 350}'::jsonb
)
ON CONFLICT (game_id, level_number) DO UPDATE SET
    config = EXCLUDED.config,
    optimal_moves = EXCLUDED.optimal_moves,
    par_moves = EXCLUDED.par_moves;

-- 3. SEED PUZZLE LEVELS FOR FLIP-TILE
INSERT INTO puzzle_levels (game_id, level_number, difficulty_tier, optimal_moves, par_moves, time_limit_seconds, min_time_seconds, config, scoring_matrix)
VALUES
(
    'flip-tile', 1, 'STARTER', 8, 12, 60, 2.0,
    '{"rows": 4, "cols": 4, "theme": "nature", "pairsCount": 8}'::jsonb,
    '{"base_points": 1000, "move_bonus": 400, "speed_bonus_max": 300}'::jsonb
),
(
    'flip-tile', 2, 'STARTER', 9, 13, 60, 2.2,
    '{"rows": 4, "cols": 4, "theme": "food", "pairsCount": 8}'::jsonb,
    '{"base_points": 1050, "move_bonus": 420, "speed_bonus_max": 300}'::jsonb
)
ON CONFLICT (game_id, level_number) DO UPDATE SET
    config = EXCLUDED.config,
    optimal_moves = EXCLUDED.optimal_moves;

-- 4. SEED SYNCHRONIZED DAILY CHALLENGE
INSERT INTO daily_challenges (challenge_date, game_id, title, difficulty_tier, level_config, target_moves, par_time_seconds, bonus_multiplier, coin_reward)
VALUES
(
    CURRENT_DATE,
    'sorting-balls',
    'The Daily Grand Sorting Labyrinth',
    'DAILY_MASTER',
    '{"capacity": 4, "tubes": [["blue", "red", "yellow", "cyan"], ["cyan", "yellow", "red", "blue"], ["yellow", "cyan", "blue", "red"], ["red", "blue", "cyan", "yellow"], [], []]}'::jsonb,
    18,
    75,
    1.40,
    30
),
(
    CURRENT_DATE,
    'memory-match',
    'The Daily Cognitive Recall Trial',
    'DAILY_MASTER',
    '{"pairsCount": 10, "totalCards": 20, "cols": 5, "rows": 4, "cardSymbols": ["star", "heart", "moon", "diamond", "shield", "crown", "bolt", "fire", "gem", "key"]}'::jsonb,
    14,
    60,
    1.35,
    25
)
ON CONFLICT (challenge_date, game_id) DO UPDATE SET
    level_config = EXCLUDED.level_config,
    target_moves = EXCLUDED.target_moves;

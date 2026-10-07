-- ==============================================================================
-- GoDigital — Baseline Seeds (Port 5442 / godigital_db)
-- Catalog of 12 Puzzle/Brain Games (1 Tournament + 11 Free Passes)
-- ==============================================================================

-- 1. Default Admin Users
INSERT INTO admin_users (id, username, email, password_hash, role)
VALUES 
    ('b0000000-0000-0000-0000-000000000001', 'superadmin', 'admin@godigital.innopulseplatform.com', '$2b$10$7Z/l8K9QZg4e1oU6Qk7sNuR1aLzBvY7p0oQY6dZtLw6oVqZl9rQeS', 'SUPER_ADMIN'),
    ('b0000000-0000-0000-0000-000000000002', 'godigital_auditor', 'auditor@godigital.innopulseplatform.com', '$2b$10$7Z/l8K9QZg4e1oU6Qk7sNuR1aLzBvY7p0oQY6dZtLw6oVqZl9rQeS', 'AUDITOR')
ON CONFLICT (username) DO NOTHING;

-- 2. GoDigital 12 Games Catalog (1 Tournament + 11 Free Passes)
INSERT INTO games (game_id, title, category, is_free, requires_coins, is_enabled, max_score_per_sec, max_score)
VALUES
    ('helix-jump', 'Helix Jump', 'arcade', false, true, true, 50, 10000),             -- 🏆 TOURNAMENT (2 Coins)
    ('bubble-shooter', 'Bubble Shooter', 'casual', true, false, true, 60, 15000),       -- ⭐ FREE PASS
    ('emoji-iq', 'Emoji IQ', 'knowledge', true, false, true, 25, 1000),                 -- ⭐ FREE PASS
    ('royal-water-sort', 'Royal Water Sort', 'puzzle', true, false, true, 50, 5000),    -- ⭐ FREE PASS
    ('hill-rider', 'Hill Climb', 'racing', true, false, true, 80, 20000),               -- ⭐ FREE PASS
    ('sorting-balls', 'Sorting Ball', 'puzzle', true, false, true, 40, 4000),           -- ⭐ FREE PASS
    ('puzzle-block', 'Block', 'puzzle', true, false, true, 50, 12000),                  -- ⭐ FREE PASS
    ('memory-match', 'Memory Match', 'knowledge', true, false, true, 30, 3000),         -- ⭐ FREE PASS
    ('color-rush', 'Color Rush', 'arcade', true, false, true, 40, 5000),                -- ⭐ FREE PASS
    ('solitaire', 'Solitaire', 'cards', true, false, true, 50, 10000),                  -- ⭐ FREE PASS
    ('emoji-sorting-ball', 'Emoji Sorting Ball', 'puzzle', true, false, true, 40, 5000), -- ⭐ FREE PASS
    ('flip-tile', 'Flip Tile', 'puzzle', true, false, true, 35, 3000)                   -- ⭐ FREE PASS
ON CONFLICT (game_id) DO UPDATE SET
    is_free = EXCLUDED.is_free,
    requires_coins = EXCLUDED.requires_coins;

-- 3. Active Weekly Tournament: Helix Jump Championship
INSERT INTO tournaments (id, title, game_id, start_date, end_date, prize_pool_etb, status)
VALUES
    ('tourn_helix_jump_01', 'Helix Tower Grand Prix', 'helix-jump', NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days', 25000, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Contenders for Helix Jump Tournament
INSERT INTO tournament_entries (tournament_id, player_msisdn, masked_msisdn, score, rank, prize_etb)
VALUES
    ('tourn_helix_jump_01', '251911998890', '091*****890', 4850, 1, 10000),
    ('tourn_helix_jump_01', '251922334412', '092*****412', 4320, 2, 6000),
    ('tourn_helix_jump_01', '251933445589', '093*****589', 3950, 3, 3000),
    ('tourn_helix_jump_01', '251944556633', '094*****633', 3420, 4, 1000),
    ('tourn_helix_jump_01', '251955667744', '095*****744', 3180, 5, 1000)
ON CONFLICT (tournament_id, player_msisdn) DO NOTHING;

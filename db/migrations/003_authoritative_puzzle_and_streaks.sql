-- ==============================================================================
-- GoDigital — Authoritative Puzzle Engine, Anti-Cheat, and Timezone Streaks
-- Migration: 003_authoritative_puzzle_and_streaks.sql
-- Target: PostgreSQL 16
-- Mandate: Zero Mock Data, Server-Authoritative Verification, Atomic Telebirr Wallet
-- ==============================================================================

-- 1. PUZZLE DEFINITIONS & LEVEL MASTER CATALOG
CREATE TABLE IF NOT EXISTS puzzle_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id VARCHAR(50) NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    level_number INT NOT NULL,
    difficulty_tier VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',
    optimal_moves INT NOT NULL,
    par_moves INT NOT NULL,
    time_limit_seconds INT NOT NULL DEFAULT 60,
    min_time_seconds NUMERIC(10,2) NOT NULL DEFAULT 1.0,
    config JSONB NOT NULL,
    scoring_matrix JSONB NOT NULL DEFAULT '{"base_points": 1000, "move_bonus": 500, "speed_bonus_max": 400}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(game_id, level_number)
);

CREATE INDEX IF NOT EXISTS idx_puzzle_levels_game_level ON puzzle_levels(game_id, level_number);

-- 2. USER PUZZLE PROGRESSION (Zero Client-Side Progress Trust)
CREATE TABLE IF NOT EXISTS user_puzzle_progress (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    game_id VARCHAR(50) NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    level_number INT NOT NULL,
    stars INT NOT NULL DEFAULT 1 CHECK (stars >= 1 AND stars <= 3),
    best_score INT NOT NULL DEFAULT 0,
    best_moves INT NOT NULL DEFAULT 0,
    best_time_seconds NUMERIC(10,2) NOT NULL DEFAULT 0,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, game_id, level_number)
);

CREATE INDEX IF NOT EXISTS idx_user_puzzle_progress_user ON user_puzzle_progress(user_id, game_id);

-- 3. SYNCHRONIZED DAILY CHALLENGES
CREATE TABLE IF NOT EXISTS daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_date DATE NOT NULL,
    game_id VARCHAR(50) NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    difficulty_tier VARCHAR(30) NOT NULL DEFAULT 'DAILY_MASTER',
    level_config JSONB NOT NULL,
    target_moves INT NOT NULL,
    par_time_seconds INT NOT NULL DEFAULT 60,
    bonus_multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.35,
    coin_reward INT NOT NULL DEFAULT 25,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(challenge_date, game_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_challenges_lookup ON daily_challenges(challenge_date, game_id);

-- 4. DAILY CHALLENGE SUBMISSIONS & HIGH-CONCURRENCY LEADERBOARD INDEX
CREATE TABLE IF NOT EXISTS daily_challenge_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    challenge_date DATE NOT NULL,
    game_id VARCHAR(50) NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    score INT NOT NULL,
    moves_count INT NOT NULL,
    duration_seconds NUMERIC(10,2) NOT NULL,
    session_id VARCHAR(100),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, challenge_date, game_id)
);

-- Pillar 4 Mandated High-Performance Index avoiding table scans
CREATE INDEX IF NOT EXISTS idx_daily_challenge_leaderboard 
    ON daily_challenge_submissions(challenge_date, score DESC, completed_at ASC);

CREATE INDEX IF NOT EXISTS idx_daily_challenge_game_leaderboard 
    ON daily_challenge_submissions(challenge_date, game_id, score DESC, completed_at ASC);

-- 5. ATOMIC WALLET LEDGER & COIN TRANSACTIONS
CREATE TABLE IF NOT EXISTS coin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'INITIAL_GRANT', 
        'DAILY_STREAK', 
        'HINT_DEDUCTION', 
        'TOURNAMENT_ENTRY', 
        'TELEBIRR_TOPUP', 
        'LEVEL_REWARD', 
        'CHALLENGE_REWARD', 
        'UNDO_DEDUCTION', 
        'ADMIN_ADJUSTMENT'
    )),
    amount INT NOT NULL,
    balance_after INT NOT NULL CHECK (balance_after >= 0),
    reference_id VARCHAR(100),
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coin_txs_user ON coin_transactions(user_id, created_at DESC);

-- 6. ENHANCE GAME SESSIONS WITH SINGLE-USE NONCE & TELEMETRY
ALTER TABLE game_sessions 
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS nonce VARCHAR(64) UNIQUE,
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    ADD COLUMN IF NOT EXISTS level_number INT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS moves_count INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS duration_seconds NUMERIC(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS telemetry JSONB,
    ADD COLUMN IF NOT EXISTS fraud_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_game_sessions_nonce ON game_sessions(nonce);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);

-- 7. ENHANCE USER STREAKS WITH EAT (Africa/Addis_Ababa) TIMEZONE LOGIC
ALTER TABLE user_streaks
    ADD COLUMN IF NOT EXISTS total_claims INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 8. ATOMIC STORED FUNCTION: CLAIM DAILY STREAK IN AFRICA/ADDIS_ABABA TIMEZONE
CREATE OR REPLACE FUNCTION claim_daily_streak_eat(
    p_user_id UUID
) RETURNS TABLE(
    success BOOLEAN,
    current_streak INT,
    longest_streak INT,
    coins_awarded INT,
    new_coin_balance INT,
    message TEXT
) AS $$
DECLARE
    v_today_eat DATE;
    v_last_claimed DATE;
    v_current_streak INT;
    v_longest_streak INT;
    v_reward INT;
    v_new_balance INT;
BEGIN
    -- Authoritative Ethiopian Midnight Date (UTC+3)
    v_today_eat := (NOW() AT TIME ZONE 'Africa/Addis_Ababa')::DATE;

    -- Lock streak row for atomic update
    SELECT us.current_streak, us.longest_streak, us.last_claimed
      INTO v_current_streak, v_longest_streak, v_last_claimed
      FROM user_streaks us
     WHERE us.user_id = p_user_id
       FOR UPDATE;

    IF NOT FOUND THEN
        INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_claimed, total_claims, updated_at)
        VALUES (p_user_id, 0, 0, NULL, 0, NOW())
        RETURNING user_streaks.current_streak, user_streaks.longest_streak, user_streaks.last_claimed
        INTO v_current_streak, v_longest_streak, v_last_claimed;
    END IF;

    -- Check if already claimed today
    IF v_last_claimed IS NOT NULL AND v_last_claimed = v_today_eat THEN
        SELECT p.coins INTO v_new_balance FROM profiles p WHERE p.id = p_user_id;
        RETURN QUERY SELECT FALSE, v_current_streak, v_longest_streak, 0, v_new_balance::INT, 'Daily streak reward already claimed for today.'::TEXT;
        RETURN;
    END IF;

    -- Consecutive day calculation based on server midnight EAT
    IF v_last_claimed IS NOT NULL AND v_last_claimed = (v_today_eat - 1) THEN
        v_current_streak := v_current_streak + 1;
    ELSE
        -- Streak broken or initial claim
        v_current_streak := 1;
    END IF;

    IF v_current_streak > v_longest_streak THEN
        v_longest_streak := v_current_streak;
    END IF;

    -- Calculate scaled reward: 10 base + 5 per streak day, capped at 50 coins
    v_reward := LEAST(50, 10 + (v_current_streak * 5));

    -- Atomic profile coin update
    UPDATE profiles
       SET coins = coins + v_reward,
           updated_at = NOW()
     WHERE id = p_user_id
    RETURNING coins INTO v_new_balance;

    -- Record transaction ledger
    INSERT INTO coin_transactions (user_id, type, amount, balance_after, reference_id, description)
    VALUES (
        p_user_id, 
        'DAILY_STREAK', 
        v_reward, 
        v_new_balance, 
        'STRK_' || v_today_eat || '_' || v_current_streak,
        'Daily Streak Day ' || v_current_streak || ' Reward (Addis Ababa Midnight)'
    );

    -- Update user_streaks record
    UPDATE user_streaks
       SET current_streak = v_current_streak,
           longest_streak = v_longest_streak,
           last_claimed = v_today_eat,
           total_claims = total_claims + 1,
           updated_at = NOW()
     WHERE user_id = p_user_id;

    RETURN QUERY SELECT TRUE, v_current_streak, v_longest_streak, v_reward, v_new_balance, 'Daily streak successfully claimed!'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 9. ATOMIC STORED FUNCTION: DEDUCT COINS WITH STRICT CHECK
CREATE OR REPLACE FUNCTION deduct_coins_atomic(
    p_user_id UUID,
    p_amount INT,
    p_tx_type VARCHAR(50),
    p_ref_id VARCHAR(100),
    p_desc VARCHAR(255)
) RETURNS TABLE(
    success BOOLEAN,
    new_balance INT,
    error_message TEXT
) AS $$
DECLARE
    v_balance INT;
BEGIN
    IF p_amount <= 0 THEN
        RETURN QUERY SELECT FALSE, 0, 'Invalid deduction amount: must be positive'::TEXT;
        RETURN;
    END IF;

    -- Atomic check-and-decrement
    UPDATE profiles
       SET coins = coins - p_amount,
           updated_at = NOW()
     WHERE id = p_user_id
       AND coins >= p_amount
    RETURNING coins INTO v_balance;

    IF NOT FOUND THEN
        SELECT coins INTO v_balance FROM profiles WHERE id = p_user_id;
        RETURN QUERY SELECT FALSE, COALESCE(v_balance, 0)::INT, 'Insufficient coin balance'::TEXT;
        RETURN;
    END IF;

    -- Record immutable transaction log
    INSERT INTO coin_transactions (user_id, type, amount, balance_after, reference_id, description)
    VALUES (p_user_id, p_tx_type, -p_amount, v_balance, p_ref_id, p_desc);

    RETURN QUERY SELECT TRUE, v_balance, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

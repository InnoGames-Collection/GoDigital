-- ==============================================================================
-- GoDigital — Telebirr Game Center Migration
-- Target: PostgreSQL 16 (Port 5442)
-- Service: GoDigital Casual & Family Games Hub (telebirr SuperApp)
-- ==============================================================================

-- 1. Create or extend profiles / players table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    phone_local VARCHAR(10) GENERATED ALWAYS AS ('0' || SUBSTRING(phone FROM 5)) STORED,
    display_name VARCHAR(50) NOT NULL DEFAULT 'GoDigital Player',
    avatar_id VARCHAR(30) NOT NULL DEFAULT 'avatar_runner',
    coins BIGINT NOT NULL DEFAULT 50 CHECK (coins >= 0),
    xp BIGINT NOT NULL DEFAULT 0 CHECK (xp >= 0),
    level INT GENERATED ALWAYS AS (1 + (xp / 1000)::INT) STORED,
    energy INT NOT NULL DEFAULT 5 CHECK (energy >= 0),
    max_energy INT NOT NULL DEFAULT 5,
    last_energy_refill_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    telebirr_linked BOOLEAN NOT NULL DEFAULT TRUE,
    telebirr_id VARCHAR(64),
    telebirr_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    matches_played INT NOT NULL DEFAULT 0,
    trophies_count INT NOT NULL DEFAULT 0,
    role VARCHAR(10) NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'admin')),
    has_received_initial_coins BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_godigital_profiles_phone ON profiles(phone);

-- 2. Telebirr Payment Orders Table (C2B Gateway Orders)
CREATE TABLE IF NOT EXISTS payment_orders (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    method VARCHAR(20) NOT NULL DEFAULT 'TELEBIRR',
    amount_etb NUMERIC(12,2) NOT NULL,
    item_type VARCHAR(30) NOT NULL CHECK (item_type IN ('VIP_SUBSCRIPTION', 'COIN_PACK', 'ENERGY_PACK')),
    item_title VARCHAR(200) NOT NULL,
    coins BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(15) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED')),
    provider_ref VARCHAR(255),
    error_message TEXT,
    msisdn_masked VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_godigital_orders_user ON payment_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_godigital_orders_status ON payment_orders(status);

-- 3. High Scores & Daily Scores
CREATE TABLE IF NOT EXISTS high_scores (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    game_id VARCHAR(50) NOT NULL,
    best_score INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, game_id)
);

CREATE TABLE IF NOT EXISTS daily_scores (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    game_id VARCHAR(50) NOT NULL,
    score_date DATE NOT NULL DEFAULT CURRENT_DATE,
    best_score INT NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, game_id, score_date)
);

CREATE INDEX IF NOT EXISTS idx_godigital_daily_scores ON daily_scores(score_date, game_id, best_score DESC);

-- 4. User Streaks & Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    language VARCHAR(5) NOT NULL DEFAULT 'en',
    audio BOOLEAN NOT NULL DEFAULT TRUE,
    haptics BOOLEAN NOT NULL DEFAULT TRUE,
    notifications BOOLEAN NOT NULL DEFAULT TRUE,
    low_data BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_streaks (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    current_streak INT NOT NULL DEFAULT 1,
    last_claimed DATE DEFAULT CURRENT_DATE,
    longest_streak INT NOT NULL DEFAULT 1
);

-- 5. Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    msisdn VARCHAR(20) NOT NULL,
    service_id VARCHAR(50) NOT NULL DEFAULT 'srv_godigital',
    plan VARCHAR(20) NOT NULL DEFAULT 'daily',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    UNIQUE(msisdn, service_id)
);

-- 6. Atomic Coin Application Function
CREATE OR REPLACE FUNCTION apply_coins(
    p_user_id UUID,
    p_delta INT,
    p_reason VARCHAR(128),
    p_ref_id VARCHAR(64)
) RETURNS INT AS $$
DECLARE
    v_new_coins INT;
BEGIN
    UPDATE profiles 
       SET coins = GREATEST(0, coins + p_delta),
           updated_at = NOW()
     WHERE id = p_user_id
    RETURNING coins INTO v_new_coins;

    RETURN v_new_coins;
END;
$$ LANGUAGE plpgsql;

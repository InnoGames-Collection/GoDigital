-- ==============================================================================
-- TelePlus — Production Relational Schema
-- Target: PostgreSQL 16
-- Service: Telecom VAS Casual & Hyper-Casual Portal (Shortcode 9898 / 2 Birr/day)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Players Master Table
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    msisdn VARCHAR(20) NOT NULL UNIQUE,
    masked_msisdn VARCHAR(20) NOT NULL,
    coins INT NOT NULL DEFAULT 50 CHECK (coins >= 0),
    energy INT NOT NULL DEFAULT 100 CHECK (energy >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'BANNED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teleplus_players_msisdn ON players(msisdn);

-- 2. Telecom Subscriptions (SMS Shortcode 9898 / 2 ETB per day)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    msisdn VARCHAR(20) NOT NULL,
    shortcode VARCHAR(10) NOT NULL DEFAULT '9898',
    service_id VARCHAR(50) NOT NULL DEFAULT 'srv_teleplus_daily',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'UNSUBSCRIBED', 'SUSPENDED')),
    plan_type VARCHAR(20) NOT NULL DEFAULT 'daily',
    price_etb NUMERIC(10,2) NOT NULL DEFAULT 2.00,
    renew_count INT NOT NULL DEFAULT 1,
    last_billed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    next_billing_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 day'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teleplus_subs_msisdn ON subscriptions(msisdn);
CREATE INDEX IF NOT EXISTS idx_teleplus_subs_status ON subscriptions(status);

-- 3. SP Webhook Audit Log
CREATE TABLE IF NOT EXISTS sp_webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    request_id VARCHAR(100),
    msisdn VARCHAR(20) NOT NULL,
    service_id VARCHAR(50),
    raw_payload JSONB NOT NULL,
    signature_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Games Catalog Controller & Anti-Cheat Thresholds
CREATE TABLE IF NOT EXISTS games (
    game_id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    is_free BOOLEAN NOT NULL DEFAULT FALSE,
    requires_coins BOOLEAN NOT NULL DEFAULT FALSE,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    max_score_per_sec INT NOT NULL DEFAULT 100,
    max_score INT NOT NULL DEFAULT 100000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Game Sessions & Anti-Cheat Telemetry
CREATE TABLE IF NOT EXISTS game_sessions (
    session_id VARCHAR(100) PRIMARY KEY,
    player_msisdn VARCHAR(20) NOT NULL,
    game_id VARCHAR(50) NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    score INT NOT NULL DEFAULT 0,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    fraud_flag BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_sessions_player ON game_sessions(player_msisdn);

-- 6. Weekly Tournaments
CREATE TABLE IF NOT EXISTS tournaments (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    game_id VARCHAR(50) NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    prize_pool_etb INT NOT NULL DEFAULT 20000,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('UPCOMING', 'ACTIVE', 'FINALIZED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Tournament Entries & Leaderboards
CREATE TABLE IF NOT EXISTS tournament_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id VARCHAR(50) NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    player_msisdn VARCHAR(20) NOT NULL,
    masked_msisdn VARCHAR(20) NOT NULL,
    score INT NOT NULL DEFAULT 0,
    rank INT,
    prize_etb INT NOT NULL DEFAULT 0,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tournament_id, player_msisdn)
);

CREATE INDEX IF NOT EXISTS idx_tourn_entries_score ON tournament_entries(tournament_id, score DESC);

-- 8. Coin Orders (Airtime Top-ups)
CREATE TABLE IF NOT EXISTS coin_orders (
    order_id VARCHAR(50) PRIMARY KEY,
    player_msisdn VARCHAR(20) NOT NULL,
    coins INT NOT NULL,
    price_etb NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'SUPER_ADMIN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Admin Audit Logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id VARCHAR(100),
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

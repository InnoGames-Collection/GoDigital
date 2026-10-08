-- ==============================================================================
-- GoDigital — Tier-0 Enterprise Admin & Skill Catalog Console Migration
-- Migration: 004_admin_enterprise_schema.sql
-- Target: PostgreSQL 16
-- Tables: admin_users, admin_audit_logs, puzzle_levels (extended), daily_challenges (extended), puzzle_level_analytics
-- ==============================================================================

-- 1. Admin Users Master Table with RBAC and Account Lockout Defense
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50),
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL DEFAULT 'Admin User',
    role VARCHAR(30) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'CONTENT_CREATOR', 'OPERATIONS_MANAGER', 'AUDITOR', 'FINANCIAL_AUDITOR')),
    department VARCHAR(100) NOT NULL DEFAULT 'Operations',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Harmonize admin_users columns if already created in 001
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS username VARCHAR(50);
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS name VARCHAR(100) DEFAULT 'Admin User';
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT 'Operations';
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS failed_login_attempts INT NOT NULL DEFAULT 0;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE admin_users ALTER COLUMN username DROP NOT NULL;

-- Harmonize role check constraint to support SUPER_ADMIN and AUDITOR per port allocation
ALTER TABLE admin_users DROP CONSTRAINT IF EXISTS chk_admin_role;
ALTER TABLE admin_users DROP CONSTRAINT IF EXISTS admin_users_role_check;
ALTER TABLE admin_users ADD CONSTRAINT chk_admin_role CHECK (role IN ('SUPER_ADMIN', 'CONTENT_CREATOR', 'OPERATIONS_MANAGER', 'AUDITOR', 'FINANCIAL_AUDITOR'));

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

-- 2. Immutable Admin Audit Logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    admin_email VARCHAR(150) NOT NULL,
    admin_role VARCHAR(30) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100),
    previous_state JSONB,
    new_state JSONB,
    reason TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON admin_audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON admin_audit_logs(admin_id);

-- 3. Dynamic Puzzle Catalog & Level Progression Curves (Create or Harmonize)
CREATE TABLE IF NOT EXISTS puzzle_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id VARCHAR(50) NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    level_number INT NOT NULL,
    title VARCHAR(150) NOT NULL DEFAULT 'Level',
    category VARCHAR(50) NOT NULL DEFAULT 'puzzle',
    difficulty VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    puzzle_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    solution_data JSONB,
    min_moves INT NOT NULL DEFAULT 5,
    par_time_seconds INT NOT NULL DEFAULT 60,
    hint_cost_coins INT NOT NULL DEFAULT 10 CHECK (hint_cost_coins >= 0),
    stars_to_unlock INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED')),
    version INT NOT NULL DEFAULT 1,
    created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_game_level UNIQUE (game_id, level_number)
);

-- Harmonize columns if puzzle_levels was created by 003
ALTER TABLE puzzle_levels ADD COLUMN IF NOT EXISTS title VARCHAR(150) DEFAULT 'Level';
ALTER TABLE puzzle_levels ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'puzzle';
ALTER TABLE puzzle_levels ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'MEDIUM';
ALTER TABLE puzzle_levels ADD COLUMN IF NOT EXISTS puzzle_data JSONB;
ALTER TABLE puzzle_levels ADD COLUMN IF NOT EXISTS solution_data JSONB;
ALTER TABLE puzzle_levels ADD COLUMN IF NOT EXISTS min_moves INT DEFAULT 5;
ALTER TABLE puzzle_levels ADD COLUMN IF NOT EXISTS par_time_seconds INT DEFAULT 60;
ALTER TABLE puzzle_levels ADD COLUMN IF NOT EXISTS hint_cost_coins INT DEFAULT 10;
ALTER TABLE puzzle_levels ADD COLUMN IF NOT EXISTS stars_to_unlock INT DEFAULT 0;
ALTER TABLE puzzle_levels ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';
ALTER TABLE puzzle_levels ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE puzzle_levels ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES admin_users(id);
ALTER TABLE puzzle_levels ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES admin_users(id);

-- Synchronize legacy columns if present
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'puzzle_levels' AND column_name = 'config') THEN
        UPDATE puzzle_levels SET puzzle_data = config WHERE puzzle_data IS NULL AND config IS NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'puzzle_levels' AND column_name = 'optimal_moves') THEN
        UPDATE puzzle_levels SET min_moves = optimal_moves WHERE min_moves IS NULL AND optimal_moves IS NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'puzzle_levels' AND column_name = 'difficulty_tier') THEN
        UPDATE puzzle_levels SET difficulty = difficulty_tier WHERE difficulty IS NULL AND difficulty_tier IS NOT NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_puzzle_levels_game ON puzzle_levels(game_id, level_number);
CREATE INDEX IF NOT EXISTS idx_puzzle_levels_difficulty ON puzzle_levels(difficulty);
CREATE INDEX IF NOT EXISTS idx_puzzle_levels_status ON puzzle_levels(status);

-- 4. Daily Brain Training & Skill Challenges Calendar (Create or Harmonize)
CREATE TABLE IF NOT EXISTS daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_date DATE NOT NULL UNIQUE,
    game_id VARCHAR(50) NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    puzzle_level_id UUID REFERENCES puzzle_levels(id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    bonus_coins INT NOT NULL DEFAULT 25 CHECK (bonus_coins >= 0),
    target_score INT NOT NULL DEFAULT 1000,
    time_limit_seconds INT NOT NULL DEFAULT 120,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    participants_count INT NOT NULL DEFAULT 0,
    completions_count INT NOT NULL DEFAULT 0,
    top_score INT NOT NULL DEFAULT 0,
    created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Harmonize daily_challenges columns
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS puzzle_level_id UUID REFERENCES puzzle_levels(id) ON DELETE SET NULL;
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'MEDIUM';
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS bonus_coins INT DEFAULT 25;
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS target_score INT DEFAULT 1000;
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS time_limit_seconds INT DEFAULT 120;
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'SCHEDULED';
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS participants_count INT DEFAULT 0;
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS completions_count INT DEFAULT 0;
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS top_score INT DEFAULT 0;
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES admin_users(id);
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Synchronize daily challenges legacy columns if present
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_challenges' AND column_name = 'coin_reward') THEN
        UPDATE daily_challenges SET bonus_coins = coin_reward WHERE bonus_coins IS NULL AND coin_reward IS NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_challenges' AND column_name = 'par_time_seconds') THEN
        UPDATE daily_challenges SET time_limit_seconds = par_time_seconds WHERE time_limit_seconds IS NULL AND par_time_seconds IS NOT NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(challenge_date);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_status ON daily_challenges(status);

-- 5. Puzzle Level Progression Analytics (Completion & Drop-off Rates)
CREATE TABLE IF NOT EXISTS puzzle_level_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id VARCHAR(50) NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    level_number INT NOT NULL,
    attempts_count INT NOT NULL DEFAULT 0,
    completions_count INT NOT NULL DEFAULT 0,
    avg_duration_seconds NUMERIC(10,2) NOT NULL DEFAULT 0,
    drop_off_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
    hints_used_count INT NOT NULL DEFAULT 0,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_game_level_date UNIQUE (game_id, level_number, recorded_date)
);

CREATE INDEX IF NOT EXISTS idx_puzzle_analytics_game_level ON puzzle_level_analytics(game_id, level_number);

-- 6. Initial Bootstrap Seed Data
-- Alignment per ITG/shared-infra/PORT_ALLOCATION_CREDENTIALS_AND_ONBOARDING.md:
--   Super Admin: superadmin (admin@godigital.innopulseplatform.com) / AdminPass@2026 / SUPER_ADMIN
--   Auditor:     godigital_auditor (auditor@godigital.innopulseplatform.com) / AdminPass@2026 / AUDITOR
--   Demo Player: 0977057270 / OTP: 123456 / 100 Coins
INSERT INTO admin_users (username, email, password_hash, name, role, department, is_active)
VALUES
    ('superadmin', 'admin@godigital.innopulseplatform.com', '8f3e2a1b9c4d5e6f7a8b9c0d1e2f3a4b:bd1638c32807be94f2a4a6d0e6dc04f4086f6b931c981ee3d36ca45b73890d7daaf9ec36dc982ab5abacf24bfee31056787ddb4d456ec623d992d7b886cbb718', 'Super Admin', 'SUPER_ADMIN', 'Executive Operations', TRUE),
    ('godigital_auditor', 'auditor@godigital.innopulseplatform.com', '8f3e2a1b9c4d5e6f7a8b9c0d1e2f3a4b:bd1638c32807be94f2a4a6d0e6dc04f4086f6b931c981ee3d36ca45b73890d7daaf9ec36dc982ab5abacf24bfee31056787ddb4d456ec623d992d7b886cbb718', 'Financial Auditor', 'AUDITOR', 'Security & Telebirr Audit', TRUE),
    ('dawit_admin', 'admin@godigital.et', '8f3e2a1b9c4d5e6f7a8b9c0d1e2f3a4b:a508e4c898a32b1e2c01dea5361388e30c8615293ea515713f572b7c23d6c77f9e395b65a3a05a6be7c9ade9e6b5fa510411a32fecba456f5d664af38fdc9c8f', 'Dawit Alemu (Super Admin)', 'SUPER_ADMIN', 'Executive Operations', TRUE),
    ('creator', 'creator@godigital.et', '8f3e2a1b9c4d5e6f7a8b9c0d1e2f3a4b:a508e4c898a32b1e2c01dea5361388e30c8615293ea515713f572b7c23d6c77f9e395b65a3a05a6be7c9ade9e6b5fa510411a32fecba456f5d664af38fdc9c8f', 'Bethlehem Tadesse (Content Lead)', 'CONTENT_CREATOR', 'Game Design & Catalog', TRUE),
    ('ops_manager', 'ops@godigital.et', '8f3e2a1b9c4d5e6f7a8b9c0d1e2f3a4b:a508e4c898a32b1e2c01dea5361388e30c8615293ea515713f572b7c23d6c77f9e395b65a3a05a6be7c9ade9e6b5fa510411a32fecba456f5d664af38fdc9c8f', 'Yonas Haile (Ops Manager)', 'OPERATIONS_MANAGER', 'Player Support & Billing', TRUE),
    ('auditor', 'auditor@godigital.et', '8f3e2a1b9c4d5e6f7a8b9c0d1e2f3a4b:a508e4c898a32b1e2c01dea5361388e30c8615293ea515713f572b7c23d6c77f9e395b65a3a05a6be7c9ade9e6b5fa510411a32fecba456f5d664af38fdc9c8f', 'Meron Bekele (Compliance Auditor)', 'AUDITOR', 'Security & Telebirr Audit', TRUE)
ON CONFLICT (email) DO UPDATE SET
    username = EXCLUDED.username,
    password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    is_active = TRUE,
    failed_login_attempts = 0,
    locked_until = NULL,
    updated_at = NOW();

-- Seed Preloaded Demo Player (MSISDN: 0977057270 / 100 Coins)
INSERT INTO profiles (phone, display_name, avatar_id, coins, energy, telebirr_linked, telebirr_balance)
VALUES ('+251977057270', 'Demo Player (100 Coins)', 'avatar_runner', 100, 5, TRUE, 0.00)
ON CONFLICT (phone) DO UPDATE SET
    coins = GREATEST(profiles.coins, 100),
    telebirr_linked = TRUE,
    updated_at = NOW();

-- Initial Seed Levels for Core Puzzle Titles
INSERT INTO puzzle_levels (game_id, level_number, title, category, difficulty, min_moves, par_time_seconds, hint_cost_coins, puzzle_data, solution_data)
VALUES
    ('royal-water-sort', 1, 'Royal Liquid Intro', 'puzzle', 'EASY', 4, 30, 5, '{"tubes": [["#ef4444", "#3b82f6"], ["#ef4444", "#3b82f6"], []], "tubeCapacity": 4}'::jsonb, '{"optimalMoves": [0, 2, 1, 0, 2, 1]}'::jsonb),
    ('royal-water-sort', 2, 'Triple Spectrum', 'puzzle', 'EASY', 6, 45, 5, '{"tubes": [["#ef4444", "#10b981", "#3b82f6"], ["#10b981", "#3b82f6", "#ef4444"], ["#3b82f6", "#ef4444", "#10b981"], []], "tubeCapacity": 4}'::jsonb, '{"moves": 6}'::jsonb),
    ('royal-water-sort', 3, 'Crystal Chasm', 'puzzle', 'MEDIUM', 10, 60, 10, '{"tubes": [["#f59e0b", "#8b5cf6", "#ec4899", "#10b981"], ["#8b5cf6", "#10b981", "#f59e0b", "#ec4899"], ["#ec4899", "#f59e0b", "#8b5cf6", "#10b981"], []], "tubeCapacity": 4}'::jsonb, '{"moves": 10}'::jsonb),
    ('emoji-iq', 1, 'Fruit Arithmetic Baseline', 'brain', 'EASY', 3, 40, 5, '{"equation": "🍎 + 🍎 = 10; 🍎 + 🍌 = 9; 🍌 = ?", "options": [3, 4, 5, 6], "answer": 4}'::jsonb, '{"correct": 4}'::jsonb),
    ('emoji-iq', 2, 'Animals Algebra', 'brain', 'MEDIUM', 4, 50, 10, '{"equation": "🦁 * 🦁 = 36; 🦁 + 🐯 = 11; 🐯 * 2 = ?", "options": [8, 10, 12, 14], "answer": 10}'::jsonb, '{"correct": 10}'::jsonb),
    ('bubble-shooter', 1, 'Emerald Cluster Warmup', 'puzzle', 'EASY', 8, 45, 5, '{"grid": "3x8", "colors": ["#10b981", "#3b82f6", "#ef4444"]}'::jsonb, '{"minClears": 5}'::jsonb)
ON CONFLICT (game_id, level_number) DO NOTHING;

-- Initial Audit Log Entry for Bootstrap
INSERT INTO admin_audit_logs (admin_email, admin_role, action, resource_type, resource_id, reason, previous_state, new_state)
VALUES
    ('admin@godigital.et', 'SUPER_ADMIN', 'SYSTEM_INITIALIZATION', 'SYSTEM', 'bootstrap', 'Initial Tier-0 enterprise security & catalog migration executed.', NULL, '{"version": "1.0.0", "status": "INITIALIZED"}'::jsonb);

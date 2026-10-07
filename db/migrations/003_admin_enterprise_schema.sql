-- ==============================================================================
-- GoDigital — Tier-0 Enterprise Admin & Skill Catalog Console Migration
-- Target: PostgreSQL 16
-- Tables: admin_users, admin_audit_logs, puzzle_levels, daily_challenges, puzzle_level_analytics
-- ==============================================================================

-- 1. Admin Users Master Table with RBAC and Account Lockout Defense
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'CONTENT_CREATOR', 'OPERATIONS_MANAGER', 'AUDITOR')),
    department VARCHAR(100) NOT NULL DEFAULT 'Operations',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
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

-- 3. Dynamic Puzzle Catalog & Level Progression Curves
CREATE TABLE IF NOT EXISTS puzzle_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id VARCHAR(50) NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    level_number INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'puzzle',
    difficulty VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD', 'EXPERT')),
    puzzle_data JSONB NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_puzzle_levels_game ON puzzle_levels(game_id, level_number);
CREATE INDEX IF NOT EXISTS idx_puzzle_levels_difficulty ON puzzle_levels(difficulty);
CREATE INDEX IF NOT EXISTS idx_puzzle_levels_status ON puzzle_levels(status);

-- 4. Daily Brain Training & Skill Challenges Calendar
CREATE TABLE IF NOT EXISTS daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_date DATE NOT NULL UNIQUE,
    game_id VARCHAR(50) NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    puzzle_level_id UUID REFERENCES puzzle_levels(id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD', 'EXPERT')),
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
-- Default Admin Accounts (Password: Admin@GoDigital2026!)
INSERT INTO admin_users (email, password_hash, name, role, department)
VALUES
    ('admin@godigital.et', '8f3e2a1b9c4d5e6f7a8b9c0d1e2f3a4b:a508e4c898a32b1e2c01dea5361388e30c8615293ea515713f572b7c23d6c77f9e395b65a3a05a6be7c9ade9e6b5fa510411a32fecba456f5d664af38fdc9c8f', 'Dawit Alemu (Super Admin)', 'SUPER_ADMIN', 'Executive Operations'),
    ('creator@godigital.et', '8f3e2a1b9c4d5e6f7a8b9c0d1e2f3a4b:a508e4c898a32b1e2c01dea5361388e30c8615293ea515713f572b7c23d6c77f9e395b65a3a05a6be7c9ade9e6b5fa510411a32fecba456f5d664af38fdc9c8f', 'Bethlehem Tadesse (Content Lead)', 'CONTENT_CREATOR', 'Game Design & Catalog'),
    ('ops@godigital.et', '8f3e2a1b9c4d5e6f7a8b9c0d1e2f3a4b:a508e4c898a32b1e2c01dea5361388e30c8615293ea515713f572b7c23d6c77f9e395b65a3a05a6be7c9ade9e6b5fa510411a32fecba456f5d664af38fdc9c8f', 'Yonas Haile (Ops Manager)', 'OPERATIONS_MANAGER', 'Player Support & Billing'),
    ('auditor@godigital.et', '8f3e2a1b9c4d5e6f7a8b9c0d1e2f3a4b:a508e4c898a32b1e2c01dea5361388e30c8615293ea515713f572b7c23d6c77f9e395b65a3a05a6be7c9ade9e6b5fa510411a32fecba456f5d664af38fdc9c8f', 'Meron Bekele (Compliance Auditor)', 'AUDITOR', 'Security & Telebirr Audit')
ON CONFLICT (email) DO NOTHING;

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

-- Initial Daily Challenges
INSERT INTO daily_challenges (challenge_date, game_id, title, difficulty, bonus_coins, target_score, time_limit_seconds, status)
VALUES
    (CURRENT_DATE, 'royal-water-sort', 'Daily Liquid Flow Master', 'MEDIUM', 25, 1200, 90, 'ACTIVE'),
    (CURRENT_DATE + INTERVAL '1 day', 'emoji-iq', 'Daily Brain Equation Blitz', 'HARD', 35, 1500, 120, 'SCHEDULED'),
    (CURRENT_DATE + INTERVAL '2 day', 'bubble-shooter', 'Cascade Precision Challenge', 'MEDIUM', 30, 2000, 100, 'SCHEDULED'),
    (CURRENT_DATE + INTERVAL '3 day', 'royal-water-sort', 'Grand Vial Separation', 'EXPERT', 50, 2500, 150, 'SCHEDULED')
ON CONFLICT (challenge_date) DO NOTHING;

-- Initial Audit Log Entry for Bootstrap
INSERT INTO admin_audit_logs (admin_email, admin_role, action, resource_type, resource_id, reason, previous_state, new_state)
VALUES
    ('admin@godigital.et', 'SUPER_ADMIN', 'SYSTEM_INITIALIZATION', 'SYSTEM', 'bootstrap', 'Initial Tier-0 enterprise security & catalog migration executed.', NULL, '{"version": "1.0.0", "status": "INITIALIZED"}'::jsonb);

-- ==============================================================================
-- GoDigital — Real-time Notification Engine Schema
-- Migration: 005_notifications_schema.sql
-- Target: PostgreSQL 16 (Port 5442)
-- Tables: notifications
-- ==============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'HIGH_SCORE', 'TOURNAMENT_QUALIFIED', 'COIN_CREDIT', 'DAILY_REWARD', 'SUBSCRIPTION', 'SYSTEM', 'WELCOME'
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    action_url VARCHAR(255),
    action_label VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_godigital_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_godigital_notifications_phone ON notifications(phone, is_read, created_at DESC);

-- Initial seed notifications for all existing registered profiles
INSERT INTO notifications (user_id, phone, type, title, message, metadata, is_read, action_url, action_label, created_at)
SELECT 
    p.id,
    p.phone,
    'WELCOME',
    'Welcome to GoDigital!',
    'Compete in the Helix Jump Grand Prix for your share of 10,000+ ETB in weekly telebirr prizes!',
    '{"category":"SYSTEM"}'::jsonb,
    FALSE,
    'tournament',
    'View Grand Prix',
    NOW() - INTERVAL '2 hours'
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM notifications n WHERE n.user_id = p.id AND n.type = 'WELCOME'
);

INSERT INTO notifications (user_id, phone, type, title, message, metadata, is_read, action_url, action_label, created_at)
SELECT 
    p.id,
    p.phone,
    'TOURNAMENT_QUALIFIED',
    'Helix Jump Tournament Live',
    'The Weekly Championship Cup is active. Set your tower score to climb into the top 10 prize zone!',
    '{"gameId":"helix-jump","category":"TOURNAMENT"}'::jsonb,
    FALSE,
    'leaderboard',
    'Leaderboard',
    NOW() - INTERVAL '30 minutes'
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM notifications n WHERE n.user_id = p.id AND n.type = 'TOURNAMENT_QUALIFIED'
);

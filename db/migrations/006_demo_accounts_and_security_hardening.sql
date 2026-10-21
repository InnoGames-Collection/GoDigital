-- ==============================================================================
-- GoDigital — Migration 006: Demo Accounts & Security Hardening
-- Target: PostgreSQL 16
-- Mandate: Database-driven demo phone numbers, strict constraints, and audit readiness
-- ==============================================================================

-- 1. Designated Demo Phone Numbers Registry (Mandated by INSA / Master Prompt Section 3)
CREATE TABLE IF NOT EXISTS demo_phone_numbers (
    phone VARCHAR(20) PRIMARY KEY,
    demo_otp VARCHAR(10) NOT NULL DEFAULT '123456',
    initial_coins INT NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    description VARCHAR(255) DEFAULT 'Approved INSA & Telebirr Auditor Demo Account',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_demo_phone_active ON demo_phone_numbers(phone, is_active);

-- Seed Designated Demo Auditor Account
INSERT INTO demo_phone_numbers (phone, demo_otp, initial_coins, is_active, description)
VALUES 
    ('+251977057270', '123456', 100, TRUE, 'Approved INSA & Telebirr Auditor Demo Account (MSISDN 0977057270)')
ON CONFLICT (phone) DO UPDATE SET
    demo_otp = EXCLUDED.demo_otp,
    initial_coins = EXCLUDED.initial_coins,
    is_active = TRUE,
    updated_at = NOW();

-- 2. Ensure subscriptions table has unique constraint on (msisdn, service_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_subscriptions_msisdn_service'
    ) THEN
        ALTER TABLE subscriptions ADD CONSTRAINT uq_subscriptions_msisdn_service UNIQUE (msisdn, service_id);
    END IF;
EXCEPTION
    WHEN duplicate_table OR duplicate_object THEN
        NULL;
END $$;

-- 3. Ensure game_sessions user_id allows NULL for guest play
ALTER TABLE game_sessions ALTER COLUMN user_id DROP NOT NULL;

-- 4. Audit Log Entry for Migration 006
INSERT INTO admin_audit_logs (admin_email, admin_role, action, resource_type, resource_id, reason, new_state)
VALUES
    ('system@godigital.et', 'SUPER_ADMIN', 'MIGRATION_006_APPLIED', 'DATABASE', 'demo_phone_numbers', 
     'Applied Migration 006: database-driven demo registry, subscription constraints, and security hardening.',
     '{"version": "006", "status": "APPLIED"}'::jsonb);

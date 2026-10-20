-- ==============================================================================
-- GoDigital — Fresh Start Data Reset
-- Truncates all gameplay telemetry, scores, transactions, and leaderboard entries.
-- Preserves admin users, games catalog, active tournament configs, and preloaded demo player.
-- ==============================================================================

TRUNCATE TABLE 
    tournament_entries, 
    high_scores, 
    daily_scores, 
    game_sessions, 
    coin_orders, 
    coin_transactions, 
    user_streaks, 
    user_puzzle_progress, 
    daily_challenge_submissions, 
    notifications,
    payment_orders,
    sp_webhook_events
CASCADE;

-- Delete all profiles except the preloaded demo test user
DELETE FROM profiles WHERE phone NOT IN ('+251977057270', '0977057270');

-- Ensure demo player is in fresh initial state: 100 coins, 5 energy, 0 score, level 1
UPDATE profiles 
SET coins = 100, 
    energy = 5, 
    telebirr_balance = 0.00, 
    xp = 0, 
    matches_played = 0,
    trophies_count = 0,
    has_received_initial_coins = TRUE,
    updated_at = NOW()
WHERE phone IN ('+251977057270', '0977057270');

-- Reset user_streaks for demo player to Day 1 unperformed
INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_claimed)
SELECT id, 1, 1, NULL FROM profiles WHERE phone IN ('+251977057270', '0977057270')
ON CONFLICT (user_id) DO UPDATE 
SET current_streak = 1, longest_streak = 1, last_claimed = NULL;

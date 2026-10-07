import { cleanEnv, str, port, num } from 'envalid';
import dotenv from 'dotenv';

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
  PORT: port({ default: 3702 }),
  ADMIN_PORT: port({ default: 3703 }),
  HOST: str({ default: '0.0.0.0' }),
  DOMAIN: str({ default: 'innopulseplatform.com' }),

  // PostgreSQL
  DATABASE_URL: str({ default: 'postgresql://godigital_user:godigital_secure_prod_password_2026@localhost:5442/godigital_db' }),
  DB_MAX_CONNECTIONS: num({ default: 20 }),

  // Valkey / Redis
  VALKEY_URL: str({ default: 'redis://localhost:6392' }),

  // Security & Secrets
  JWT_SECRET: str({ default: 'godigital-telebirr-jwt-secret-key-prod-2026' }),
  JWT_ACCESS_EXPIRES_IN: str({ default: '24h' }),
  JWT_REFRESH_EXPIRES_IN: str({ default: '7d' }),
  GAME_TOKEN_SECRET: str({ default: 'godigital-anti-cheat-round-token-secret-2026' }),
  CRON_SECRET: str({ default: 'godigital-cron-secret-prod-2026' }),

  // Rate Limiting
  RATE_LIMIT_GENERAL: num({ default: 60 }),

  // TeleBirr SuperApp Integration
  TELEBIRR_MODE: str({ choices: ['sandbox', 'live'], default: 'live' }),
  TELEBIRR_APP_KEY: str({ default: '' }),
  TELEBIRR_APP_ID: str({ default: '' }),
  TELEBIRR_PUBLIC_KEY: str({ default: '' }),
  TELEBIRR_CHECKOUT_URL: str({ default: 'https://telebirr.et/checkout' }),
  TELEBIRR_NOTIFY_URL: str({ default: 'https://godigital-api.innopulseplatform.com/api/v1/payments/webhook' }),
  TELEBIRR_RETURN_URL: str({ default: 'https://godigital.innopulseplatform.com/#/profile' }),
  DEFAULT_TEST_MSISDN: str({ default: '0977057270' }),
});

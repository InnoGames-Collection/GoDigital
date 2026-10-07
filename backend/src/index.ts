import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { env } from './config/env.js';
import { pool } from './config/database.js';
import { cache } from './config/cache.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { authRoutes } from './routes/auth.routes.js';
import { paymentRoutes } from './routes/payment.routes.js';
import { gameRoutes } from './routes/game.routes.js';
import { tournamentRoutes } from './routes/tournament.routes.js';
import { adminRoutes } from './routes/admin.routes.js';

const fastify = Fastify({
  logger: { level: env.NODE_ENV === 'production' ? 'info' : 'debug' },
  trustProxy: true,
});

async function main() {
  await fastify.register(helmet, { contentSecurityPolicy: false });
  await fastify.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  fastify.addHook('preHandler', rateLimiter);

  // Healthchecks
  fastify.get('/health', async () => ({ status: 'healthy', service: 'godigital-api', timestamp: new Date().toISOString() }));
  fastify.get('/api/v1/health', async () => ({ status: 'healthy', platform: 'GoDigital', version: '1.0.0' }));

  // Routes (support both /api/* and /api/v1/*)
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(authRoutes, { prefix: '/api/v1/auth' });

  await fastify.register(paymentRoutes, { prefix: '/api/payments' });
  await fastify.register(paymentRoutes, { prefix: '/api/v1/payments' });

  await fastify.register(gameRoutes, { prefix: '/api/game' });
  await fastify.register(gameRoutes, { prefix: '/api/v1/game' });

  await fastify.register(tournamentRoutes, { prefix: '/api/tournaments' });
  await fastify.register(tournamentRoutes, { prefix: '/api/v1/tournaments' });

  await fastify.register(adminRoutes, { prefix: '/api' });
  await fastify.register(adminRoutes, { prefix: '/api/v1' });

  try {
    const address = await fastify.listen({ port: env.PORT, host: env.HOST });
    fastify.log.info(`🚀 GoDigital API Server running at ${address} on port ${env.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, async () => {
    fastify.log.info(`Shutting down gracefully on ${signal}...`);
    try {
      await fastify.close();
      await cache.quit();
      await pool.end();
    } catch (err) {
      fastify.log.error(err);
    }
    process.exit(0);
  });
});

main();

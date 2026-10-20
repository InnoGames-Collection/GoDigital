/**
 * GoDigital - Real-time Notification Engine Routes
 * Fastify REST endpoints & Server-Sent Events (SSE) Stream
 */

import { FastifyInstance } from 'fastify';
import { optionalAuth } from '../middleware/auth.js';
import { NotificationService } from '../services/notificationService.js';
import { env } from '../config/env.js';

export async function notificationRoutes(fastify: FastifyInstance) {
  // 1. Fetch player notifications & unread count
  fastify.get('/', { preHandler: [optionalAuth] }, async (req, reply) => {
    const query = (req.query || {}) as { phone?: string; unreadOnly?: string; limit?: string };
    const phone = query.phone || req.user?.phone || env.DEFAULT_TEST_MSISDN;
    const unreadOnly = query.unreadOnly === 'true' || query.unreadOnly === '1';
    const limit = query.limit ? parseInt(query.limit, 10) : 50;

    if (!phone) {
      return reply.status(400).send({ success: false, error: 'Phone parameter required.' });
    }

    try {
      const data = await NotificationService.getNotifications(phone, unreadOnly, limit);
      return reply.send({ success: true, ...data });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ success: false, error: err.message || 'Failed to fetch notifications.' });
    }
  });

  // 2. Mark specific notification as read
  fastify.post('/:id/read', { preHandler: [optionalAuth] }, async (req, reply) => {
    const { id } = req.params as { id: string };

    if (!id) {
      return reply.status(400).send({ success: false, error: 'Notification ID required.' });
    }

    try {
      const updated = await NotificationService.markAsRead(id);
      return reply.send({ success: true, updated, id });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ success: false, error: err.message || 'Failed to mark as read.' });
    }
  });

  // 3. Mark all notifications as read for phone
  fastify.post('/read-all', { preHandler: [optionalAuth] }, async (req, reply) => {
    const body = (req.body || {}) as { phone?: string };
    const query = (req.query || {}) as { phone?: string };
    const phone = body.phone || query.phone || req.user?.phone || env.DEFAULT_TEST_MSISDN;

    if (!phone) {
      return reply.status(400).send({ success: false, error: 'Phone parameter required.' });
    }

    try {
      const count = await NotificationService.markAllAsRead(phone);
      return reply.send({ success: true, markedCount: count });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ success: false, error: err.message || 'Failed to mark all as read.' });
    }
  });

  // 4. Trigger / dispatch a new notification (used by game events, tournaments, wallet credits)
  fastify.post('/trigger', { preHandler: [optionalAuth] }, async (req, reply) => {
    const body = (req.body || {}) as {
      phone?: string;
      type: 'HIGH_SCORE' | 'TOURNAMENT_QUALIFIED' | 'COIN_CREDIT' | 'DAILY_REWARD' | 'SUBSCRIPTION' | 'SYSTEM' | 'WELCOME';
      title: string;
      message: string;
      metadata?: any;
      action_url?: string;
      action_label?: string;
    };

    const targetPhone = body.phone || req.user?.phone || env.DEFAULT_TEST_MSISDN;

    if (!targetPhone || !body.title || !body.message) {
      return reply.status(400).send({ success: false, error: 'Missing required notification fields.' });
    }

    try {
      const notification = await NotificationService.createNotification({
        phone: targetPhone,
        type: body.type || 'SYSTEM',
        title: body.title,
        message: body.message,
        metadata: body.metadata,
        action_url: body.action_url,
        action_label: body.action_label,
      });

      return reply.send({ success: true, notification });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ success: false, error: err.message || 'Failed to trigger notification.' });
    }
  });

  // 5. Server-Sent Events (SSE) stream for real-time delivery
  fastify.get('/stream', { preHandler: [optionalAuth] }, async (req, reply) => {
    const query = (req.query || {}) as { phone?: string };
    const phone = query.phone || req.user?.phone || env.DEFAULT_TEST_MSISDN;

    // Set SSE headers
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache, no-transform');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('Access-Control-Allow-Origin', '*');
    reply.raw.flushHeaders();

    // Handshake
    reply.raw.write(`data: ${JSON.stringify({ type: 'CONNECTED', phone, timestamp: new Date().toISOString() })}\n\n`);

    // Event listener
    const listener = (notification: any) => {
      try {
        reply.raw.write(`data: ${JSON.stringify({ type: 'NOTIFICATION', notification })}\n\n`);
      } catch (err) {
        // stream closed
      }
    };

    NotificationService.onNotification(phone, listener);

    // Heartbeat ping every 25s to keep connection alive through cloud proxies
    const heartbeat = setInterval(() => {
      try {
        reply.raw.write(`:ping ${Date.now()}\n\n`);
      } catch {
        clearInterval(heartbeat);
      }
    }, 25000);

    // Cleanup on disconnect
    req.raw.on('close', () => {
      clearInterval(heartbeat);
      NotificationService.offNotification(phone, listener);
    });
  });
}

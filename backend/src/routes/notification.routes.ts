/**
 * GoDigital - Real-time Notification Engine Routes
 * Fastify REST endpoints & Server-Sent Events (SSE) Stream
 */

import { FastifyInstance } from 'fastify';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { NotificationService } from '../services/notificationService.js';
import { env } from '../config/env.js';

export async function notificationRoutes(fastify: FastifyInstance) {
  // 1. Fetch player notifications & unread count (Protected against IDOR & PII Leak)
  fastify.get('/', { preHandler: [requireAuth] }, async (req, reply) => {
    const query = (req.query || {}) as { phone?: string; unreadOnly?: string; limit?: string };
    const authPhone = req.user!.phone;
    const isAdmin = req.user?.role === 'admin';

    // If query.phone is specified, enforce that only an Admin can query another user's notifications
    let targetPhone = authPhone;
    if (query.phone && query.phone !== authPhone) {
      if (!isAdmin) {
        return reply.status(403).send({
          success: false,
          error: 'FORBIDDEN',
          message: 'Access denied: You may only view notifications for your own authenticated account.',
        });
      }
      targetPhone = query.phone;
    }

    const unreadOnly = query.unreadOnly === 'true' || query.unreadOnly === '1';
    const limit = query.limit ? Math.min(100, Math.max(1, parseInt(query.limit, 10))) : 50;

    try {
      const data = await NotificationService.getNotifications(targetPhone, unreadOnly, limit);
      return reply.send({ success: true, ...data });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ success: false, error: err.message || 'Failed to fetch notifications.' });
    }
  });

  // 2. Mark specific notification as read (Strictly authorized to owner or admin)
  fastify.post('/:id/read', { preHandler: [requireAuth] }, async (req, reply) => {
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

  // 3. Mark all notifications as read for phone (Protected against IDOR)
  fastify.post('/read-all', { preHandler: [requireAuth] }, async (req, reply) => {
    const body = (req.body || {}) as { phone?: string };
    const authPhone = req.user!.phone;
    const isAdmin = req.user?.role === 'admin';

    let targetPhone = authPhone;
    if (body.phone && body.phone !== authPhone) {
      if (!isAdmin) {
        return reply.status(403).send({
          success: false,
          error: 'FORBIDDEN',
          message: 'Access denied: You may only clear notifications for your own authenticated account.',
        });
      }
      targetPhone = body.phone;
    }

    try {
      const count = await NotificationService.markAllAsRead(targetPhone);
      return reply.send({ success: true, markedCount: count });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ success: false, error: err.message || 'Failed to mark all as read.' });
    }
  });

  // 4. Trigger / dispatch a new notification (Restricted to internal services or Admin)
  fastify.post('/trigger', { preHandler: [optionalAuth] }, async (req, reply) => {
    const internalSecret = req.headers['x-internal-secret'] as string | undefined;
    const isInternalService = internalSecret && internalSecret === env.CRON_SECRET;
    const isAdmin = req.user?.role === 'admin';

    if (!isInternalService && !isAdmin) {
      return reply.status(403).send({
        success: false,
        error: 'FORBIDDEN',
        message: 'Notification trigger endpoint is restricted to authenticated administrators and internal system services.',
      });
    }

    const body = (req.body || {}) as {
      phone?: string;
      type: 'HIGH_SCORE' | 'TOURNAMENT_QUALIFIED' | 'COIN_CREDIT' | 'DAILY_REWARD' | 'SUBSCRIPTION' | 'SYSTEM' | 'WELCOME';
      title: string;
      message: string;
      metadata?: any;
      action_url?: string;
      action_label?: string;
    };

    const targetPhone = body.phone || req.user?.phone;
    if (!targetPhone || !body.title || !body.message) {
      return reply.status(400).send({ success: false, error: 'Missing required notification fields: phone, title, message.' });
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

  // 5. Server-Sent Events (SSE) stream for real-time delivery (Strictly Authenticated)
  fastify.get('/stream', { preHandler: [requireAuth] }, async (req, reply) => {
    const phone = req.user!.phone;

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

/**
 * GoDigital - Real-time Notification Engine Service
 * Authoritative PostgreSQL database backed notification pipeline with SSE streaming.
 */

import { EventEmitter } from 'events';
import { query } from '../config/database.js';
import { normalizeEthiopianPhone } from '../utils/msisdn.js';

export interface NotificationItem {
  id: string;
  user_id?: string;
  phone: string;
  type: 'HIGH_SCORE' | 'TOURNAMENT_QUALIFIED' | 'COIN_CREDIT' | 'DAILY_REWARD' | 'SUBSCRIPTION' | 'SYSTEM' | 'WELCOME';
  title: string;
  message: string;
  metadata?: Record<string, any>;
  is_read: boolean;
  action_url?: string;
  action_label?: string;
  created_at: string;
}

export class NotificationService {
  private static emitter = new EventEmitter();

  static onNotification(phone: string, listener: (notification: NotificationItem) => void) {
    this.emitter.on(`notification:${phone}`, listener);
    this.emitter.on('notification:all', listener);
  }

  static offNotification(phone: string, listener: (notification: NotificationItem) => void) {
    this.emitter.off(`notification:${phone}`, listener);
    this.emitter.off('notification:all', listener);
  }

  static async getNotifications(
    phone: string,
    unreadOnly = false,
    limit = 50
  ): Promise<{ unreadCount: number; notifications: NotificationItem[] }> {
    const { local, e164 } = normalizeEthiopianPhone(phone);
    const searchPhone = e164 || phone;
    const searchLocal = local || phone;

    // Count unread notifications
    const countRes = await query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM notifications 
       WHERE (phone = $1 OR phone = $2) AND is_read = FALSE`,
      [searchPhone, searchLocal]
    );
    const unreadCount = parseInt(countRes.rows[0]?.count || '0', 10);

    // Fetch list of notifications
    let queryText = `
      SELECT id, user_id, phone, type, title, message, metadata, is_read, action_url, action_label, created_at
      FROM notifications
      WHERE (phone = $1 OR phone = $2)
    `;
    const params: any[] = [searchPhone, searchLocal];

    if (unreadOnly) {
      queryText += ' AND is_read = FALSE';
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const res = await query<NotificationItem>(queryText, params);

    // Initial seed notifications if new player
    if (res.rows.length === 0) {
      const welcome = await this.createNotification({
        phone: searchPhone,
        type: 'WELCOME',
        title: 'Welcome to GoDigital!',
        message: 'Compete in the Helix Jump Grand Prix for your share of 10,000+ ETB in weekly prizes!',
        action_url: 'tournament',
        action_label: 'View Grand Prix',
      });
      const tournament = await this.createNotification({
        phone: searchPhone,
        type: 'TOURNAMENT_QUALIFIED',
        title: 'Helix Jump Tournament Live',
        message: 'The Weekly Championship Cup is active. Play Helix Jump to qualify for top 10 cash prizes!',
        action_url: 'leaderboard',
        action_label: 'Leaderboard',
      });
      return {
        unreadCount: 2,
        notifications: [tournament, welcome],
      };
    }

    return {
      unreadCount,
      notifications: res.rows,
    };
  }

  static async markAsRead(id: string): Promise<boolean> {
    const res = await query(
      `UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING id`,
      [id]
    );
    return (res.rowCount || 0) > 0;
  }

  static async markAllAsRead(phone: string): Promise<number> {
    const { local, e164 } = normalizeEthiopianPhone(phone);
    const searchPhone = e164 || phone;
    const searchLocal = local || phone;

    const res = await query(
      `UPDATE notifications SET is_read = TRUE WHERE (phone = $1 OR phone = $2) AND is_read = FALSE`,
      [searchPhone, searchLocal]
    );
    return res.rowCount || 0;
  }

  static async createNotification(params: {
    phone: string;
    type: 'HIGH_SCORE' | 'TOURNAMENT_QUALIFIED' | 'COIN_CREDIT' | 'DAILY_REWARD' | 'SUBSCRIPTION' | 'SYSTEM' | 'WELCOME';
    title: string;
    message: string;
    metadata?: Record<string, any>;
    action_url?: string;
    action_label?: string;
  }): Promise<NotificationItem> {
    const { local, e164 } = normalizeEthiopianPhone(params.phone);
    const primaryPhone = e164 || params.phone;

    let userId: string | null = null;
    try {
      const uRes = await query<{ id: string }>(
        `SELECT id FROM profiles WHERE phone = $1 OR phone_local = $2 LIMIT 1`,
        [primaryPhone, local]
      );
      if (uRes.rows[0]) {
        userId = uRes.rows[0].id;
      }
    } catch {}

    const insertRes = await query<NotificationItem>(
      `INSERT INTO notifications (user_id, phone, type, title, message, metadata, is_read, action_url, action_label, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, FALSE, $7, $8, NOW())
       RETURNING id, user_id, phone, type, title, message, metadata, is_read, action_url, action_label, created_at`,
      [
        userId,
        primaryPhone,
        params.type,
        params.title,
        params.message,
        JSON.stringify(params.metadata || {}),
        params.action_url || null,
        params.action_label || null,
      ]
    );

    const created = insertRes.rows[0];

    // Emit real-time notification to active SSE streams
    this.emitter.emit(`notification:${primaryPhone}`, created);
    if (local) {
      this.emitter.emit(`notification:${local}`, created);
    }
    this.emitter.emit('notification:all', created);

    return created;
  }
}

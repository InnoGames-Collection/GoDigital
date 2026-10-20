/**
 * GoDigital - Real-Time Notification Service
 * Connects frontend to the PostgreSQL-backed notifications API and SSE stream.
 */

export interface NotificationItem {
  id: string;
  user_id?: string;
  phone: string;
  type:
    | 'score_verified'
    | 'tournament_entry'
    | 'coin_purchase'
    | 'subscription_activated'
    | 'daily_streak'
    | 'welcome'
    | 'system';
  title: string;
  message: string;
  metadata?: Record<string, any>;
  is_read: boolean;
  action_url?: string;
  action_label?: string;
  created_at: string;
}

const STORAGE_CACHE_KEY = 'godigital_notifications_cache_v2';
const getApiBase = () => {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return '/api';
  }
  return (typeof process !== 'undefined' && process.env?.API_URL) || 'http://localhost:3702/api';
};

class NotificationService {
  private memoryCache: NotificationItem[] = [];
  private activeEventSource: EventSource | null = null;
  private pollInterval: any = null;

  constructor() {
    this.loadCache();
  }

  private loadCache(): NotificationItem[] {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_CACHE_KEY);
        if (raw) {
          this.memoryCache = JSON.parse(raw);
          return this.memoryCache;
        }
      }
    } catch {
      // fallback
    }
    return this.memoryCache;
  }

  private saveCache(items: NotificationItem[]) {
    try {
      this.memoryCache = items;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(items.slice(0, 50)));
      }
    } catch {
      // ignore storage errors
    }
  }

  /**
   * Fetch all notifications for the given user phone from DB
   */
  async fetchNotifications(phone?: string): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    const queryPhone = phone || '0911223344';
    try {
      const res = await fetch(`${getApiBase()}/notifications?phone=${encodeURIComponent(queryPhone)}&limit=30`, {
        headers: { 'Accept': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.notifications)) {
          this.saveCache(data.notifications);
          return {
            notifications: data.notifications,
            unreadCount: data.unreadCount ?? data.notifications.filter((n: NotificationItem) => !n.is_read).length,
          };
        }
      }
    } catch (err) {
      console.warn('[NotificationService] Failed to fetch remote notifications, falling back to cache:', err);
    }

    // Fallback to local cache
    const cached = this.loadCache();
    const unreadCount = cached.filter((n) => !n.is_read).length;
    return { notifications: cached, unreadCount };
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string): Promise<boolean> {
    // Optimistic cache update
    const updated = this.memoryCache.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    this.saveCache(updated);

    try {
      const res = await fetch(`${getApiBase()}/notifications/${encodeURIComponent(id)}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return res.ok;
    } catch (err) {
      console.warn('[NotificationService] Mark read error:', err);
      return false;
    }
  }

  /**
   * Mark all notifications as read for this user
   */
  async markAllAsRead(phone?: string): Promise<boolean> {
    const queryPhone = phone || '0911223344';
    // Optimistic cache update
    const updated = this.memoryCache.map((n) => ({ ...n, is_read: true }));
    this.saveCache(updated);

    try {
      const res = await fetch(`${getApiBase()}/notifications/read-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: queryPhone }),
      });
      return res.ok;
    } catch (err) {
      console.warn('[NotificationService] Mark all read error:', err);
      return false;
    }
  }

  /**
   * Trigger a new notification (e.g. from client event or test)
   */
  async triggerNotification(payload: {
    phone?: string;
    type: NotificationItem['type'];
    title: string;
    message: string;
    action_url?: string;
    action_label?: string;
    metadata?: Record<string, any>;
  }): Promise<NotificationItem | null> {
    const queryPhone = payload.phone || '0911223344';
    try {
      const res = await fetch(`${getApiBase()}/notifications/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, phone: queryPhone }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.notification) {
          // Prepend to cache
          this.saveCache([data.notification, ...this.memoryCache.filter((n) => n.id !== data.notification.id)]);
          return data.notification;
        }
      }
    } catch (err) {
      console.warn('[NotificationService] Trigger error:', err);
    }

    // Local fallback creation
    const localNotif: NotificationItem = {
      id: `local-${Date.now()}`,
      phone: queryPhone,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      metadata: payload.metadata,
      is_read: false,
      action_url: payload.action_url,
      action_label: payload.action_label,
      created_at: new Date().toISOString(),
    };
    this.saveCache([localNotif, ...this.memoryCache]);
    return localNotif;
  }

  /**
   * Real-time subscription via Server-Sent Events (SSE) with auto-reconnect and polling fallback
   */
  subscribeRealtime(
    phone: string | undefined,
    onNotification: (notif: NotificationItem) => void,
    onCountUpdate?: (count: number) => void
  ): () => void {
    if (typeof window === 'undefined') return () => {};

    const queryPhone = phone || '0911223344';
    let isCleanedUp = false;

    const connectSSE = () => {
      if (isCleanedUp) return;
      try {
        if (this.activeEventSource) {
          this.activeEventSource.close();
        }

        const sseUrl = `${getApiBase()}/notifications/stream?phone=${encodeURIComponent(queryPhone)}`;
        const es = new EventSource(sseUrl);
        this.activeEventSource = es;

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'notification' && data.data) {
              const notif: NotificationItem = data.data;
              // Add to cache
              const exists = this.memoryCache.some((n) => n.id === notif.id);
              if (!exists) {
                this.saveCache([notif, ...this.memoryCache]);
              }
              onNotification(notif);
              if (onCountUpdate) {
                const count = this.memoryCache.filter((n) => !n.is_read).length;
                onCountUpdate(count);
              }
            } else if (data.type === 'connected') {
              // Initial connection acknowledged
            }
          } catch (err) {
            console.warn('[NotificationService] SSE parse error:', err);
          }
        };

        es.onerror = () => {
          // Close and attempt retry
          if (es.readyState === EventSource.CLOSED) {
            setTimeout(connectSSE, 10000);
          }
        };
      } catch (e) {
        console.warn('[NotificationService] SSE connection failed, polling will cover updates', e);
      }
    };

    connectSSE();

    // Secondary backup polling every 30s to keep count fresh
    this.pollInterval = setInterval(async () => {
      if (isCleanedUp) return;
      const res = await this.fetchNotifications(queryPhone);
      if (onCountUpdate) {
        onCountUpdate(res.unreadCount);
      }
    }, 30000);

    return () => {
      isCleanedUp = true;
      if (this.activeEventSource) {
        this.activeEventSource.close();
        this.activeEventSource = null;
      }
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
        this.pollInterval = null;
      }
    };
  }
}

export const notificationService = new NotificationService();

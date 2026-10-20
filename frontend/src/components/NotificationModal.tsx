/**
 * GoDigital - Real-Time Notification Center Modal
 * Conforming to reference design & warm sunset palette:
 * - Surface #352316 with subtle bronze border #81502B
 * - Warm illuminated cream typography #FFF0CF and warm subtext #E6C8A4
 * - Sunset amber action affordances #FFAA24 / #FFD35A
 */

import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Trophy, 
  Target, 
  Coins, 
  Crown, 
  Zap, 
  Info, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { NotificationItem } from '../services/notificationService';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigateAction?: (url: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigateAction,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const displayedNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'score_verified':
        return (
          <div className="w-9 h-9 rounded-xl bg-[#FFAA24]/20 border border-[#FFAA24]/40 flex items-center justify-center text-[#FFD35A] shrink-0">
            <Trophy className="w-4.5 h-4.5" />
          </div>
        );
      case 'tournament_entry':
        return (
          <div className="w-9 h-9 rounded-xl bg-[#F47B20]/20 border border-[#F47B20]/40 flex items-center justify-center text-[#FFAA24] shrink-0">
            <Target className="w-4.5 h-4.5" />
          </div>
        );
      case 'coin_purchase':
        return (
          <div className="w-9 h-9 rounded-xl bg-[#FFAA24]/20 border border-[#FFAA24]/40 flex items-center justify-center text-[#FFD35A] shrink-0">
            <Coins className="w-4.5 h-4.5" />
          </div>
        );
      case 'subscription_activated':
        return (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFAA24]/25 to-[#F47B20]/25 border border-[#FFAA24]/40 flex items-center justify-center text-[#FFD35A] shrink-0">
            <Crown className="w-4.5 h-4.5" />
          </div>
        );
      case 'daily_streak':
        return (
          <div className="w-9 h-9 rounded-xl bg-[#FFAA24]/20 border border-[#FFAA24]/40 flex items-center justify-center text-[#FFD35A] shrink-0">
            <Zap className="w-4.5 h-4.5" />
          </div>
        );
      case 'welcome':
        return (
          <div className="w-9 h-9 rounded-xl bg-[#FFAA24]/20 border border-[#FFAA24]/40 flex items-center justify-center text-[#FFD35A] shrink-0">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
        );
      case 'system':
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-[#442C1B] border border-[#81502B] flex items-center justify-center text-[#E6C8A4] shrink-0">
            <Info className="w-4.5 h-4.5" />
          </div>
        );
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const handleActionClick = (notification: NotificationItem) => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    if (notification.action_url && onNavigateAction) {
      onNavigateAction(notification.action_url);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-modal-title"
    >
      <div 
        className="relative w-full max-w-md bg-[#352316] border border-[#81502B] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-6 duration-200"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#81502B] flex items-center justify-between bg-[#24170F]/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#442C1B] border border-[#81502B] flex items-center justify-center text-[#FFD35A]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="notification-modal-title" className="text-base font-black text-[#FFF0CF] tracking-wide">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F]">
                    {unreadCount} NEW
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#E6C8A4]">Real-time gameplay & account activity</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                title="Mark all as read"
                className="px-2.5 py-1 text-xs font-semibold text-[#FFAA24] hover:text-[#FFD35A] hover:bg-[#442C1B] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close notifications"
              className="p-1.5 rounded-xl bg-[#442C1B] text-[#E6C8A4] hover:text-[#FFF0CF] hover:bg-[#523521] border border-[#81502B] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-5 py-2.5 border-b border-[#81502B]/60 flex items-center justify-between bg-[#352316]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F] shadow-xs'
                  : 'bg-[#442C1B] text-[#E6C8A4] hover:text-[#FFF0CF] border border-[#81502B]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === 'unread'
                  ? 'bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F] shadow-xs'
                  : 'bg-[#442C1B] text-[#E6C8A4] hover:text-[#FFF0CF] border border-[#81502B]'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <span className="text-[11px] text-[#E6C8A4]/80 font-mono">
            Live SSE sync
          </span>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#81502B]/40 p-2 sm:p-3 space-y-1">
          {displayedNotifications.length === 0 ? (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-[#442C1B]/60 border border-[#81502B] flex items-center justify-center text-[#E6C8A4]/60 mb-3">
                <Bell className="w-7 h-7 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-bold text-[#FFF0CF]">All caught up!</h3>
              <p className="text-xs text-[#E6C8A4] max-w-xs mt-1">
                {filter === 'unread'
                  ? 'You have read all your notifications.'
                  : 'No activity notifications yet. Play tournaments or top up to earn rewards!'}
              </p>
            </div>
          ) : (
            displayedNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && onMarkAsRead(notif.id)}
                className={`group relative p-3 sm:p-3.5 rounded-2xl transition-all cursor-pointer flex gap-3 ${
                  notif.is_read
                    ? 'bg-transparent hover:bg-[#442C1B]/40'
                    : 'bg-[#442C1B]/80 hover:bg-[#442C1B] border border-[#FFAA24]/30 shadow-xs'
                }`}
              >
                {/* Icon */}
                {getNotificationIcon(notif.type)}

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={`text-xs sm:text-sm font-bold truncate ${notif.is_read ? 'text-[#FFF0CF]' : 'text-[#FFD35A]'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-[#E6C8A4]/70 shrink-0 font-medium">
                      {formatTime(notif.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-[#E6C8A4] leading-relaxed line-clamp-2">
                    {notif.message}
                  </p>

                  {/* Optional Action Button */}
                  {notif.action_label && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionClick(notif);
                        }}
                        className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#FFAA24] to-[#F47B20] hover:brightness-110 text-[#24170F] text-xs font-black flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer border-none"
                      >
                        <span>{notif.action_label}</span>
                        <ExternalLink className="w-3 h-3 stroke-[2.5]" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Unread Glowing Dot */}
                {!notif.is_read && (
                  <div className="w-2 h-2 rounded-full bg-[#FFD35A] shrink-0 mt-1.5 shadow-[0_0_6px_rgba(255,211,90,0.9)]" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#81502B] bg-[#24170F]/70 flex items-center justify-between text-[11px] text-[#E6C8A4]">
          <span>Single Source of Truth: PostgreSQL</span>
          <button
            type="button"
            onClick={onClose}
            className="text-[#FFF0CF] hover:text-[#FFAA24] font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;

/**
 * Notification Toast Component - GoDigital
 * Intrusive top-of-screen floating toasts are globally suppressed per Prompt 4.
 * Internal observability is preserved via diagnostic event logging.
 */

import React from 'react';
import { ToastMessage } from '../types';

interface NotificationToastProps {
  toasts?: ToastMessage[];
  onDismiss?: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = () => {
  // Return null to eliminate transient pop-ups covering gameplay canvas and header
  return null;
};

export default NotificationToast;

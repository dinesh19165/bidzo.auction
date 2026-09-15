import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  getNotifications,
  getUnreadNotificationCount,
  getVendorNotifications,
  getVendorUnreadNotificationCount,
  markAllNotificationsAsRead,
  markAllVendorNotificationsAsRead,
  markNotificationAsRead,
  markVendorNotificationAsRead,
  type NotificationResponse,
} from '../api/notificationApi';

interface NotificationContextValue {
  items: NotificationResponse[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markRead: (notification: NotificationResponse) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const scope = user?.type === 'vendor' ? 'vendor' : user?.type === 'customer' ? 'customer' : null;
  const [items, setItems] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!scope) {
      setItems([]);
      setUnreadCount(0);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [nextItems, nextUnreadCount] = scope === 'vendor'
        ? await Promise.all([getVendorNotifications(), getVendorUnreadNotificationCount()])
        : await Promise.all([getNotifications(), getUnreadNotificationCount()]);
      setItems(nextItems);
      setUnreadCount(nextUnreadCount);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    if (!scope) return undefined;
    const refreshOnFocus = () => { if (document.visibilityState === 'visible') void refresh(); };
    document.addEventListener('visibilitychange', refreshOnFocus);
    return () => document.removeEventListener('visibilitychange', refreshOnFocus);
  }, [refresh, scope]);

  const markRead = useCallback(async (notification: NotificationResponse) => {
    if (notification.isRead || !scope) return;
    if (scope === 'vendor') await markVendorNotificationAsRead(notification.id);
    else await markNotificationAsRead(Number(notification.id));
    setItems((current) => current.map((item) => item.id === notification.id ? { ...item, isRead: true } : item));
    setUnreadCount((current) => Math.max(0, current - 1));
  }, [scope]);

  const markAllRead = useCallback(async () => {
    if (!scope) return;
    if (scope === 'vendor') await markAllVendorNotificationsAsRead();
    else await markAllNotificationsAsRead();
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  }, [scope]);

  const value = useMemo(() => ({ items, unreadCount, loading, error, refresh, markRead, markAllRead }), [items, unreadCount, loading, error, refresh, markRead, markAllRead]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotificationContext must be used within NotificationProvider');
  return context;
}

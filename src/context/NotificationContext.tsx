import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { ApiError } from '../api/apiClient';
import {
  getNotifications,
  getUnreadNotificationCount,
  getAdminNotificationInbox,
  getAdminNotificationInboxUnreadCount,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
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
  mutationError: string | null;
  refresh: () => Promise<void>;
  markRead: (notificationId: number | string) => Promise<boolean>;
  markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

function mutationErrorMessage(reason: unknown, action: string): string {
  if (reason instanceof ApiError && reason.status === 401) return 'Your session has expired. Sign in again to update notifications.';
  if (reason instanceof ApiError && reason.status === 403) return reason.message || 'You do not have permission to update these notifications.';
  return reason instanceof Error ? reason.message : `Unable to ${action}.`;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const role = String(user?.role ?? '').trim().toUpperCase();
  const scope = role === 'FRANCHISE_ADMIN' ? 'franchise-admin' : role === 'SUPER_ADMIN' || role === 'ADMIN' ? 'admin-inbox' : user?.type === 'vendor' ? 'vendor' : user?.type === 'customer' ? 'customer' : null;
  const [items, setItems] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const refreshSequence = useRef(0);

  const refresh = useCallback(async () => {
    const sequence = ++refreshSequence.current;
    if (!scope) {
      setItems([]);
      setUnreadCount(0);
      setLoading(false);
      setError(null);
      setMutationError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let nextItems: NotificationResponse[];
      let nextUnreadCount: number;
      if (scope === 'franchise-admin' || scope === 'admin-inbox') {
        [nextItems, nextUnreadCount] = await Promise.all([getAdminNotificationInbox(), getAdminNotificationInboxUnreadCount()]);
      } else if (scope === 'vendor') {
        [nextItems, nextUnreadCount] = await Promise.all([getVendorNotifications(), getVendorUnreadNotificationCount()]);
      } else {
        [nextItems, nextUnreadCount] = await Promise.all([getNotifications(), getUnreadNotificationCount()]);
      }
      if (sequence !== refreshSequence.current) return;
      setItems([...new Map(nextItems.map((item) => [String(item.id), item])).values()]);
      setUnreadCount(nextUnreadCount);
      setMutationError(null);
    } catch (reason) {
      if (sequence === refreshSequence.current) setError(reason instanceof Error ? reason.message : 'Unable to load notifications.');
    } finally {
      if (sequence === refreshSequence.current) setLoading(false);
    }
  }, [scope, user?.id, user?.token]);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    if (!scope) return undefined;
    const refreshOnFocus = () => { if (document.visibilityState === 'visible') void refresh(); };
    document.addEventListener('visibilitychange', refreshOnFocus);
    return () => document.removeEventListener('visibilitychange', refreshOnFocus);
  }, [refresh, scope]);

  const markRead = useCallback(async (notificationId: number | string): Promise<boolean> => {
    const notification = items.find((item) => String(item.id) === String(notificationId));
    if (!scope || !notification || notification.isRead) return true;
    setMutationError(null);
    try {
      if (scope === 'franchise-admin' || scope === 'admin-inbox') await markAdminNotificationAsRead(notificationId);
      else if (scope === 'vendor') await markVendorNotificationAsRead(notificationId);
      else await markNotificationAsRead(Number(notificationId));
      await refresh();
      return true;
    } catch (reason) {
      setMutationError(mutationErrorMessage(reason, 'mark notification as read'));
      return false;
    }
  }, [items, refresh, scope]);

  const markAllRead = useCallback(async () => {
    if (!scope) return;
    setMutationError(null);
    try {
      if (scope === 'franchise-admin' || scope === 'admin-inbox') await markAllAdminNotificationsAsRead();
      else if (scope === 'vendor') await markAllVendorNotificationsAsRead();
      else await markAllNotificationsAsRead();
      await refresh();
    } catch (reason) {
      setMutationError(mutationErrorMessage(reason, 'mark notifications as read'));
    }
  }, [refresh, scope]);

  const value = useMemo(() => ({ items, unreadCount, loading, error, mutationError, refresh, markRead, markAllRead }), [items, unreadCount, loading, error, mutationError, refresh, markRead, markAllRead]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotificationContext must be used within NotificationProvider');
  return context;
}

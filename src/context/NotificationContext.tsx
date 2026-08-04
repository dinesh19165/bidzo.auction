import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Notification } from '../types';

interface NotificationContextValue {
  items: Notification[];
  addNotification: (notification: Notification) => void;
  markAllRead: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Notification[]>([]);
  const addNotification = (notification: Notification) => setItems((current) => [notification, ...current]);
  const markAllRead = () => setItems((current) => current.map((item) => ({ ...item, read: true })));
  const value = useMemo(() => ({ items, addNotification, markAllRead }), [items]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotificationContext must be used within NotificationProvider');
  return context;
}

import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';

interface UserContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoaded: boolean;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const value = useMemo(() => ({ user, setUser, isLoaded: true }), [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUserContext must be used within UserProvider');
  return context;
}

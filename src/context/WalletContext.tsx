import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

interface WalletContextValue {
  balance: number;
  setBalance: (value: number) => void;
  credit: (value: number) => void;
  debit: (value: number) => void;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0);
  const credit = (value: number) => setBalance((current) => current + value);
  const debit = (value: number) => setBalance((current) => current - value);
  const value = useMemo(() => ({ balance, setBalance, credit, debit }), [balance]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWalletContext must be used within WalletProvider');
  return context;
}

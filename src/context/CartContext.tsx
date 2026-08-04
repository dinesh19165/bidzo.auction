import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

interface CartContextValue {
  items: Array<{ id: string; title: string; quantity: number }>;
  addItem: (item: { id: string; title: string; quantity?: number }) => void;
  removeItem: (id: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Array<{ id: string; title: string; quantity: number }>>([]);

  const addItem = (item: { id: string; title: string; quantity?: number }) => {
    setItems((current) => {
      const existing = current.find((entry) => entry.id === item.id);
      if (existing) {
        return current.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + (item.quantity ?? 1) } : entry);
      }
      return [...current, { ...item, quantity: item.quantity ?? 1 }];
    });
  };

  const removeItem = (id: string) => setItems((current) => current.filter((entry) => entry.id !== id));
  const clear = () => setItems([]);

  const value = useMemo(() => ({ items, addItem, removeItem, clear }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCartContext must be used within CartProvider');
  return context;
}

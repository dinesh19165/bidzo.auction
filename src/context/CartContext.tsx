import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { addCartItem, getCart, removeCartItem, updateCartItem, type CartItemResponse, type CartResponse } from '../api/cartApi';
import { useAuth } from './AuthContext';

interface CartContextValue {
  cart: CartResponse;
  isLoading: boolean;
  error: string | null;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const emptyCart: CartResponse = { items: [], total: 0 };
const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartResponse>(emptyCart);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const refresh = async () => {
    setError(null);
    try {
      setCart(await getCart());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.type === 'customer') {
      setIsLoading(true);
      refresh();
    } else {
      setCart(emptyCart);
      setError(null);
      setIsLoading(false);
    }
  }, [user?.type]);

  const addItem = async (productId: number, quantity = 1) => setCart(await addCartItem(productId, quantity));
  const updateItem = async (itemId: number, quantity: number) => setCart(await updateCartItem(itemId, quantity));
  const removeItem = async (itemId: number) => setCart(await removeCartItem(itemId));

  const value = useMemo(() => ({ cart, isLoading, error, addItem, updateItem, removeItem, refresh }), [cart, isLoading, error]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCartContext must be used within CartProvider');
  return context;
}

export type { CartItemResponse };

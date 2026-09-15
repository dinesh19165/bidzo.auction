import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getWishlist, getWishlistCount, notifyWishlistChanged, removeFromWishlist, toggleWishlist, type WishlistItemResponse, type WishlistToggleParams } from '../api/wishlistApi';

type WishlistKey = `${WishlistToggleParams['itemType']}:${number}`;

interface WishlistContextValue {
  items: WishlistItemResponse[];
  count: number;
  loading: boolean;
  error: string | null;
  pendingKeys: Set<WishlistKey>;
  refresh: () => Promise<void>;
  isWishlisted: (params: WishlistToggleParams) => boolean;
  isPending: (params: WishlistToggleParams) => boolean;
  getItem: (params: WishlistToggleParams) => WishlistItemResponse | undefined;
  toggle: (params: WishlistToggleParams) => Promise<void>;
  remove: (item: WishlistItemResponse) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

function keyFor(params: WishlistToggleParams): WishlistKey | null {
  const id = params.itemType === 'AUCTION' ? params.auctionId : params.productId;
  return id === undefined ? null : `${params.itemType}:${Number(id)}`;
}

function keyForItem(item: WishlistItemResponse): WishlistKey | null {
  return keyFor({ itemType: item.itemType === 'AUCTION' ? 'AUCTION' : 'PRODUCT', productId: item.productId, auctionId: item.auctionId });
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, authReady } = useAuth();
  const isCustomer = user?.type === 'customer' || user?.role === 'CUSTOMER';
  const userKey = isCustomer ? `${user?.id ?? ''}:${user?.email ?? ''}` : '';
  const [items, setItems] = useState<WishlistItemResponse[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingKeys, setPendingKeys] = useState<Set<WishlistKey>>(new Set());

  const refresh = useCallback(async () => {
    if (!isCustomer) {
      setItems([]);
      setCount(0);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [nextItems, nextCount] = await Promise.all([getWishlist(), getWishlistCount()]);
      setItems(nextItems);
      setCount(nextCount);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load your wishlist.');
    } finally {
      setLoading(false);
    }
  }, [isCustomer]);

  useEffect(() => {
    if (!authReady) return;
    void refresh();
  }, [authReady, refresh, userKey]);

  const getItem = useCallback((params: WishlistToggleParams) => {
    const targetKey = keyFor(params);
    return targetKey ? items.find((item) => keyForItem(item) === targetKey) : undefined;
  }, [items]);

  const isWishlisted = useCallback((params: WishlistToggleParams) => {
    const targetKey = keyFor(params);
    return Boolean(targetKey && (items.some((item) => keyForItem(item) === targetKey) || pendingKeys.has(targetKey)));
  }, [items, pendingKeys]);

  const isPending = useCallback((params: WishlistToggleParams) => {
    const targetKey = keyFor(params);
    return Boolean(targetKey && pendingKeys.has(targetKey));
  }, [pendingKeys]);

  const toggle = useCallback(async (params: WishlistToggleParams) => {
    if (!isCustomer) throw new Error('Please log in as a customer to use your wishlist.');
    const targetKey = keyFor(params);
    if (!targetKey) throw new Error('A valid wishlist item is required.');
    if (pendingKeys.has(targetKey)) return;

    const existing = getItem(params);
    setPendingKeys((current) => new Set(current).add(targetKey));
    setError(null);

    if (existing) {
      setItems((current) => current.filter((item) => item.id !== existing.id));
      setCount((current) => Math.max(0, current - 1));
      try {
        await removeFromWishlist(existing.id);
        notifyWishlistChanged({ productId: existing.productId, auctionId: existing.auctionId, wishlistId: existing.id, saved: false });
      } catch (reason) {
        setItems((current) => [existing, ...current]);
        setCount((current) => current + 1);
        throw reason;
      } finally {
        setPendingKeys((current) => { const next = new Set(current); next.delete(targetKey); return next; });
      }
      return;
    }

    try {
      const savedItem = await toggleWishlist(params);
      setItems((current) => [savedItem, ...current.filter((item) => keyForItem(item) !== targetKey)]);
      setCount((current) => current + 1);
      notifyWishlistChanged({ productId: savedItem.productId, auctionId: savedItem.auctionId, wishlistId: savedItem.id, saved: true });
    } catch (reason) {
      throw reason;
    } finally {
      setPendingKeys((current) => { const next = new Set(current); next.delete(targetKey); return next; });
    }
  }, [getItem, isCustomer, pendingKeys, setError]);

  const remove = useCallback(async (item: WishlistItemResponse) => {
    if (!isCustomer) throw new Error('Please log in as a customer to use your wishlist.');
    const targetKey = keyForItem(item);
    if (!targetKey || pendingKeys.has(targetKey)) return;
    setPendingKeys((current) => new Set(current).add(targetKey));
    setItems((current) => current.filter((candidate) => candidate.id !== item.id));
    setCount((current) => Math.max(0, current - 1));
    try {
      await removeFromWishlist(item.id);
      notifyWishlistChanged({ productId: item.productId, auctionId: item.auctionId, wishlistId: item.id, saved: false });
    } catch (reason) {
      setItems((current) => [item, ...current]);
      setCount((current) => current + 1);
      throw reason;
    } finally {
      setPendingKeys((current) => { const next = new Set(current); next.delete(targetKey); return next; });
    }
  }, [isCustomer, pendingKeys]);

  const value = useMemo(() => ({ items, count, loading, error, pendingKeys, refresh, isWishlisted, isPending, getItem, toggle, remove }), [count, error, getItem, isPending, isWishlisted, items, loading, pendingKeys, refresh, remove, toggle]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}

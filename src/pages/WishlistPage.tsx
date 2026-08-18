import { useEffect, useState } from 'react';
import { SectionShell } from '../components/SectionShell';
import { getWishlist, type WishlistItemResponse } from '../api/wishlistApi';

export function WishlistPage() {
  const [items, setItems] = useState<WishlistItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getWishlist();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load wishlist');
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, []);

  if (isLoading) {
    return (
      <SectionShell title="Wishlist" subtitle="Saved opportunities">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-blue-500"></div>
            <p className="mt-4 text-slate-400">Loading your wishlist...</p>
          </div>
        </div>
      </SectionShell>
    );
  }

  if (error) {
    return (
      <SectionShell title="Wishlist" subtitle="Saved opportunities">
        <div className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 p-6 text-slate-300">
          <p className="text-sm font-medium text-rose-200">Wishlist Error</p>
          <p className="mt-2">{error}</p>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell title="Wishlist" subtitle="Saved opportunities">
      {items.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => {
            const product = item.product ?? null;
            const title = product?.name || 'Wishlist item';
            const description = product?.description || 'Saved item';
            const price = typeof product?.price === 'number' ? product.price : 0;

            return (
              <div key={item.id ?? product?.id ?? title} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm text-slate-400">{description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-lg font-semibold text-white">₹{price.toLocaleString()}</p>
                  <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Move to cart</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-12 text-center">
          <p className="text-slate-400">No wishlist items</p>
        </div>
      )}
    </SectionShell>
  );
}

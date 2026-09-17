import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { SectionShell } from '../components/SectionShell';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { showToast } from '../components/ui/toast';
import type { WishlistItemResponse } from '../api/wishlistApi';
import { StockBadge } from '../components/common/StockBadge';

function itemTitle(item: WishlistItemResponse): string { return item.product?.name || item.title || 'Saved product'; }
function itemDescription(item: WishlistItemResponse): string | null { const value = item.product?.description || item.description; return value?.trim() || null; }
function itemPrice(item: WishlistItemResponse): string | null { const value = item.product?.price ?? item.price; if (value === undefined || value === null || value === '') return null; const amount = Number(value); return Number.isFinite(amount) ? `₹${amount.toLocaleString('en-IN')}` : String(value); }
function itemImage(item: WishlistItemResponse): string { return item.product?.imageUrl || item.product?.image || item.imageUrl || '/logo.png'; }

function WishlistCard({ item }: { item: WishlistItemResponse }) {
  const { remove, isPending } = useWishlist();
  const title = itemTitle(item);
  const description = itemDescription(item);
  const price = itemPrice(item);
  const itemType = item.itemType === 'AUCTION' ? 'AUCTION' as const : 'PRODUCT' as const;
  const pending = isPending({ itemType, productId: item.productId, auctionId: item.auctionId });
  const href = itemType === 'AUCTION' && item.auctionId !== undefined ? `/auctions/${item.auctionId}` : `/product/${item.productId}`;
  const handleRemove = async () => {
    if (pending) return;
    try { await remove(item); showToast('Removed from wishlist', `${title} is no longer saved.`, 'info'); }
    catch (reason) { showToast('Unable to remove item', reason instanceof Error ? reason.message : 'Please try again.', 'warning'); }
  };
  return <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-lg shadow-slate-950/15"><div className="aspect-[4/3] w-full bg-slate-950/50"><img src={itemImage(item)} alt={title} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/logo.png'; }} className="h-full w-full object-contain p-3" loading="lazy" /></div><div className="flex flex-1 flex-col p-4"><div className="flex items-start justify-between gap-3"><h3 className="min-w-0 line-clamp-2 text-base font-semibold leading-5 text-white">{title}</h3><button type="button" onClick={() => void handleRemove()} disabled={pending} aria-label={`Remove ${title} from wishlist`} className="shrink-0 rounded-lg p-2 text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-wait disabled:opacity-50"><Trash2 className="h-4 w-4" /></button></div>{description ? <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-400">{description}</p> : null}<StockBadge availableQuantity={item.product?.availableQuantity} className="mt-2" /><div className="mt-auto flex items-end justify-between gap-3 pt-4"><div><p className="text-lg font-semibold text-white">{price || 'Price unavailable'}</p><p className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">{itemType === 'AUCTION' ? 'Auction' : 'Direct buy'}</p></div><Link to={href} className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-500">View {itemType === 'AUCTION' ? 'Auction' : 'Product'}</Link></div></div></article>;
}

export function WishlistPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, count, loading, error, refresh } = useWishlist();
  if (!user || (user.type !== 'customer' && user.role !== 'CUSTOMER')) return <SectionShell title="Wishlist" subtitle="Your saved products"><div className="rounded-2xl border border-white/10 bg-slate-900/70 p-8 text-center"><Heart className="mx-auto h-10 w-10 text-slate-500" /><p className="mt-4 text-slate-300">Sign in to view your wishlist.</p><button type="button" onClick={() => navigate('/login')} className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">Sign in</button></div></SectionShell>;
  return <SectionShell title="Wishlist" subtitle={`Your saved products${count > 0 ? ` · ${count} item${count === 1 ? '' : 's'}` : ''}`}>{loading ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70"><div className="aspect-[4/3] animate-pulse bg-white/5" /><div className="space-y-3 p-4"><div className="h-4 animate-pulse rounded bg-white/5" /><div className="h-3 w-2/3 animate-pulse rounded bg-white/5" /><div className="h-9 animate-pulse rounded bg-white/5" /></div></div>)}</div> : error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-6 text-slate-300"><p className="font-medium text-rose-200">Unable to load your wishlist.</p><p className="mt-2 text-sm">{error}</p><button type="button" onClick={() => void refresh()} className="mt-4 rounded-lg border border-rose-300/30 px-4 py-2 text-sm text-rose-100 hover:bg-rose-500/10">Retry</button></div> : items.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/50 p-10 text-center"><Heart className="mx-auto h-10 w-10 text-slate-600" /><h2 className="mt-4 text-lg font-semibold text-white">Your wishlist is empty.</h2><p className="mt-2 text-sm text-slate-400">Save products you like and they will appear here.</p><Link to="/marketplace" className="mt-5 inline-flex min-h-[40px] items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">Browse Products</Link></div> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{items.map((item) => <WishlistCard key={String(item.id)} item={item} />)}</div>}</SectionShell>;
}

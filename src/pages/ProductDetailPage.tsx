import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Heart, ShieldCheck, Truck, Share2 } from 'lucide-react';
import { SectionShell } from '../components/SectionShell';
import { ProductCard } from '../components/cards/MarketplaceCards';
import { getProductById, getProducts, type ProductListItem } from '../api/productApi';
import { getProductReviews, type ReviewResponse } from '../api/reviewApi';
import { EmptyState, ErrorState, SkeletonCard } from '../components/loading/LoadingComponents';
import { ProductSpecification } from '../components/marketplace/MarketplaceComponents';
import { showToast } from '../components/ui/toast';
import { initializeBuyNowFlow } from '../utils/auctionFlowState';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { StockBadge } from '../components/common/StockBadge';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductListItem | null>(null);
  const [similarProducts, setSimilarProducts] = useState<ProductListItem[]>([]);
  const [main, setMain] = useState('');
  const [zoom, setZoom] = useState(false);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { getItem, isPending, toggle } = useWishlist();

  useEffect(() => {
    const idNum = Number(id);
    if (!id || !Number.isFinite(idNum)) {
      setError('Invalid product ID');
      setLoading(false);
      return;
    }

    const loadProduct = async () => {
      setError(null);
      setLoading(true);
      try {
        const details = await getProductById(idNum);
        setProduct(details);
        setMain(details.gallery?.[0] || details.image);
        const [list, reviewData] = await Promise.all([
          getProducts(),
          getProductReviews(idNum),
        ]);
        setReviews(reviewData);
        setSimilarProducts(list.filter((item) => item.id !== details.id).slice(0, 3));
      } catch (err: any) {
        setError(err?.message || 'Unable to load product details');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const productWishlistParams = product ? { itemType: product.isAuction ? 'AUCTION' as const : 'PRODUCT' as const, productId: product.isAuction ? undefined : product.id, auctionId: product.isAuction ? product.auctionId : undefined } : null;
  const currentProductWishlistItem = productWishlistParams ? getItem(productWishlistParams) : undefined;
  const favoritePending = productWishlistParams ? isPending(productWishlistParams) : false;

  const toggleProductFavorite = async () => {
    if (!product || favoritePending) return;

    if (!user || (user.type !== 'customer' && user.role !== 'CUSTOMER')) {
      navigate('/login');
      return;
    }
    if (!productWishlistParams) return;
    try {
      await toggle(productWishlistParams);
      showToast(currentProductWishlistItem ? 'Removed from favourites' : 'Added to favourites', currentProductWishlistItem ? 'The listing is no longer in your saved collection.' : 'Saved for your next bidding session.', currentProductWishlistItem ? 'info' : 'success');
    } catch (error) {
      showToast('Unable to update favourites', error instanceof Error ? error.message : 'Please try again.', 'warning');
    }
  };

  const handleShareProduct = async () => {
    if (!product) return;

    const productUrl = typeof window === 'undefined'
      ? `/product/${product.id}`
      : new URL(`/product/${product.id}`, window.location.origin).toString();

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.title,
          text: `Check out ${product.title} on Bidzo`,
          url: productUrl,
        });
        showToast('Product shared', 'The product link has been opened in your sharing sheet.', 'success');
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(productUrl);
        showToast('Product link copied', 'The product link has been copied to your clipboard.', 'success');
        return;
      }

      throw new Error('Clipboard API unavailable');
    } catch (error) {
      const message = error instanceof Error && error.name === 'AbortError'
        ? 'Share was cancelled.'
        : 'Unable to share this product right now. Please try again.';

      showToast(
        error instanceof Error && error.name === 'AbortError' ? 'Share cancelled' : 'Unable to share product',
        message,
        error instanceof Error && error.name === 'AbortError' ? 'info' : 'warning',
      );
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    const priceNum = Number(product.price.replace(/[^0-9.-]/g, '')) || 0;
    initializeBuyNowFlow(product.id, product.title, priceNum, product.image, product.categoryId);
    navigate('/customer/buynow-confirm');
  };

  if (loading) {
    return (
      <SectionShell title="Product details" subtitle="Loading product">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </SectionShell>
    );
  }

  if (error) {
    return (
      <SectionShell title="Product" subtitle="Error">
        <ErrorState title="Unable to load product" description={error} />
      </SectionShell>
    );
  }

  if (!product) {
    return (
      <SectionShell title="Product" subtitle="Not found">
        <EmptyState title="Product unavailable" description="This listing could not be found or has been removed." />
      </SectionShell>
    );
  }

  return (
    <SectionShell title="Product details" subtitle={product.title}>
      <div className="grid min-w-0 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="w-full rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/30 sm:p-5">
            <div className="grid gap-3 md:grid-cols-[1fr_120px]">
            <div className="relative">
              <img
                src={main || product.image || '/logo.png'}
                alt={product.title}
                loading="lazy"
                decoding="async"
                onMouseEnter={() => setZoom(true)}
                onMouseLeave={() => setZoom(false)}
                className={`aspect-[4/3] max-h-[420px] w-full max-w-full rounded-[24px] object-contain transition-transform ${zoom ? 'scale-105' : ''}`}
              />
              <div className="absolute right-4 top-4 inline-flex gap-2">
                <button type="button" onClick={() => void toggleProductFavorite()} disabled={favoritePending} className="rounded-full bg-slate-950/75 p-2 text-slate-200 transition hover:bg-slate-900/90 disabled:cursor-wait disabled:opacity-60" aria-label="Toggle favorite" aria-busy={favoritePending}>
                  <Heart className={`h-4 w-4 transition ${currentProductWishlistItem ? 'fill-current text-rose-500' : ''}`} />
                </button>
                <button type="button" onClick={handleShareProduct} className="rounded-full bg-slate-950/75 p-2 text-slate-200 transition hover:bg-slate-900/90" aria-label="Share product">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex max-w-full gap-2 overflow-x-auto md:flex-col md:overflow-x-visible">
              {(product.gallery || []).map((g) => (
                <button key={g} type="button" onClick={() => setMain(g)} className={`shrink-0 overflow-hidden rounded-xl border ${main === g ? 'border-blue-500' : 'border-white/10'}`}>
                  <img src={g} loading="lazy" decoding="async" className="h-16 w-16 object-cover md:h-20 md:w-28" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <StockBadge availableQuantity={product.availableQuantity} />
            <button onClick={handleBuyNow} className="w-full rounded-full bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white sm:w-auto hover:bg-blue-700">Buy now</button>
          </div>

          <div className="mt-6 grid gap-3 grid-cols-1 sm:grid-cols-3">
            {['Verified seller', 'Secure checkout', 'Fast dispatch'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">{item}</div>
            ))}
          </div>
        </div>

        <div className="w-full space-y-4">
          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/30">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">{product.category}</p>
              <div className="rounded-full bg-amber-500/10 px-3 py-1 text-sm text-amber-300">★ {product.rating}</div>
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-white">{product.price}</h3>
            <p className="mt-3 text-sm text-slate-300">{product.description}</p>
            <div className="mt-4 grid gap-2 text-sm text-slate-300">
              <p><span className="text-slate-500">Seller:</span> {product.seller} {product.verified ? <span className="ml-2 inline-flex items-center gap-1 text-emerald-300">(Verified)</span> : null}</p>
              <p><span className="text-slate-500">Location:</span> {product.location}</p>
              <p><span className="text-slate-500">Condition:</span> {product.condition}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Buyer protection</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2"><Truck className="h-4 w-4 text-blue-300" /> Express delivery</span>
            </div>
          </div>

          {product.videoUrl ? (
            <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/30">
              <h4 className="text-lg font-semibold text-white">Product video</h4>
              <video src={product.videoUrl} controls playsInline className="mt-3 aspect-video w-full max-w-xl rounded-xl bg-slate-950 object-contain" />
            </div>
          ) : null}

          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30">
            <h4 className="text-lg font-semibold text-white">Seller profile</h4>
            <p className="mt-3 text-sm text-slate-300">Premium seller with excellent response time, strong delivery metrics and verified account status.</p>
            <Link to="/customer/seller/1" className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200">View seller profile <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-3">
        <ProductSpecification specs={product.specifications || []} />

        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <h4 className="text-lg font-semibold text-white">Questions & Answers</h4>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {(product.qna || []).map((q) => (
              <div key={q.question} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="font-medium text-white">Q: {q.question}</p>
                <p className="mt-1">A: {q.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <h4 className="text-lg font-semibold text-white">Reviews</h4>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-400">No reviews yet for this product.</div>
            ) : (
              reviews.map((review) => (
                <div key={review.id ?? `${review.productId}-${review.createdAt}`} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{review.customerName || review.customer?.name || review.customer?.firstName || 'Customer'}</p>
                      <p className="text-slate-400 text-sm">{review.rating ?? 0} ★</p>
                    </div>
                    {review.createdAt ? <p className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p> : null}
                  </div>
                  {review.title ? <p className="mt-2 font-medium text-white">{review.title}</p> : null}
                  {review.content ? <p className="mt-2">{review.content}</p> : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-white">Similar products</h3>
        <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {similarProducts.length === 0 ? (
            <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-slate-300">No similar products available.</div>
          ) : (
            similarProducts.map((item) => {
              return (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  image={item.image}
                  images={item.gallery}
                  price={item.price}
                  category={item.category}
                  condition={item.condition}
                  seller={item.seller}
                  rating={item.rating}
                  reviews={item.reviews}
                  verified={item.verified}
                  badge={item.badge}
                  location={item.location}
                  actionLink={`/product/${item.id}`}
                  wishlistItemType={item.isAuction ? 'AUCTION' : 'PRODUCT'}
                  wishlistProductId={item.isAuction ? undefined : item.id}
                  wishlistAuctionId={item.isAuction ? item.auctionId : undefined}
                />
              );
            })
          )}
        </div>
      </div>
    </SectionShell>
  );
}

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Share2, ShoppingCart, Star } from 'lucide-react';
import { SectionShell } from '../components/SectionShell';
import { ProductCard } from '../components/cards/MarketplaceCards';
import { getProductById, getProducts, type ProductListItem } from '../api/productApi';
import { getProductReviews, type ReviewResponse } from '../api/reviewApi';
import { EmptyState, ErrorState, SkeletonCard } from '../components/loading/LoadingComponents';
import { showToast } from '../components/ui/toast';
import { initializeBuyNowFlow } from '../utils/auctionFlowState';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCartContext } from '../context/CartContext';
import { StockBadge } from '../components/common/StockBadge';
import { OfferPrice } from '../components/common/OfferPrice';
import { getActiveProductOffers } from '../services/productOfferService';

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
  const { addItem } = useCartContext();
  const [addingToCart, setAddingToCart] = useState(false);

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
        const offer = (await getActiveProductOffers()).get(String(details.id));
        const enrichedDetails = offer ? { ...details, offerPrice: String(offer.discountedPrice), originalPrice: String(offer.price), discountType: offer.discountType, discountValue: String(offer.discountValue), offerEndsAt: offer.offerEndsAt, offerActive: true } : details;
        setProduct(enrichedDetails);
        setMain(enrichedDetails.gallery?.[0] || enrichedDetails.image);
        const [list, reviewData] = await Promise.all([
          getProducts(),
          getProductReviews(idNum),
        ]);
        setReviews(reviewData);
        const offers = await getActiveProductOffers();
        setSimilarProducts(list.filter((item) => item.id !== details.id).slice(0, 3).map((item) => {
          const itemOffer = offers.get(String(item.id));
          return itemOffer ? { ...item, offerPrice: String(itemOffer.discountedPrice), originalPrice: String(itemOffer.price), discountType: itemOffer.discountType, discountValue: String(itemOffer.discountValue), offerEndsAt: itemOffer.offerEndsAt, offerActive: true } : item;
        }));
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

  const handleAddToCart = async () => {
    if (!product || !product.isDirectBuy || addingToCart) return;
    if (!user || (user.type !== 'customer' && user.role !== 'CUSTOMER')) {
      navigate('/login');
      return;
    }

    setAddingToCart(true);
    try {
      await addItem(product.id);
      showToast('Added to cart', `${product.title} is ready for checkout.`, 'success');
    } catch (reason) {
      showToast('Unable to add to cart', reason instanceof Error ? reason.message : 'Please try again.', 'warning');
    } finally {
      setAddingToCart(false);
    }
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

  const gallery = [...new Set((product.gallery?.length ? product.gallery : [product.image]).filter(Boolean))];
  const reviewRatings = reviews.map((review) => Number(review.rating)).filter((rating) => Number.isFinite(rating) && rating > 0);
  const averageRating = reviewRatings.length > 0
    ? reviewRatings.reduce((total, rating) => total + rating, 0) / reviewRatings.length
    : null;
  const available = product.availableQuantity == null || product.availableQuantity > 0;

  return (
    <main className="mx-auto w-full max-w-[1440px] min-w-0 px-4 py-5 sm:px-6 lg:px-8">
      <div className="grid min-w-0 gap-5 md:gap-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10">
        <section aria-label="Product images" className="grid min-w-0 content-start gap-3 lg:grid-cols-[4.5rem_minmax(0,1fr)]">
          <div className="order-2 flex max-w-full gap-2 overflow-x-auto lg:order-1 lg:max-h-[32rem] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
            {gallery.map((image, index) => (
              <button key={image} type="button" onClick={() => setMain(image)} aria-label={`Show product image ${index + 1}`} aria-pressed={main === image} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-20 sm:w-20 lg:h-[4.5rem] lg:w-[4.5rem] ${main === image ? 'border-blue-500' : 'border-[var(--border-color)]'}`}>
                <img src={image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="relative order-1 min-w-0 overflow-hidden rounded-xl bg-[var(--surface-muted)] lg:order-2">
            <img
              src={main || product.image || '/logo.png'}
              alt={product.title}
              loading="lazy"
              decoding="async"
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
              className={`aspect-[4/3] max-h-[38rem] w-full object-contain transition-transform ${zoom ? 'scale-[1.02]' : ''}`}
            />
            <div className="absolute right-3 top-3 flex gap-2 sm:right-4 sm:top-4">
              <button type="button" onClick={() => void toggleProductFavorite()} disabled={favoritePending} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--text-secondary)] transition hover:text-rose-500 disabled:cursor-wait disabled:opacity-60" aria-label="Toggle favorite" aria-busy={favoritePending}>
                <Heart className={`h-5 w-5 transition ${currentProductWishlistItem ? 'fill-current text-rose-500' : ''}`} />
              </button>
              <button type="button" onClick={handleShareProduct} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--text-secondary)] transition hover:text-blue-600" aria-label="Share product">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
            {gallery.length > 1 ? <span className="absolute bottom-3 right-3 rounded-full bg-slate-950/75 px-2.5 py-1 text-xs font-medium text-white">{gallery.indexOf(main) + 1} / {gallery.length}</span> : null}
          </div>
        </section>

        <section aria-label="Product information" className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--text-muted)]">
            <Link to="/" className="hover:text-blue-500">Home</Link>
            {product.category ? <><span aria-hidden="true">›</span><Link to="/categories" className="max-w-[12rem] truncate hover:text-blue-500">{product.category}</Link></> : null}
            {product.sku ? <><span aria-hidden="true">›</span><span className="break-all">SKU: {product.sku}</span></> : null}
          </div>
          <div className="mt-3 flex min-w-0 items-start justify-between gap-3">
            <h1 className="min-w-0 break-words text-2xl font-semibold leading-snug text-[var(--text-primary)] sm:text-3xl [overflow-wrap:anywhere]">{product.title}</h1>
            {averageRating !== null ? <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-1 text-sm font-semibold text-emerald-600"><Star aria-hidden="true" className="h-4 w-4 fill-current" />{averageRating.toFixed(1)}</span> : null}
          </div>
          {reviewRatings.length > 0 ? <a href="#product-reviews" className="mt-2 w-fit text-sm text-[var(--text-muted)] hover:text-blue-500">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</a> : null}
          {product.seller || product.location || product.condition ? (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--text-muted)]">
              {product.seller ? <span>Seller: <span className="font-medium text-[var(--text-secondary)]">{product.seller}</span></span> : null}
              {product.location ? <span>Location: <span className="font-medium text-[var(--text-secondary)]">{product.location}</span></span> : null}
              {product.condition ? <span>Condition: <span className="font-medium text-[var(--text-secondary)]">{product.condition}</span></span> : null}
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[var(--border-color)] pt-4">
            <OfferPrice price={product.price} offerPrice={product.offerPrice} originalPrice={product.originalPrice} discountType={product.discountType} discountValue={product.discountValue} offerEndsAt={product.offerEndsAt} offerActive={product.offerActive} detail />
            <StockBadge availableQuantity={product.availableQuantity} className="sm:ml-auto" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={handleBuyNow} disabled={!available} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50">
              {available ? 'Buy now' : 'Out of stock'}
            </button>
            {product.isDirectBuy ? <button type="button" onClick={() => void handleAddToCart()} disabled={!available || addingToCart} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-blue-500 px-4 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50">
              <ShoppingCart aria-hidden="true" className="h-4 w-4" />
              {addingToCart ? 'Adding...' : 'Add to cart'}
            </button> : null}
          </div>
          {product.seller && product.vendorId != null ? <Link to={`/customer/seller/${product.vendorId}`} className="mt-4 w-fit text-sm font-medium text-blue-600 hover:text-blue-700">Visit seller profile <span aria-hidden="true">→</span></Link> : null}
        </section>
      </div>

      {product.videoUrl ? (
        <section aria-label="Product video" className="mt-8 border-t border-[var(--border-color)] pt-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Product video</h2>
          <video src={product.videoUrl} controls playsInline className="mt-3 aspect-video w-full rounded-xl bg-slate-950 object-contain lg:max-w-3xl" />
        </section>
      ) : null}

      <div className="mt-8 divide-y divide-[var(--border-color)] border-y border-[var(--border-color)]">
        {product.description ? (
          <section id="product-description" aria-labelledby="product-description-heading" className="py-5">
            <h2 id="product-description-heading" className="text-lg font-semibold text-[var(--text-primary)]">Description</h2>
            <p className="mt-3 whitespace-pre-line break-words text-sm leading-6 text-[var(--text-secondary)] [overflow-wrap:anywhere]">{product.description}</p>
          </section>
        ) : null}

        {product.specifications?.length ? (
          <section id="product-specifications" aria-labelledby="product-specifications-heading" className="py-5">
            <h2 id="product-specifications-heading" className="text-lg font-semibold text-[var(--text-primary)]">Specifications</h2>
            <dl className="mt-3 grid min-w-0 grid-cols-1 divide-y divide-[var(--border-color)] sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0">
              {product.specifications.map((specification) => (
                <div key={specification.label} className="grid min-w-0 grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3 border-b border-[var(--border-color)] py-2.5 text-sm sm:gap-4">
                  <dt className="break-words text-[var(--text-muted)] [overflow-wrap:anywhere]">{specification.label}</dt>
                  <dd className="break-words text-[var(--text-secondary)] [overflow-wrap:anywhere]">{specification.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <section id="product-reviews" aria-labelledby="product-reviews-heading" className="py-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="product-reviews-heading" className="text-lg font-semibold text-[var(--text-primary)]">Reviews</h2>
            {averageRating !== null ? <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--text-secondary)]"><Star aria-hidden="true" className="h-4 w-4 fill-current text-amber-500" />{averageRating.toFixed(1)} / 5 · {reviews.length}</span> : null}
          </div>
          {reviews.length === 0 ? <p className="mt-2 text-sm text-[var(--text-muted)]">No reviews yet.</p> : (
            <div className="mt-3 divide-y divide-[var(--border-color)]">
              {reviews.map((review, index) => {
                const reviewer = review.customerName || review.customer?.name || [review.customer?.firstName, review.customer?.lastName].filter(Boolean).join(' ');
                return (
                  <article key={review.id ?? `${review.productId}-${review.createdAt}-${index}`} className="py-3 text-sm text-[var(--text-secondary)]">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      {reviewer ? <p className="font-medium text-[var(--text-primary)]">{reviewer}</p> : null}
                      {review.rating !== undefined ? <p className="inline-flex items-center gap-1 text-amber-600"><Star aria-hidden="true" className="h-4 w-4 fill-current" />{review.rating}</p> : null}
                      {review.createdAt ? <time className="text-xs text-[var(--text-muted)]">{new Date(review.createdAt).toLocaleDateString()}</time> : null}
                    </div>
                    {review.title ? <p className="mt-2 font-medium text-[var(--text-primary)]">{review.title}</p> : null}
                    {review.content ? <p className="mt-1 whitespace-pre-line break-words [overflow-wrap:anywhere]">{review.content}</p> : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section id="product-questions" aria-labelledby="product-questions-heading" className="py-5">
          <h2 id="product-questions-heading" className="text-lg font-semibold text-[var(--text-primary)]">Questions &amp; Answers</h2>
          {product.qna?.length ? (
            <div className="mt-3 divide-y divide-[var(--border-color)]">
              {product.qna.map((item, index) => (
                <article key={`${item.question}-${index}`} className="py-3 text-sm text-[var(--text-secondary)]">
                  <p className="font-medium text-[var(--text-primary)]">Q: {item.question}</p>
                  <p className="mt-1">A: {item.answer}</p>
                </article>
              ))}
            </div>
          ) : <p className="mt-2 text-sm text-[var(--text-muted)]">No questions yet.</p>}
        </section>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Similar products</h2>
        <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {similarProducts.length === 0 ? (
            <p className="py-4 text-sm text-[var(--text-muted)]">No similar products available.</p>
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
                  offerPrice={item.offerPrice}
                  originalPrice={item.originalPrice}
                  discountType={item.discountType}
                  discountValue={item.discountValue}
                  offerEndsAt={item.offerEndsAt}
                  offerActive={item.offerActive}
                />
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}

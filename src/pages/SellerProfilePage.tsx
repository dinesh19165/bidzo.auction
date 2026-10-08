import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { ApiError, API_BASE_URL } from '../api/apiClient';
import { getPublicSellerById, type PublicSellerProfile } from '../api/sellerApi';
import { ProductCard } from '../components/cards/MarketplaceCards';
import { EmptyState, ErrorState, SkeletonCard } from '../components/loading/LoadingComponents';
import { SectionShell } from '../components/SectionShell';

export function SellerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [seller, setSeller] = useState<PublicSellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    const vendorId = Number(id);
    if (!id || !Number.isSafeInteger(vendorId) || vendorId <= 0) {
      setSeller(null);
      setNotFound(true);
      setError(null);
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);
    setNotFound(false);
    setError(null);
    getPublicSellerById(vendorId).then((data) => {
      if (active) setSeller(data);
    }).catch((reason: unknown) => {
      if (!active) return;
      setSeller(null);
      if (reason instanceof ApiError && reason.status === 404) setNotFound(true);
      else setError(reason instanceof Error ? reason.message : 'Unable to load seller profile.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [id, retryCount]);

  const location = seller ? [seller.city, seller.state].filter((value): value is string => Boolean(value?.trim())).join(', ') : '';
  const sellerName = seller?.companyName || seller?.name;

  return <SectionShell title="SELLER PROFILE" subtitle="Seller information">
    {loading ? <div className="grid gap-4 md:grid-cols-3">{[1, 2, 3].map((item) => <SkeletonCard key={item} />)}</div> : notFound ? <EmptyState title="Seller not found" description="This seller profile could not be found." /> : error ? <div><ErrorState title="Unable to load seller profile" description={error} /><button type="button" onClick={() => setRetryCount((count) => count + 1)} className="mt-3 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Retry</button></div> : seller ? <>
      <section className="mb-6 rounded-[24px] border border-white/10 bg-slate-900/70 p-5 sm:p-6">
        <h2 className="break-words text-xl font-semibold text-white">{sellerName}</h2>
        {location ? <p className="mt-2 text-sm text-slate-300">{location}</p> : null}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-300">
          {seller.verified ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 font-medium text-emerald-300"><CheckCircle2 className="h-4 w-4" />Verified seller</span> : null}
          <span>{seller.productCount} products</span>
        </div>
      </section>
      {seller.productCount === 0 ? <EmptyState title="No published products from this seller yet." description="Published products from this seller will appear here." /> : seller.products.length === 0 ? <EmptyState title="Products temporarily unavailable" description="This seller has published products, but none are available to display right now." /> : <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {seller.products.map((product) => {
          const images = product.images || [];
          const image = product.imageUrl || product.image || images[0] || '/logo.png';
          const toAbsoluteImage = (value: string) => value.startsWith('/') && !value.startsWith('/logo') ? `${API_BASE_URL}${value}` : value;
          return <ProductCard key={product.id} id={product.id} title={product.name} description={product.description || ''} image={toAbsoluteImage(image)} images={images.map(toAbsoluteImage)} price={String(product.offerPrice ?? product.price ?? '')} category={product.categoryName || 'Marketplace product'} condition={product.condition || 'Available'} seller={sellerName || ''} verified={product.verified} actionLabel="View Product" actionLink={`/product/${product.id}`} wishlistItemType="PRODUCT" wishlistProductId={Number(product.id)} availableQuantity={product.availableQuantity} offerPrice={product.offerPrice ?? product.discountedPrice} originalPrice={product.originalPrice} discountType={product.discountType || undefined} discountValue={product.discountValue == null ? undefined : String(product.discountValue)} offerEndsAt={product.offerEndsAt} offerActive={product.offerActive} showAddToCart containImage />;
        })}
      </div>}
    </> : null}
  </SectionShell>;
}

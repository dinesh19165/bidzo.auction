import { useEffect, useState } from 'react';
import { Check, Tag, X } from 'lucide-react';
import { getCustomerOffers, validateOffer, type Offer, type OfferValidationResponse } from '../../api/offerApi';
import { showToast } from '../ui/toast';

type AppliedOffer = OfferValidationResponse & { sourceCode?: string };

interface OfferCheckoutSectionProps {
  orderAmount: number;
  productId?: number;
  categoryId?: number;
  categoryName?: string;
  categoryObject?: { id?: number | string | null; name?: string | null } | null;
  productIds?: number[];
  categoryIds?: number[];
  onApplied: (value: AppliedOffer) => void;
  onRemoved: () => void;
}

export function OfferCheckoutSection({ orderAmount, productId, categoryId, categoryName, categoryObject: productCategory, productIds: suppliedProductIds, categoryIds: suppliedCategoryIds, onApplied, onRemoved }: OfferCheckoutSectionProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [offerId, setOfferId] = useState<number | string | undefined>();
  const [applied, setApplied] = useState<AppliedOffer | null>(null);
  const [loading, setLoading] = useState(false);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersError, setOffersError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const productIds = suppliedProductIds ?? (productId === undefined ? [] : [productId]);
  const categoryIds = suppliedCategoryIds ?? (categoryId === undefined ? [] : [categoryId]);

  useEffect(() => {
    let active = true;
    setOffersLoading(true);
    setOffersError(null);
    if (productIds.length === 0 || categoryIds.length === 0) {
      setOffers([]);
      setOffersError('Product category information is unavailable. Please refresh and try again.');
      setOffersLoading(false);
      return undefined;
    }
    getCustomerOffers().then(async (candidates) => {
      const validationErrors: string[] = [];
      const results = await Promise.all(candidates.map(async (offer) => {
        try {
          const request = { offerId: offer.id, orderAmount, productIds, categoryIds };
          console.log('=== BUY NOW OFFER DEBUG ===', { productId, productCategoryId: categoryId, productCategoryName: categoryName, productCategoryObject: productCategory, offerId: offer.id, offerType: offer.offerType, offerCategoryIds: offer.categoryIds, orderAmount });
          console.log('VALIDATE BODY', request);
          const result = await validateOffer(request);
          console.log('VALIDATION RESPONSE', result);
          if (result.valid !== false) return offer;
          if (result.message) validationErrors.push(result.message);
          return null;
        } catch (reason) {
          console.error('Offer validation failed', { offer, reason });
          if (reason instanceof Error && reason.message) validationErrors.push(reason.message);
          return null;
        }
      }));
      if (active) {
        const applicableOffers = results.filter((offer): offer is Offer => Boolean(offer));
        setOffers(applicableOffers);
        if (applicableOffers.length === 0 && validationErrors.length > 0) setOffersError(validationErrors[0]);
      }
    }).catch((reason) => {
      if (active) {
        console.error('Customer offers failed to load', reason);
        setOffers([]);
        setOffersError(reason instanceof Error ? reason.message : 'Unable to load available offers.');
      }
    }).finally(() => {
      if (active) setOffersLoading(false);
    });
    return () => { active = false; };
  }, [categoryId, categoryName, orderAmount, productId, productIds.join(','), categoryIds.join(',')]);

  const apply = async () => {
    if (!couponCode.trim() && offerId === undefined) { setError('Enter a coupon code or select an offer.'); return; }
    setLoading(true); setError(null);
    try {
      const trimmedCouponCode = couponCode.trim();
      if (productIds.length === 0 || categoryIds.length === 0) {
        throw new Error('Product category information is unavailable. Please refresh and try again.');
      }
      const request = { orderAmount, productIds, categoryIds, ...(offerId !== undefined ? { offerId } : {}), ...(trimmedCouponCode ? { couponCode: trimmedCouponCode } : {}) };
      console.log('VALIDATE BODY', request);
      const result = await validateOffer(request);
      console.log('VALIDATION RESPONSE', result);
      if (result.valid === false) throw new Error(result.message || 'Offer is not available.');
      const next = { ...result, sourceCode: trimmedCouponCode || undefined };
      setApplied(next); onApplied(next); showToast('Offer applied', `Discount: ₹${Number(result.discountAmount || 0).toLocaleString('en-IN')}`, 'success');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to validate offer.'); }
    finally { setLoading(false); }
  };

  const remove = () => { setApplied(null); setOfferId(undefined); setCouponCode(''); setError(null); onRemoved(); };

  return <section className="rounded-lg border border-emerald-400/20 bg-emerald-500/5 p-3"><div className="flex items-center gap-2"><Tag className="h-4 w-4 text-emerald-300" /><h3 className="text-sm font-bold text-white">Have an offer?</h3></div>{applied ? <div className="mt-3 flex items-start justify-between gap-3 rounded-lg border border-emerald-400/20 bg-emerald-500/10 p-3"><div><p className="flex items-center gap-1 text-sm font-semibold text-emerald-200"><Check className="h-4 w-4" />Offer applied</p><p className="mt-1 text-xs text-slate-300">Discount: ₹{Number(applied.discountAmount || 0).toLocaleString('en-IN')}</p>{applied.finalAmount !== undefined ? <p className="mt-1 text-xs text-slate-400">Backend total: ₹{Number(applied.finalAmount).toLocaleString('en-IN')}</p> : null}</div><button type="button" onClick={remove} className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white"><X className="h-3.5 w-3.5" />Remove</button></div> : <><div className="mt-3 flex flex-col gap-2 sm:flex-row"><input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="Enter coupon code" className="h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-emerald-400/50" /><button type="button" onClick={() => void apply()} disabled={loading} className="h-10 rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-slate-950 disabled:opacity-50">{loading ? 'Checking...' : 'Apply'}</button></div>{!offersLoading && offers.length > 0 ? <select value={offerId === undefined ? '' : String(offerId)} onChange={(event) => setOfferId(event.target.value ? event.target.value : undefined)} className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 text-sm text-white"><option value="">Select an available offer</option>{offers.map((offer) => <option key={offer.id} value={String(offer.id)}>{offer.name} - {offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}%` : `₹${offer.discountValue}`} off</option>)}</select> : null}</>}{offersError ? <p className="mt-2 text-xs text-amber-200">{offersError}</p> : !offersLoading && offers.length === 0 ? <p className="mt-2 text-xs text-slate-400">No applicable offers for this product</p> : null}{error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}</section>;
}

export type { AppliedOffer };

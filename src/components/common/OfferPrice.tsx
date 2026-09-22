import { useLocaleContext } from '../../context/LocaleContext';

type OfferPriceProps = {
  price: string | number;
  offerPrice?: string | number | null;
  originalPrice?: string | number | null;
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT' | string | null;
  discountValue?: string | number | null;
  offerEndsAt?: string | null;
  offerActive?: boolean | null;
  detail?: boolean;
};

function validAmount(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const amount = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(amount) ? amount : null;
}

export function OfferPrice({ price, offerPrice, originalPrice, discountType, discountValue, offerEndsAt, offerActive, detail = false }: OfferPriceProps) {
  const { formatCurrency } = useLocaleContext();
  const baseAmount = validAmount(price);
  const effectiveAmount = validAmount(offerPrice);
  const explicitOriginal = validAmount(originalPrice);
  const originalAmount = explicitOriginal ?? baseAmount;
  const hasExpiry = Boolean(offerEndsAt);
  const expired = hasExpiry && Number.isFinite(new Date(offerEndsAt as string).getTime()) && new Date(offerEndsAt as string).getTime() <= Date.now();
  const active = offerActive !== false && effectiveAmount !== null && originalAmount !== null && effectiveAmount < originalAmount && !expired;
  const discountAmount = active && originalAmount !== null && effectiveAmount !== null ? originalAmount - effectiveAmount : 0;
  const percentage = active && originalAmount ? Math.round((discountAmount / originalAmount) * 100) : 0;
  const badge = discountType === 'PERCENTAGE' && validAmount(discountValue) !== null
    ? `${validAmount(discountValue)}% OFF`
    : percentage > 0
      ? `${percentage}% OFF`
      : discountAmount > 0
        ? `${formatCurrency(discountAmount)} OFF`
        : null;

  if (!active) return <span className={detail ? 'text-2xl font-semibold text-white' : 'truncate text-base font-bold'}>{formatCurrency(baseAmount ?? price)}</span>;

  return <span className={detail ? 'block' : 'block min-w-0'}>
    {badge ? <span className="mb-1 inline-flex rounded bg-red-500 px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none text-white">{badge}</span> : null}
    <span className={detail ? 'block text-2xl font-semibold text-emerald-300' : 'block truncate text-base font-bold text-emerald-500'}>{formatCurrency(effectiveAmount)}</span>
    <span className={detail ? 'mt-1 block text-sm text-slate-400 line-through' : 'block truncate text-[10px] text-slate-500 line-through'}>{formatCurrency(originalAmount)}</span>
  </span>;
}

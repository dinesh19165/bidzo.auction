import { useEffect, useState } from 'react';
import { Copy, Gift, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionShell } from '../components/SectionShell';
import { Card } from '../components/common/Card';
import { ErrorState } from '../components/loading/LoadingComponents';
import { getCustomerOffers, type Offer } from '../api/offerApi';
import { showToast } from '../components/ui/toast';

function money(value?: number | null): string | null { return value === null || value === undefined || !Number.isFinite(Number(value)) ? null : `₹${Number(value).toLocaleString('en-IN')}`; }
function discount(offer: Offer): string { return offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}% OFF` : `${money(offer.discountValue) ?? '₹0'} OFF`; }

function OfferCard({ offer }: { offer: Offer }) {
  const copy = async () => { if (!offer.couponCode) return; await navigator.clipboard?.writeText(offer.couponCode); showToast('Code copied', `${offer.couponCode} is ready to use.`, 'success'); };
  return <Card className="relative overflow-hidden p-5"><div className="absolute right-4 top-4 rounded-full bg-emerald-500/10 p-2 text-emerald-300"><Gift className="h-4 w-4" /></div><p className="pr-10 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">{offer.offerType.replaceAll('_', ' ')}</p><h2 className="mt-2 pr-10 text-xl font-semibold text-white">{offer.name}</h2><p className="mt-2 text-sm leading-6 text-slate-300">{offer.description || 'A special offer is available for your account.'}</p><p className="mt-4 text-2xl font-bold text-emerald-300">{discount(offer)}</p>{offer.minimumOrderAmount ? <p className="mt-2 text-sm text-slate-400">Minimum order {money(offer.minimumOrderAmount)}</p> : null}{offer.maximumDiscountAmount ? <p className="mt-1 text-sm text-slate-400">Maximum discount {money(offer.maximumDiscountAmount)}</p> : null}{offer.couponCode ? <button type="button" onClick={() => void copy()} className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"><Copy className="h-4 w-4" />{offer.couponCode}</button> : null}<p className="mt-4 text-xs text-slate-500">Valid until {offer.endAt ? new Date(offer.endAt).toLocaleString('en-IN') : 'further notice'}</p></Card>;
}

export function CustomerOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = async () => { setLoading(true); setError(null); try { setOffers(await getCustomerOffers()); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load offers.'); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  return <SectionShell title="Offers" subtitle="Savings available for your account"><div className="mx-auto w-full max-w-5xl">{loading ? <div className="grid gap-4 md:grid-cols-2"><div className="h-52 animate-pulse rounded-2xl bg-white/10" /><div className="h-52 animate-pulse rounded-2xl bg-white/10" /></div> : error ? <ErrorState title="Unable to load offers" description={error} /> : offers.length === 0 ? <Card className="p-10 text-center"><Gift className="mx-auto h-10 w-10 text-slate-600" /><p className="mt-3 text-white">No offers available right now.</p><p className="mt-1 text-sm text-slate-400">Eligible offers will appear here automatically.</p><button type="button" onClick={() => void load()} className="mt-4 inline-flex items-center gap-2 text-sm text-sky-300"><RefreshCw className="h-4 w-4" />Refresh</button></Card> : <div className="grid gap-4 md:grid-cols-2">{offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}</div>}<Link to="/customer/cart" className="mt-5 inline-flex text-sm font-semibold text-sky-300 hover:text-sky-200">Continue shopping</Link></div></SectionShell>;
}

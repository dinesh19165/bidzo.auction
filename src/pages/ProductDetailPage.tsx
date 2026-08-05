import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Heart, ShieldCheck, Truck, Share2 } from 'lucide-react';
import { SectionShell } from '../components/SectionShell';
import { ProductCard } from '../components/cards/MarketplaceCards';
import { products, reviews as mockReviews } from '../data/mockData';
import { useState } from 'react';

export function ProductDetailPage() {
  const { id } = useParams();
  const product = products.find((item) => item.id === Number(id));

  const [main, setMain] = useState(product?.gallery?.[0] || product?.image || '');
  const [zoom, setZoom] = useState(false);

  if (!product) {
    return (
      <SectionShell title="Product" subtitle="Not found">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-300">This listing is unavailable.</div>
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
                src={main}
                alt={product.title}
                loading="lazy"
                decoding="async"
                onMouseEnter={() => setZoom(true)}
                onMouseLeave={() => setZoom(false)}
                className={`h-72 w-full max-w-full rounded-[24px] object-cover transition-transform sm:h-96 ${zoom ? 'scale-105' : ''}`}
              />
              <div className="absolute right-4 top-4 inline-flex gap-2">
                <button className="rounded-full bg-slate-950/75 p-2 text-slate-200"><Heart className="h-4 w-4" /></button>
                <button className="rounded-full bg-slate-950/75 p-2 text-slate-200"><Share2 className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="hidden flex-col gap-2 md:flex">
              {(product.gallery || []).map((g) => (
                <button key={g} onClick={() => setMain(g)} className={`overflow-hidden rounded-xl border ${main === g ? 'border-blue-500' : 'border-white/10'}`}>
                  <img src={g} loading="lazy" decoding="async" className="h-20 w-28 object-cover" />
                </button>
              ))}
              <div className="mt-2 rounded-xl border border-white/10 p-2 text-sm text-slate-300">Video walkthrough available on request for premium listings.</div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to="/customer/checkout" className="w-full rounded-full bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white sm:w-auto">Buy now</Link>
            <Link to="/customer/wishlist" className="w-full rounded-full border border-white/10 px-5 py-2.5 text-center text-sm font-medium text-slate-200 sm:w-auto">Add to wishlist</Link>
            <button className="w-full rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-200 sm:w-auto">Compare</button>
          </div>

          <div className="mt-6 grid gap-3 grid-cols-1 sm:grid-cols-3">
            {['Verified seller', 'Secure checkout', 'Fast dispatch'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">{item}</div>
            ))}
          </div>
        </div>

        <div className="w-full space-y-4">
          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">{product.category}</p>
              <div className="rounded-full bg-amber-500/10 px-3 py-1 text-sm text-amber-300">★ {product.rating}</div>
            </div>
            <h3 className="mt-3 text-3xl font-semibold text-white">{product.price}</h3>
            <p className="mt-3 text-sm text-slate-300">{product.description}</p>
            <div className="mt-5 grid gap-3 text-sm text-slate-300">
              <p><span className="text-slate-500">Seller:</span> {product.seller} {product.verified ? <span className="ml-2 inline-flex items-center gap-1 text-emerald-300">(Verified)</span> : null}</p>
              <p><span className="text-slate-500">Location:</span> {product.location}</p>
              <p><span className="text-slate-500">Condition:</span> {product.condition}</p>
              <p><span className="text-slate-500">Stock:</span> {product.stock} available</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Buyer protection</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2"><Truck className="h-4 w-4 text-blue-300" /> Express delivery</span>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30">
            <h4 className="text-lg font-semibold text-white">Seller profile</h4>
            <p className="mt-3 text-sm text-slate-300">Premium seller with excellent response time, strong delivery metrics and verified account status.</p>
            <Link to="/customer/seller/1" className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200">View seller profile <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <h4 className="text-lg font-semibold text-white">Specifications</h4>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            {(product.specifications || []).map((s) => (
              <div key={s.label} className="flex justify-between"><span className="text-slate-400">{s.label}</span><span className="font-medium text-white">{s.value}</span></div>
            ))}
          </div>
        </div>

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
            {mockReviews.map((r) => (
              <div key={r.author} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between"><div><p className="font-medium text-white">{r.author}</p><p className="text-slate-400 text-sm">{r.rating} ★</p></div></div>
                <p className="mt-2">{r.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-white">Similar products</h3>
        <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 3).map((item) => (
            <ProductCard key={item.id} id={item.id} title={item.title} description={item.description} image={item.image} price={item.price} category={item.category} condition={item.condition} seller={item.seller} />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

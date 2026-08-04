import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Heart, ShieldCheck, Star, Truck } from 'lucide-react';
import { SectionShell } from '../components/SectionShell';
import { ProductCard } from '../components/cards/MarketplaceCards';
import { products } from '../data/mockData';

export function ProductDetailPage() {
  const { id } = useParams();
  const product = products.find((item) => item.id === Number(id));

  if (!product) {
    return <SectionShell title="Product" subtitle="Not found"><div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-300">This listing is unavailable.</div></SectionShell>;
  }

  return (
    <SectionShell title="Product details" subtitle={product.title}>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/30">
          <img src={product.image} alt={product.title} className="h-96 w-full rounded-[24px] object-cover" />
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white">Buy now</button>
            <button className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-200">Add to wishlist</button>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {['Verified seller', 'Secure checkout', 'Fast dispatch'].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">{item}</div>)}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">{product.category}</p>
              <div className="rounded-full bg-amber-500/10 px-3 py-1 text-sm text-amber-300">★ {product.rating}</div>
            </div>
            <h3 className="mt-3 text-3xl font-semibold text-white">{product.price}</h3>
            <p className="mt-3 text-sm text-slate-300">{product.description}</p>
            <div className="mt-5 grid gap-3 text-sm text-slate-300">
              <p><span className="text-slate-500">Seller:</span> {product.seller}</p>
              <p><span className="text-slate-500">Location:</span> {product.location}</p>
              <p><span className="text-slate-500">Condition:</span> {product.condition}</p>
              <p><span className="text-slate-500">Stock:</span> {product.stock} available</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Escrow protected</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2"><Truck className="h-4 w-4 text-blue-300" /> Express delivery</span>
            </div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30">
            <h4 className="text-lg font-semibold text-white">Seller profile</h4>
            <p className="mt-3 text-sm text-slate-300">Premium seller with excellent response time, strong delivery metrics and verified account status.</p>
            <Link to="/seller/1" className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200">View seller profile <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-white">Similar products</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {products.slice(0, 3).map((item) => <ProductCard key={item.id} id={item.id} title={item.title} description={item.description} image={item.image} price={item.price} category={item.category} condition={item.condition} seller={item.seller} />)}
        </div>
      </div>
    </SectionShell>
  );
}

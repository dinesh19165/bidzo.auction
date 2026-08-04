import { SectionShell } from '../components/SectionShell';
import { wishlistItems } from '../data/mockData';

export function WishlistPage() {
  return (
    <SectionShell title="Wishlist" subtitle="Saved opportunities">
      <div className="grid gap-4 md:grid-cols-2">
        {wishlistItems.map((item) => (
          <div key={item.title} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-3 text-sm text-slate-400">{item.note}</p>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-lg font-semibold text-white">{item.price}</p>
              <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Move to cart</button>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

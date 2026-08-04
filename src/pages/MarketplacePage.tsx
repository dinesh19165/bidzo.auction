import { SectionShell } from '../components/SectionShell';
import { categories, products } from '../data/mockData';
import { SearchBar } from '../components/forms/FormComponents';
import { Sidebar } from '../components/layout/LayoutComponents';
import { ProductCard } from '../components/cards/MarketplaceCards';

export function MarketplacePage() {
  return (
    <SectionShell title="Marketplace" subtitle="Browse categories and curated listings">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Sidebar theme="dark">
          <h3 className="text-lg font-semibold text-white">Categories</h3>
          <div className="mt-4 space-y-2">
            {categories.slice(0, 12).map((category) => (
              <div key={category} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">{category}</div>
            ))}
          </div>
        </Sidebar>
        <div className="space-y-4">
          <SearchBar placeholder="Search listings, categories, or sellers" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} id={product.id} title={product.title} description={product.description} image={product.image} price={product.price} category={product.category} condition={product.condition} seller={product.seller} />
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

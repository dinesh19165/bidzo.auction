import { SectionShell } from '../../components/SectionShell';
import { products, categories } from '../../data/mockData';

export function CategoriesPage() {
  return (
    <SectionShell title="Categories" subtitle="Browse by vertical and intent">
      <div className="grid gap-4 md:grid-cols-3">
        {categories.map((category) => (
          <div key={category} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-slate-300">{category}</div>
        ))}
      </div>
    </SectionShell>
  );
}

export function SubCategoriesPage() {
  return (
    <SectionShell title="Sub categories" subtitle="Details for niche discovery">
      <div className="grid gap-4 md:grid-cols-3">
        {['Smartphones', 'Gaming', 'Office Equipment', 'Classic Vehicles', 'Luxury Jewelry', 'Industrial Tools'].map((item) => (
          <div key={item} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-slate-300">{item}</div>
        ))}
      </div>
    </SectionShell>
  );
}

export function SearchResultsPage() {
  return (
    <SectionShell title="Search results" subtitle="Focused match results">
      <div className="grid gap-4 md:grid-cols-2">
        {products.slice(0, 4).map((product) => (
          <div key={product.id} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-slate-300">
            <h3 className="text-lg font-semibold text-white">{product.title}</h3>
            <p className="mt-2 text-sm">{product.description}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function RecommendedPage() {
  return (
    <SectionShell title="Recommended" subtitle="Suggested for your buying journey">
      <div className="grid gap-4 md:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-slate-300">
            <h3 className="text-lg font-semibold text-white">{product.title}</h3>
            <p className="mt-2 text-sm">{product.price}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

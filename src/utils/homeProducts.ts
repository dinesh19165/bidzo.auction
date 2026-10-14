import type { ProductResponse } from '../api/homeApi';

const HOME_PRODUCT_SECTION_LIMIT = 5;

function uniqueDirectBuyProducts(products: ProductResponse[]): ProductResponse[] {
  const seen = new Set<string>();
  return products.filter((product) => {
    if (String(product.sellingType ?? '').trim().toUpperCase() !== 'DIRECT_BUY') return false;
    const id = String(product.id);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function buildHomeProductSections(featuredCandidates: ProductResponse[], recentCandidates: ProductResponse[]) {
  const featuredProducts = uniqueDirectBuyProducts(featuredCandidates).slice(0, HOME_PRODUCT_SECTION_LIMIT);
  const featuredIds = new Set(featuredProducts.map((product) => String(product.id)));
  const recentProducts = uniqueDirectBuyProducts(recentCandidates)
    .filter((product) => !featuredIds.has(String(product.id)))
    .slice(0, HOME_PRODUCT_SECTION_LIMIT);

  return { featuredProducts, recentProducts };
}

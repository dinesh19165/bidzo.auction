export interface HomePromotion {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  eyebrow: string;
  priceLabel: string;
  ctaLabel: string;
  href: string;
  currentBid?: string;
  startingBid?: string;
  remainingTime?: string;
  offerText?: string;
}

export const demoLiveAuctionPromotions: HomePromotion[] = [
  {
    id: 'auction-vintage-watch',
    title: 'Vintage Chronograph Timepiece',
    imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1800&q=85',
    description: 'A collector-grade classic with a story worth bidding on.',
    eyebrow: 'Live auction · Ends in 02h 18m',
    priceLabel: '₹2,72,000',
    currentBid: '₹2,72,000',
    startingBid: '₹2,40,000',
    remainingTime: '02h 18m left',
    ctaLabel: 'Bid now',
    href: '/auctions',
  },
  {
    id: 'auction-premium-motorcycle',
    title: 'Yamaha RX100 Heritage Edition',
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1800&q=85',
    description: 'Ride home a timeless machine from a verified seller.',
    eyebrow: 'Live auction · Ends in 05h 42m',
    priceLabel: '₹1,18,500',
    currentBid: '₹1,18,500',
    startingBid: '₹95,000',
    remainingTime: '05h 42m left',
    ctaLabel: 'View auction',
    href: '/auctions',
  },
  {
    id: 'auction-studio-console',
    title: 'Limited Edition Studio Console',
    imageUrl: 'https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?auto=format&fit=crop&w=1800&q=85',
    description: 'Bring a rare piece of design into your space before it is gone.',
    eyebrow: 'Live auction · Ends in 08h 06m',
    priceLabel: '₹68,000',
    currentBid: '₹68,000',
    startingBid: '₹52,000',
    remainingTime: '08h 06m left',
    ctaLabel: 'Bid now',
    href: '/auctions',
  },
];

export const demoDirectBuyPromotions: HomePromotion[] = [
  {
    id: 'directbuy-flagship-phone',
    title: 'Flagship Smartphone Pro',
    imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1800&q=85',
    description: 'A powerful everyday upgrade, ready to ship from a verified seller.',
    eyebrow: 'Direct Buy · Verified seller',
    priceLabel: '₹70,000',
    offerText: 'Free insured delivery · Verified seller',
    ctaLabel: 'Buy now',
    href: '/marketplace',
  },
  {
    id: 'directbuy-modern-chair',
    title: 'Modern Lounge Chair',
    imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1800&q=85',
    description: 'Designed comfort with a polished silhouette for your home.',
    eyebrow: 'Direct Buy · Ready to ship',
    priceLabel: '₹18,500',
    offerText: 'Save 12% · Ready to ship',
    ctaLabel: 'Buy now',
    href: '/marketplace',
  },
  {
    id: 'directbuy-premium-headphones',
    title: 'Studio Wireless Headphones',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1800&q=85',
    description: 'Immersive sound and all-day comfort for focused listening.',
    eyebrow: 'Direct Buy · New arrival',
    priceLabel: '₹12,999',
    offerText: 'New arrival · 1-year warranty',
    ctaLabel: 'Buy now',
    href: '/marketplace',
  },
];

export interface DemoCategoryPromotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tone: string;
  href: string;
}

export const demoCategoryPromotions: DemoCategoryPromotion[] = [
  { id: 'category-electronics', title: 'Consumer Electronics', description: 'Mobiles, laptops, cameras & more', imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=900&q=85', tone: 'from-sky-200 to-blue-300', href: '/marketplace?category=Consumer%20Electronics' },
  { id: 'category-home-living', title: 'Home & Living', description: 'Furniture, appliances, decor & more', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85', tone: 'from-amber-100 to-orange-200', href: '/marketplace?category=Home%20%26%20Living' },
  { id: 'category-fashion', title: 'Fashion & Lifestyle', description: 'Clothing, footwear, accessories & more', imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=85', tone: 'from-pink-200 to-rose-300', href: '/marketplace?category=Fashion' },
];
export type Product = {
  id: number;
  title: string;
  category: string;
  price: string;
  rating: number;
  reviews: number;
  condition: string;
  location: string;
  badge: string;
  verified: boolean;
  image: string;
  description: string;
  seller: string;
  stock: number;
  gallery?: string[];
  specifications?: { label: string; value: string }[];
  qna?: { question: string; answer: string }[];
  relatedAuctions?: number[];
};

export const categories = [
  'Electronics', 'Vehicles', 'Real Estate', 'Furniture', 'Fashion', 'Pets', 'Fish', 'Livestock', 'Agriculture', 'Seeds', 'Farm Equipment', 'Books', 'Services', 'Jobs', 'Industrial Equipment', 'Sports', 'Jewelry', 'Mobile Phones', 'Laptops', 'Gaming', 'Home Appliances'
];

export const products: Product[] = [
  {
    id: 1,
    title: 'Premium MacBook Pro M3',
    category: 'Laptops',
    price: '₹2,48,000',
    rating: 4.9,
    reviews: 124,
    condition: 'Like New',
    location: 'Bengaluru',
    badge: 'Featured',
    verified: true,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
    ],
    specifications: [
      { label: 'Processor', value: 'Apple M3' },
      { label: 'Memory', value: '18GB unified RAM' },
      { label: 'Storage', value: '512GB SSD' },
      { label: 'Display', value: '14-inch Liquid Retina' },
      { label: 'Warranty', value: '12 months' },
    ],
    qna: [
      { question: 'Does this include charger?', answer: 'Yes, it includes the original 100W USB-C charger.' },
      { question: 'Is battery health certified?', answer: 'Battery is certified to be over 98% capacity.' },
    ],
    relatedAuctions: [101],
    description: 'Apple M3 chip, 18GB RAM, 512GB SSD, premium display with excellent battery life.',
    seller: 'Nova Tech',
    stock: 3,
  },
  {
    id: 2,
    title: 'Luxury SUV 2024',
    category: 'Vehicles',
    price: '₹34,75,000',
    rating: 4.8,
    reviews: 88,
    condition: 'Certified',
    location: 'Mumbai',
    badge: 'Auction',
    verified: true,
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80',
    ],
    specifications: [
      { label: 'Engine', value: '3.5L V6 Turbo' },
      { label: 'Seats', value: '7-passenger' },
      { label: 'Drive', value: 'AWD' },
      { label: 'Mileage', value: '14 km/l' },
      { label: 'Service', value: 'Certified pre-owned' },
    ],
    qna: [
      { question: 'Has this vehicle been accident-free?', answer: 'Yes, it has a clean accident history report.' },
      { question: 'Is road tax included?', answer: 'Road tax is not included and will be calculated at checkout.' },
    ],
    relatedAuctions: [102, 103],
    description: 'High-end SUV with panoramic roof, ADAS assist, and premium cabin finish.',
    seller: 'DriveHub',
    stock: 1,
  },
  {
    id: 3,
    title: 'Waterfront Villa',
    category: 'Real Estate',
    price: '₹1,20,00,000',
    rating: 4.7,
    reviews: 31,
    condition: 'New Listing',
    location: 'Goa',
    badge: 'Verified',
    verified: true,
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1472220625704-91e1462799b2?auto=format&fit=crop&w=900&q=80',
    ],
    specifications: [
      { label: 'Area', value: '5,200 sq.ft.' },
      { label: 'Bedrooms', value: '5' },
      { label: 'Bathrooms', value: '4' },
      { label: 'Pool', value: 'Private infinity pool' },
      { label: 'Parking', value: '3 cars' },
    ],
    qna: [
      { question: 'Is the property furnished?', answer: 'The villa is semi-furnished; custom furniture is available separately.' },
      { question: 'What are the annual property taxes?', answer: 'Estimated taxes are ₹1,20,000 per year.' },
    ],
    relatedAuctions: [],
    description: 'Marble finish villa with private pool, smart security, and panoramic terrace.',
    seller: 'Urban Estates',
    stock: 1,
  },
  {
    id: 4,
    title: 'Italian Leather Sofa',
    category: 'Furniture',
    price: '₹1,28,000',
    rating: 4.6,
    reviews: 47,
    condition: 'Excellent',
    location: 'Hyderabad',
    badge: 'Buy Now',
    verified: false,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80',
    ],
    specifications: [
      { label: 'Material', value: 'Italian full-grain leather' },
      { label: 'Dimensions', value: '95 x 38 x 34 inches' },
      { label: 'Finish', value: 'Matte black legs' },
      { label: 'Warranty', value: '6 months' },
      { label: 'Assembly', value: 'No assembly required' },
    ],
    qna: [
      { question: 'Is this suitable for office lounges?', answer: 'Yes, it is ideal for executive office and premium lounges.' },
      { question: 'Can I select custom color?', answer: 'Custom colors are available on request with a 2-week lead time.' },
    ],
    relatedAuctions: [],
    description: 'Handcrafted leather sofa built for comfort and executive spaces.',
    seller: 'Modern Interiors',
    stock: 7,
  },
];

export const featuredProducts = products.slice(0, 3);

export const featuredCategories = [
  { title: 'Mobiles & Accessories', description: 'Premium devices with warranty support', count: '1.2k listings' },
  { title: 'Automotive', description: 'Certified vehicles and premium parts', count: '840 listings' },
  { title: 'Real Estate', description: 'Commercial and luxurious residences', count: '320 listings' },
  { title: 'Home & Lifestyle', description: 'Furniture, decor and designer interiors', count: '1.8k listings' },
];

export const marketplaceCategories = [
  { title: 'Electronics', description: 'Top devices, accessories and premium gadgets', count: '4.6k listings' },
  { title: 'Vehicles', description: 'Certified cars, bikes and heavy equipment', count: '1.9k listings' },
  { title: 'Real Estate', description: 'Waterfront villas and commercial spaces', count: '420 listings' },
  { title: 'Pets', description: 'Healthy pets from trusted breeders', count: '680 listings' },
  { title: 'Fish', description: 'Aquarium collections and specialty breeds', count: '240 listings' },
  { title: 'Livestock', description: 'Cattle, goats and farm-ready stock', count: '180 listings' },
  { title: 'Agriculture', description: 'Seeds, equipment and farm supplies', count: '1.1k listings' },
  { title: 'Fashion', description: 'Designer apparel and curated collections', count: '2.4k listings' },
  { title: 'Furniture', description: 'Luxury living and office furniture', count: '1.1k listings' },
  { title: 'Books', description: 'Collector editions and business library picks', count: '910 listings' },
  { title: 'Services', description: 'Installation, logistics and inspection support', count: '520 listings' },
  { title: 'Industrial', description: 'Machinery and manufacturing essentials', count: '720 listings' },
];

export const topCategories = [
  { title: 'Electronics', count: '18.4k' },
  { title: 'Automotive', count: '9.1k' },
  { title: 'Home & Lifestyle', count: '7.2k' },
  { title: 'Luxury & Fashion', count: '5.8k' },
];

export const verifiedVendors = [
  { name: 'Nova Tech', specialty: 'Premium electronics', rating: '4.9' },
  { name: 'DriveHub', specialty: 'Certified vehicles', rating: '4.8' },
  { name: 'Urban Estates', specialty: 'High-end properties', rating: '4.7' },
  { name: 'Modern Interiors', specialty: 'Luxury furniture', rating: '4.7' },
];

export const premiumAuctions = [
  { title: 'Rolex Oyster', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80', currentBid: '₹3,12,000', endsIn: '01:12:03', status: 'Live' },
  { title: 'Classic Motorcycle', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80', currentBid: '₹8,20,000', endsIn: '02:50:21', status: 'Live' },
  { title: 'Vintage Camera Kit', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80', currentBid: '₹1,12,000', endsIn: '03:22:11', status: 'Upcoming' },
];

export const sponsoredProducts = [
  { id: 201, title: 'Smartwatch Series 9', category: 'Wearables', price: '₹18,990', oldPrice: '₹24,500', discount: '22% off', rating: 4.9, reviews: 670, verified: true, image: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=900&q=80', seller: 'Nova Tech', location: 'Mumbai', badge: 'Sponsored', currentBid: '₹18,990', endsIn: 'Buy now' },
  { id: 202, title: 'Ergonomic Desk Chair', category: 'Furniture', price: '₹12,400', oldPrice: '₹15,800', discount: '21% off', rating: 4.7, reviews: 310, verified: false, image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80', seller: 'Modern Interiors', location: 'Hyderabad', badge: 'Best seller', currentBid: '₹12,400', endsIn: 'Ships tomorrow' },
  { id: 203, title: 'Pro Camera Lens', category: 'Photography', price: '₹54,000', oldPrice: '₹64,000', discount: '16% off', rating: 4.5, reviews: 54, verified: true, image: 'https://images.unsplash.com/photo-1519183071298-a2962fa5e8f1?auto=format&fit=crop&w=900&q=80', seller: 'LensLab', location: 'Delhi', badge: 'Limited', currentBid: '₹54,000', endsIn: 'Buy now' },
];

export const trustStatements = [
  { label: 'Secure Payments', description: 'Encrypted transactions, escrow support for big orders.' },
  { label: 'Verified Sellers', description: 'Every vendor is vetted before listing premium inventory.' },
  { label: 'Fast Delivery', description: 'Express shipping and logistics across India.' },
  { label: 'Buyer Protection', description: 'Refunds, quality checks and dispute support.' },
  { label: '24x7 Support', description: 'Marketplace support available any time you need help.' },
];

export const statsOverview = [
  { label: 'Active Users', value: '86k+' },
  { label: 'Active Auctions', value: '214' },
  { label: 'Products Sold', value: '48k+' },
  { label: 'Verified Vendors', value: '1.4k' },
  { label: 'Countries', value: '12' },
];

export const testimonials = [
  { quote: 'The premium marketplace experience is polished and fast. I found the right bid in minutes.', author: 'Asha P.', role: 'Enterprise buyer' },
  { quote: 'Our auction listings reach the right customers and the dashboard makes selling effortless.', author: 'Arjun S.', role: 'Verified vendor' },
  { quote: 'Customer support stayed responsive throughout the order and delivery process.', author: 'Mina K.', role: 'Frequent buyer' },
];

export const downloadCards = [
  { platform: 'Android', label: 'Get it on Google Play', action: 'Download app', icon: 'play' },
  { platform: 'iOS', label: 'Download on the App Store', action: 'Install now', icon: 'apple' },
  { platform: 'QR', label: 'Scan to download', action: 'Quick access', icon: 'qr' },
];

export const footerLinks = [
  { title: 'Marketplace', links: ['Home', 'Marketplace', 'Auctions', 'Deals', 'Gift cards'] },
  { title: 'Categories', links: ['Electronics', 'Vehicles', 'Real Estate', 'Fashion', 'Services'] },
  { title: 'Customer Support', links: ['Help center', 'Tracking', 'Returns', 'Payments', 'Buyer protection'] },
  { title: 'Seller Support', links: ['Sell on Bidzo', 'Seller guidelines', 'Shipping policy', 'Payments', 'Resources'] },
  { title: 'Company', links: ['About us', 'Careers', 'Press', 'Blog', 'Legal'] },
];

export const trendingAuctions = [
  { title: 'Rolex Oyster', currentBid: '₹3,12,000', endsIn: '01:12:03' },
  { title: 'Studio Camera Set', currentBid: '₹1,86,000', endsIn: '03:22:11' },
];

export const flashDeals = [
  { title: 'Smartwatch Pro', price: '₹18,990', badge: 'Ends soon' },
  { title: 'Designer Travel Case', price: '₹6,450', badge: 'Under 10 min' },
];

export const topCollections = [
  { title: 'Luxury Tech', value: '12 new drops' },
  { title: 'Collector Edition', value: '7 live auctions' },
  { title: 'Home Wellness', value: '18 premium picks' },
];

export const popularSearches = ['MacBook', 'Vintage watch', 'SUV', 'Villa', 'Leather sofa', 'Camera kit'];

export const appStats = [
  { label: 'Verified users', value: '86k+' },
  { label: 'Daily orders', value: '12k+' },
  { label: 'Seller response', value: '< 1 hr' },
];

export const blogPosts = [
  { title: 'How premium sellers win trust on Bidzo', slug: 'premium-sellers-trust', date: '23 Jul 2026' },
  { title: 'The future of live auction experiences', slug: 'future-live-auctions', date: '18 Jul 2026' },
  { title: 'Why enterprise buyers prefer curated listings', slug: 'enterprise-buyers-curated', date: '10 Jul 2026' },
];

export const faqItems = [
  { question: 'How do I register for auctions?', answer: 'Create an account, complete KYC, and pay the auction registration fee to unlock verified bidding.' },
  { question: 'Can I sell to international buyers?', answer: 'Yes. The marketplace supports international shipping and escrow-style buyer protection flows.' },
  { question: 'How are disputes handled?', answer: 'The admin and support teams review disputes within 24 hours and provide case-based resolution.' },
];

export const careers = [
  { title: 'Principal Product Designer', location: 'Remote • India' },
  { title: 'Senior Frontend Engineer', location: 'Bengaluru • Hybrid' },
  { title: 'Marketplace Operations Lead', location: 'Mumbai • Onsite' },
];

export const auctionItems = [
  { id: 101, title: 'Rare Collectible Watch', status: 'Live', currentBid: '₹2,45,000', endsIn: '02:14:36', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80', highestBid: '₹2,45,000', reservePrice: '₹2,10,000', bidIncrement: '₹5,000', watchers: 128, participants: 24, bidHistory: [{ bidder: 'Arjun', amount: '₹2,45,000', time: '2 min ago' }, { bidder: 'Asha', amount: '₹2,40,000', time: '8 min ago' }, { bidder: 'Rohan', amount: '₹2,35,000', time: '15 min ago' }], rules: ['Minimum bid increment ₹5,000', 'Reserve price must be met', 'No cancellation after close'] },
  { id: 102, title: 'Vintage Camera Kit', status: 'Live', currentBid: '₹1,12,000', endsIn: '3 days', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80', highestBid: '₹1,12,000', reservePrice: '₹1,00,000', bidIncrement: '₹2,000', watchers: 84, participants: 12, bidHistory: [{ bidder: 'Nidhi', amount: '₹1,12,000', time: 'Just now' }], rules: ['Registration required before bidding', 'Buy now available after auction', 'All bids are binding'] },
  { id: 103, title: 'Classic Motorcycle', status: 'Live', currentBid: '₹8,20,000', endsIn: '02:14:36', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80', highestBid: '₹8,20,000', reservePrice: '₹7,50,000', bidIncrement: '₹10,000', watchers: 182, participants: 46, bidHistory: [{ bidder: 'Priya', amount: '₹8,20,000', time: 'Ended' }, { bidder: 'Mina', amount: '₹8,10,000', time: '1 hr ago' }, { bidder: 'Sandeep', amount: '₹8,00,000', time: '2 hrs ago' }], rules: ['Winning bidder pays in 24h', 'Shipping coordinated after payment', 'Inspection available on request'] },
  { id: 104, title: 'Royal Enfield Classic 350', status: 'Live', currentBid: '₹2,35,000', endsIn: '05:26:12', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80', highestBid: '₹2,35,000', reservePrice: '₹2,00,000', bidIncrement: '₹5,000', watchers: 94, participants: 18, bidHistory: [{ bidder: 'Tara', amount: '₹2,35,000', time: 'Just now' }, { bidder: 'Vikram', amount: '₹2,30,000', time: '9 min ago' }, { bidder: 'Anita', amount: '₹2,25,000', time: '20 min ago' }], rules: ['Reserve price required to win', 'No returns after auction close', 'Registration required to bid'] },
];

export const sellers = [
  { name: 'Nova Tech', rating: 4.9, verified: true, sales: '12.4k' },
  { name: 'DriveHub', rating: 4.8, verified: true, sales: '8.9k' },
  { name: 'Urban Estates', rating: 4.7, verified: true, sales: '6.2k' },
];

export const reviews = [
  { author: 'Asha P.', quote: 'The bidding experience felt polished and secure. Great for premium inventory.', rating: 5 },
  { author: 'Rohan D.', quote: 'Better analytics and seller visibility than any marketplace I have used.', rating: 5 },
  { author: 'Mina K.', quote: 'Fast support and fantastic dashboard experience for vendors.', rating: 4 },
];

export const wishlistItems = [
  { title: 'Designer Watch', price: '₹86,000', note: 'Ends in 5 hours' },
  { title: 'Studio Apartment', price: '₹48,00,000', note: 'Verified seller' },
];

export const transactions = [
  { id: 'TXN-2026-001', type: 'Withdrawal', amount: '₹18,500', status: 'Completed' },
  { id: 'TXN-2026-002', type: 'Bid Deposit', amount: '₹1,200', status: 'Pending' },
  { id: 'TXN-2026-003', type: 'Order Payment', amount: '₹9,870', status: 'Completed' },
];

export const notifications = [
  { title: 'Outbid on premium watch', time: '2 min ago', unread: true },
  { title: 'Auction ending soon: classic motorcycle', time: '18 min ago', unread: true },
  { title: 'Payment cleared for your order', time: '1 hr ago', unread: false },
];

export const chats = [
  { name: 'Niveda', lastMessage: 'I can ship tomorrow morning.', active: true },
  { name: 'Support', lastMessage: 'Your KYC review is in progress.', active: false },
];

export const customerStats = [
  { label: 'Active Bids', value: '14' },
  { label: 'Won Auctions', value: '3' },
  { label: 'Wishlist Items', value: '9' },
  { label: 'Wallet Balance', value: '₹82,500' },
];

export const vendorStats = [
  { label: 'Live Products', value: '128' },
  { label: 'Open Auctions', value: '21' },
  { label: 'Orders', value: '314' },
  { label: 'Revenue', value: '₹4.8L' },
];

export const adminStats = [
  { label: 'Users', value: '18.2k' },
  { label: 'Vendors', value: '1.4k' },
  { label: 'Auctions', value: '2.4k' },
  { label: 'Fraud Alerts', value: '22' },
];

export const chartSeries = [
  { name: 'Jan', value: 24 },
  { name: 'Feb', value: 31 },
  { name: 'Mar', value: 28 },
  { name: 'Apr', value: 40 },
  { name: 'May', value: 47 },
  { name: 'Jun', value: 55 },
];

export const customerOrders = [
  { id: 'ORD-1001', item: 'Designer Watch', status: 'Delivered', total: '₹86,000' },
  { id: 'ORD-1002', item: 'MacBook Pro', status: 'Packed', total: '₹2,48,000' },
];

export const customerBids = [
  { item: 'Rolex Oyster', bid: '₹3,10,000', progress: 'Outbid by 2 min' },
  { item: 'Classic Motorcycle', bid: '₹8,20,000', progress: 'Leading' },
];

export const recentlyViewed = [
  { title: 'Designer Lamp Set', price: '₹12,400' },
  { title: 'Executive Office Chair', price: '₹24,900' },
];

export const savedSearches = ['Luxury SUV', 'Verified laptops', 'Waterfront villas'];

export const addresses = [
  { label: 'Home', detail: 'Bangalore, Karnataka • 560001' },
  { label: 'Office', detail: 'Mumbai, Maharashtra • 400001' },
];

export const supportTickets = [
  { id: 'TK-204', subject: 'Delayed dispatch', status: 'Resolved' },
  { id: 'TK-208', subject: 'Auction invoice request', status: 'Pending' },
];

export const invoices = [
  { id: 'INV-2401', amount: '₹9,870', due: 'Paid' },
  { id: 'INV-2403', amount: '₹18,500', due: 'Scheduled' },
];

export const walletActivity = [
  { id: 'WA-001', title: 'Top-up', amount: '+₹25,000', type: 'Deposit', time: 'Today' },
  { id: 'WA-002', title: 'Auction fee', amount: '-₹1,200', type: 'Fee', time: 'Yesterday' },
  { id: 'WA-003', title: 'Refund', amount: '+₹4,800', type: 'Credit', time: '2 days ago' },
  { id: 'WA-004', title: 'Order payout', amount: '+₹18,500', type: 'Payout', time: '3 days ago' },
];

export const vendorFeeHistory = [
  { id: 'FEE-001', title: 'Auction fee', amount: '-₹1,200', date: '09 Aug 2026', category: 'Auction' },
  { id: 'FEE-002', title: 'Listing fee', amount: '-₹450', date: '08 Aug 2026', category: 'Product' },
  { id: 'FEE-003', title: 'Settlement charge', amount: '-₹890', date: '05 Aug 2026', category: 'Order' },
];

export const vendorRegistrationFees = [
  { id: 'REG-020', amount: '₹1,000', date: '01 Jul 2026', description: 'Seller registration fee' },
  { id: 'REG-021', amount: '₹750', date: '12 Jun 2026', description: 'Premium seller subscription' },
];

export const vendorShippingTimeline = [
  { id: 1, label: 'Order picked by courier', time: 'Today, 12:48', status: 'Completed' },
  { id: 2, label: 'In transit', time: 'Today, 14:20', status: 'In progress' },
  { id: 3, label: 'Out for delivery', time: 'Tomorrow, 09:00', status: 'Upcoming' },
  { id: 4, label: 'Delivered', time: 'Tomorrow, 16:00', status: 'Pending' },
];

export const vendorMessages = [
  { id: 'MSG-101', name: 'Niveda', lastMessage: 'I can ship tomorrow morning.', unread: true, attachments: 1, type: 'Buyer' },
  { id: 'MSG-102', name: 'Support', lastMessage: 'Your KYC review is in progress.', unread: false, attachments: 0, type: 'Support' },
  { id: 'MSG-103', name: 'Arjun', lastMessage: 'Can you provide the vehicle inspection report?', unread: true, attachments: 2, type: 'Buyer' },
];

export const vendorMessageThreads = [
  { threadId: 'MSG-101', from: 'Niveda', text: 'Hello! I can ship tomorrow morning.', time: '11:35 AM', attachments: [{ name: 'invoice.pdf', size: '120KB' }] },
  { threadId: 'MSG-101', from: 'You', text: 'Thanks, please send confirmation once picked up.', time: '11:40 AM', attachments: [] },
  { threadId: 'MSG-103', from: 'Arjun', text: 'Can you provide the vehicle inspection report?', time: 'Yesterday, 4:12 PM', attachments: [{ name: 'inspection.jpg', size: '1.2MB' }] },
];

export const vendorNotifications = [
  { id: 'N-101', title: 'Bid alert for Rolex Oyster', time: '2 min ago', category: 'Bid', unread: true },
  { id: 'N-102', title: 'Order SO-9021 shipped', time: '18 min ago', category: 'Order', unread: true },
  { id: 'N-103', title: 'Withdrawal request approved', time: '1 hr ago', category: 'Wallet', unread: false },
  { id: 'N-104', title: 'Shipping delay reported for order SO-9022', time: '3 hrs ago', category: 'Shipping', unread: false },
];

export const vendorInventory = [
  { sku: 'MBP-M3-512', name: 'MacBook Pro M3', category: 'Laptops', price: '₹2,48,000', stock: 3, reserved: 1, available: 2, health: 'High', status: 'Active', lowStock: false, outOfStock: false, lastUpdated: '2h ago' },
  { sku: 'WTR-ROLEX', name: 'Rolex Oyster', category: 'Luxury Watches', price: '₹12,80,000', stock: 1, reserved: 0, available: 1, health: 'Low', status: 'Low stock', lowStock: true, outOfStock: false, lastUpdated: '8h ago' },
  { sku: 'WFL-SOFA', name: 'Italian Leather Sofa', category: 'Furniture', price: '₹1,28,000', stock: 7, reserved: 2, available: 5, health: 'Healthy', status: 'Active', lowStock: false, outOfStock: false, lastUpdated: '1d ago' },
  { sku: 'DSK-CHAIR', name: 'Ergonomic Desk Chair', category: 'Furniture', price: '₹12,400', stock: 0, reserved: 0, available: 0, health: 'Out of stock', status: 'Out of stock', lowStock: false, outOfStock: true, lastUpdated: '4d ago' },
  { sku: 'CAM-LENS', name: 'Pro Camera Lens', category: 'Photography', price: '₹54,000', stock: 5, reserved: 3, available: 2, health: 'Reserved', status: 'Reserved', lowStock: false, outOfStock: false, lastUpdated: '12h ago' },
  { sku: 'WST-SNGL', name: 'Smartwatch Series 9', category: 'Wearables', price: '₹18,990', stock: 15, reserved: 0, available: 15, health: 'Healthy', status: 'Active', lowStock: false, outOfStock: false, lastUpdated: '30m ago' },
];

export const vendorProducts = [
  { sku: 'MBP-M3-512', name: 'MacBook Pro M3', category: 'Laptops', status: 'Live', price: '₹2,48,000', stock: 3, stockStatus: 'In stock', sales: '180', conversion: '4.8%', rating: 4.9, reviews: 124, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80', badge: 'Featured', featured: true, views: '14.2k', favorites: 820, auctionStatus: 'Live', lastUpdated: '2h ago' },
  { sku: 'WTR-ROLEX', name: 'Rolex Oyster', category: 'Luxury Watches', status: 'Auction', price: '₹12,80,000', stock: 1, stockStatus: 'Low stock', sales: '72', conversion: '22%', rating: 4.8, reviews: 88, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=500&q=80', badge: 'Trending', featured: true, views: '9.1k', favorites: 420, auctionStatus: 'Scheduled', lastUpdated: '8h ago' },
  { sku: 'WFL-SOFA', name: 'Italian Leather Sofa', category: 'Furniture', status: 'Archived', price: '₹1,28,000', stock: 7, stockStatus: 'In stock', sales: '43', conversion: '2.1%', rating: 4.6, reviews: 47, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=80', badge: 'Clearance', featured: false, views: '6.5k', favorites: 190, auctionStatus: 'None', lastUpdated: '3d ago' },
  { sku: 'DSK-CHAIR', name: 'Ergonomic Desk Chair', category: 'Furniture', status: 'Live', price: '₹12,400', stock: 0, stockStatus: 'Out of stock', sales: '240', conversion: '5.0%', rating: 4.7, reviews: 310, image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=500&q=80', badge: 'Best seller', featured: false, views: '18.2k', favorites: 650, auctionStatus: 'None', lastUpdated: '12h ago' },
  { sku: 'CAM-LENS', name: 'Pro Camera Lens', category: 'Photography', status: 'Draft', price: '₹54,000', stock: 5, stockStatus: 'Reserved', sales: '32', conversion: '3.8%', rating: 4.5, reviews: 54, image: 'https://images.unsplash.com/photo-1519183071298-a2962fa5e8f1?auto=format&fit=crop&w=500&q=80', badge: 'Draft', featured: false, views: '4.2k', favorites: 130, auctionStatus: 'None', lastUpdated: '1d ago' },
  { sku: 'WST-SNGL', name: 'Smartwatch Series 9', category: 'Wearables', status: 'Live', price: '₹18,990', stock: 15, stockStatus: 'In stock', sales: '420', conversion: '8.2%', rating: 4.9, reviews: 670, image: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=500&q=80', badge: 'Featured', featured: true, views: '22.4k', favorites: 1_200, auctionStatus: 'None', lastUpdated: '1h ago' },
  { sku: 'SPK-BT100', name: 'Noise-canceling Bluetooth Speaker', category: 'Electronics', status: 'Live', price: '₹7,899', stock: 8, stockStatus: 'In stock', sales: '116', conversion: '6.5%', rating: 4.4, reviews: 92, image: 'https://images.unsplash.com/photo-1512499617640-c2f999fe6bb0?auto=format&fit=crop&w=500&q=80', badge: 'Popular', featured: false, views: '11.1k', favorites: 380, auctionStatus: 'None', lastUpdated: '18h ago' },
];

export const vendorOrders = [
  { id: 'SO-9021', customer: 'Arjun Sharma', customerLocation: 'Bangalore, KA', total: '₹86,000', status: 'Shipped', items: 2, payment: 'Paid', shipping: 'Express', date: '08 Aug 2026', deliveryETA: '12 Aug 2026', tracking: 'TRK-4421', stage: 'Shipped', progress: 80, timeline: ['Confirmed', 'Packed', 'Shipped'] },
  { id: 'SO-9022', customer: 'Mina Patel', customerLocation: 'Mumbai, MH', total: '₹48,000', status: 'Pending', items: 1, payment: 'Pending', shipping: 'Standard', date: '09 Aug 2026', deliveryETA: '15 Aug 2026', tracking: 'TRK-4418', stage: 'Pending', progress: 20, timeline: ['Pending'] },
  { id: 'SO-9023', customer: 'Zara Khan', customerLocation: 'Delhi, DL', total: '₹1,20,000', status: 'Delivered', items: 1, payment: 'Paid', shipping: 'Express', date: '05 Aug 2026', deliveryETA: '10 Aug 2026', tracking: 'TRK-4405', stage: 'Delivered', progress: 100, timeline: ['Confirmed', 'Packed', 'Shipped', 'Delivered'] },
  { id: 'SO-9024', customer: 'Rohan Mehta', customerLocation: 'Pune, MH', total: '₹62,500', status: 'Cancelled', items: 1, payment: 'Refunded', shipping: 'Standard', date: '10 Aug 2026', deliveryETA: 'N/A', tracking: 'TRK-4428', stage: 'Cancelled', progress: 0, timeline: ['Pending', 'Cancelled'] },
  { id: 'SO-9025', customer: 'Sneha Roy', customerLocation: 'Kolkata, WB', total: '₹34,900', status: 'Refund Requested', items: 1, payment: 'Disputed', shipping: 'Standard', date: '11 Aug 2026', deliveryETA: '16 Aug 2026', tracking: 'TRK-4432', stage: 'Refund Requested', progress: 45, timeline: ['Confirmed', 'Packed', 'Refund Requested'] },
];

export const vendorAuctions = [
  { id: 201, title: 'Vintage Camera Kit', status: 'Live', type: 'Featured', bids: 28, currentBid: '₹1,12,000', highestBid: '₹1,18,000', remaining: '02:14:36', start: 'Today 11:00', ends: 'Today 13:00', watchers: 24, reservePrice: '₹1,00,000', bidIncrement: '₹2,000', countdown: '2h 14m', action: 'Active' },
  { id: 202, title: 'Luxury Watch', status: 'Scheduled', type: 'Premium', bids: 0, currentBid: '₹0', highestBid: '₹0', remaining: '3d 2h', start: '15 Aug 2026 10:00', ends: '15 Aug 2026 16:00', watchers: 18, reservePrice: '₹3,50,000', bidIncrement: '₹5,000', countdown: '3d 2h', action: 'Schedule' },
  { id: 203, title: 'Classic Motorcycle', status: 'Ended', type: 'Collector', bids: 96, currentBid: '₹8,20,000', highestBid: '₹8,20,000', remaining: 'Ended', start: '12 Aug 2026 09:00', ends: '12 Aug 2026 18:00', watchers: 88, reservePrice: '₹7,50,000', bidIncrement: '₹10,000', countdown: 'Ended', action: 'Review' },
  { id: 204, title: 'Vintage Vinyl Set', status: 'Draft', type: 'Classic', bids: 0, currentBid: '₹0', highestBid: '₹0', remaining: '-', start: 'Draft', ends: '-', watchers: 6, reservePrice: '₹12,000', bidIncrement: '₹500', countdown: 'Draft', action: 'Draft' },
  { id: 205, title: 'Designer Handbag', status: 'Cancelled', type: 'Fashion', bids: 14, currentBid: '₹42,500', highestBid: '₹42,500', remaining: 'Cancelled', start: '08 Aug 2026 12:00', ends: '09 Aug 2026 14:00', watchers: 32, reservePrice: '₹35,000', bidIncrement: '₹1,000', countdown: 'Cancelled', action: 'Cancelled' },
  { id: 206, title: 'Royal Enfield Classic 350', status: 'Live', type: 'Bike', bids: 18, currentBid: '₹2,35,000', highestBid: '₹2,35,000', remaining: '05:26:12', start: 'Today 10:00', ends: 'Today 15:30', watchers: 94, reservePrice: '₹2,00,000', bidIncrement: '₹5,000', countdown: '5h 26m', action: 'Active' },
];

export const vendorReports = {
  metrics: [
    { label: 'Daily revenue', value: '₹1,24,000' },
    { label: 'Weekly revenue', value: '₹8,90,000' },
    { label: 'Monthly revenue', value: '₹3,45,000' },
    { label: 'Active products', value: '34' },
    { label: 'Live auctions', value: '12' },
    { label: 'Repeat customers', value: '28%' },
  ],
  revenueTrend: {
    daily: [120, 132, 150, 170, 190, 210, 220],
    weekly: [480, 520, 540, 580, 600, 650, 700],
    monthly: [2400, 2500, 2600, 2700, 2800, 2950, 3100],
  },
  topProducts: [
    { name: 'Smartwatch Series 9', sales: '420', revenue: '₹7.9L' },
    { name: 'MacBook Pro M3', sales: '180', revenue: '₹4.5L' },
    { name: 'Ergonomic Desk Chair', sales: '240', revenue: '₹2.9L' },
  ],
  topCategories: [
    { category: 'Electronics', value: '42%' },
    { category: 'Furniture', value: '24%' },
    { category: 'Luxury & Fashion', value: '18%' },
  ],
};

export const vendorShippingRules = [
  { name: 'Standard', delivery: '3-5 days', charge: '₹150' },
  { name: 'Express', delivery: '1-2 days', charge: '₹320' },
  { name: 'Premium', delivery: 'Same day', charge: '₹550' },
];

export const verificationSteps = [
  { title: 'Business details', done: true },
  { title: 'GST and bank info', done: true },
  { title: 'Identity verification', done: false },
];

export const paymentMethods = ['UPI', 'Cards', 'Net banking', 'Wallet'];

export const organizationHierarchy = [
  { entity: 'Bidzo Group', level: 'Super Admin', region: 'Global', status: 'Active' },
  { entity: 'India Operations', level: 'Country', region: 'India', status: 'Active' },
  { entity: 'South Zone', level: 'Region', region: 'Karnataka, Tamil Nadu, Kerala', status: 'Active' },
  { entity: 'Bengaluru District', level: 'District', region: 'Bengaluru Urban', status: 'Live' },
  { entity: 'Bengaluru City', level: 'City', region: 'Bengaluru', status: 'Live' },
  { entity: 'Bengaluru Franchise', level: 'Franchise Admin', region: 'Bengaluru', status: 'Onboarding' },
  { entity: 'Nova Tech', level: 'Vendor', region: 'Bengaluru', status: 'Verified' },
  { entity: 'RapidRoute Logistics', level: 'Delivery Partner', region: 'Bengaluru', status: 'Active' },
];

export const franchiseDirectory = [
  { name: 'Bengaluru Franchise', code: 'BLR-01', city: 'Bengaluru', region: 'South', admin: 'Asha Rao', health: '92%', status: 'Healthy' },
  { name: 'Mumbai Franchise', code: 'MUM-02', city: 'Mumbai', region: 'West', admin: 'Nilesh V.', health: '84%', status: 'Stable' },
  { name: 'Delhi Franchise', code: 'DEL-03', city: 'Delhi', region: 'North', admin: 'Riya Sen', health: '79%', status: 'Review' },
];

export const locationDirectory = [
  { type: 'Country', name: 'India', code: 'IN', parent: 'Global', activeNodes: 28 },
  { type: 'State', name: 'Karnataka', code: 'KA', parent: 'India', activeNodes: 6 },
  { type: 'District', name: 'Bengaluru Urban', code: 'BLR', parent: 'Karnataka', activeNodes: 4 },
  { type: 'City', name: 'Bengaluru', code: 'BLR-01', parent: 'Bengaluru Urban', activeNodes: 12 },
];

export const rolePermissions = [
  { role: 'Super Admin', scope: 'Group-wide', users: 3, status: 'Active', permissions: ['User management', 'Finance', 'Policy control'] },
  { role: 'Country Admin', scope: 'Country', users: 8, status: 'Active', permissions: ['Location management', 'Franchise oversight', 'Reporting'] },
  { role: 'Franchise Admin', scope: 'City', users: 24, status: 'Live', permissions: ['Vendor onboarding', 'Delivery oversight', 'Support triage'] },
  { role: 'Vendor Manager', scope: 'Vendor', users: 118, status: 'Live', permissions: ['Inventory', 'Orders', 'KYC review'] },
];

export const franchiseDashboardKpis = [
  { label: 'Active franchises', value: '24' },
  { label: 'Verified vendors', value: '1,280' },
  { label: 'Orders processed', value: '18.2k' },
  { label: 'Pending reviews', value: '42' },
];

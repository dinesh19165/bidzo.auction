import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, CheckCircle2, Clock3, CreditCard, Gavel, Heart, MapPin, PackageCheck, Search, Share2, ShieldCheck, ShoppingBag, Sparkles, Truck, Wallet, Zap } from 'lucide-react';
import { SectionShell } from '../../components/SectionShell';
import { products, auctionItems, sellers, wishlistItems, reviews, transactions, categories } from '../../data/mockData';
import ProductForm from '../../components/ProductForm';
import Wizard from '../../components/Wizard';
import AuctionForm from '../../components/AuctionForm';
import UploadField from '../../components/forms/UploadField';

function FlowBreadcrumbs({ steps }: { steps: Array<{ label: string; to: string }> }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2 rounded-full border border-white/10 bg-slate-900/70 p-2 text-sm text-slate-300">
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-center gap-2">
          {index > 0 && <span className="text-slate-500">/</span>}
          <Link to={step.to} className="rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-white">{step.label}</Link>
        </div>
      ))}
    </div>
  );
}

export function CustomerSearchPage() {
  return (
    <SectionShell title="Search products" subtitle="Discover the right listing and continue to the next step">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
            <Search className="h-4 w-4 text-blue-300" />
            <input className="w-full bg-transparent text-sm outline-none" defaultValue="Premium MacBook Pro" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Electronics', 'Vehicles', 'Furniture', 'Real Estate'].map((tag) => <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">{tag}</span>)}
          </div>
          <Link to="/customer/filter-products" className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Apply filters <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Top matches</p>
          <div className="mt-4 space-y-3">
            {products.slice(0, 3).map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                <div>
                  <p className="font-semibold text-white">{product.title}</p>
                  <p>{product.category}</p>
                </div>
                <Link to={`/customer/category`} className="text-blue-300">Open</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerFilterPage() {
  return (
    <SectionShell title="Filter products" subtitle="Refine by location, price range, condition and seller type">
      <FlowBreadcrumbs steps={[{ label: 'Search', to: '/customer/search-products' }, { label: 'Filters', to: '/customer/filter-products' }, { label: 'Category', to: '/customer/category' }]} />
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <div className="space-y-3 text-sm text-slate-300">
            {['Verified sellers only', 'Price range ₹10k–₹3L', 'Like new or certified', 'Bengaluru and Mumbai'].map((filter) => (
              <div key={filter} className="rounded-2xl border border-white/10 bg-white/5 p-3">{filter}</div>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-300">Results summary</p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600/10 to-amber-500/10 p-5 text-sm text-slate-300">
            <p className="text-lg font-semibold text-white">18 premium matches</p>
            <p className="mt-2">Delivery forecast: 24h to 72h depending on order value and seller location.</p>
          </div>
          <Link to="/customer/category" className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Continue to category <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerCategoryPage() {
  return (
    <SectionShell title="Category page" subtitle="Browse the chosen category with premium filters and clear next actions">
      <FlowBreadcrumbs steps={[{ label: 'Search', to: '/customer/search-products' }, { label: 'Filters', to: '/customer/filter-products' }, { label: 'Category', to: '/customer/category' }, { label: 'Product', to: '/customer/product/1' }]} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">{product.category}</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{product.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{product.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-white">{product.price}</p>
              <Link to={`/customer/product/${product.id}`} className="rounded-full bg-blue-600 px-3 py-2 text-sm font-medium text-white">Open</Link>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function CustomerProductPage() {
  const { id } = useParams();
  const product = products.find((item) => item.id === Number(id)) || products[0];

  return (
    <SectionShell title="Product details" subtitle={product.title}>
      <FlowBreadcrumbs steps={[{ label: 'Search', to: '/customer/search-products' }, { label: 'Category', to: '/customer/category' }, { label: 'Product', to: `/customer/product/${product.id}` }, { label: 'Seller', to: '/customer/seller/1' }]} />
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5">
          <img src={product.image} alt={product.title} className="h-80 w-full rounded-[20px] object-cover" />
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/customer/seller/1" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">View seller</Link>
            <Link to="/customer/wishlist" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Add to wishlist</Link>
            <Link to="/customer/watch-auction" className="rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950">Watch auction</Link>
            <Link to="/customer/place-bid" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Place bid</Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {['Verified seller', 'Secure delivery', 'Express support'].map((feature) => <div key={feature} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">{feature}</div>)}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">{product.category}</p>
            <h3 className="mt-2 text-3xl font-semibold text-white">{product.price}</h3>
            <p className="mt-3 text-sm text-slate-300">{product.description}</p>
            <div className="mt-6 space-y-2 text-sm text-slate-300">
              <p><span className="text-slate-500">Seller:</span> {product.seller}</p>
              <p><span className="text-slate-500">Condition:</span> {product.condition}</p>
              <p><span className="text-slate-500">Location:</span> {product.location}</p>
            </div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <h4 className="text-lg font-semibold text-white">Why buyers love it</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>• Trusted checkout and delivery estimates</li>
              <li>• Verified coverage for high-value items</li>
              <li>• Flexible wallet and card payments</li>
            </ul>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerSellerPage() {
  const seller = sellers[0];

  return (
    <SectionShell title="Seller profile" subtitle={seller.name}>
      <FlowBreadcrumbs steps={[{ label: 'Product', to: '/customer/product/1' }, { label: 'Seller', to: '/customer/seller/1' }, { label: 'Wishlist', to: '/customer/wishlist' }]} />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-300"><BadgeCheck className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Verified seller</p>
              <h3 className="mt-1 text-2xl font-semibold text-white">Trusted by 12.4k buyers</h3>
            </div>
          </div>
          <p className="mt-5 text-sm text-slate-300">This seller offers rapid dispatch, premium packaging, and responsive support for high-value orders and auctions.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/customer/wishlist" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Add to wishlist</Link>
            <Link to="/customer/watch-auction" className="rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950">Watch auction</Link>
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <h4 className="text-lg font-semibold text-white">Recent buyer feedback</h4>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {reviews.map((review) => <div key={review.author} className="rounded-2xl border border-white/10 bg-white/5 p-3">{review.quote}</div>)}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerWishlistPage() {
  return (
    <SectionShell title="Wishlist" subtitle="Saved products and auctions you want to follow">
      <FlowBreadcrumbs steps={[{ label: 'Product', to: '/customer/product/1' }, { label: 'Wishlist', to: '/customer/wishlist' }, { label: 'Auction', to: '/customer/watch-auction' }]} />
      <div className="grid gap-4 md:grid-cols-2">
        {wishlistItems.map((item) => (
          <div key={item.title} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-white">{item.title}</p>
              <Heart className="h-4 w-4 text-amber-300" />
            </div>
            <p className="mt-2 text-sm text-slate-400">{item.note}</p>
            <p className="mt-4 text-lg font-semibold text-white">{item.price}</p>
            <div className="mt-4 flex gap-3">
              <Link to="/customer/watch-auction" className="rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950">Watch</Link>
              <Link to="/customer/place-bid" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Bid</Link>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function CustomerWatchAuctionPage() {
  return (
    <SectionShell title="Watch auction" subtitle="Follow live bidding events and be ready to act">
      <FlowBreadcrumbs steps={[{ label: 'Wishlist', to: '/customer/wishlist' }, { label: 'Watch', to: '/customer/watch-auction' }, { label: 'Bid', to: '/customer/place-bid' }]} />
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-300">Live countdown</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Rare Collectible Watch</h3>
          </div>
          <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">Live now</div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
            <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-amber-300" /> Ends in 02:14:36</p>
            <p className="mt-3">Current highest bid: ₹2,45,000</p>
            <p className="mt-2">Auto-bid available for buyers who want a capped bidding strategy.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/customer/place-bid" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Place bid</Link>
              <Link to="/customer/auction-live" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Open live screen</Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600/10 to-amber-500/10 p-5 text-sm text-slate-300">
            <p className="flex items-center gap-2"><Share2 className="h-4 w-4 text-blue-300" /> Share auction</p>
            <p className="mt-2">Send a private link to your colleagues or co-bidders before the final countdown.</p>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerPlaceBidPage() {
  return (
    <SectionShell title="Place bid" subtitle="Enter your bid and review the confirmation before checkout">
      <FlowBreadcrumbs steps={[{ label: 'Watch', to: '/customer/watch-auction' }, { label: 'Bid', to: '/customer/place-bid' }, { label: 'Confirmation', to: '/customer/bid-confirmation' }]} />
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-300">Bid details</p>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Current highest bid: ₹2,45,000</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Minimum next bid: ₹2,50,000</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Auto-bid enabled with max cap ₹2,70,000</div>
          </div>
          <input className="mt-5 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" defaultValue="₹2,50,000" />
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/customer/bid-confirmation" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Submit bid</Link>
            <Link to="/customer/auction-live" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Open live screen</Link>
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Bid history</p>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {['Rahul • ₹2,35,000', 'Priya • ₹2,40,000', 'Arjun • ₹2,45,000'].map((entry) => <div key={entry} className="rounded-2xl border border-white/10 bg-white/5 p-3">{entry}</div>)}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerBidConfirmationPage() {
  return (
    <SectionShell title="Bid confirmation" subtitle="Your bid is ready. Finish verification and payment to secure the item.">
      <FlowBreadcrumbs steps={[{ label: 'Bid', to: '/customer/place-bid' }, { label: 'Confirmation', to: '/customer/bid-confirmation' }, { label: 'Fee', to: '/registration-fee' }]} />
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-300">Order summary</p>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Item: Rare Collectible Watch</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Bid: ₹2,50,000</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Registration fee: ₹20</div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/registration-fee" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Pay registration fee</Link>
            <Link to="/customer/wallet-payment" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Wallet payment</Link>
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-blue-600/10 to-amber-500/10 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-300">Next steps</p>
          <p className="mt-3 text-sm text-slate-300">Complete the registration payment before the live auction closes. Your wallet balance will be updated immediately after confirmation.</p>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerWalletPaymentPage() {
  return (
    <SectionShell title="Wallet payment" subtitle="Use your wallet balance for the winning bid and related fees">
      <FlowBreadcrumbs steps={[{ label: 'Fee', to: '/registration-fee' }, { label: 'Wallet', to: '/customer/wallet-payment' }, { label: 'Checkout', to: '/customer/checkout' }]} />
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Available balance</p>
          <p className="mt-3 text-3xl font-semibold text-white">₹82,500</p>
          <div className="mt-5 space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Fee due: ₹20</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Auction balance reserve: ₹2,50,000</div>
          </div>
          <Link to="/customer/checkout" className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Continue to checkout <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-emerald-600/10 to-blue-500/10 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-300">Payment protection</p>
          <p className="mt-3 text-sm text-slate-300">Your wallet payment is secured with instant confirmation and order protection for every completed purchase.</p>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerAuctionLivePage() {
  return (
    <SectionShell title="Auction live screen" subtitle="See the bid stream, timer, and bid controls in one place">
      <FlowBreadcrumbs steps={[{ label: 'Watch', to: '/customer/watch-auction' }, { label: 'Live', to: '/customer/auction-live' }, { label: 'Winner', to: '/customer/winner' }]} />
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-300">Current highest bid</p>
              <h3 className="mt-2 text-3xl font-semibold text-white">₹2,50,000</h3>
            </div>
            <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">Live</div>
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-amber-300" /> 00:03:12 remaining</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/customer/place-bid" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Rebid</Link>
            <Link to="/customer/winner" className="rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950">View winner screen</Link>
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <h4 className="text-lg font-semibold text-white">Bid history</h4>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {['Arjun • ₹2,50,000', 'Nidhi • ₹2,45,000', 'Sandeep • ₹2,40,000'].map((entry) => <div key={entry} className="rounded-2xl border border-white/10 bg-white/5 p-3">{entry}</div>)}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerWinnerPage() {
  return (
    <SectionShell title="Auction winner" subtitle="Congratulations — your bid secured the auction item">
      <FlowBreadcrumbs steps={[{ label: 'Live', to: '/customer/auction-live' }, { label: 'Winner', to: '/customer/winner' }, { label: 'Checkout', to: '/customer/checkout' }]} />
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-300">Winning status</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">You won Rare Collectible Watch</h3>
          <p className="mt-3 text-sm text-slate-300">The winning amount has been confirmed and the payment reminder is ready.</p>
          <Link to="/customer/checkout" className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Continue to checkout <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-emerald-600/10 to-blue-500/10 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Payment reminder</p>
          <p className="mt-3 text-sm text-slate-300">Complete the remaining payment and delivery confirmation before the item ships.</p>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerCheckoutPage() {
  return (
    <SectionShell title="Checkout" subtitle="Complete your purchase with address, shipping and payment steps">
      <FlowBreadcrumbs steps={[{ label: 'Winner', to: '/customer/winner' }, { label: 'Checkout', to: '/customer/checkout' }, { label: 'Address', to: '/customer/address' }]} />
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          <div>
            <p className="font-semibold text-white">Rare Collectible Watch</p>
            <p>Winning bid ₹2,50,000</p>
          </div>
          <span className="text-white">₹2,50,000</span>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/customer/address" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Continue</Link>
          <Link to="/customer/shipping" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Shipping options</Link>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerAddressPage() {
  return (
    <SectionShell title="Address" subtitle="Choose where your order should be delivered">
      <FlowBreadcrumbs steps={[{ label: 'Checkout', to: '/customer/checkout' }, { label: 'Address', to: '/customer/address' }, { label: 'Shipping', to: '/customer/shipping' }]} />
      <div className="grid gap-4 lg:grid-cols-2">
        {['Home • 12, 4th Cross, Bengaluru', 'Office • 54, Marine Drive, Mumbai'].map((address) => (
          <div key={address} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 text-sm text-slate-300">{address}</div>
        ))}
      </div>
      <Link to="/customer/shipping" className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Continue to shipping <ArrowRight className="h-4 w-4" /></Link>
    </SectionShell>
  );
}

export function CustomerShippingPage() {
  return (
    <SectionShell title="Shipping method" subtitle="Choose an express or standard delivery mode">
      <FlowBreadcrumbs steps={[{ label: 'Address', to: '/customer/address' }, { label: 'Shipping', to: '/customer/shipping' }, { label: 'Payment', to: '/customer/payment' }]} />
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Express', detail: '1-2 business days', price: '₹1,200' },
          { label: 'Standard', detail: '3-5 business days', price: '₹450' },
          { label: 'Pickup', detail: 'Same-day pickup', price: 'Free' },
        ].map((option) => (
          <div key={option.label} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 text-sm text-slate-300">
            <p className="font-semibold text-white">{option.label}</p>
            <p className="mt-2">{option.detail}</p>
            <p className="mt-4 text-white">{option.price}</p>
          </div>
        ))}
      </div>
      <Link to="/customer/payment" className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Continue to payment <ArrowRight className="h-4 w-4" /></Link>
    </SectionShell>
  );
}

export function CustomerPaymentPage() {
  return (
    <SectionShell title="Payment" subtitle="Choose a secure payment method for your order">
      <FlowBreadcrumbs steps={[{ label: 'Shipping', to: '/customer/shipping' }, { label: 'Payment', to: '/customer/payment' }, { label: 'Success', to: '/customer/order-success' }]} />
      <div className="grid gap-4 md:grid-cols-3">
        {['UPI', 'Credit card', 'Wallet'].map((method) => <div key={method} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 text-sm text-slate-300">{method}</div>)}
      </div>
      <Link to="/customer/order-success" className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Confirm order <ArrowRight className="h-4 w-4" /></Link>
    </SectionShell>
  );
}

export function CustomerOrderSuccessPage() {
  return (
    <SectionShell title="Order success" subtitle="Your order is confirmed and ready for the next milestone">
      <FlowBreadcrumbs steps={[{ label: 'Payment', to: '/customer/payment' }, { label: 'Success', to: '/customer/order-success' }, { label: 'Invoice', to: '/customer/invoice' }]} />
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-slate-300">
        <p className="text-lg font-semibold text-white">Order #31284 confirmed</p>
        <p className="mt-3">You’ll receive updates once the seller dispatches the item.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/customer/invoice" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">View invoice</Link>
          <Link to="/customer/track-order" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Track order</Link>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerInvoicePage() {
  return (
    <SectionShell title="Invoice" subtitle="Official payment and order receipt">
      <FlowBreadcrumbs steps={[{ label: 'Success', to: '/customer/order-success' }, { label: 'Invoice', to: '/customer/invoice' }, { label: 'Track', to: '/customer/track-order' }]} />
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-300">
        <p className="font-semibold text-white">Invoice INV-31284</p>
        <p className="mt-2">Item: Rare Collectible Watch</p>
        <p className="mt-2">Amount paid: ₹2,51,200</p>
        <p className="mt-2">Delivery mode: Express</p>
        <Link to="/customer/track-order" className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Track order <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </SectionShell>
  );
}

export function CustomerTrackOrderPage() {
  return (
    <SectionShell title="Track order" subtitle="Monitor progress from dispatch to delivery">
      <FlowBreadcrumbs steps={[{ label: 'Invoice', to: '/customer/invoice' }, { label: 'Track', to: '/customer/track-order' }, { label: 'Delivered', to: '/customer/delivered' }]} />
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-300">
        <p className="font-semibold text-white">Shipment status: In transit</p>
        <p className="mt-2">Estimated delivery: 18 Aug 2026</p>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p>Dispatch confirmed • Packaging complete • Courier assigned</p>
        </div>
        <Link to="/customer/delivered" className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Mark delivered <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </SectionShell>
  );
}

export function CustomerDeliveredPage() {
  return (
    <SectionShell title="Delivered" subtitle="Your purchase was delivered successfully">
      <FlowBreadcrumbs steps={[{ label: 'Track', to: '/customer/track-order' }, { label: 'Delivered', to: '/customer/delivered' }, { label: 'Review', to: '/customer/review' }]} />
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-slate-300">
        <p className="text-lg font-semibold text-white">Delivered to your preferred address</p>
        <p className="mt-3">The item arrived safely and is ready for your rating and review.</p>
        <Link to="/customer/review" className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Write a review <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </SectionShell>
  );
}

export function CustomerReviewPage() {
  return (
    <SectionShell title="Review product" subtitle="Share your purchase experience and return to the dashboard">
      <FlowBreadcrumbs steps={[{ label: 'Delivered', to: '/customer/delivered' }, { label: 'Review', to: '/customer/review' }, { label: 'Dashboard', to: '/dashboards/customer' }]} />
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <p className="font-semibold text-white">How would you rate the experience?</p>
          <p className="mt-2">5/5 • Delivery, quality and seller communication were excellent.</p>
        </div>
        <textarea className="mt-4 min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" defaultValue="The item arrived in perfect condition and the support team was responsive." />
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/dashboards/customer" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Submit review</Link>
          <Link to="/customer/dashboard" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Skip for now</Link>
        </div>
      </div>
    </SectionShell>
  );
}

export function VendorCreateProductWizardPage() {
  const categoryFields: Record<string, string[]> = {
    Electronics: ['Brand', 'Model', 'RAM', 'Storage', 'Warranty'],
    Vehicles: ['Brand', 'Fuel', 'Mileage', 'Transmission', 'RC'],
    Pets: ['Breed', 'Age', 'Gender', 'Vaccination', 'Health'],
    Fish: ['Species', 'Size', 'Quantity', 'Water Type'],
    Agriculture: ['Crop', 'Harvest Date', 'Quantity', 'Organic'],
    Furniture: ['Material', 'Dimensions', 'Weight'],
    Fashion: ['Brand', 'Size', 'Color'],
    RealEstate: ['Property Type', 'Area', 'Bedrooms', 'Bathrooms'],
    Services: ['Experience', 'Availability', 'Location'],
  };

  const requiredFields: Record<string, string[]> = {
    Electronics: ['Brand', 'Model'],
    Vehicles: ['Brand', 'Fuel'],
    Pets: ['Breed', 'Age', 'Vaccination'],
    Agriculture: ['Crop', 'Quantity'],
    Furniture: ['Material'],
    RealEstate: ['Property Type', 'Area'],
    Services: ['Experience'],
  };

  const steps = ['Category', 'Basic info', 'Category fields', 'Images', 'Pricing', 'Shipping', 'Auction', 'Preview', 'Publish'];
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({ title: '', category: 'Electronics', price: '', fields: {}, description: '' });
  const [autosaveStatus, setAutosaveStatus] = useState('Saved');
  const [productFormValid, setProductFormValid] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[] | undefined>(undefined);

  useEffect(() => {
    setAutosaveStatus('Autosaving...');
    const t = setTimeout(() => setAutosaveStatus('Saved'), 700);
    return () => clearTimeout(t);
  }, [formData]);

  // compute whether the current step can continue
  let canContinue = true;
  if (step === 1) {
    canContinue = !!formData.category;
  } else if (step === 2) {
    canContinue = !!(formData.title && formData.title.toString().trim().length > 0 && formData.description && formData.description.toString().trim().length > 0);
  } else if (step === 3) {
    canContinue = productFormValid;
  } else if (step === 4) {
    const imgs = uploadedImages || formData.images || [];
    canContinue = imgs.length > 0;
  } else if (step === 5) {
    canContinue = !!(formData.price && formData.price.toString().trim().length > 0);
  }

  return (
    <SectionShell title="Create product" subtitle="Multi-step product wizard for a complete selling experience">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
        <Wizard
          steps={steps}
          step={step}
          canContinue={canContinue}
          onPrev={() => setStep(Math.max(1, step - 1))}
          onNext={() => setStep(Math.min(steps.length, step + 1))}
          onSaveDraft={() => alert('Draft saved (UI only)')}
          onPreview={() => alert('Preview (UI only)')}
          autosaveStatus={autosaveStatus}
        >
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">Choose the category for the product.</p>
              <div className="grid gap-3 md:grid-cols-2">
                {Object.keys(categoryFields).map((c) => (
                  <button key={c} onClick={() => setFormData({ ...formData, category: c })} className={`rounded-2xl border px-4 py-3 text-left text-sm ${formData.category === c ? 'border-blue-500/40 bg-blue-500/10 text-white' : 'border-white/10 bg-white/5 text-slate-300'}`}>{c}</button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <input className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Listing title" />
              <textarea className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Short description" />
            </div>
          )}

          {step === 3 && (
            <div>
              <ProductForm initial={formData} categoryFields={categoryFields} requiredFields={requiredFields} onValidate={(v) => setProductFormValid(v)} onChange={(data) => setFormData({ ...formData, ...data })} />
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="text-sm text-slate-400">Upload product gallery images and a hero image.</p>
              <div className="mt-3">
                <UploadField onChange={(files) => { setUploadedImages(files); setFormData({ ...formData, images: files }); }} />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <input className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="Price" />
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Set price, promotions, and installment options (UI only).</div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <select className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" value={formData.shipping || 'Express'} onChange={(e) => setFormData({ ...formData, shipping: e.target.value })}>
                <option>Express</option>
                <option>Standard</option>
                <option>Pickup</option>
              </select>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Choose dispatch times, packaging and returns policy.</div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Auction settings: reserve price, duration and auto-bid rules.</div>
            </div>
          )}

          {step === 8 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
              <p className="font-semibold text-white">Preview</p>
              <p className="mt-2">{formData.title}</p>
              <p className="mt-2">Category: {formData.category}</p>
              <p className="mt-2">Price: {formData.price}</p>
            </div>
          )}

          {step === 9 && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-sm text-slate-300">
              <p className="text-lg font-semibold text-white">Product published</p>
              <p className="mt-2">Your listing is visible to buyers and is now ready for auction or direct purchase.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/vendor/products" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Manage products</Link>
                <Link to="/vendor/create-auction-wizard" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Create auction</Link>
              </div>
            </div>
          )}
        </Wizard>
      </div>
    </SectionShell>
  );
}

export function VendorEditProductWizardPage() {
  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id)) || products[0];

  const categoryFields: Record<string, string[]> = {
    Electronics: ['Brand', 'Model', 'RAM', 'Storage', 'Warranty'],
    Vehicles: ['Brand', 'Fuel', 'Mileage', 'Transmission', 'RC'],
    Pets: ['Breed', 'Age', 'Gender', 'Vaccination', 'Health'],
    Fish: ['Species', 'Size', 'Quantity', 'Water Type'],
    Agriculture: ['Crop', 'Harvest Date', 'Quantity', 'Organic'],
    Furniture: ['Material', 'Dimensions', 'Weight'],
    Fashion: ['Brand', 'Size', 'Color'],
    RealEstate: ['Property Type', 'Area', 'Bedrooms', 'Bathrooms'],
    Services: ['Experience', 'Availability', 'Location'],
  };

  const requiredFieldsEdit: Record<string, string[]> = {
    Electronics: ['Brand', 'Model'],
    Vehicles: ['Brand', 'Fuel'],
    Pets: ['Breed', 'Age', 'Vaccination'],
    Agriculture: ['Crop', 'Quantity'],
    Furniture: ['Material'],
    RealEstate: ['Property Type', 'Area'],
    Services: ['Experience'],
  };

  const [productFormValidEdit, setProductFormValidEdit] = useState(false);

  const steps = ['Edit Info', 'Category fields', 'Images', 'Pricing', 'Shipping', 'Preview', 'Publish'];
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({ title: product.title, category: product.category || 'Electronics', price: product.price, fields: {}, description: product.description });
  const [autosaveStatus, setAutosaveStatus] = useState('Saved');

  useEffect(() => {
    setAutosaveStatus('Autosaving...');
    const t = setTimeout(() => setAutosaveStatus('Saved'), 700);
    return () => clearTimeout(t);
  }, [formData]);

  // compute canContinue for edit wizard
  let canContinueEdit = true;
  if (step === 1) {
    canContinueEdit = !!(formData.title && formData.title.toString().trim().length > 0);
  } else if (step === 2) {
    canContinueEdit = productFormValidEdit;
  } else if (step === 3) {
    canContinueEdit = !!(formData.images && formData.images.length > 0);
  } else if (step === 4) {
    canContinueEdit = !!(formData.price && formData.price.toString().trim().length > 0);
  }

  return (
    <SectionShell title="Edit product" subtitle={`Edit: ${product.title}`}>
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
        <Wizard
          steps={steps}
          step={step}
          canContinue={canContinueEdit}
          onPrev={() => setStep(Math.max(1, step - 1))}
          onNext={() => setStep(Math.min(steps.length, step + 1))}
          onSaveDraft={() => alert('Draft saved (UI only)')}
          onPreview={() => alert('Preview (UI only)')}
          autosaveStatus={autosaveStatus}
        >
          {step === 1 && (
            <div className="space-y-4">
              <input className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              <textarea className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
          )}

          {step === 2 && (
            <ProductForm initial={formData} categoryFields={categoryFields} requiredFields={requiredFieldsEdit} onValidate={(v) => setProductFormValidEdit(v)} onChange={(data) => setFormData({ ...formData, ...data })} />
          )}

          {step === 3 && (
            <div>
              <p className="text-sm text-slate-400">Manage product images and media.</p>
              <div className="mt-3">
                <UploadField onChange={(files) => setFormData({ ...formData, images: files })} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <input className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
            </div>
          )}

          {step === 5 && <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Shipping and returns configuration (UI only)</div>}

          {step === 6 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
              <p className="font-semibold text-white">Preview</p>
              <p className="mt-2">{formData.title}</p>
              <p className="mt-2">Category: {formData.category}</p>
              <p className="mt-2">Price: {formData.price}</p>
            </div>
          )}

          {step === 7 && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-sm text-slate-300">
              <p className="text-lg font-semibold text-white">Product updated</p>
              <p className="mt-2">Your changes are saved locally (UI only).</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/vendor/products" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Manage products</Link>
              </div>
            </div>
          )}
        </Wizard>
      </div>
    </SectionShell>
  );
}

export function VendorCreateAuctionWizardPage() {
  const steps = ['Settings', 'Details', 'Preview', 'Publish'];
  const [step, setStep] = useState(1);
  const [data, setData] = useState<any>({ title: 'Vintage Camera Kit', reserve: '₹1,00,000', durationDays: 3, bidIncrement: '₹1,000' });
  const [autosaveStatus, setAutosaveStatus] = useState('Saved');
  const [auctionFormValid, setAuctionFormValid] = useState(false);

  useEffect(() => {
    setAutosaveStatus('Autosaving...');
    const t = setTimeout(() => setAutosaveStatus('Saved'), 700);
    return () => clearTimeout(t);
  }, [data]);

  let canContinueAuction = true;
  if (step === 1) {
    canContinueAuction = !!(data.title && data.title.toString().trim().length > 0 && data.reserve && data.bidIncrement);
  } else if (step === 2) {
    canContinueAuction = auctionFormValid;
  }

  return (
    <SectionShell title="Create auction" subtitle="Guide your auction from setup to launch">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
        <Wizard
          steps={steps}
          step={step}
          canContinue={canContinueAuction}
          onPrev={() => setStep(Math.max(1, step - 1))}
          onNext={() => setStep(Math.min(steps.length, step + 1))}
          onSaveDraft={() => alert('Auction draft saved (UI only)')}
          onPreview={() => alert('Auction preview (UI only)')}
          autosaveStatus={autosaveStatus}
        >
          {step === 1 && <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Choose item, audience and reserve rules.</div>}
          {step === 2 && <AuctionForm initial={data} onValidate={(v) => setAuctionFormValid(v)} onChange={(d) => setData(d)} />}
          {step === 3 && (<div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Preview start time, increments and promotional placement.</div>)}
          {step === 4 && (<div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-sm text-slate-300"><p className="text-lg font-semibold text-white">Auction published</p><p className="mt-2">{data.title} is now live for buyers and ready for instant bidding.</p><Link to="/vendor/auctions" className="mt-4 inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Manage auctions</Link></div>)}
        </Wizard>
      </div>
    </SectionShell>
  );
}

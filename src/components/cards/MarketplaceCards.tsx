import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, Eye, Heart, MessageCircle, Share2, Star } from 'lucide-react';
import type { ReactNode } from 'react';

interface ProductCardProps {
  id: string | number;
  title: string;
  description: string;
  image: string;
  price: string;
  category: string;
  condition: string;
  seller: string;
  rating?: number;
  reviews?: number;
  oldPrice?: string;
  discount?: string;
  verified?: boolean;
  currentBid?: string;
  endsIn?: string;
  badge?: string;
  location?: string;
  actionLabel?: string;
  actionLink?: string;
}

export function ProductCard({
  id,
  title,
  description,
  image,
  price,
  category,
  condition,
  seller,
  rating,
  reviews,
  oldPrice,
  discount,
  verified,
  currentBid,
  endsIn,
  badge,
  location,
  actionLabel,
  actionLink,
}: ProductCardProps) {
  return (
    <motion.article whileHover={{ y: -4, scale: 1.01 }} className="group relative w-full max-w-full overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/80 shadow-xl shadow-slate-950/30 transition duration-300">
      <div className="relative overflow-hidden">
        <div className="thumbnail-wrapper" style={{ width: 280, height: 180, maxWidth: '100%', overflow: 'hidden', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
          <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="transition duration-500 group-hover:scale-105" />
        </div>
        <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3">
          {badge ? (
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">{badge}</span>
          ) : null}
          <div className="flex items-center gap-2">
            <button className="rounded-full bg-slate-950/75 p-2 text-slate-200 transition hover:bg-white/10"><Heart className="h-4 w-4" /></button>
            <button className="rounded-full bg-slate-950/75 p-2 text-slate-200 transition hover:bg-white/10"><Eye className="h-4 w-4" /></button>
          </div>
        </div>
        {verified ? (
          <div className="absolute left-4 bottom-4 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-emerald-300 shadow-lg shadow-slate-950/40">
            <CheckCircle2 className="mr-1 inline-block h-3.5 w-3.5" /> Verified
          </div>
        ) : null}
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
          <span>{category}</span>
          <span>{condition}</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-slate-400 line-clamp-2">{description}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-semibold text-white">{price}</p>
              {oldPrice ? <p className="text-sm text-slate-500 line-through">{oldPrice}</p> : null}
            </div>
            {discount ? <p className="mt-1 text-xs uppercase tracking-[0.18em] text-emerald-300">{discount}</p> : null}
          </div>
          {currentBid ? (
            <div className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-200">Bid ₹{currentBid}</div>
          ) : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-3xl bg-slate-950/75 px-4 py-3 text-sm text-slate-300">
            <p className="font-medium text-white">Seller</p>
            <p>{seller}</p>
          </div>
          <div className="rounded-3xl bg-slate-950/75 px-4 py-3 text-sm text-slate-300">
            <p className="font-medium text-white">Location</p>
            <p>{location || 'India'}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            {rating ? (
              <span className="inline-flex items-center gap-1 text-amber-300">
                <Star className="h-4 w-4" /> {rating}
              </span>
            ) : null}
            <span>{reviews ? `${reviews} reviews` : 'Popular choice'}</span>
          </div>
          {endsIn ? <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Ends in {endsIn}</span> : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to={actionLink ?? `/customer/product/${id}`} className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 sm:w-auto">
            {actionLabel || (currentBid ? 'Bid now' : 'Buy now')}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/10 sm:w-auto">
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>
      </div>
    </motion.article>
  );
}

interface AuctionCardProps {
  id: string | number;
  title: string;
  image: string;
  status: string;
  currentBid: string;
  endsIn: string;
}

export function AuctionCard({ id, title, image, status, currentBid, endsIn }: AuctionCardProps) {
  return (
    <motion.article whileHover={{ y: -4, scale: 1.01 }} className="w-full max-w-full overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/80 shadow-xl shadow-slate-950/30 transition duration-300">
      <div className="relative overflow-hidden">
        {/* Auction image: render a constrained thumbnail (responsive) */}
        <div className="thumbnail-wrapper" style={{ width: 280, height: 180, maxWidth: '100%', overflow: 'hidden', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
          <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="bg-slate-800" />
        </div>
        <div className="absolute inset-x-4 top-4 flex items-center justify-between">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${status === 'Live' ? 'bg-emerald-500/15 text-emerald-300' : status === 'Upcoming' ? 'bg-amber-500/15 text-amber-300' : 'bg-slate-700/80 text-slate-300'}`}>{status}</span>
          <div className="inline-flex items-center gap-1 rounded-full bg-slate-950/90 px-3 py-1 text-xs text-slate-300">
            <Clock3 className="h-3.5 w-3.5" /> {endsIn}
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-3 text-sm text-slate-400">Current bid {currentBid}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <Link to={`/auctions/${id}`} className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 sm:w-auto">
            View auction
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button className="min-h-[48px] w-full rounded-full bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 sm:w-auto">Watch</button>
        </div>
      </div>
    </motion.article>
  );
}

export function CategoryCard({ title, description, icon }: { title: string; description: string; icon?: ReactNode }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="w-full max-w-full rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/30 transition duration-300">
      <div className="flex items-center gap-3">
        <div className="rounded-3xl bg-blue-500/10 p-3 text-blue-300">{icon}</div>
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function SellerCard({ name, specialty, rating }: { name: string; specialty: string; rating: string }) {
  return (
    <div className="w-full max-w-full rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/30 transition duration-300">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{name}</p>
          <p className="mt-1 text-sm text-slate-400">{specialty}</p>
        </div>
        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-sm text-amber-300">★ {rating}</span>
      </div>
    </div>
  );
}

export function ReviewCard({ quote, author, rating }: { quote: string; author: string; rating: number }) {
  return (
    <div className="w-full max-w-full rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/30 transition duration-300">
      <p className="text-amber-300">{'★'.repeat(rating)}</p>
      <p className="mt-4 text-sm text-slate-300">“{quote}”</p>
      <p className="mt-5 text-sm font-semibold text-white">{author}</p>
    </div>
  );
}

export function StatisticCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className={`w-full max-w-full rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/30 transition duration-300 ${accent || ''}`}>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

import { SectionShell } from '../components/SectionShell';
import { motion } from 'framer-motion';

export function AboutPage() {
  return (
    <SectionShell title="About" subtitle="Built for premium, transparent commerce">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8">
          <p className="text-slate-300">Bidzo brings together modern auction infrastructure, curated marketplace discovery, and enterprise-grade trust tools for buyers, sellers, vendors, and administrators. The experience is intentionally polished and ready for future backend integration.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {['Verified sellers', 'Live bidding', 'Enterprise dashboards'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-slate-300">{item}</div>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-blue-600/20 to-amber-500/10 p-8">
          <h3 className="text-xl font-semibold text-white">Why teams choose Bidzo</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>• Premium UI patterns tailored to e-commerce and auctions</li>
            <li>• Responsive foundation for desktop, tablet, and mobile</li>
            <li>• Reusable components and mock data for rapid product iteration</li>
          </ul>
        </div>
      </motion.div>
    </SectionShell>
  );
}

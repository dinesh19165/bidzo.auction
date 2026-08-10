import { motion } from 'framer-motion';

type Breadcrumb = { label: string; to?: string };

export function SectionShell({ title, subtitle, children, breadcrumbs, compact = false }: { title: string; subtitle: string; children: React.ReactNode; breadcrumbs?: Breadcrumb[]; compact?: boolean }) {
  return (
    <section className={`mx-auto w-full max-w-7xl px-4 ${compact ? 'py-5' : 'py-8'} sm:px-6 lg:px-8`}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="w-full min-w-0 overflow-x-hidden">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-3 text-sm text-slate-400" aria-label="Breadcrumb">
            {breadcrumbs.map((b, i) => (
              <span key={b.label} className="inline-block">
                {b.to ? <a className="text-slate-400 hover:underline" href={b.to}>{b.label}</a> : <span className="text-slate-400">{b.label}</span>}
                {i < breadcrumbs.length - 1 && <span className="px-2">/</span>}
              </span>
            ))}
          </nav>
        )}

        <div className={`${compact ? 'mb-4 gap-1.5' : 'mb-6 gap-2'} flex flex-col sm:flex-row sm:items-end sm:justify-between`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">{title}</p>
            <h1 className="mt-1 text-2xl font-extrabold leading-tight text-white sm:text-3xl">{subtitle}</h1>
          </div>
        </div>
        {children}
      </motion.div>
    </section>
  );
}

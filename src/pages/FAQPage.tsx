import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { SectionShell } from '../components/SectionShell';
import { getPublishedFaqs, type PublicFaq } from '../api/cmsApi';

export function FAQPage() {
  const [faqs, setFaqs] = useState<PublicFaq[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getPublishedFaqs()
      .then((items) => {
        if (active) setFaqs(items);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredFaqs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return faqs;
    return faqs.filter((item) => `${item.question} ${item.answer}`.toLowerCase().includes(normalizedQuery));
  }, [faqs, query]);

  return (
    <SectionShell title="Support" subtitle="Frequently Asked Questions">
      <div className="mx-auto max-w-3xl">
        <label className="mb-5 flex min-h-12 items-center gap-3 border border-white/10 bg-slate-900/70 px-4 focus-within:border-blue-400/60 focus-within:ring-2 focus-within:ring-blue-400/15">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search FAQs" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
        </label>
        {loading ? <p className="py-8 text-center text-sm text-slate-400">Loading FAQs...</p> : error ? <p role="alert" className="border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">Unable to load FAQs. Please try again later.</p> : filteredFaqs.length === 0 ? <p className="border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">No FAQs are available right now.</p> : <div className="space-y-3">
          {filteredFaqs.map((item) => <details key={item.id} className="border border-white/10 bg-slate-900/70 px-4 py-4">
            <summary className="cursor-pointer list-none text-sm font-semibold text-white marker:hidden">{item.question}{item.category ? <span className="ml-2 text-xs font-normal text-slate-500">{item.category}</span> : null}</summary>
            <p className="mt-3 text-sm leading-6 text-slate-300">{item.answer}</p>
          </details>)}
        </div>}
      </div>
    </SectionShell>
  );
}

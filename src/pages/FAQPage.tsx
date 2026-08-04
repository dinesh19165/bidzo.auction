import { SectionShell } from '../components/SectionShell';
import { faqItems } from '../data/mockData';

export function FAQPage() {
  return (
    <SectionShell title="FAQ" subtitle="Common questions answered">
      <div className="space-y-4">
        {faqItems.map((item) => (
          <details key={item.question} className="rounded-[20px] border border-white/10 bg-slate-900/70 p-5">
            <summary className="cursor-pointer text-base font-semibold text-white">{item.question}</summary>
            <p className="mt-3 text-sm text-slate-300">{item.answer}</p>
          </details>
        ))}
      </div>
    </SectionShell>
  );
}

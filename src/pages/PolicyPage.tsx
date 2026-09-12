import { SectionShell } from '../components/SectionShell';

export interface PolicySection {
  title: string;
  body: string;
}

export function PolicyPage({ title, subtitle, intro, sections, body }: { title: string; subtitle: string; intro?: string; sections?: PolicySection[]; body?: string }) {
  return (
    <SectionShell title={title} subtitle={subtitle}>
      {sections ? <article className="max-w-4xl border-y border-white/10 py-8 text-slate-300 sm:py-10">
        <p className="max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">{intro}</p>
        <div className="mt-8 divide-y divide-white/10 border-t border-white/10">
          {sections.map((section, index) => (
            <section key={section.title} className="py-7 first:pt-6 last:pb-2 sm:py-8">
              <h2 className="text-lg font-semibold leading-7 text-white sm:text-xl">{index + 1}. {section.title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">{section.body}</p>
            </section>
          ))}
        </div>
      </article> : <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-300">{body}</div>}
    </SectionShell>
  );
}

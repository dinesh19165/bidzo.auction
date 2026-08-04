import { SectionShell } from '../components/SectionShell';
import { careers } from '../data/mockData';

export function CareersPage() {
  return (
    <SectionShell title="Careers" subtitle="Join the team building the next generation of auctions">
      <div className="grid gap-4 md:grid-cols-3">
        {careers.map((job) => (
          <div key={job.title} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <h3 className="text-lg font-semibold text-white">{job.title}</h3>
            <p className="mt-3 text-sm text-slate-400">{job.location}</p>
            <button className="mt-5 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Apply</button>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

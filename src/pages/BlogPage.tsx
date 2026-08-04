import { SectionShell } from '../components/SectionShell';
import { blogPosts } from '../data/mockData';

export function BlogPage() {
  return (
    <SectionShell title="Blog" subtitle="Insights for modern marketplaces">
      <div className="grid gap-4 md:grid-cols-3">
        {blogPosts.map((post) => (
          <div key={post.slug} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <p className="text-sm text-blue-300">{post.date}</p>
            <h3 className="mt-3 text-lg font-semibold text-white">{post.title}</h3>
            <p className="mt-3 text-sm text-slate-400">Read more about the latest thinking in auction design, trust systems, and seller growth.</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

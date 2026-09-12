import { SectionShell } from '../components/SectionShell';
import { EmptyState } from '../components/loading/LoadingComponents';

export function BlogPage() {
  return (
    <SectionShell title="Blog" subtitle="Insights for modern marketplaces">
      <EmptyState title="Blog unavailable" description="A public published blog API is not currently available." />
    </SectionShell>
  );
}

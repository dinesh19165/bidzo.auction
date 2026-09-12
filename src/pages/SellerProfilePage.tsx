import { SectionShell } from '../components/SectionShell';
import { EmptyState } from '../components/loading/LoadingComponents';

export function SellerProfilePage() {
  return (
    <SectionShell title="Seller profile" subtitle="Seller information">
      <EmptyState title="Seller profile unavailable" description="The backend does not currently provide a public seller-profile endpoint." />
    </SectionShell>
  );
}

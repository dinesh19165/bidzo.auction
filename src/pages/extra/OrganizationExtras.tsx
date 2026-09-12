import { SectionShell } from '../../components/SectionShell';
import { EmptyState } from '../../components/loading/LoadingComponents';

function OrganizationUnavailable({ title, subtitle, description }: { title: string; subtitle: string; description: string }) {
  return <SectionShell title={title} subtitle={subtitle}><EmptyState title="Data unavailable" description={description} /></SectionShell>;
}

export function OrganizationHierarchyPage() {
  return <OrganizationUnavailable title="Organization hierarchy" subtitle="Group, country, region, franchise and vendor operations" description="The organization hierarchy API is not currently available." />;
}

export function FranchiseManagementPage() {
  return <OrganizationUnavailable title="Franchise management" subtitle="Franchise health and operational readiness" description="The franchise management API is not currently available." />;
}

export function LocationManagementPage() {
  return <OrganizationUnavailable title="Location management" subtitle="Country, state, district and city governance" description="The location hierarchy API is not currently available." />;
}

export function RolePermissionPage() {
  return <OrganizationUnavailable title="Role & permissions" subtitle="Access across the franchise and support ecosystem" description="The organization permissions API is not currently available." />;
}

export function FranchiseDashboardPage() {
  return <OrganizationUnavailable title="Franchise dashboard" subtitle="Regional operations and partner performance" description="The franchise dashboard API is not currently available." />;
}

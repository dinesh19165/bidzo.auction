import { Building2, Landmark, MapPin, ShieldCheck, Store, Users } from 'lucide-react';
import { SectionShell } from '../../components/SectionShell';
import { Card } from '../../components/common/Card';
import { Badge, PrimaryButton, SecondaryButton } from '../../components/common/Buttons';
import { Table } from '../../components/common/Table';
import { franchiseDashboardKpis, franchiseDirectory, locationDirectory, organizationHierarchy, rolePermissions } from '../../data/mockData';

export function OrganizationHierarchyPage() {
  return (
    <SectionShell title="Organization hierarchy" subtitle="A scalable structure for group, country, region, franchise and vendor operations">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Hierarchy view</p>
              <h3 className="mt-1 text-xl font-semibold text-white">Multi-level operating model</h3>
            </div>
            <PrimaryButton>Export tree</PrimaryButton>
          </div>
          <div className="mt-6 space-y-3">
            {organizationHierarchy.map((item, index) => (
              <div key={`${item.level}-${item.entity}`} className="flex items-center justify-between rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">{item.entity}</p>
                  <p className="text-sm text-slate-400">{item.level}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-300">{item.region}</p>
                  <Badge className="mt-2">{item.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-500/10 p-2 text-blue-200"><Building2 className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-semibold text-white">Governance controls</p>
              <p className="text-sm text-slate-400">Operational guardrails for each node</p>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-sm text-slate-300">
            <div className="rounded-[18px] border border-white/10 bg-slate-950/50 p-3">Franchise onboarding requires KYC, bank verification and local compliance review.</div>
            <div className="rounded-[18px] border border-white/10 bg-slate-950/50 p-3">District and city nodes receive policy packs, service SLAs and settlement rules.</div>
            <div className="rounded-[18px] border border-white/10 bg-slate-950/50 p-3">Vendor and delivery relationships inherit the same risk and performance monitoring framework.</div>
          </div>
        </Card>
      </div>
    </SectionShell>
  );
}

export function FranchiseManagementPage() {
  return (
    <SectionShell title="Franchise management" subtitle="Track franchise health, admin ownership and operational readiness">
      <div className="flex flex-wrap gap-3">
        <PrimaryButton icon={<Store className="h-4 w-4" />}>Create franchise</PrimaryButton>
        <SecondaryButton icon={<ShieldCheck className="h-4 w-4" />}>Bulk verify</SecondaryButton>
      </div>
      <Card className="mt-6 p-0">
        <Table
          columns={[
            { key: 'name', label: 'Franchise' },
            { key: 'code', label: 'Code' },
            { key: 'city', label: 'City' },
            { key: 'region', label: 'Region' },
            { key: 'admin', label: 'Admin' },
            { key: 'health', label: 'Health' },
            { key: 'status', label: 'Status' },
          ]}
          data={franchiseDirectory}
          className="p-4"
        />
      </Card>
    </SectionShell>
  );
}

export function LocationManagementPage() {
  return (
    <SectionShell title="Location management" subtitle="Country, state, district and city governance in one workspace">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {locationDirectory.map((item) => (
          <Card key={`${item.type}-${item.name}`} className="p-5">
            <div className="flex items-center gap-2 text-emerald-300">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em]">{item.type}</span>
            </div>
            <p className="mt-3 text-lg font-semibold text-white">{item.name}</p>
            <p className="mt-1 text-sm text-slate-400">{item.code}</p>
            <p className="mt-4 text-sm text-slate-300">Parent: {item.parent}</p>
            <p className="mt-2 text-sm text-slate-300">Active nodes: {item.activeNodes}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-6 p-0">
        <Table
          columns={[
            { key: 'type', label: 'Type' },
            { key: 'name', label: 'Name' },
            { key: 'code', label: 'Code' },
            { key: 'parent', label: 'Parent' },
            { key: 'activeNodes', label: 'Active nodes' },
          ]}
          data={locationDirectory}
          className="p-4"
        />
      </Card>
    </SectionShell>
  );
}

export function RolePermissionPage() {
  return (
    <SectionShell title="Role & permissions" subtitle="Assign access across the franchise and support ecosystem">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-0">
          <Table
            columns={[
              { key: 'role', label: 'Role' },
              { key: 'scope', label: 'Scope' },
              { key: 'users', label: 'Users' },
              { key: 'status', label: 'Status' },
            ]}
            data={rolePermissions}
            className="p-4"
          />
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-500/10 p-2 text-amber-200"><ShieldCheck className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-semibold text-white">Permission matrix</p>
              <p className="text-sm text-slate-400">Fine-grained access for admin and partner roles</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {rolePermissions.map((role) => (
              <div key={role.role} className="rounded-[18px] border border-white/10 bg-slate-950/50 p-3">
                <p className="font-semibold text-white">{role.role}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {role.permissions.map((permission) => (
                    <span key={permission} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">{permission}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </SectionShell>
  );
}

export function FranchiseDashboardPage() {
  return (
    <SectionShell title="Franchise dashboard" subtitle="A dedicated overview for regional operations and partner performance">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {franchiseDashboardKpis.map((item) => (
          <Card key={item.label} className="p-5">
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-blue-200">
            <Landmark className="h-5 w-5" />
            <p className="text-sm font-semibold uppercase tracking-[0.2em]">Regional pulse</p>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="rounded-[18px] border border-white/10 bg-white/5 p-3">Bengaluru franchise outperformed target with 18% higher verified orders this month.</div>
            <div className="rounded-[18px] border border-white/10 bg-white/5 p-3">Delivery partner handoff latency improved after introducing shared route monitoring.</div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 text-emerald-300">
            <Users className="h-5 w-5" />
            <p className="text-sm font-semibold uppercase tracking-[0.2em]">Partner actions</p>
          </div>
          <div className="mt-4 space-y-3">
            <div className="rounded-[18px] border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-300">Approve 4 pending vendor KYC submissions.</div>
            <div className="rounded-[18px] border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-300">Review 2 new franchise bids for the western cluster.</div>
            <div className="rounded-[18px] border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-300">Publish a new city-level compliance bulletin.</div>
          </div>
        </Card>
      </div>
    </SectionShell>
  );
}

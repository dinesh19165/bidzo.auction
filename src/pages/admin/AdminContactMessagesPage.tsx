import { useEffect, useState } from 'react';
import { Eye, Inbox, Search } from 'lucide-react';
import { AdminShell } from '../../components/admin/AdminShell';
import { Card } from '../../components/common/Card';
import { PrimaryButton, SecondaryButton } from '../../components/common/Buttons';
import { Modal } from '../../components/common/Feedback';
import { EmptyState, ErrorState, SkeletonTable } from '../../components/loading/LoadingComponents';
import { getAdminContactMessage, getAdminContactMessages, updateAdminContactMessageStatus, type ContactMessage, type ContactMessagePage, type ContactMessageStatus } from '../../api/contactAdminApi';

const pageSize = 10;
const statusOptions: Array<{ label: string; value: '' | ContactMessageStatus }> = [
  { label: 'All statuses', value: '' },
  { label: 'New', value: 'NEW' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved', value: 'RESOLVED' },
];

function displayName(message: ContactMessage) {
  return message.name || message.customerName || '-';
}

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function statusLabel(status: ContactMessageStatus) {
  return status === 'IN_PROGRESS' ? 'In Progress' : status === 'RESOLVED' ? 'Resolved' : 'New';
}

function statusClass(status: ContactMessageStatus) {
  return status === 'NEW'
    ? 'border-blue-400/30 bg-blue-500/10 text-blue-200'
    : status === 'IN_PROGRESS'
      ? 'border-amber-400/30 bg-amber-500/10 text-amber-200'
      : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200';
}

export function AdminContactMessagesPage() {
  const [result, setResult] = useState<ContactMessagePage>({ content: [], totalElements: 0, totalPages: 0, size: pageSize, number: 0, first: true, last: true });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | ContactMessageStatus>('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | string | null>(null);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await getAdminContactMessages({ page, size: pageSize, search: search.trim() || undefined, status: status || undefined, sort: 'createdAt', direction: 'DESC' });
      setResult(next);
    } catch {
      setError('Unable to load contact messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMessages(); }, [page, status, search]);

  const openMessage = async (message: ContactMessage) => {
    setSelected(message);
    setDetailLoading(true);
    try {
      setSelected(await getAdminContactMessage(message.id));
    } catch {
      setError('Unable to load contact messages. Please try again.');
    } finally {
      setDetailLoading(false);
    }
  };

  const updateStatus = async (message: ContactMessage, nextStatus: ContactMessageStatus) => {
    setUpdatingId(message.id);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateAdminContactMessageStatus(message.id, nextStatus);
      const nextMessage = updated ? { ...message, ...updated, status: nextStatus } : { ...message, status: nextStatus };
      setResult((current) => ({ ...current, content: current.content.map((item) => item.id === message.id ? nextMessage : item) }));
      setSelected((current) => current?.id === message.id ? nextMessage : current);
      setSuccess(`Message status updated to ${statusLabel(nextStatus)}.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to update message status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const nextStatus = (current: ContactMessageStatus): ContactMessageStatus | null => current === 'NEW' ? 'IN_PROGRESS' : current === 'IN_PROGRESS' ? 'RESOLVED' : null;
  const totalPages = result.totalPages || (result.totalElements ? Math.ceil(result.totalElements / result.size) : 0);

  return (
    <AdminShell title="Enterprise admin" subtitle="Contact Messages" breadcrumbs={[{ label: 'Admin' }, { label: 'Contact Messages' }]} activePath="/admin/contact" actions={<PrimaryButton icon={<Inbox className="h-4 w-4" />} onClick={loadMessages}>Refresh</PrimaryButton>}>
      <Card className="p-4">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} placeholder="Search name, email, or message..." className="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-blue-400/60" />
          </div>
          <select value={status} onChange={(event) => { setStatus(event.target.value as '' | ContactMessageStatus); setPage(0); }} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none">
            {statusOptions.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
          </select>
        </div>
        {success ? <div role="status" className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">{success}</div> : null}
        {error ? <ErrorState title="Unable to load contact messages" description={error} /> : loading ? <SkeletonTable /> : result.content.length === 0 ? <EmptyState title="No contact messages found." description="There are no messages matching the current filters." /> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="text-slate-400"><tr>{['Customer', 'Email', 'Message', 'Status', 'Submitted', 'Actions'].map((heading) => <th key={heading} className="px-3 py-3">{heading}</th>)}</tr></thead><tbody className="text-slate-300">{result.content.map((message) => <tr key={message.id} className="border-t border-white/6"><td className="px-3 py-3 font-medium text-white">{displayName(message)}</td><td className="px-3 py-3">{message.email}</td><td className="max-w-[320px] truncate px-3 py-3" title={message.message}>{message.message}</td><td className="px-3 py-3"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(message.status)}`}>{statusLabel(message.status)}</span></td><td className="whitespace-nowrap px-3 py-3">{formatDate(message.createdAt)}</td><td className="px-3 py-3"><SecondaryButton icon={<Eye className="h-4 w-4" />} onClick={() => openMessage(message)}>View</SecondaryButton></td></tr>)}</tbody></table></div>}
        <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between"><span>{result.totalElements} total</span><div className="flex items-center gap-2"><span>Page {result.number + 1} of {Math.max(totalPages, 1)}</span><SecondaryButton disabled={result.first || loading} onClick={() => setPage((current) => current - 1)}>Previous</SecondaryButton><SecondaryButton disabled={result.last || loading || totalPages === 0} onClick={() => setPage((current) => current + 1)}>Next</SecondaryButton></div></div>
      </Card>

      <Modal open={selected !== null} title="Contact message" onClose={() => setSelected(null)}>
        {detailLoading ? <SkeletonTable /> : selected ? <div className="space-y-4 text-sm text-slate-300"><div className="grid gap-3 sm:grid-cols-2"><div><p className="text-slate-500">Name</p><p className="mt-1 text-white">{displayName(selected)}</p></div><div><p className="text-slate-500">Email</p><p className="mt-1 break-all text-white">{selected.email}</p></div><div><p className="text-slate-500">Created</p><p className="mt-1 text-white">{formatDate(selected.createdAt)}</p></div><div><p className="text-slate-500">Updated</p><p className="mt-1 text-white">{formatDate(selected.updatedAt)}</p></div></div><div><p className="text-slate-500">Message</p><p className="mt-1 whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/5 p-4 text-white">{selected.message}</p></div><div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(selected.status)}`}>{statusLabel(selected.status)}</span>{nextStatus(selected.status) ? <SecondaryButton disabled={updatingId === selected.id} onClick={() => updateStatus(selected, nextStatus(selected.status) as ContactMessageStatus)}>{updatingId === selected.id ? 'Updating...' : `Move to ${statusLabel(nextStatus(selected.status) as ContactMessageStatus)}`}</SecondaryButton> : <span className="text-slate-500">No further status changes</span>}</div></div> : null}
      </Modal>
    </AdminShell>
  );
}
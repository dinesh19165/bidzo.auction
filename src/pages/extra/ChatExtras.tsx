import { SectionShell } from '../../components/SectionShell';

export function AdminChatPage() {
  return (
    <SectionShell title="Admin chat" subtitle="Support conversations">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-300">
        <p>Internal admin communication and support queue.</p>
      </div>
    </SectionShell>
  );
}

export function SupportChatPage() {
  return (
    <SectionShell title="Support chat" subtitle="Customer support live view">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-300">
        <p>Support chat thread with a buyer and seller assistance flow.</p>
      </div>
    </SectionShell>
  );
}

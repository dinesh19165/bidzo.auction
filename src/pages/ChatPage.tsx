import { SectionShell } from '../components/SectionShell';
import { chats } from '../data/mockData';

export function ChatPage() {
  return (
    <SectionShell title="Chat" subtitle="Buyer and seller conversations">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          {chats.map((chat) => (
            <div key={chat.name} className={`rounded-2xl border border-white/10 bg-white/5 p-4 ${chat.active ? 'border-blue-500/40' : ''}`}>
              <p className="font-semibold text-white">{chat.name}</p>
              <p className="mt-2 text-sm text-slate-400">{chat.lastMessage}</p>
            </div>
          ))}
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <h3 className="text-lg font-semibold text-white">Conversation</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl bg-blue-500/10 p-3">I can ship tomorrow morning.</div>
            <div className="rounded-2xl bg-white/5 p-3">Perfect, I will confirm the address.</div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

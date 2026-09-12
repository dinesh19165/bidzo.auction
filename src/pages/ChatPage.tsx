import { useEffect, useState } from 'react';
import { SectionShell } from '../components/SectionShell';
import { getConversations, getMessages, type ConversationResponse, type MessageResponse } from '../api/messageApi';

export function ChatPage() {
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [selected, setSelected] = useState<ConversationResponse | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { getConversations().then((items) => setConversations(Array.isArray(items) ? items : [])).catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load conversations.')).finally(() => setLoading(false)); }, []);
  const openConversation = async (conversation: ConversationResponse) => { setSelected(conversation); setError(null); try { setMessages(await getMessages(conversation.id)); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load messages.'); setMessages([]); } };

  return (
    <SectionShell title="Chat" subtitle="Buyer and seller conversations">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          {loading ? <p className="text-sm text-slate-400">Loading conversations...</p> : error && !selected ? <p className="text-sm text-rose-300">{error}</p> : conversations.length === 0 ? <p className="text-sm text-slate-400">No conversations yet.</p> : conversations.map((chat) => <button type="button" key={chat.id} onClick={() => void openConversation(chat)} className={`w-full rounded-2xl border bg-white/5 p-4 text-left ${selected?.id === chat.id ? 'border-blue-500/40' : 'border-white/10'}`}><p className="font-semibold text-white">{chat.participantName}</p><p className="mt-2 truncate text-sm text-slate-400">{chat.lastMessage || 'No messages yet.'}</p></button>)}
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <h3 className="text-lg font-semibold text-white">{selected?.participantName || 'Conversation'}</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">{error && selected ? <p className="text-rose-300">{error}</p> : !selected ? <p className="text-slate-400">Select a conversation to view messages.</p> : messages.length === 0 ? <p className="text-slate-400">No messages in this conversation yet.</p> : messages.map((message) => <div key={message.id} className="rounded-2xl bg-white/5 p-3"><p>{message.content}</p><p className="mt-1 text-xs text-slate-500">{new Date(message.createdAt).toLocaleString()}</p></div>)}</div>
        </div>
      </div>
    </SectionShell>
  );
}

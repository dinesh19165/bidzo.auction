import type { ReactNode } from 'react';

export function ChatList({ items }: { items: Array<{ name: string; preview: string }> }) {
  return <div className="space-y-2">{items.map((item) => <div key={item.name} className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="font-medium text-white">{item.name}</p><p className="mt-1 text-sm text-slate-400">{item.preview}</p></div>)}</div>;
}

export function ChatWindow({ children }: { children: ReactNode }) {
  return <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5">{children}</div>;
}

export function MessageBubble({ text, self }: { text: string; self?: boolean }) {
  return <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${self ? 'ml-auto bg-blue-600 text-white' : 'bg-white/5 text-slate-300'}`}>{text}</div>;
}

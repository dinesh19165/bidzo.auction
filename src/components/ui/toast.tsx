import { createRoot } from 'react-dom/client';

export function showToast(message: string, detail?: string, tone: 'success' | 'info' | 'warning' = 'info', duration = 2400) {
  try {
    const id = `bidzo-toast-${Date.now()}`;
    const container = document.createElement('div');
    container.id = id;
    document.body.appendChild(container);

    const toneClasses = {
      success: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
      info: 'border-blue-400/30 bg-slate-900/95 text-slate-100',
      warning: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
    };

    const root = createRoot(container);
    root.render(
      <div className="pointer-events-none fixed right-4 top-4 z-[9999] w-[min(92vw,360px)]" role="status" aria-live="polite">
        <div className={`rounded-2xl border px-4 py-3 shadow-2xl shadow-slate-950/40 backdrop-blur ${toneClasses[tone]}`}>
          <p className="text-sm font-semibold">{message}</p>
          {detail ? <p className="mt-1 text-xs opacity-80">{detail}</p> : null}
        </div>
      </div>
    );

    setTimeout(() => {
      try {
        root.unmount();
        container.remove();
      } catch (e) {
        // ignore
      }
    }, duration);
  } catch (e) {
    try {
      alert(message);
    } catch {}
  }
}

export default showToast;

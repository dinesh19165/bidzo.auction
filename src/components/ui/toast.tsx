import { createRoot } from 'react-dom/client';

export function showToast(message: string, duration = 2200) {
  try {
    const id = `bidzo-toast-${Date.now()}`;
    const container = document.createElement('div');
    container.id = id;
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(
      <div className="pointer-events-none fixed right-4 top-4 z-[9999]">
        <div className="max-w-xs rounded-xl bg-slate-900/95 border border-white/10 px-4 py-3 text-sm text-white shadow-lg shadow-black/60 transition-all duration-200">
          {message}
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
      // fallback
      alert(message);
    } catch {}
  }
}

export default showToast;

import React from 'react';

export function Tooltip({ children, text }: { children: React.ReactNode; text: string }) {
  return (
    <span className="relative inline-block">
      <span className="cursor-help">{children}</span>
      <span className="invisible absolute left-1/2 top-full z-10 w-max -translate-x-1/2 rounded-md bg-slate-800/90 px-2 py-1 text-xs text-slate-200 group-hover:visible">{text}</span>
    </span>
  );
}

export default Tooltip;

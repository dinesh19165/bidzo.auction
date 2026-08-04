import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[20px] border border-white/10 bg-slate-900/70 p-4 ${className}`}>
      {children}
    </div>
  );
}

export default Card;

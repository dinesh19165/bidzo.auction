import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`min-w-0 rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-4 shadow-sm shadow-[var(--shadow-color)] ${className}`}>
      {children}
    </div>
  );
}

export default Card;

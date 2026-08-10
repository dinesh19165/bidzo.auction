import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[20px] border border-[var(--border-color)] bg-[var(--surface)] p-4 ${className}`}>
      {children}
    </div>
  );
}

export default Card;

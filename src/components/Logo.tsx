import React from 'react';

export function Logo({ className }: { className?: string }) {
  return (
    <img src="/logo.png" alt="Bidzo" className={className} width={64} height={48} style={{ height: 48, width: 'auto', maxWidth: 64 }} />
  );
}

export default Logo;

import React from 'react';

export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="Bidzo"
      className={className}
    />
  );
}

export default Logo;
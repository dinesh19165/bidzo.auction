import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function PrimaryButton({ children, icon, fullWidth = false, className = '', ...props }: ButtonProps) {
  return (
    <button className={`inline-flex min-h-[48px] max-w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 ${fullWidth ? 'w-full' : 'w-full sm:w-auto'} ${className}`} {...props}>
      {icon}
      {children}
    </button>
  );
}

export function SecondaryButton({ children, icon, fullWidth = false, className = '', ...props }: ButtonProps) {
  return (
    <button className={`inline-flex min-h-[48px] max-w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 font-medium text-slate-200 transition hover:bg-white/10 ${fullWidth ? 'w-full' : 'w-full sm:w-auto'} ${className}`} {...props}>
      {icon}
      {children}
    </button>
  );
}

export function IconButton({ children, className = '', ...props }: ButtonProps) {
  return (
    <button className={`inline-flex min-h-[48px] min-w-[48px] max-w-full items-center justify-center rounded-full border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:bg-white/10 ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-blue-200 ${className}`}>{children}</span>;
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' }[size];
  return <div className={`${sizeClasses} flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-amber-500 font-semibold text-white`}>{name.slice(0, 2).toUpperCase()}</div>;
}

export function Spinner() {
  return <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />;
}

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function CategoryGrid({ items }: { items: Array<{ title: string; description: string }> }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <div key={item.title} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5"><h3 className="font-semibold text-white">{item.title}</h3><p className="mt-2 text-sm text-slate-400">{item.description}</p></div>)}</div>;
}

export function ProductGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

export function ProductGallery({ images }: { images: string[] }) {
  return <div className="grid gap-3 md:grid-cols-2">{images.map((image) => <img key={image} src={image} alt="gallery" loading="lazy" decoding="async" className="h-44 w-full rounded-[20px] object-cover" />)}</div>;
}

export function ProductSpecification({ specs }: { specs: Array<{ label: string; value: string }> }) {
  return <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5"><h3 className="font-semibold text-white">Specifications</h3><div className="mt-4 space-y-3">{specs.map((spec) => <div key={spec.label} className="flex items-center justify-between text-sm text-slate-300"><span>{spec.label}</span><span className="text-slate-400">{spec.value}</span></div>)}</div></div>;
}

export function ProductActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-3">{children}</div>;
}

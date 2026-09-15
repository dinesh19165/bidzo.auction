import { LayoutGrid } from 'lucide-react';
import { useEffect, useState } from 'react';

export function CategoryIcon({ iconUrl, className = 'h-8 w-8', imageClassName = '' }: { iconUrl?: string | null; className?: string; imageClassName?: string }) {
  const source = iconUrl?.trim() || null;
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [source]);

  if (!source || imageFailed) {
    return <LayoutGrid aria-hidden="true" className={className} />;
  }

  return <img src={source} alt="" aria-hidden="true" onError={() => setImageFailed(true)} className={`${className} object-contain p-0 ${imageClassName}`} />;
}

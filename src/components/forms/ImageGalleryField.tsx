import { useEffect, useRef, useState } from 'react';
import { Star, X } from 'lucide-react';

export interface GalleryImage {
  id?: number | string;
  url: string;
  altText?: string | null;
}

interface Props {
  existingImages?: GalleryImage[];
  files: File[];
  onFilesChange: (files: File[]) => void;
  onRemoveExisting?: (image: GalleryImage) => void;
  onPrimaryChange?: (image: GalleryImage, index: number) => void;
  label?: string;
  disabled?: boolean;
}

const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const maxFileSize = 5 * 1024 * 1024;

export function ImageGalleryField({ existingImages = [], files, onFilesChange, onRemoveExisting, onPrimaryChange, label = 'Product images', disabled = false }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const addFiles = (selected: File[]) => {
    const valid: File[] = [];
    const nextErrors: string[] = [];
    selected.forEach((file) => {
      if (!acceptedTypes.includes(file.type)) {
        nextErrors.push(`${file.name}: use JPG, PNG, or WEBP`);
      } else if (file.size > maxFileSize) {
        nextErrors.push(`${file.name}: exceeds 5MB`);
      } else {
        valid.push(file);
      }
    });
    setErrors(nextErrors);
    if (valid.length) onFilesChange([...files, ...valid]);
  };

  const removeFile = (index: number) => {
    const next = files.filter((_, fileIndex) => fileIndex !== index);
    onFilesChange(next);
    if (primaryIndex >= existingImages.length + next.length) setPrimaryIndex(Math.max(0, existingImages.length + next.length - 1));
  };

  const allImages = [...existingImages, ...files.map((file, index) => ({ url: previews[index] || '', altText: file.name }))];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="mt-1 text-xs text-slate-400">JPG, PNG, or WEBP up to 5MB each</p>
        </div>
        <button type="button" disabled={disabled} onClick={() => inputRef.current?.click()} className="rounded-full bg-blue-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50">+ Add images</button>
        <input ref={inputRef} type="file" accept={acceptedTypes.join(',')} multiple className="hidden" disabled={disabled} onChange={(event) => { addFiles(Array.from(event.target.files || [])); event.target.value = ''; }} />
      </div>
      {errors.length > 0 && <div className="mt-3 space-y-1 text-xs text-rose-300">{errors.map((error) => <p key={error}>{error}</p>)}</div>}
      {allImages.length > 0 && (
        <div className="mt-3 flex max-w-full gap-2 overflow-x-auto pb-1">
          {allImages.map((image, index) => (
            <div key={`${image.url}-${index}`} className={`relative w-24 shrink-0 rounded-xl border p-1.5 ${primaryIndex === index ? 'border-amber-400' : 'border-white/10'}`}>
              <button type="button" className="block w-full" onClick={() => {
                if (index >= existingImages.length) {
                  const selectedFileIndex = index - existingImages.length;
                  if (selectedFileIndex > 0) {
                    const reorderedFiles = [files[selectedFileIndex], ...files.filter((_, fileIndex) => fileIndex !== selectedFileIndex)];
                    onFilesChange(reorderedFiles);
                  }
                  setPrimaryIndex(existingImages.length ? index : 0);
                } else {
                  setPrimaryIndex(index);
                }
                onPrimaryChange?.(image, index);
              }} aria-label={`Make image ${index + 1} primary`}>
                {image.url ? <img src={image.url} alt={image.altText || `Gallery image ${index + 1}`} className="h-16 w-full rounded-lg bg-slate-950 object-cover" /> : <div className="flex h-16 w-full items-center justify-center rounded-lg bg-slate-950 text-[10px] text-slate-500">Preparing preview...</div>}
                <span className={`mt-1 flex items-center justify-center gap-1 text-[10px] ${primaryIndex === index ? 'text-amber-300' : 'text-slate-500'}`}><Star className="h-3 w-3" /> {primaryIndex === index ? 'Primary' : 'Set primary'}</span>
              </button>
              {index < existingImages.length ? (
                onRemoveExisting ? <button type="button" disabled={disabled} onClick={() => onRemoveExisting(image)} className="absolute right-1 top-1 rounded-full bg-slate-950/85 p-1 text-rose-300" aria-label="Remove existing image"><X className="h-3 w-3" /></button> : null
              ) : (
                <button type="button" disabled={disabled} onClick={() => removeFile(index - existingImages.length)} className="absolute right-1 top-1 rounded-full bg-slate-950/85 p-1 text-rose-300" aria-label="Remove selected image"><X className="h-3 w-3" /></button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageGalleryField;
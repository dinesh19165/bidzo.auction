import { useEffect, useState } from 'react';
import { Film, X } from 'lucide-react';

const acceptedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

interface Props {
  file?: File | null;
  existingUrl?: string | null;
  onChange: (file: File | null) => void;
  label?: string;
  disabled?: boolean;
}

export function VideoUploadField({ file = null, existingUrl = null, onChange, label = 'Product video (optional)', disabled = false }: Props) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!file) {
      setPreviewUrl(existingUrl || '');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, existingUrl]);

  const handleFile = (selected: File | undefined) => {
    if (!selected) return;
    if (!acceptedTypes.includes(selected.type)) {
      setError('Please select a valid MP4, WebM, or MOV video.');
      return;
    }
    setError('');
    onChange(selected);
  };

  const remove = () => {
    setError('');
    onChange(null);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="mt-1 text-xs text-slate-400">MP4, WebM, or MOV</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-xs font-medium text-white has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
          <Film className="h-3.5 w-3.5" /> {file || existingUrl ? 'Replace' : 'Add video'}
          <input type="file" accept={acceptedTypes.join(',')} className="sr-only" disabled={disabled} onChange={(event) => { handleFile(event.target.files?.[0]); event.target.value = ''; }} />
        </label>
      </div>
      {error ? <p className="mt-3 text-xs text-rose-300">{error}</p> : null}
      {previewUrl ? (
        <div className="relative mt-3 max-w-xl overflow-hidden rounded-xl border border-white/10 bg-slate-950/60">
          <video src={previewUrl} controls playsInline className="aspect-video w-full max-w-full object-contain" />
          <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-slate-300">
            <span className="truncate">{file?.name || 'Existing product video'}</span>
            <button type="button" disabled={disabled} onClick={remove} className="inline-flex shrink-0 items-center gap-1 rounded-full border border-rose-400/30 px-2 py-1 text-rose-300 disabled:opacity-50" aria-label="Remove video"><X className="h-3 w-3" /> Remove</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default VideoUploadField;

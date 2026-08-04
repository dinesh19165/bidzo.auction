import React, { useRef, useState, useCallback } from 'react';

export function UploadField({ onChange, multiple = true, maxSizeMB = 5, accept = ['image/jpeg', 'image/png'] }: { onChange?: (files: File[]) => void; multiple?: boolean; maxSizeMB?: number; accept?: string[] }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});

  const validateAndAdd = useCallback((arr: File[]) => {
    const nextFiles: File[] = [];
    const nextErrors: string[] = [];
    arr.forEach((f) => {
      if (accept.length && !accept.includes(f.type)) {
        nextErrors.push(`${f.name}: invalid file type`);
        return;
      }
      if (f.size > maxSizeMB * 1024 * 1024) {
        nextErrors.push(`${f.name}: exceeds ${maxSizeMB}MB`);
        return;
      }
      nextFiles.push(f);
    });
    setErrors((e) => [...e, ...nextErrors]);
    setFiles((prev) => {
      const combined = multiple ? [...prev, ...nextFiles] : nextFiles;
      onChange?.(combined);
      // simulate progress
      nextFiles.forEach((f) => {
        setProgress((p) => ({ ...p, [f.name]: 10 }));
        setTimeout(() => setProgress((p) => ({ ...p, [f.name]: 80 })), 300);
        setTimeout(() => setProgress((p) => ({ ...p, [f.name]: 100 })), 700);
      });
      return combined;
    });
  }, [accept, maxSizeMB, multiple, onChange]);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    validateAndAdd(Array.from(list));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    validateAndAdd(Array.from(e.dataTransfer.files));
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const removeAt = (index: number) => {
    setFiles((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      onChange?.(copy);
      return copy;
    });
  };

  return (
    <div>
      <div onDrop={onDrop} onDragOver={onDragOver} className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center">
        <input ref={inputRef} type="file" multiple={multiple} accept={accept.join(',')} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        <div className="flex items-center justify-center">
          <button type="button" onClick={() => inputRef.current?.click()} className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Upload images</button>
        </div>
        <p className="mt-3 text-sm text-slate-400">Drag & drop supported — recommended 1200×800 JPEG/PNG • Max {maxSizeMB}MB</p>
      </div>

      {errors.length > 0 && (
        <div className="mt-3 space-y-1 text-sm text-rose-300">
          {errors.map((err, i) => <div key={i}>{err}</div>)}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4 grid gap-3 grid-cols-3">
          {files.map((f, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-800 p-2 relative">
              <div className="h-28 w-full overflow-hidden rounded-md bg-black/20">
                <img src={URL.createObjectURL(f)} alt={f.name} className="h-full w-full object-cover" />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs text-slate-300 truncate">{f.name}</div>
                <div className="flex gap-2">
                  <button onClick={() => removeAt(i)} className="text-xs text-rose-300">Remove</button>
                </div>
              </div>
              {progress[f.name] !== undefined && (
                <div className="absolute left-2 right-2 bottom-2 h-1 rounded-full bg-white/10">
                  <div className="h-1 rounded-full bg-emerald-400" style={{ width: `${progress[f.name]}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UploadField;

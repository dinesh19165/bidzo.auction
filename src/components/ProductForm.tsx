import React, { useEffect, useState } from 'react';

export interface ProductFormData {
  title: string;
  category: string;
  price: string;
  quantity: string;
  fields: Record<string, string>;
  description: string;
}

interface Props {
  initial?: Partial<ProductFormData>;
  categoryFields: Record<string, string[]>;
  onChange?: (data: ProductFormData) => void;
  requiredFields?: Record<string, string[]>;
  onValidate?: (isValid: boolean) => void;
}

export const ProductForm: React.FC<Props> = ({ initial, categoryFields, onChange, requiredFields, onValidate }) => {
  const [title, setTitle] = useState(initial?.title || '');
  const [category, setCategory] = useState(initial?.category || 'Electronics');
  const [price, setPrice] = useState(initial?.price || '');
  const [quantity, setQuantity] = useState(initial?.quantity || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [fields, setFields] = useState<Record<string, string>>(initial?.fields || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autosaveStatus, setAutosaveStatus] = useState('Saved');

  useEffect(() => {
    onChange?.({ title, category, price, quantity, fields, description });
  }, [title, category, price, quantity, fields, description]);

  // Simulate autosave indicator
  useEffect(() => {
    setAutosaveStatus('Autosaving...');
    const t = setTimeout(() => setAutosaveStatus('Saved'), 900);
    return () => clearTimeout(t);
  }, [title, category, price, quantity, JSON.stringify(fields), description]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Title is required';
    if (!price.trim()) next.price = 'Price is required';

    const parsedQuantity = Number(quantity);
    if (!quantity.trim()) {
      next.quantity = 'Quantity is required';
    } else if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      next.quantity = 'Quantity must be a non-negative whole number';
    }

    const req = requiredFields?.[category] ?? categoryFields[category] ?? [];
    req.forEach((f) => {
      if (!fields[f] || !fields[f].trim()) next[f] = `${f} is required`;
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  useEffect(() => {
    onValidate?.(validate());
  }, [title, category, price, quantity, JSON.stringify(fields), description]);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-slate-400">Title</label>
        <input aria-label="Product title" placeholder="e.g. MacBook Pro 16-inch (M1)" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white" />
        <div className="mt-1 text-xs text-slate-500">Keep titles concise and include brand/model for discoverability.</div>
        {errors.title && <div className="mt-1 text-sm text-rose-400">{errors.title}</div>}
      </div>

      <div>
        <label className="text-sm text-slate-400">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white">
          {Object.keys(categoryFields).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="text-sm text-slate-400">Price</label>
        <input aria-label="Price" placeholder="₹0.00" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white" />
        <div className="mt-1 text-xs text-slate-500">Enter a numeric value. Use local currency formatting (UI-only).</div>
        {errors.price && <div className="mt-1 text-sm text-rose-400">{errors.price}</div>}
      </div>

      <div>
        <label className="text-sm text-slate-400">Quantity / Stock</label>
        <input type="number" min="0" step="1" aria-label="Quantity" placeholder="e.g. 10" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white" />
        <div className="mt-1 text-xs text-slate-500">Number of pieces available for sale.</div>
        {errors.quantity && <div className="mt-1 text-sm text-rose-400">{errors.quantity}</div>}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {(categoryFields[category] || []).map((field) => (
            <div key={field}>
              <label className="text-sm text-slate-400">{field}</label>
              <input aria-label={field} placeholder={`Enter ${field}`} value={fields[field] || ''} onChange={(e) => setFields({ ...fields, [field]: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white" />
              <div className="mt-1 text-xs text-slate-500">{`Provide the ${field.toLowerCase()} for this listing.`}</div>
              {errors[field] && <div className="mt-1 text-sm text-rose-400">{errors[field]}</div>}
            </div>
        ))}
      </div>

      <div>
        <label className="text-sm text-slate-400">Description</label>
        <textarea maxLength={1000} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white" />
        <div className="mt-1 text-xs text-slate-500">{description.length}/1000 characters</div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        <div className="font-medium text-white">Preview</div>
        <div className="mt-2">{title || 'Untitled product'} • {category} • {price}</div>
        <div className="mt-2 text-sm text-slate-400">{description}</div>
      </div>

      <div className="text-sm text-slate-400">Autosave status: {autosaveStatus}</div>
    </div>
  );
};

export default ProductForm;

import React, { useEffect, useState } from 'react';
import { categoryLabel, type CategoryFieldDefinition, type CategoryRecord } from '../api/categoryApi';

export interface ProductFormData {
  title: string;
  category: string;
  price: string;
  quantity: string;
  fields: Record<string, string>;
  description: string;
  categoryId?: number | string | null;
}

interface Props {
  initial?: Partial<ProductFormData>;
  categoryFields: CategoryFieldDefinition[];
  categories?: CategoryRecord[];
  onChange?: (data: ProductFormData) => void;
  onValidate?: (isValid: boolean) => void;
}

export const ProductForm: React.FC<Props> = ({ initial, categoryFields, categories = [], onChange, onValidate }) => {
  const [title, setTitle] = useState(initial?.title || '');
  const [category, setCategory] = useState(initial?.category || categories[0]?.name || '');
  const [categoryId, setCategoryId] = useState<number | string | null>(initial?.categoryId ?? categories.find((item) => item.name === initial?.category)?.id ?? null);
  const [price, setPrice] = useState(initial?.price || '');
  const [quantity, setQuantity] = useState(initial?.quantity || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [fields, setFields] = useState<Record<string, string>>(initial?.fields || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autosaveStatus, setAutosaveStatus] = useState('Saved');

  useEffect(() => {
    onChange?.({ title, category, categoryId, price, quantity, fields, description });
  }, [title, category, categoryId, price, quantity, fields, description]);

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

    categoryFields.filter((field) => field.required).forEach((field) => {
      if (!fields[field.fieldKey]?.trim()) next[field.fieldKey] = `${field.fieldName} is required`;
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  useEffect(() => {
    onValidate?.(validate());
  }, [title, category, price, quantity, JSON.stringify(fields), description, categoryFields]);

  const updateField = (field: CategoryFieldDefinition, value: string) => setFields((current) => ({ ...current, [field.fieldKey]: value }));

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
        <select value={category} onChange={(e) => { const next = categories.find((item) => item.name === e.target.value); setCategory(e.target.value); setCategoryId(next?.id ?? null); setFields({}); }} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white">
          {categories.map((item) => <option key={String(item.id)} value={item.name}>{categoryLabel(item)}</option>)}
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
        {categoryFields.map((field) => {
          const value = fields[field.fieldKey] || '';
          const commonClass = 'mt-2 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white';
          return <div key={String(field.id)}>
            <label className="text-sm text-slate-400">{field.fieldName}{field.required ? ' *' : ''}</label>
            {field.fieldType === 'TEXTAREA' ? <textarea aria-label={field.fieldName} value={value} onChange={(event) => updateField(field, event.target.value)} className={`${commonClass} min-h-24`} /> : field.fieldType === 'SELECT' ? <select aria-label={field.fieldName} value={value} onChange={(event) => updateField(field, event.target.value)} className={commonClass}><option value="">Select {field.fieldName}</option>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select> : field.fieldType === 'BOOLEAN' ? <label className="mt-3 flex items-center gap-2 text-sm text-white"><input type="checkbox" checked={value === 'true'} onChange={(event) => updateField(field, event.target.checked ? 'true' : 'false')} /> {field.fieldName}</label> : <input aria-label={field.fieldName} type={field.fieldType === 'NUMBER' ? 'number' : field.fieldType === 'DATE' ? 'date' : 'text'} placeholder={`Enter ${field.fieldName}`} value={value} onChange={(event) => updateField(field, event.target.value)} className={commonClass} />}
            {errors[field.fieldKey] && <div className="mt-1 text-sm text-rose-400">{errors[field.fieldKey]}</div>}
          </div>;
        })}
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

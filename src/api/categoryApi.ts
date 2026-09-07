import { fetchJson } from './apiClient';

export type CategoryStatus = 'DRAFT' | 'PUBLISHED';
export type CategoryFieldType = 'TEXT' | 'NUMBER' | 'SELECT' | 'BOOLEAN' | 'DATE' | 'TEXTAREA';

export interface CategoryRecord {
  id: number | string;
  name: string;
  slug?: string;
  parentId?: number | string | null;
  status: CategoryStatus;
  featured?: boolean;
  description?: string;
  fields?: CategoryFieldDefinition[];
  [key: string]: unknown;
}

export interface CategoryFieldDefinition {
  id: number | string;
  categoryId: number | string;
  fieldName: string;
  fieldKey: string;
  fieldType: CategoryFieldType;
  required: boolean;
  displayOrder: number;
  options: string[];
}

export interface CategoryFieldRequest {
  fieldName: string;
  fieldKey: string;
  fieldType: CategoryFieldType;
  required: boolean;
  displayOrder: number;
  options?: string[];
}

export interface CategoryCreateRequest {
  name: string;
  parentId?: number | string | null;
  status?: CategoryStatus;
  featured?: boolean;
}

export interface CategoryUpdateRequest {
  name?: string;
  parentId?: number | string | null;
  status?: CategoryStatus;
  featured?: boolean;
}

interface CategoryEnvelope<T> {
  data?: T;
  content?: T;
  items?: T;
  success?: boolean;
  message?: string;
}

function unwrap<T>(response: T | CategoryEnvelope<T>, fallback: string): T {
  if (response && typeof response === 'object' && ('data' in response || 'content' in response || 'items' in response || 'success' in response)) {
    const envelope = response as CategoryEnvelope<T>;
    if (envelope.success === false) throw new Error(envelope.message || fallback);
    return (envelope.data ?? envelope.content ?? envelope.items) as T;
  }
  return response as T;
}

function records(value: unknown): CategoryRecord[] {
  if (Array.isArray(value)) return value as CategoryRecord[];
  if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>;
    for (const key of ['items', 'content', 'results', 'records', 'data']) {
      const nested = records(object[key]);
      if (nested.length > 0) return nested;
    }
  }
  return [];
}

export function normalizeCategoryStatus(value: unknown): CategoryStatus {
  return String(value ?? '').trim().toUpperCase() === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
}

function normalizeCategories(value: unknown): CategoryRecord[] {
  const seen = new Set<string>();
  const categories = records(value).map((category) => ({
    ...category,
    name: String(category.name ?? category.title ?? '').trim(),
    status: normalizeCategoryStatus(category.status),
    fields: Array.isArray(category.fields) ? category.fields.map(normalizeCategoryField) : undefined,
  })).filter((category) => {
    const name = category.name;
    const key = name.toLowerCase();
    if (!name || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const ordered: CategoryRecord[] = [];
  const addChildren = (parentId: number | string | null) => {
    categories.filter((category) => parentId === null ? category.parentId === undefined || category.parentId === null || category.parentId === '' : String(category.parentId) === String(parentId)).forEach((category) => {
      ordered.push(category);
      addChildren(category.id);
    });
  };
  addChildren(null);
  categories.filter((category) => !ordered.includes(category)).forEach((category) => ordered.push(category));
  return ordered;
}

export function categoryLabel(category: CategoryRecord): string {
  return category.parentId === undefined || category.parentId === null || category.parentId === '' ? category.name : `  - ${category.name}`;
}

function normalizeFieldType(value: unknown): CategoryFieldType {
  const type = String(value ?? '').trim().toUpperCase();
  return ['TEXT', 'NUMBER', 'SELECT', 'BOOLEAN', 'DATE', 'TEXTAREA'].includes(type) ? type as CategoryFieldType : 'TEXT';
}

function normalizeCategoryField(value: CategoryFieldDefinition): CategoryFieldDefinition {
  return {
    ...value,
    fieldName: String(value.fieldName ?? '').trim(),
    fieldKey: String(value.fieldKey ?? value.fieldName ?? '').trim(),
    fieldType: normalizeFieldType(value.fieldType),
    required: Boolean(value.required),
    displayOrder: Number(value.displayOrder ?? 0),
    options: Array.isArray(value.options) ? value.options.map(String).filter(Boolean) : [],
  };
}

let categoriesRequest: Promise<CategoryRecord[]> | null = null;

export function getCategories(): Promise<CategoryRecord[]> {
  if (categoriesRequest) return categoriesRequest;
  categoriesRequest = fetchJson<unknown>('/api/categories/list', { method: 'GET' }, false)
    .then((response) => normalizeCategories(unwrap(response, 'Unable to load categories.')))
    .catch((error) => {
      categoriesRequest = null;
      throw error;
    });
  return categoriesRequest;
}

function invalidateCategories(): void {
  categoriesRequest = null;
}

export async function createCategory(data: CategoryCreateRequest): Promise<CategoryRecord> {
  const payload: CategoryCreateRequest = { ...data, name: data.name.trim() };
  if (import.meta.env.DEV) console.debug('[Bidzo categories] create category request', payload);
  const created = unwrap(await fetchJson<CategoryRecord | CategoryEnvelope<CategoryRecord>>('/api/categories', { method: 'POST', body: JSON.stringify(payload) }), 'Failed to create category');
  invalidateCategories();
  return created;
}

export async function updateCategory(id: number | string, data: CategoryUpdateRequest): Promise<CategoryRecord> {
  const payload: CategoryUpdateRequest = { ...data, ...(data.name === undefined ? {} : { name: data.name.trim() }) };
  if (import.meta.env.DEV) console.debug('[Bidzo categories] update category request', { categoryId: id, ...payload });
  const updated = unwrap(await fetchJson<CategoryRecord | CategoryEnvelope<CategoryRecord>>(`/api/categories/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) }), 'Failed to update category');
  invalidateCategories();
  return updated;
}

export async function deleteCategory(id: number | string): Promise<void> {
  await fetchJson<unknown>(`/api/categories/${encodeURIComponent(id)}`, { method: 'DELETE' });
  invalidateCategories();
}

export async function updateCategoryFeatured(id: number | string, featured: boolean): Promise<CategoryRecord> {
  const updated = unwrap(await fetchJson<CategoryRecord | CategoryEnvelope<CategoryRecord>>(`/api/categories/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ featured }) }), 'Failed to update category');
  invalidateCategories();
  return updated;
}

export async function getCategory(id: number | string): Promise<CategoryRecord> {
  return unwrap(await fetchJson<CategoryRecord | CategoryEnvelope<CategoryRecord>>(`/api/categories/${encodeURIComponent(id)}`, { method: 'GET' }), 'Failed to load category');
}

export async function getCategoryFields(categoryId: number | string): Promise<CategoryFieldDefinition[]> {
  const response = await fetchJson<unknown>(`/api/categories/${encodeURIComponent(categoryId)}/fields`, { method: 'GET' });
  const value = unwrap(response, 'Unable to load category fields.');
  const fields = Array.isArray(value) ? value : (value && typeof value === 'object' && Array.isArray((value as { fields?: unknown[] }).fields) ? (value as { fields: unknown[] }).fields : []);
  return fields.filter((field): field is CategoryFieldDefinition => Boolean(field && typeof field === 'object')).map(normalizeCategoryField).sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function createCategoryField(categoryId: number | string, data: CategoryFieldRequest): Promise<CategoryFieldDefinition> {
  const response = await fetchJson<CategoryFieldDefinition | CategoryEnvelope<CategoryFieldDefinition>>(`/api/categories/${encodeURIComponent(categoryId)}/fields`, { method: 'POST', body: JSON.stringify(data) });
  return normalizeCategoryField(unwrap(response, 'Failed to create category field'));
}

export async function updateCategoryField(categoryId: number | string, fieldId: number | string, data: CategoryFieldRequest): Promise<CategoryFieldDefinition> {
  const response = await fetchJson<CategoryFieldDefinition | CategoryEnvelope<CategoryFieldDefinition>>(`/api/categories/${encodeURIComponent(categoryId)}/fields/${encodeURIComponent(fieldId)}`, { method: 'PUT', body: JSON.stringify(data) });
  return normalizeCategoryField(unwrap(response, 'Failed to update category field'));
}

export async function deleteCategoryField(categoryId: number | string, fieldId: number | string): Promise<void> {
  await fetchJson<unknown>(`/api/categories/${encodeURIComponent(categoryId)}/fields/${encodeURIComponent(fieldId)}`, { method: 'DELETE' });
}

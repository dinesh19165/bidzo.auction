import { fetchBlob, fetchJson } from './apiClient';

export interface CmsRecord { id: number | string; status: string; [key: string]: unknown; }
export interface CmsCounts { [key: string]: number; }
type Envelope<T> = { data?: T; content?: T; items?: T; success?: boolean; message?: string };

function unwrap<T>(response: T | Envelope<T>, fallback: string): T {
  if (response && typeof response === 'object' && ('data' in response || 'content' in response || 'items' in response || 'success' in response)) {
    const envelope = response as Envelope<T>;
    if (envelope.success === false) throw new Error(envelope.message || fallback);
    return (envelope.data ?? envelope.content ?? envelope.items) as T;
  }
  return response as T;
}

function listValue<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of ['items', 'content', 'results', 'records', 'data']) if (Array.isArray(record[key])) return record[key] as T[];
  }
  return [];
}

async function list<T extends CmsRecord>(path: string, query = ''): Promise<T[]> {
  return listValue<T>(unwrap(await fetchJson<unknown>(`${path}${query}`), `Failed to load ${path}`));
}
async function one<T>(path: string, method: string, body?: unknown): Promise<T> {
  const response = await fetchJson<unknown>(path, { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  return unwrap<T>(response as T | Envelope<T>, `Failed to ${method === 'POST' ? 'create' : method === 'PUT' ? 'update' : 'load'} CMS record`);
}
const remove = (path: string) => fetchJson(path, { method: 'DELETE' }).then(() => undefined);
const resource = (path: string) => ({
  list: (query?: string) => list<CmsRecord>(path, query || ''), get: (id: number | string) => one<CmsRecord>(`${path}/${encodeURIComponent(id)}`, 'GET'),
  create: (data: Record<string, unknown>) => one<CmsRecord>(path, 'POST', data), update: (id: number | string, data: Record<string, unknown>) => one<CmsRecord>(`${path}/${encodeURIComponent(id)}`, 'PUT', data),
  delete: (id: number | string) => remove(`${path}/${encodeURIComponent(id)}`), status: (id: number | string, status: string) => one<CmsRecord>(`${path}/${encodeURIComponent(id)}/status`, 'PATCH', { status }),
});

export const getBanners = (query?: string) => resource('/api/admin/cms/banners').list(query); export const getBanner = (id: number | string) => resource('/api/admin/cms/banners').get(id); export const createBanner = (data: Record<string, unknown>) => resource('/api/admin/cms/banners').create(data); export const updateBanner = (id: number | string, data: Record<string, unknown>) => resource('/api/admin/cms/banners').update(id, data); export const deleteBanner = (id: number | string) => resource('/api/admin/cms/banners').delete(id); export const updateBannerStatus = (id: number | string, status: string) => resource('/api/admin/cms/banners').status(id, status);
export const getBannerCounts = async () => unwrap(await fetchJson<unknown>('/api/admin/cms/banners/counts'), 'Failed to load banner counts') as CmsCounts;
export const getCategories = (query?: string) => resource('/api/admin/cms/categories').list(query); export const getCategory = (id: number | string) => resource('/api/admin/cms/categories').get(id); export const createCategory = (data: Record<string, unknown>) => resource('/api/admin/cms/categories').create(data); export const updateCategory = (id: number | string, data: Record<string, unknown>) => resource('/api/admin/cms/categories').update(id, data); export const deleteCategory = (id: number | string) => resource('/api/admin/cms/categories').delete(id); export const updateCategoryStatus = (id: number | string, status: string) => resource('/api/admin/cms/categories').status(id, status); export const updateCategoryFeatured = (id: number | string, featured: boolean) => one<CmsRecord>(`/api/admin/cms/categories/${encodeURIComponent(id)}/featured`, 'PATCH', { featured });
export const getCategoryCounts = async () => unwrap(await fetchJson<unknown>('/api/admin/cms/categories/counts'), 'Failed to load category counts') as CmsCounts;

const faq = resource('/api/admin/cms/faq'); export const getFaq = faq.list; export const getFaqItem = faq.get; export const createFaq = (data: Record<string, unknown>) => faq.create({ ...data, featured: data.featured === true }); export const updateFaq = (id: number | string, data: Record<string, unknown>) => faq.update(id, { ...data, featured: data.featured === true }); export const deleteFaq = faq.delete; export const updateFaqStatus = faq.status;
const blog = resource('/api/admin/cms/blog'); export const getBlogs = blog.list; export const getBlog = blog.get; export const createBlog = blog.create; export const updateBlog = blog.update; export const deleteBlog = blog.delete; export const updateBlogStatus = blog.status;
const testimonials = resource('/api/admin/cms/testimonials'); export const getTestimonials = testimonials.list; export const getTestimonial = testimonials.get; const testimonialPayload = (data: Record<string, unknown>) => ({ customerName: String(data.customerName ?? ''), customerId: data.customerId === '' || data.customerId === undefined || data.customerId === null ? null : Number(data.customerId), rating: Number(data.rating), content: String(data.content ?? ''), imageUrl: data.imageUrl === '' || data.imageUrl === undefined ? null : String(data.imageUrl), status: String(data.status ?? 'DRAFT').toUpperCase(), featured: data.featured === true }); export const createTestimonial = (data: Record<string, unknown>) => testimonials.create(testimonialPayload(data)); export const updateTestimonial = (id: number | string, data: Record<string, unknown>) => testimonials.update(id, testimonialPayload(data)); export const deleteTestimonial = testimonials.delete; export const updateTestimonialStatus = testimonials.status;
const pages = resource('/api/admin/cms/pages'); export const getPages = pages.list; export const getPage = pages.get; export const createPage = pages.create; export const updatePage = pages.update; export const deletePage = pages.delete; export const updatePageStatus = pages.status;
const newsletter = resource('/api/admin/cms/newsletter'); export const getNewsletter = newsletter.list; export const getNewsletterItem = newsletter.get; export const createNewsletter = newsletter.create; export const updateNewsletterStatus = newsletter.status; export const deleteNewsletter = newsletter.delete;
export const exportNewsletter = () => fetchBlob('/api/admin/cms/newsletter/export');
export const getCmsPages = getPages;
export const getCmsPageBySlug = (slug: string) => getPages(`?slug=${encodeURIComponent(slug)}`);

export interface PublicTestimonial {
  id: number | string;
  customerName: string;
  customerId?: number | null;
  rating: number;
  message: string;
  imageUrl?: string | null;
  status: string;
  createdAt?: string;
}

export async function getPublishedTestimonials(): Promise<PublicTestimonial[]> {
  const response = await fetchJson<unknown>('/api/cms/testimonials', { method: 'GET' }, false);
  const value = unwrap(response, 'Failed to load testimonials');
  const records = listValue<PublicTestimonial>(value);
  return records.filter((testimonial) => testimonial.status === 'PUBLISHED');
}

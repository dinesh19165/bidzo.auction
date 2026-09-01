export const API_BASE_URL = 'https://bidzo-backend.onrender.com/api';
//export const API_BASE_URL = 'http://localhost:8080/api';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getStoredAuthToken(): string | null {
  const raw = localStorage.getItem('bidzo_user');
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    const candidate =
      parsed?.token ??
      parsed?.user?.token ??
      parsed?.accessToken ??
      parsed?.jwt ??
      parsed?.authToken ??
      parsed?.data?.token ??
      parsed?.data?.accessToken ??
      null;

    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate;
    }

    return null;
  } catch {
    return null;
  }
}

export function getApiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = API_BASE_URL.replace(/\/+$/, '');

  if (normalizedPath.startsWith('/api')) {
    return `${baseUrl}${normalizedPath.replace(/^\/api/, '')}`;
  }

  return `${baseUrl}${normalizedPath}`;
}

function applyAuthHeaders(headers: Headers, token?: string | null) {
  if (!token) {
    return headers;
  }

  headers.set('Authorization', `Bearer ${token}`);
  return headers;
}

export async function fetchJson<T>(path: string, init: RequestInit = {}, useAuth = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = useAuth ? getStoredAuthToken() : null;
  applyAuthHeaders(headers, token);

  const response = await fetch(getApiUrl(path), {
    ...init,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('bidzo_user');
    throw new ApiError(response.status, 'Unauthorized');
  }
  if (response.status === 403) {
    const body = (await response.json().catch(() => null)) as any;
    throw new ApiError(response.status, body?.message || "You don't have permission to perform this action");
  }

  const body = (await response.json().catch(() => null)) as any;
  if (!response.ok) {
    throw new ApiError(response.status, body?.message || response.statusText || 'Request failed');
  }

  return body as T;
}

export async function fetchJsonWithToken<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  applyAuthHeaders(headers, token);

  const response = await fetch(getApiUrl(path), {
    ...init,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('bidzo_user');
    throw new Error('Unauthorized');
  }

  const body = (await response.json().catch(() => null)) as any;
  if (!response.ok) {
    throw new Error(body?.message || response.statusText || 'Request failed');
  }

  return body as T;
}

export async function fetchBlob(path: string, init: RequestInit = {}): Promise<Blob> {
  const headers = new Headers(init.headers);
  const token = getStoredAuthToken();
  applyAuthHeaders(headers, token);
  const response = await fetch(getApiUrl(path), { ...init, headers });
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('bidzo_user');
    throw new Error(response.status === 403 ? "You don't have permission to perform this action" : 'Unauthorized');
  }
  if (!response.ok) throw new Error(response.statusText || 'Request failed');
  return response.blob();
}

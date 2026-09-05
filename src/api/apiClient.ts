// export const API_BASE_URL =
//  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:8080/api');
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '/api' : 'https://api.bidzo.auction/api');
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

let sessionExpirationHandled = false;

type AuthExpiryDetail = {
  role?: string;
  type?: string;
};

const EXPIRED_LOGIN_ROLE_KEY = 'bidzo_expired_login_role';

export function resetAuthExpirationHandling(): void {
  sessionExpirationHandled = false;
}

export function handleUnauthorized(): void {
  const token = getStoredAuthToken();
  if (sessionExpirationHandled && !token) {
    localStorage.removeItem('bidzo_user');
    localStorage.removeItem('bidzo_vendor_profile_id');
    return;
  }

  let detail: AuthExpiryDetail = {};
  try {
    const storedUser = JSON.parse(localStorage.getItem('bidzo_user') || 'null');
    detail = { role: storedUser?.role, type: storedUser?.type };
  } catch {
    // Continue with the generic login route when stored auth data is invalid.
  }

  localStorage.removeItem('bidzo_user');
  localStorage.removeItem('bidzo_vendor_profile_id');

  if (sessionExpirationHandled || typeof window === 'undefined') {
    return;
  }

  sessionExpirationHandled = true;
  window.dispatchEvent(new CustomEvent<AuthExpiryDetail>('bidzo:session-expired', { detail }));

  if (typeof window !== 'undefined') {
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'FRANCHISE_ADMIN'].includes(detail.role || '');
    if (!isAdmin && detail.type === 'vendor') {
      sessionStorage.setItem(EXPIRED_LOGIN_ROLE_KEY, 'vendor');
    }
    window.location.replace(isAdmin ? '/admin/login' : '/login');
  }
}

export function isJwtExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    if (!payload) return false;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=');
    const decoded = JSON.parse(atob(padded));
    return typeof decoded.exp === 'number' && decoded.exp <= Math.floor(Date.now() / 1000);
  } catch {
    return false;
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
  if (useAuth && sessionExpirationHandled) {
    throw new ApiError(401, 'Unauthorized');
  }

  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = useAuth ? getStoredAuthToken() : null;
  if (useAuth && token && isJwtExpired(token)) {
    handleUnauthorized();
    throw new ApiError(401, 'Unauthorized');
  }
  applyAuthHeaders(headers, token);

  const response = await fetch(getApiUrl(path), {
    ...init,
    headers,
  });

  if (response.status === 401) {
    if (useAuth) {
      handleUnauthorized();
    }
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
  if (sessionExpirationHandled) {
    throw new Error('Unauthorized');
  }
  if (isJwtExpired(token)) {
    handleUnauthorized();
    throw new ApiError(401, 'Unauthorized');
  }

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
    if (response.status === 401) {
      handleUnauthorized();
    }
    throw new Error('Unauthorized');
  }

  const body = (await response.json().catch(() => null)) as any;
  if (!response.ok) {
    throw new Error(body?.message || response.statusText || 'Request failed');
  }

  return body as T;
}

export async function fetchBlob(path: string, init: RequestInit = {}): Promise<Blob> {
  if (sessionExpirationHandled) {
    throw new Error('Unauthorized');
  }

  const headers = new Headers(init.headers);
  const token = getStoredAuthToken();
  if (token && isJwtExpired(token)) {
    handleUnauthorized();
    throw new ApiError(401, 'Unauthorized');
  }
  applyAuthHeaders(headers, token);
  const response = await fetch(getApiUrl(path), { ...init, headers });
  if (response.status === 401 || response.status === 403) {
    if (response.status === 401) {
      handleUnauthorized();
    }
    throw new Error(response.status === 403 ? "You don't have permission to perform this action" : 'Unauthorized');
  }
  if (!response.ok) throw new Error(response.statusText || 'Request failed');
  return response.blob();
}

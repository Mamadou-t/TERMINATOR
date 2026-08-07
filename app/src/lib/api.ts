const API_BASE_URL = ((import.meta.env?.VITE_API_BASE_URL as string | undefined) || 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '');

const ACCESS_TOKEN_KEY = 'terminator_access_token';
const REFRESH_TOKEN_KEY = 'terminator_refresh_token';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  const response = await fetch(`${API_BASE_URL}/auth/connexion/rafraichir/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    clearTokens();
    return null;
  }

  const data = await response.json();
  setTokens(data.access, data.refresh || refresh);
  return data.access;
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

export async function apiRequest<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const buildHeaders = (token: string | null) => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  });

  let response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: buildHeaders(auth ? getAccessToken() : null),
  });

  if (response.status === 401 && auth) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...rest,
        headers: buildHeaders(newAccess),
      });
    }
  }

  if (!response.ok) {
    let details: unknown = null;
    try {
      details = await response.json();
    } catch {
      details = null;
    }
    throw new ApiError(
      (details as { detail?: string } | null)?.detail || 'Une erreur est survenue.',
      response.status,
      details
    );
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  return response.json();
}

export function formatApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.details && typeof error.details === 'object') {
      const messages = Object.values(error.details as Record<string, unknown>)
        .flat()
        .filter((value): value is string => typeof value === 'string');
      if (messages.length > 0) return messages.join(' ');
    }
    return error.message;
  }
  return 'Une erreur inattendue est survenue.';
}

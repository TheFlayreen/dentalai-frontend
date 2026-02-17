import Cookies from 'js-cookie';

export type RequestConfig = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003';
}

async function request<T>(path: string, config: RequestConfig = {}): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const url = path.startsWith('http')
    ? path
    : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;

  const accessToken: string | undefined = Cookies.get('accessToken');

  const response = await fetch(url, {
    ...config,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...config.headers,
    },
    credentials: 'include',
  });

  if (response.status === 401) {
    await fetch(`${getAppUrl()}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    window.location.href = '/login';
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message ?? `HTTP ${response.status}`);
  }

  return response.json();
}

export const apiClient = {
  get<T>(path: string, config?: RequestConfig) {
    return request<T>(path, { ...config, method: 'GET' });
  },

  post<T>(path: string, body?: unknown, config?: RequestConfig) {
    return request<T>(path, {
      ...config,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(path: string, body?: unknown, config?: RequestConfig) {
    return request<T>(path, {
      ...config,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(path: string, config?: RequestConfig) {
    return request<T>(path, { ...config, method: 'DELETE' });
  },
};

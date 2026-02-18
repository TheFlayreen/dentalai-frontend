import Cookies from 'js-cookie';

export type RequestConfig = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

async function request<T>(path: string, config: RequestConfig = {}): Promise<T> {
  const baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const url = path.startsWith('http')
    ? path
    : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;

  const makeRequest = async (token?: string) => {
    return fetch(url, {
      ...config,
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        ...config.headers,
      },
      credentials: 'include',
    });
  };

  let accessToken = Cookies.get('accessToken');
  console.log('accessToken: ', accessToken);
  let response = await makeRequest(accessToken);

  if (response.status === 401) {
    const refreshResponse = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!refreshResponse.ok) {
      await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');

      window.location.href = '/login';
      throw new Error('Session expired');
    }

    const { accessToken: newAccessToken } = await refreshResponse.json();
    console.log('newAccessToken: ', newAccessToken);

    Cookies.set('accessToken', newAccessToken);

    response = await makeRequest(newAccessToken);
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

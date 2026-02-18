export type RequestConfig = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
  accessToken?: string;
};

const getBaseUrl = () => process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function baseRequest<T = unknown>(
  path: string,
  config: RequestConfig = {},
): Promise<T> {
  const baseUrl = getBaseUrl().replace(/\/$/, '');
  const url = path.startsWith('http')
    ? path
    : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config.headers,
  };

  if (config.accessToken) {
    headers.Authorization = `Bearer ${config.accessToken}`;
  }

  const response = await fetch(url, {
    ...config,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('UNAUTHORIZED');
    }

    const error = await response.json().catch(() => ({ message: response.statusText }));

    throw new Error(error.message ?? `HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }

  return response.text() as unknown as T;
}

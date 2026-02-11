import { cookies } from 'next/headers';
import {redirect} from "next/navigation";

const getBaseUrl = () => process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function getAppUrl(): string {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003';
}

async function getAccessToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get('accessToken')?.value;
}

export class UnauthorizedError extends Error {
    constructor(message = 'Unauthorized') {
        super(message);
        this.name = 'UnauthorizedError';
    }
}

export type RequestConfig = Omit<RequestInit, 'headers'> & {
    headers?: Record<string, string>;
};

// async function refreshAccessToken(): Promise<string | null> {
//     const cookieStore = await cookies();
//
//     const res = await fetch(`${getBaseUrl()}/auth/refresh`, {
//         method: 'POST',
//         // headers: {
//         //     "Authorization": `Bearer ${accessToken}`,
//         //     'Content-Type': 'application/json'
//         // },
//         credentials: 'include',
//     });
//
//     if (!res.ok) return null;
//     const data = await res.json();
//     console.log("daaaaaaata", data)
//     return data.accessToken ?? null;
// }

async function request<T = unknown>(
    path: string,
    config: RequestConfig = {},
    isRetry = false
): Promise<T> {
    const baseUrl = getBaseUrl().replace(/\/$/, '');
    const url = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;

    const accessToken: string | undefined = await getAccessToken();
    console.log(`Access token: ${accessToken}`);
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...config.headers,
    };

    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
        ...config,
        headers,
        credentials: config.credentials ?? 'include',
    });
    console.log("response:", response.status)

    if (response.status === 401) {
        await fetch(`${getAppUrl()}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        redirect('/login');
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message ?? `HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
        return response.json() as Promise<T>;
    }
    return response.text() as Promise<T>;
}

export const apiClient = {
    get<T = unknown>(path: string, config?: RequestConfig) {
        return request<T>(path, { ...config, method: 'GET' });
    },

    post<T = unknown>(path: string, body?: unknown, config?: RequestConfig) {
        return request<T>(path, { ...config, method: 'POST', body: body != null ? JSON.stringify(body) : undefined });
    },

    put<T = unknown>(path: string, body?: unknown, config?: RequestConfig) {
        return request<T>(path, { ...config, method: 'PUT', body: body != null ? JSON.stringify(body) : undefined });
    },

    patch<T = unknown>(path: string, body?: unknown, config?: RequestConfig) {
        return request<T>(path, { ...config, method: 'PATCH', body: body != null ? JSON.stringify(body) : undefined });
    },

    delete<T = unknown>(path: string, config?: RequestConfig) {
        return request<T>(path, { ...config, method: 'DELETE' });
    },
};

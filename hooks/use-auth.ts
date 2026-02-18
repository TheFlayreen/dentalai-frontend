'use client';

import Cookies from 'js-cookie';

const getBackendUrl = () => process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export function useAuth() {
  const logout = async () => {
    const baseUrl = getBackendUrl();
    try {
      await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    } finally {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      window.location.href = '/login';
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    const baseUrl = getBackendUrl();
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message ?? 'Login failed');
    }

    if (data.accessToken) {
      Cookies.set('accessToken', data.accessToken);
    }

    return data;
  };

  const register = async (credentials: {
    name: string;
    surname: string;
    email: string;
    password: string;
  }) => {
    const baseUrl = getBackendUrl();
    const response = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message ?? 'Register failed');
    }

    if (data.accessToken) {
      Cookies.set('accessToken', data.accessToken);
    }

    return data;
  };

  const verifyEmail = async (credentials: { token: string }) => {
    const baseUrl = getBackendUrl();
    const response = await fetch(`${baseUrl}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message ?? 'Verify email failed');
    }

    if (data.accessToken) {
      Cookies.set('accessToken', data.accessToken);
    }

    return data;
  };

  const forgotPassword = async (credentials: { email: string }) => {
    const baseUrl = getBackendUrl();
    const response = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message ?? 'Forgot password failed');
    }

    return response.json().catch(() => ({}));
  };

  const resetPassword = async (credentials: { email: string; newPassword: string }) => {
    const baseUrl = getBackendUrl();
    const response = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message ?? 'Reset password failed');
    }

    return response.json().catch(() => ({}));
  };

  return { login, logout, register, verifyEmail, forgotPassword, resetPassword };
}

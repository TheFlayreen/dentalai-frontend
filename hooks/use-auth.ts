'use client';

export function useAuth() {
    const logout = async () => {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });
        window.location.href = '/login';
    };

    const login = async (credentials: { email: string; password: string }) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(credentials),
            credentials: 'include',
        });

        if (response.ok) {
            return await response.json();
        }

        throw new Error('Login failed');
    };

    const register = async (credentials: { name: string, surname: string, email: string; password: string }) => {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(credentials),
            credentials: 'include',
        });

        if (response.ok) {
            return await response.json();
        }

        throw new Error('Register failed');
    };

    const verifyEmail = async (credentials: { token: string }) => {
        const response = await fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(credentials),
            credentials: 'include',
        });

        if (response.ok) {
            return await response.json();
        }

        throw new Error('Verify email failed');
    };

    const forgotPassword = async (credentials: { email: string }) => {
        const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(credentials),
            credentials: 'include',
        });

        if (response.ok) {
            return await response.json();
        }

        throw new Error('Forgot password failed');
    }

    const resetPassword = async (credentials: { newPassword: string, token: string }) => {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(credentials),
            credentials: 'include',
        });

        if (response.ok) {
            return await response.json();
        }

        throw new Error('Reset password failed');
    }

    return {login, logout, register, verifyEmail, forgotPassword, resetPassword};
}

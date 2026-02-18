'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/common/app-header';
import AppSidebar from '@/components/common/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { apiClient } from '@/lib/api-client';
import { IUser } from '@/types/user.type';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      try {
        const data = await apiClient.get<IUser>('/auth/me');
        if (!cancelled) {
          setUser(data);
        }
      } catch {
        if (!cancelled) {
          router.replace('/login');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchUser();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset className="w-0 px-4 pb-6">
        <AppHeader />
        <main className="flex min-h-screen flex-col items-start justify-start mt-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

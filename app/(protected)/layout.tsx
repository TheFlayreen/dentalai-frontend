import AppHeader from '@/components/common/AppHeader';
import AppSidebar from '@/components/common/AppSidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { apiServer } from '@/lib/api-server';
import { IUser } from '@/types/user.type';
import { redirect } from 'next/navigation';

const fetchUser = async (): Promise<IUser | undefined> => {
  try {
    return await apiServer.get<IUser>('/auth/me');
  } catch (e) {
    console.log(e);
  }
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user: IUser | undefined = await fetchUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset className="w-0 px-4">
        <AppHeader />
        <main className="flex flex-col items-start justify-start min-h-screen mt-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

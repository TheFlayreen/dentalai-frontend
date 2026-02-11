import AppHeader from '@/components/common/AppHeader';
import AppSidebar from '@/components/common/AppSidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { apiClient } from '@/lib/api-client';
import { IUser } from '@/types/user.type';
import { redirect } from 'next/navigation';

const fetchUser = async (): Promise<IUser | undefined> => {
	try {
		return await apiClient.get<IUser>('/auth/me');
	} catch (e) {
		console.log(e);
	}
};

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user: IUser | undefined = await fetchUser();

	if (!user) {
		redirect('/login');
	}

	return (
		<SidebarProvider>
			<AppSidebar user={user} />
			<SidebarInset className='w-0 px-4'>
				<AppHeader />
				<main className='flex flex-col items-center justify-center min-h-screen'>
					{children}
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}

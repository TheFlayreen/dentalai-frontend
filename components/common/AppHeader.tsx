'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';

const metadata = {
  '/trainer': {
    title: 'Front Desk Training',
    description: 'Practice realistic patient conversations though text-based simulations.',
  },
  '/history': {
    title: 'Training History',
    description: 'Review past simulations and track your improvements over time.',
  },
  '/analytics': {
    title: 'Analytics',
    description: 'Track your progress and identify coaching opportunities.',
  },
  '/scenarios': {
    title: 'Scenarios',
    description: 'Create, edit and publish scenarios.',
  },
  '/users': {
    title: 'Team Activity',
    description: 'Monitor training activity across your team.',
  },
  '/default': {
    title: 'Page title',
    description: 'Page description.',
  },
};

export default function AppHeader() {
  const pathname: string = usePathname();

  const pageMeta =
    Object.entries(metadata).find(([key]) => key !== '/default' && pathname.startsWith(key))?.[1] ??
    metadata['/default'];

  const { title, description } = pageMeta;

  return (
    <header className="py-2">
      <div className="flex flex-row items-center gap-4">
        <SidebarTrigger />
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-gray-700 text-sm">{description}</p>
        </div>
      </div>
    </header>
  );
}

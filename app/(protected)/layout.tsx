import ProtectedLayoutClient from '@/components/layout/ProtectedLayoutClient';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayoutClient>{children}</ProtectedLayoutClient>;
}

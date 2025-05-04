import { Header } from '@/components/header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Annotation App | Dashboard',
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative h-screen w-screen bg-background-secondary">
      <Header />
      {children}
    </div>
  );
}

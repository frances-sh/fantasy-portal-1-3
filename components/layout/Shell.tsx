import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileDock } from './MobileDock';
import { PageTransition } from '@/components/motion/PageTransition';

export async function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="page-shell">
      <Sidebar />
      <main className="min-w-0">
        <Header />
        <PageTransition>
          <div className="page-content">{children}</div>
        </PageTransition>
      </main>
      <MobileDock />
    </div>
  );
}

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PageTransition } from '@/components/motion/PageTransition';

export async function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="page-shell">
      <Sidebar />
      <main className="min-w-0">
        <Header />
        <PageTransition>
          <div className="p-6">{children}</div>
        </PageTransition>
      </main>
    </div>
  );
}

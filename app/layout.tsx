import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fantasy Portal',
  description: 'Portal de universos com login, compartilhamento e administração.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

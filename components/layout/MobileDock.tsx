import Link from 'next/link';
import { Compass, LayoutDashboard, MessageSquare, Shield, UserCircle2 } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

export async function MobileDock() {
  const user = await getCurrentUser();

  const items = [
    { href: '/', label: 'Início', icon: Compass },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/dashboard', label: 'Painel', icon: LayoutDashboard },
    { href: '/profile', label: 'Perfil', icon: UserCircle2 },
  ];

  if (user?.role === 'ADMIN') {
    items.push({ href: '/admin', label: 'Admin', icon: Shield });
  }

  return (
    <nav className="mobile-dock lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} className="mobile-dock-item">
            <Icon size={18} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

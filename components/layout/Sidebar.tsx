import Link from 'next/link';
import { BookOpen, Globe2, LayoutDashboard, Library, MessageSquare, Shield, Sparkles, UserCircle2 } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

const items = [
  { href: '/', label: 'Início', icon: Globe2 },
  { href: '/dashboard', label: 'Painel', icon: LayoutDashboard },
  { href: '/profile', label: 'Perfil', icon: UserCircle2 },
  { href: '/chat', label: 'Comunidade', icon: MessageSquare },
];

export async function Sidebar() {
  const user = await getCurrentUser();

  return (
    <aside className="sidebar-shell hidden lg:block">
      <div className="sticky top-0 p-5">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">PU</div>
          <div>
            <p className="sidebar-brand-kicker">arquivo vivo</p>
            <h2 className="sidebar-brand-title">Portal de Universos</h2>
          </div>
        </div>

        <div className="sidebar-user-card">
          <div className="sidebar-user-avatar">
            {user?.name ? user.name[0] : 'G'}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-100">{user?.name || 'Visitante'}</p>
            <p className="text-xs text-slate-400">{user ? (user.role === 'ADMIN' ? 'Administrador' : 'Conta comum') : 'Sem sessão iniciada'}</p>
          </div>
        </div>

        <nav className="mt-5 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="sidebar-link">
                <Icon size={18} className="text-sky-300" />
                {item.label}
              </Link>
            );
          })}

          {user?.role === 'ADMIN' && (
            <Link href="/admin" className="sidebar-link">
              <Shield size={18} className="text-sky-300" /> Administração
            </Link>
          )}
        </nav>

        <div className="sidebar-section">
          <div className="sidebar-section-title"><Sparkles size={16} /> Comunidade</div>
          <p className="mt-3 text-sm leading-6 text-slate-400">Converse no chat geral, visite perfis e continue no privado quando quiser.</p>
          <Link href="/chat" className="sidebar-mini-link">Abrir comunidade</Link>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title"><Library size={16} /> Navegação rápida</div>
          <div className="mt-3 grid gap-2 text-sm">
            <Link href="/" className="sidebar-mini-link"><BookOpen size={14} /> Mundos públicos</Link>
            <Link href="/dashboard" className="sidebar-mini-link"><LayoutDashboard size={14} /> Seus conteúdos</Link>
          </div>
        </div>

        {user ? (
          <form action="/api/auth/logout" method="post" className="mt-5">
            <button className="sidebar-logout">Sair da conta</button>
          </form>
        ) : (
          <div className="mt-5 grid gap-2">
            <Link href="/login" className="sidebar-cta">Entrar</Link>
            <Link href="/register" className="sidebar-ghost">Criar conta</Link>
          </div>
        )}
      </div>
    </aside>
  );
}

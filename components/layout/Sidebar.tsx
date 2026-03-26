import Link from 'next/link';
import { BookOpen, FolderKanban, Globe, Library, MessageSquare, Shield, Sparkles, User2, Users } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

const items = [
  { href: '/', label: 'Início', icon: Sparkles },
  { href: '/dashboard', label: 'Meus universos', icon: FolderKanban },
  { href: '/profile', label: 'Meu perfil', icon: User2 },
  { href: '/#characters', label: 'Personagens', icon: Users },
  { href: '/#worlds', label: 'Mundos', icon: Globe },
  { href: '/#library', label: 'Biblioteca', icon: Library },
  { href: '/#comments', label: 'Comentários', icon: MessageSquare },
];

export async function Sidebar() {
  const user = await getCurrentUser();

  return (
    <aside className="border-r border-white/5 bg-[#1a0f12]/80 p-5 md:min-h-screen">
      <div className="panel rounded-3xl p-4">
        <div className="flex items-center gap-3 border-b border-white/8 pb-4">
          <div
            className="h-14 w-14 rounded-2xl p-[2px]"
            style={{ background: `linear-gradient(135deg, ${user?.accentColor || '#e9b86d'}66, rgba(255,255,255,.08))` }}
          >
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[14px] bg-black/60 text-lg font-black text-amber-100">
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user?.name?.[0] || 'U'
              )}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-amber-200/70">Usuário</p>
            <p className="text-base font-bold text-amber-50">{user?.name || 'Visitante'}</p>
            <p className="text-xs text-white/45">{user?.role || 'Sem sessão'}</p>
          </div>
        </div>

        <nav className="mt-5 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-white/75 transition hover:bg-white/5 hover:text-amber-100"
              >
                <Icon size={18} className="text-rose-300" />
                {item.label}
              </Link>
            );
          })}

          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link href="/admin" className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-white/75 transition hover:bg-white/5 hover:text-amber-100">
                  <Shield size={18} className="text-rose-300" /> Administração
                </Link>
              )}
              <form action="/api/auth/logout" method="post" className="pt-2">
                <button className="w-full rounded-2xl border border-amber-200/15 bg-amber-200/10 px-3 py-3 text-left text-sm font-semibold text-amber-100 transition hover:bg-amber-200/15">
                  Sair
                </button>
              </form>
            </>
          ) : (
            <div className="grid gap-2 pt-2">
              <Link href="/login" className="rounded-2xl border border-amber-200/15 bg-amber-200/10 px-3 py-3 text-center text-sm font-semibold text-amber-100">Entrar</Link>
              <Link href="/register" className="rounded-2xl border border-white/10 px-3 py-3 text-center text-sm font-semibold text-white/80">Criar conta</Link>
            </div>
          )}
        </nav>
      </div>

      <div className="mt-5 panel rounded-3xl p-4 text-sm text-white/65">
        <div className="mb-3 flex items-center gap-2 text-amber-100"><BookOpen size={16} /> Atalho rápido</div>
        <p className="leading-6">Abra o universo de demonstração e use o link público para testar a área de compartilhamento.</p>
        <Link href="/share/demo-public-link" className="mt-4 inline-flex text-sm font-semibold text-amber-200">Abrir demo pública</Link>
      </div>
    </aside>
  );
}

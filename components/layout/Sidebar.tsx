import Link from 'next/link';
import { BookOpen, Compass, LayoutDashboard, MessageCircle, Shield, Sparkles, UserRound } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

const items = [
  { href: '/', label: 'Explorar mundos', icon: Compass },
  { href: '/chat', label: 'Chat geral', icon: MessageCircle },
  { href: '/dashboard', label: 'Meu painel', icon: LayoutDashboard },
  { href: '/profile', label: 'Meu perfil', icon: UserRound },
];

export async function Sidebar() {
  const user = await getCurrentUser();

  return (
    <aside className="border-r border-white/8 bg-black/25 px-4 py-5 backdrop-blur-xl md:sticky md:top-0 md:h-screen">
      <div className="panel rounded-[30px] p-4">
        <div className="flex items-center gap-3 border-b border-white/8 pb-4">
          <div className="h-14 w-14 rounded-2xl bg-[linear-gradient(135deg,rgba(65,223,255,.7),rgba(176,104,255,.5))] p-[2px]">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-black/75 text-lg font-black text-white">FP</div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/70">Portal vivo</p>
            <p className="text-base font-bold text-white">Fantasy Portal</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 border-b border-white/8 pb-4">
          <div
            className="h-14 w-14 rounded-2xl p-[2px]"
            style={{ background: `linear-gradient(135deg, ${user?.accentColor || '#63d7ff'}66, rgba(255,255,255,.08))` }}
          >
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[14px] bg-black/60 text-lg font-black text-white">
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user?.name?.[0] || 'U'
              )}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/70">Sessão</p>
            <p className="text-base font-bold text-white">{user?.name || 'Visitante'}</p>
            <p className="text-xs text-white/45">{user?.role || 'Sem sessão'}</p>
          </div>
        </div>

        <nav className="mt-5 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-white/75 transition hover:bg-white/5 hover:text-cyan-100">
                <Icon size={18} className="text-cyan-300" />
                {item.label}
              </Link>
            );
          })}

          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link href="/admin" className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-white/75 transition hover:bg-white/5 hover:text-cyan-100">
                  <Shield size={18} className="text-cyan-300" /> Administração
                </Link>
              )}
              <form action="/api/auth/logout" method="post" className="pt-2">
                <button className="w-full rounded-2xl border border-cyan-200/15 bg-cyan-200/10 px-3 py-3 text-left text-sm font-semibold text-cyan-100 transition hover:bg-cyan-200/15">
                  Sair
                </button>
              </form>
            </>
          ) : (
            <div className="grid gap-2 pt-2">
              <Link href="/login" className="rounded-2xl border border-cyan-200/15 bg-cyan-200/10 px-3 py-3 text-center text-sm font-semibold text-cyan-100">Entrar</Link>
              <Link href="/register" className="rounded-2xl border border-white/10 px-3 py-3 text-center text-sm font-semibold text-white/80">Criar conta</Link>
            </div>
          )}
        </nav>
      </div>

      <div className="mt-5 panel rounded-3xl p-4 text-sm text-white/65">
        <div className="mb-3 flex items-center gap-2 text-cyan-100"><Sparkles size={16} /> Agora com comunidade</div>
        <p className="leading-6">Use o chat geral para conhecer autores, abrir perfis e iniciar conversas privadas sem depender de um mundo específico.</p>
        <Link href="/chat" className="mt-4 inline-flex text-sm font-semibold text-cyan-200">Abrir chat geral</Link>
      </div>

      <div className="mt-5 panel rounded-3xl p-4 text-sm text-white/65">
        <div className="mb-3 flex items-center gap-2 text-cyan-100"><BookOpen size={16} /> Mundo demo</div>
        <p className="leading-6">O universo de demonstração continua público para teste de perfil, edição e visualização.</p>
        <Link href="/share/demo-public-link" className="mt-4 inline-flex text-sm font-semibold text-cyan-200">Abrir demo pública</Link>
      </div>
    </aside>
  );
}

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

export default async function PublicUserPage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      universes: {
        where: { visibility: 'PUBLIC' },
        orderBy: { updatedAt: 'desc' },
        include: {
          characters: true,
          loreEntries: true,
        },
      },
      globalMessages: { orderBy: { createdAt: 'desc' }, take: 6 },
    },
  });

  if (!user) return notFound();

  return (
    <Shell>
      <div className="grid gap-6 xl:grid-cols-[1.16fr_.84fr]">
        <section className="panel overflow-hidden rounded-[34px]">
          <div className="relative h-72 border-b border-white/8 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(135deg, ${user.accentColor}66, rgba(0,0,0,.65)), url('${user.bannerUrl || '/uploads/demo-banner.svg'}')` }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/80" />
            <div className="absolute bottom-6 left-6 flex items-end gap-5">
              <div className="h-28 w-28 overflow-hidden rounded-[30px] border border-white/15 bg-black/40 p-1">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[24px] bg-black/40 text-3xl font-black text-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" /> : user.name[0]}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/65">Perfil público</p>
                <h1 className="mt-2 text-4xl font-black text-white">{user.name}</h1>
                <p className="mt-3 max-w-3xl leading-7 text-white/75">{user.bio || 'Esse autor ainda não preencheu a bio pública.'}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-3">
            <div className="rounded-[26px] border border-white/8 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-white/45">Universos públicos</p>
              <p className="mt-2 text-3xl font-black text-white">{user.universes.length}</p>
            </div>
            <div className="rounded-[26px] border border-white/8 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-white/45">Mensagens recentes</p>
              <p className="mt-2 text-3xl font-black text-white">{user.globalMessages.length}</p>
            </div>
            <div className="rounded-[26px] border border-white/8 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-white/45">Entrou em</p>
              <p className="mt-2 text-base font-semibold text-white">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </section>

        <aside className="grid gap-6">
          <section className="panel rounded-[32px] p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/60">Conexão direta</p>
            <h2 className="mt-2 text-2xl font-black text-white">Falar com {user.name}</h2>
            <p className="mt-3 leading-7 text-white/60">Você pode chamar esse autor no privado ou ir vendo seus mundos públicos antes de iniciar a conversa.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {currentUser && currentUser.id !== user.id ? <Button href={`/chat/private/${user.id}`}>Abrir chat privado</Button> : <Button href="/chat">Ir ao chat geral</Button>}
              <Button href="/chat" className="bg-white/5">Voltar ao chat</Button>
            </div>
          </section>
        </aside>
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {user.universes.map((universe) => (
          <Link key={universe.id} href={`/universes/${universe.slug}`} className="panel group overflow-hidden rounded-[30px] border border-white/8">
            <div className="relative h-48 bg-gradient-to-r from-cyan-600/15 via-violet-400/10 to-black">
              <div className="card-image-zoom absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: `url('${universe.coverUrl || universe.bannerUrl || '/uploads/demo-cover.svg'}')` }} />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-white">{universe.title}</h3>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/65">{universe.visibility}</span>
              </div>
              <p className="mt-3 line-clamp-3 leading-7 text-white/60">{universe.description}</p>
              <div className="mt-4 flex gap-4 text-sm text-white/45">
                <span>{universe.characters.length} personagens</span>
                <span>{universe.loreEntries.length} curiosidades</span>
              </div>
            </div>
          </Link>
        ))}
        {user.universes.length === 0 && <p className="text-white/50">Esse autor ainda não compartilhou mundos publicamente.</p>}
      </section>
    </Shell>
  );
}

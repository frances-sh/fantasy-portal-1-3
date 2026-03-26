import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const share = await prisma.shareLink.findUnique({
    where: { token },
    include: {
      universe: {
        include: {
          owner: true,
          characters: true,
          timeline: { orderBy: { orderIndex: 'asc' } },
        },
      },
    },
  });

  if (!share) return notFound();
  if (share.expiresAt && share.expiresAt < new Date()) return notFound();

  return (
    <main className="mx-auto max-w-5xl p-6 md:p-10">
      <div className="panel overflow-hidden rounded-[36px]">
        <div className="relative h-64 bg-gradient-to-r from-orange-800/50 via-amber-400/20 to-black">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-45"
            style={{ backgroundImage: `url('${share.universe.bannerUrl || '/uploads/demo-banner.svg'}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
        </div>
        <div className="p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/60">Compartilhamento público</p>
          <h1 className="fantasy-title mt-3 text-4xl font-black text-amber-50">{share.universe.title}</h1>
          <p className="mt-4 max-w-3xl leading-7 text-white/65">{share.universe.description}</p>
          <div className="mt-5 text-sm text-white/45">Autor: {share.universe.owner.name} · Criado em {formatDate(share.createdAt)}</div>

          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[28px] border border-white/8 bg-black/20 p-5">
              <h2 className="text-2xl font-bold text-amber-50">Personagens</h2>
              <div className="mt-4 space-y-3">
                {share.universe.characters.map((character) => (
                  <div key={character.id} className="rounded-3xl border border-white/8 p-4">
                    <p className="font-semibold text-amber-100">{character.name}</p>
                    <p className="mt-2 text-white/60">{character.summary}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[28px] border border-white/8 bg-black/20 p-5">
              <h2 className="text-2xl font-bold text-amber-50">Linha do tempo</h2>
              <div className="mt-4 space-y-3">
                {share.universe.timeline.map((entry) => (
                  <div key={entry.id} className="rounded-3xl border border-white/8 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-amber-200/60">{entry.centuryLabel}</p>
                    <p className="mt-2 font-semibold text-white">{entry.title}</p>
                    <p className="mt-2 text-white/60">{entry.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

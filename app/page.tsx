import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

export default async function HomePage() {
  const universes = await prisma.universe.findMany({
    where: { visibility: 'PUBLIC' },
    include: {
      owner: { select: { name: true } },
      characters: true,
      timeline: { orderBy: { orderIndex: 'asc' } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const featured = universes[0];

  return (
    <Shell>
      <section className="grid gap-6">
        {featured && (
          <div className="panel hero-banner gold-line rounded-[32px] border p-0">
            <div className="relative h-[240px] overflow-hidden rounded-t-[32px] bg-gradient-to-r from-orange-700/60 via-amber-400/30 to-black">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,210,120,.35),transparent_25%),linear-gradient(120deg,rgba(14,10,22,.6),rgba(14,10,22,.1))]" />
              <div
                className="absolute inset-0 bg-cover bg-center opacity-45"
                style={{ backgroundImage: `url('${featured.bannerUrl || '/uploads/demo-banner.svg'}')` }}
              />
            </div>
            <div className="relative z-10 -mt-10 grid gap-4 p-6 md:grid-cols-[1.6fr_.8fr] md:p-8">
              <div className="rounded-[28px] bg-black/80 p-6 shadow-2xl shadow-black/40">
                <p className="text-xs uppercase tracking-[0.35em] text-amber-200/65">Universo em destaque</p>
                <h2 className="fantasy-title mt-3 text-3xl font-black text-amber-50 md:text-5xl">{featured.title}</h2>
                <div className="mt-4 h-px w-full bg-gradient-to-r from-amber-300/70 to-transparent" />
                <p className="mt-4 max-w-3xl leading-7 text-white/65">{featured.description}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button href={`/universes/${featured.slug}`}>Abrir universo</Button>
                  <Button href="/dashboard" className="bg-white/5">Criar o meu</Button>
                </div>
              </div>
              <div className="panel rounded-[28px] p-5">
                <p className="text-sm font-semibold text-amber-100">Resumo</p>
                <div className="mt-4 grid gap-4 text-sm text-white/65">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-amber-200/55">Autor</div>
                    <div className="mt-1 text-base text-white/90">{featured.owner.name}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-amber-200/55">Atualizado</div>
                    <div className="mt-1 text-base text-white/90">{formatDate(featured.updatedAt)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-amber-200/55">Personagens</div>
                    <div className="mt-1 text-base text-white/90">{featured.characters.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <section id="worlds" className="grid gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200/60">Coleção pública</p>
              <h3 className="mt-2 text-2xl font-bold">Mundos compartilhados</h3>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {universes.map((universe) => (
              <Link key={universe.id} href={`/universes/${universe.slug}`} className="group panel overflow-hidden rounded-[28px] border border-white/8">
                <div className="relative h-52 overflow-hidden bg-gradient-to-r from-rose-900/40 via-amber-700/20 to-black">
                  <div
                    className="card-image-zoom absolute inset-0 bg-cover bg-center opacity-50"
                    style={{ backgroundImage: `url('${universe.coverUrl || universe.bannerUrl || '/uploads/demo-cover.svg'}')` }}
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-xl font-bold text-amber-50">{universe.title}</h4>
                    <span className="rounded-full border border-amber-200/20 px-3 py-1 text-xs text-amber-100/80">{universe.visibility}</span>
                  </div>
                  <p className="mt-3 line-clamp-3 leading-6 text-white/60">{universe.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </Shell>
  );
}

import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

export default async function HomePage() {
  const universes = await prisma.universe.findMany({
    where: { visibility: 'PUBLIC' },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true, accentColor: true } },
      characters: true,
      timeline: { orderBy: { orderIndex: 'asc' } },
      loreEntries: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  const featured = universes[0];

  return (
    <Shell>
      <section className="grid gap-6">
        {featured && (
          <div className="panel hero-banner rounded-[32px] border p-0">
            <div className="relative h-[260px] overflow-hidden rounded-t-[32px] bg-gradient-to-r from-cyan-700/30 via-violet-400/18 to-black">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,215,255,.35),transparent_25%),linear-gradient(120deg,rgba(14,10,22,.6),rgba(14,10,22,.12))]" />
              <div className="absolute inset-0 bg-cover bg-center opacity-45" style={{ backgroundImage: `url('${featured.bannerUrl || '/uploads/demo-banner.svg'}')` }} />
            </div>
            <div className="relative z-10 -mt-12 grid gap-4 p-6 md:grid-cols-[1.6fr_.8fr] md:p-8">
              <div className="frost-panel rounded-[28px] p-6 shadow-2xl shadow-black/40">
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/65">Universo em destaque</p>
                <h2 className="fantasy-title mt-3 text-3xl font-black text-white md:text-5xl">{featured.title}</h2>
                <div className="mt-4 h-px w-full bg-gradient-to-r from-cyan-300/70 to-transparent" />
                <p className="mt-4 max-w-3xl leading-7 text-white/68">{featured.description}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button href={`/universes/${featured.slug}`}>Abrir universo</Button>
                  <Button href={`/users/${featured.owner.id}`} className="bg-white/5">Ver autor</Button>
                  <Button href="/chat" className="bg-cyan-400/10 border-cyan-200/15 text-cyan-50">Entrar no chat geral</Button>
                </div>
              </div>
              <div className="panel rounded-[28px] p-5">
                <p className="text-sm font-semibold text-cyan-100">Resumo</p>
                <div className="mt-4 grid gap-4 text-sm text-white/65">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/55">Autor</div>
                    <Link href={`/users/${featured.owner.id}`} className="mt-1 block text-base text-white/90 transition hover:text-cyan-200">{featured.owner.name}</Link>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/55">Atualizado</div>
                    <div className="mt-1 text-base text-white/90">{formatDate(featured.updatedAt)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/55">Personagens</div>
                    <div className="mt-1 text-base text-white/90">{featured.characters.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          {[
            ['Perfis públicos', 'Entre nos perfis dos autores, veja bio, estilo e mundos compartilhados.'],
            ['Chat geral', 'A antiga área de comentários virou um ponto central de conversa para todo o site.'],
            ['Chat privado', 'Achou alguém interessante? Abra o perfil e continue a conversa só com essa pessoa.'],
          ].map(([title, desc]) => (
            <div key={title} className="panel rounded-[28px] p-5">
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <p className="mt-3 leading-7 text-white/60">{desc}</p>
            </div>
          ))}
        </section>

        <section id="worlds" className="grid gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/60">Coleção pública</p>
              <h3 className="mt-2 text-2xl font-bold text-white">Mundos compartilhados</h3>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {universes.map((universe) => (
              <Link key={universe.id} href={`/universes/${universe.slug}`} className="group panel overflow-hidden rounded-[28px] border border-white/8">
                <div className="relative h-52 overflow-hidden bg-gradient-to-r from-cyan-900/35 via-violet-700/12 to-black">
                  <div className="card-image-zoom absolute inset-0 bg-cover bg-center opacity-55" style={{ backgroundImage: `url('${universe.coverUrl || universe.bannerUrl || '/uploads/demo-cover.svg'}')` }} />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-xl font-bold text-white">{universe.title}</h4>
                    <span className="rounded-full border border-cyan-200/20 px-3 py-1 text-xs text-cyan-100/80">{universe.visibility}</span>
                  </div>
                  <p className="mt-3 line-clamp-3 leading-6 text-white/60">{universe.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/45">
                    <Link href={`/users/${universe.owner.id}`} className="text-cyan-200 transition hover:text-white">{universe.owner.name}</Link>
                    <span>•</span>
                    <span>{universe.characters.length} personagens</span>
                    <span>•</span>
                    <span>{universe.loreEntries.length} curiosidades</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </Shell>
  );
}

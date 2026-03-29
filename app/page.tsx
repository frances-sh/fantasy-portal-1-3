import Link from 'next/link';
import { MessageSquareMore, Sparkles, Users2 } from 'lucide-react';
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
          <div className="hero-shell">
            <div className="hero-visual" style={{ backgroundImage: `linear-gradient(180deg, rgba(10,14,24,.2), rgba(10,14,24,.82)), url('${featured.bannerUrl || '/uploads/demo-banner.svg'}')` }} />
            <div className="hero-content-grid">
              <div className="hero-card-main">
                <p className="hero-kicker">Destaque da semana</p>
                <h2 className="hero-title">{featured.title}</h2>
                <p className="hero-description">{featured.description}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button href={`/universes/${featured.slug}`}>Abrir universo</Button>
                  <Button href={`/users/${featured.owner.id}`} className="bg-white/5 text-white/85">Ver perfil do autor</Button>
                  <Button href="/chat" className="bg-sky-500/10 border-sky-400/20 text-sky-100">Entrar na comunidade</Button>
                </div>
              </div>

              <div className="hero-card-side">
                <div>
                  <div className="hero-meta-label">Criado por</div>
                  <Link href={`/users/${featured.owner.id}`} className="hero-meta-value hover:text-sky-300">{featured.owner.name}</Link>
                </div>
                <div>
                  <div className="hero-meta-label">Última atualização</div>
                  <div className="hero-meta-value">{formatDate(featured.updatedAt)}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="hero-stat-box">
                    <span className="hero-stat-number">{featured.characters.length}</span>
                    <span className="hero-stat-label">personagens</span>
                  </div>
                  <div className="hero-stat-box">
                    <span className="hero-stat-number">{featured.loreEntries.length}</span>
                    <span className="hero-stat-label">curiosidades</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { title: 'Perfis que conectam', desc: 'Entre no perfil de autores, veja bio, estilo visual e os mundos que cada um publicou.', icon: Users2 },
            { title: 'Comunidade viva', desc: 'O antigo campo de comentários virou um chat geral mais limpo, mais rápido e melhor de acompanhar.', icon: MessageSquareMore },
            { title: 'Atualização constante', desc: 'Mundos, curiosidades, linhas do tempo e personagens podem crescer e mudar com o tempo.', icon: Sparkles },
          ].map(({ title, desc, icon: Icon }) => (
            <div key={title} className="feature-card">
              <div className="feature-icon"><Icon size={18} /></div>
              <h3 className="text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 leading-7 text-slate-300/80">{desc}</p>
            </div>
          ))}
        </section>

        <section id="worlds" className="grid gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="header-kicker">coleção pública</p>
              <h3 className="text-2xl font-semibold text-white">Mundos compartilhados</h3>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {universes.map((universe) => (
              <Link key={universe.id} href={`/universes/${universe.slug}`} className="world-card group">
                <div className="world-card-cover">
                  <div className="card-image-zoom absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url('${universe.coverUrl || universe.bannerUrl || '/uploads/demo-cover.svg'}')` }} />
                </div>
                <div className="world-card-body">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-xl font-semibold text-white">{universe.title}</h4>
                      <p className="mt-3 line-clamp-3 leading-7 text-slate-300/78">{universe.description}</p>
                    </div>
                    <span className="world-chip">{universe.visibility}</span>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                    <Link href={`/users/${universe.owner.id}`} className="text-sky-300 transition hover:text-white">{universe.owner.name}</Link>
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

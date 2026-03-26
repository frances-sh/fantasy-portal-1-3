import { notFound } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { prisma } from '@/lib/prisma';

export default async function UniversePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const universe = await prisma.universe.findUnique({
    where: { slug },
    include: {
      owner: { select: { name: true } },
      characters: true,
      timeline: { orderBy: { orderIndex: 'asc' } },
      library: true,
      comments: { include: { author: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!universe) return notFound();

  return (
    <Shell>
      <div className="grid gap-6">
        <section className="panel overflow-hidden rounded-[32px]">
          <div className="relative h-64 bg-gradient-to-r from-orange-700/60 via-amber-300/15 to-black">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-45"
              style={{ backgroundImage: `url('${universe.bannerUrl || '/uploads/demo-banner.svg'}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90" />
          </div>
          <div className="relative -mt-16 p-6 md:p-8">
            <div className="max-w-4xl rounded-[30px] bg-black/75 p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200/65">Arquivo central</p>
              <h1 className="fantasy-title mt-3 text-3xl font-black text-amber-50 md:text-5xl">{universe.title}</h1>
              <p className="mt-4 leading-7 text-white/65">{universe.description}</p>
              <p className="mt-5 text-sm text-white/45">Criado por {universe.owner.name}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div className="grid gap-6">
            <div className="panel rounded-[30px] p-6">
              <h2 className="text-2xl font-bold text-amber-50">Linha do tempo</h2>
              <div className="mt-5 space-y-4">
                {universe.timeline.map((entry) => (
                  <div key={entry.id} className="rounded-3xl border border-white/8 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-amber-200/60">{entry.centuryLabel}</p>
                    <h3 className="mt-2 text-lg font-bold">{entry.title}</h3>
                    <p className="mt-2 leading-7 text-white/60">{entry.content}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel rounded-[30px] p-6" id="comments">
              <h2 className="text-2xl font-bold text-amber-50">Comentários</h2>
              <div className="mt-5 space-y-4">
                {universe.comments.map((comment) => (
                  <div key={comment.id} className="rounded-3xl border border-white/8 bg-black/20 p-4">
                    <p className="font-semibold text-amber-100">{comment.author.name}</p>
                    <p className="mt-2 leading-7 text-white/65">{comment.content}</p>
                  </div>
                ))}
                {universe.comments.length === 0 && <p className="text-white/50">Ainda não há comentários.</p>}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="panel rounded-[30px] p-6" id="characters">
              <h2 className="text-2xl font-bold text-amber-50">Personagens</h2>
              <div className="mt-5 grid gap-4">
                {universe.characters.map((character) => (
                  <div key={character.id} className="rounded-3xl border border-white/8 bg-black/20 p-4">
                    <h3 className="text-lg font-bold text-amber-100">{character.name}</h3>
                    <p className="mt-2 text-white/60">{character.summary}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.25em] text-white/40">{character.tags}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel rounded-[30px] p-6" id="library">
              <h2 className="text-2xl font-bold text-amber-50">Biblioteca</h2>
              <div className="mt-5 grid gap-4">
                {universe.library.map((item) => (
                  <a key={item.id} href={item.fileUrl} className="rounded-3xl border border-white/8 bg-black/20 p-4 transition hover:border-amber-200/20">
                    <p className="text-lg font-semibold text-amber-100">{item.title}</p>
                    <p className="mt-1 text-sm text-white/50">{item.type}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}

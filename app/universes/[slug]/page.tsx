import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

export default async function UniversePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [universe, currentUser, allUsers] = await Promise.all([
    prisma.universe.findUnique({
      where: { slug },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true, accentColor: true, bio: true } },
        characters: { orderBy: { updatedAt: 'desc' } },
        timeline: { orderBy: [{ orderIndex: 'asc' }, { updatedAt: 'desc' }] },
        loreEntries: { orderBy: [{ orderIndex: 'asc' }, { updatedAt: 'desc' }] },
        library: true,
      },
    }),
    getCurrentUser(),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  if (!universe) return notFound();

  const canEdit = !!currentUser && (currentUser.role === 'ADMIN' || currentUser.id === universe.ownerId);
  const returnTo = `/universes/${universe.slug}`;

  if (universe.visibility === 'PRIVATE' && !canEdit) redirect('/login');

  return (
    <Shell>
      <div className="grid gap-6">
        <section className="panel overflow-hidden rounded-[34px] world-showcase">
          <div className="relative h-80 bg-gradient-to-r from-fuchsia-700/45 via-cyan-500/10 to-black">
            <div className="absolute inset-0 bg-cover bg-center opacity-45" style={{ backgroundImage: `url('${universe.bannerUrl || '/uploads/demo-banner.svg'}')` }} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/90" />
          </div>
          <div className="relative -mt-20 p-6 md:p-8">
            <div className="frost-panel max-w-5xl rounded-[32px] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/65">Arquivo central do mundo</p>
                  <h1 className="fantasy-title mt-3 text-3xl font-black text-white md:text-5xl">{universe.title}</h1>
                  <p className="mt-4 max-w-4xl leading-7 text-white/68">{universe.description}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/55">
                    <span>Criado por</span>
                    <Link href={`/users/${universe.owner.id}`} className="font-semibold text-cyan-200 transition hover:text-white">{universe.owner.name}</Link>
                    <span>•</span>
                    <span>{universe.characters.length} personagens</span>
                    <span>•</span>
                    <span>{universe.loreEntries.length} curiosidades</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button href={`/users/${universe.owner.id}`}>Ver perfil do autor</Button>
                  {currentUser && currentUser.id !== universe.owner.id ? <Button href={`/chat/private/${universe.owner.id}`} className="bg-cyan-400/10 border-cyan-200/15 text-cyan-50">Chamar no privado</Button> : <Button href="/chat" className="bg-white/5">Ir ao chat geral</Button>}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.12fr_.88fr]">
          <div className="grid gap-6">
            <div className="panel rounded-[30px] p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-white">Linha do tempo</h2>
                {canEdit && <span className="text-xs uppercase tracking-[0.3em] text-white/35">editável</span>}
              </div>
              <div className="mt-5 space-y-4">
                {universe.timeline.map((entry) => (
                  <div key={entry.id} className="rounded-3xl border border-white/8 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/60">{entry.centuryLabel}</p>
                    <h3 className="mt-2 text-lg font-bold text-white">{entry.title}</h3>
                    <p className="mt-2 leading-7 text-white/60">{entry.content}</p>
                    {canEdit && (
                      <form action={`/api/timeline/${entry.id}`} method="post" className="mt-4 grid gap-3 rounded-3xl border border-white/8 bg-black/20 p-4">
                        <input type="hidden" name="returnTo" value={returnTo} />
                        <div className="grid gap-3 md:grid-cols-3">
                          <Input name="centuryLabel" defaultValue={entry.centuryLabel} />
                          <Input name="title" defaultValue={entry.title} />
                          <Input name="orderIndex" defaultValue={String(entry.orderIndex)} />
                        </div>
                        <Textarea name="content" defaultValue={entry.content} />
                        <div className="flex gap-3">
                          <Button type="submit">Salvar marco</Button>
                          <button name="action" value="delete" className="rounded-2xl border border-red-400/20 px-4 py-2 text-sm font-semibold text-red-200">Excluir</button>
                        </div>
                      </form>
                    )}
                  </div>
                ))}
                {universe.timeline.length === 0 && <p className="text-white/50">Ainda não há eventos marcados.</p>}
              </div>
            </div>

            <div className="panel rounded-[30px] p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-white">Curiosidades e lore</h2>
                {canEdit && <span className="text-xs uppercase tracking-[0.3em] text-white/35">modificável com o tempo</span>}
              </div>
              <div className="mt-5 space-y-4">
                {universe.loreEntries.map((entry) => (
                  <div key={entry.id} className="rounded-3xl border border-white/8 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-fuchsia-200/65">{entry.category}</p>
                    <h3 className="mt-2 text-lg font-bold text-white">{entry.title}</h3>
                    <p className="mt-2 leading-7 text-white/60">{entry.content}</p>
                    {canEdit && (
                      <form action={`/api/lore/${entry.id}`} method="post" className="mt-4 grid gap-3 rounded-3xl border border-white/8 bg-black/20 p-4">
                        <input type="hidden" name="returnTo" value={returnTo} />
                        <div className="grid gap-3 md:grid-cols-3">
                          <Input name="category" defaultValue={entry.category} />
                          <Input name="title" defaultValue={entry.title} />
                          <Input name="orderIndex" defaultValue={String(entry.orderIndex)} />
                        </div>
                        <Textarea name="content" defaultValue={entry.content} />
                        <div className="flex gap-3">
                          <Button type="submit">Salvar curiosidade</Button>
                          <button name="action" value="delete" className="rounded-2xl border border-red-400/20 px-4 py-2 text-sm font-semibold text-red-200">Excluir</button>
                        </div>
                      </form>
                    )}
                  </div>
                ))}
                {universe.loreEntries.length === 0 && <p className="text-white/50">Ainda não há curiosidades registradas.</p>}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="panel rounded-[30px] p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-white">Personagens</h2>
                <span className="text-sm text-white/45">Elenco e figuras importantes</span>
              </div>
              <div className="mt-5 grid gap-4">
                {universe.characters.map((character) => (
                  <div key={character.id} className="rounded-[28px] border border-white/8 bg-black/20 p-4">
                    <div className="flex gap-4">
                      <div className="h-20 w-20 overflow-hidden rounded-[24px] border border-white/10 bg-black/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={character.imageUrl || '/uploads/default-avatar.svg'} alt={character.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-white">{character.name}</h3>
                        <p className="mt-2 leading-7 text-white/60">{character.summary}</p>
                        <p className="mt-2 text-sm text-cyan-200/70">{character.tags}</p>
                      </div>
                    </div>
                    {canEdit && (
                      <form action={`/api/characters/${character.id}`} method="post" className="mt-4 grid gap-3 rounded-3xl border border-white/8 bg-black/20 p-4">
                        <input type="hidden" name="returnTo" value={returnTo} />
                        <Input name="name" defaultValue={character.name} />
                        <Textarea name="summary" defaultValue={character.summary} />
                        <div className="grid gap-3 md:grid-cols-2">
                          <Input name="tags" defaultValue={character.tags} />
                          <Input name="imageUrl" defaultValue={character.imageUrl || ''} />
                        </div>
                        <div className="flex gap-3">
                          <Button type="submit">Salvar personagem</Button>
                          <button name="action" value="delete" className="rounded-2xl border border-red-400/20 px-4 py-2 text-sm font-semibold text-red-200">Excluir</button>
                        </div>
                      </form>
                    )}
                  </div>
                ))}
                {universe.characters.length === 0 && <p className="text-white/50">Ainda não há personagens cadastrados.</p>}
              </div>
            </div>

            <div className="panel rounded-[30px] p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-white">Autor e conexões</h2>
                <span className="text-sm text-white/45">Explore além do mundo</span>
              </div>
              <div className="mt-5 rounded-[28px] border border-white/8 bg-black/20 p-4">
                <div className="flex gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-[22px] border border-white/10 bg-black/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {universe.owner.avatarUrl ? <img src={universe.owner.avatarUrl} alt={universe.owner.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-xl font-black text-white">{universe.owner.name[0]}</div>}
                  </div>
                  <div>
                    <Link href={`/users/${universe.owner.id}`} className="text-lg font-bold text-white transition hover:text-cyan-200">{universe.owner.name}</Link>
                    <p className="mt-2 leading-7 text-white/60">{universe.owner.bio || 'Esse autor ainda não preencheu uma bio pública.'}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button href={`/users/${universe.owner.id}`}>Abrir perfil</Button>
                  {currentUser && currentUser.id !== universe.owner.id ? <Button href={`/chat/private/${universe.owner.id}`} className="bg-cyan-400/10 border-cyan-200/15 text-cyan-50">Conversar no privado</Button> : <Button href="/chat" className="bg-white/5">Ir ao chat geral</Button>}
                </div>
              </div>
            </div>

            {canEdit && (
              <div className="panel rounded-[30px] p-6">
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/60">Editar mundo</p>
                <form action={`/api/universes/${universe.id}`} method="post" className="mt-5 grid gap-4">
                  <Input name="title" defaultValue={universe.title} />
                  <Textarea name="description" defaultValue={universe.description} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input name="bannerUrl" defaultValue={universe.bannerUrl || ''} placeholder="URL do banner" />
                    <Input name="coverUrl" defaultValue={universe.coverUrl || ''} placeholder="URL da capa" />
                  </div>
                  <select name="visibility" defaultValue={universe.visibility} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm">
                    <option value="PRIVATE">Privado</option>
                    <option value="UNLISTED">Não listado</option>
                    <option value="PUBLIC">Público</option>
                  </select>
                  {currentUser?.role === 'ADMIN' && (
                    <select name="ownerId" defaultValue={universe.ownerId} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm">
                      {allUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <Button type="submit">Salvar mundo</Button>
                    <button name="action" value="delete" className="rounded-2xl border border-red-400/20 px-4 py-2 text-sm font-semibold text-red-200">Excluir mundo</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </section>
      </div>
    </Shell>
  );
}

import { notFound, redirect } from 'next/navigation';
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
        owner: { select: { id: true, name: true } },
        characters: { orderBy: { updatedAt: 'desc' } },
        timeline: { orderBy: [{ orderIndex: 'asc' }, { updatedAt: 'desc' }] },
        loreEntries: { orderBy: [{ orderIndex: 'asc' }, { updatedAt: 'desc' }] },
        library: true,
        comments: { include: { author: { select: { name: true } } }, orderBy: { createdAt: 'asc' } },
      },
    }),
    getCurrentUser(),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  if (!universe) return notFound();

  const canEdit = !!currentUser && (currentUser.role === 'ADMIN' || currentUser.id === universe.ownerId);
  const canAdmin = currentUser?.role === 'ADMIN';
  const returnTo = `/universes/${universe.slug}`;

  if (universe.visibility === 'PRIVATE' && !canEdit) redirect('/login');

  return (
    <Shell>
      <div className="grid gap-6">
        <section className="panel overflow-hidden rounded-[32px]">
          <div className="relative h-72 bg-gradient-to-r from-orange-700/60 via-amber-300/15 to-black">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-45"
              style={{ backgroundImage: `url('${universe.bannerUrl || '/uploads/demo-banner.svg'}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90" />
          </div>
          <div className="relative -mt-16 p-6 md:p-8">
            <div className="max-w-5xl rounded-[30px] bg-black/75 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-amber-200/65">Arquivo central do mundo</p>
                  <h1 className="fantasy-title mt-3 text-3xl font-black text-amber-50 md:text-5xl">{universe.title}</h1>
                  <p className="mt-4 leading-7 text-white/65">{universe.description}</p>
                  <p className="mt-5 text-sm text-white/45">Criado por {universe.owner.name}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="rounded-full border border-amber-300/20 px-3 py-1 text-xs text-amber-100">{universe.visibility}</span>
                  {currentUser ? <Button href="#chat" className="bg-white/5">Abrir chat</Button> : <Button href="/login" className="bg-white/5">Entrar para conversar</Button>}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.12fr_.88fr]">
          <div className="grid gap-6">
            <div className="panel rounded-[30px] p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-amber-50">Linha do tempo</h2>
                {canEdit && <span className="text-xs uppercase tracking-[0.3em] text-white/35">editável</span>}
              </div>
              <div className="mt-5 space-y-4">
                {universe.timeline.map((entry) => (
                  <div key={entry.id} className="rounded-3xl border border-white/8 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-amber-200/60">{entry.centuryLabel}</p>
                    <h3 className="mt-2 text-lg font-bold">{entry.title}</h3>
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
                <h2 className="text-2xl font-bold text-amber-50">Curiosidades e lore</h2>
                {canEdit && <span className="text-xs uppercase tracking-[0.3em] text-white/35">modificável com o tempo</span>}
              </div>
              <div className="mt-5 space-y-4">
                {universe.loreEntries.map((entry) => (
                  <div key={entry.id} className="rounded-3xl border border-white/8 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-amber-200/60">{entry.category}</p>
                    <h3 className="mt-2 text-lg font-bold text-amber-100">{entry.title}</h3>
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

            <div className="panel rounded-[30px] p-6" id="chat">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-amber-50">Chat do mundo</h2>
                <span className="text-sm text-white/45">Conversa e interação em tempo real por atualização da página</span>
              </div>
              {currentUser ? (
                <form action="/api/comments" method="post" className="mt-5 grid gap-4">
                  <input type="hidden" name="universeId" value={universe.id} />
                  <input type="hidden" name="returnTo" value={`${returnTo}#chat`} />
                  <Textarea name="content" placeholder="Escreva uma mensagem, comentário, dúvida ou ideia para este mundo" required />
                  <div>
                    <Button type="submit">Enviar mensagem</Button>
                  </div>
                </form>
              ) : (
                <p className="mt-4 text-white/55">Faça login para participar do chat desse universo.</p>
              )}
              <div className="mt-6 space-y-3">
                {universe.comments.map((comment) => (
                  <div key={comment.id} className="rounded-3xl border border-white/8 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-amber-100">{comment.author.name}</p>
                      <p className="text-xs uppercase tracking-[0.25em] text-white/35">{new Date(comment.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                    <p className="mt-2 leading-7 text-white/65">{comment.content}</p>
                  </div>
                ))}
                {universe.comments.length === 0 && <p className="text-white/50">Ainda não há mensagens no chat.</p>}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="panel rounded-[30px] p-6" id="characters">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-amber-50">Personagens</h2>
                <span className="text-sm text-white/45">Liberdade total para evolução do elenco</span>
              </div>
              <div className="mt-5 grid gap-4">
                {universe.characters.map((character) => (
                  <div key={character.id} className="rounded-3xl border border-white/8 bg-black/20 p-4">
                    <h3 className="text-lg font-bold text-amber-100">{character.name}</h3>
                    <p className="mt-2 text-white/60">{character.summary}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.25em] text-white/40">{character.tags}</p>
                    {canEdit && (
                      <form action={`/api/characters/${character.id}`} method="post" className="mt-4 grid gap-3 rounded-3xl border border-white/8 bg-black/20 p-4">
                        <input type="hidden" name="returnTo" value={`${returnTo}#characters`} />
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
                {universe.characters.length === 0 && <p className="text-white/50">Ainda não há personagens.</p>}
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
                {universe.library.length === 0 && <p className="text-white/50">Nenhum item na biblioteca ainda.</p>}
              </div>
            </div>

            {canEdit && (
              <>
                <div className="panel rounded-[30px] p-6">
                  <h2 className="text-2xl font-bold text-amber-50">Editar mundo</h2>
                  <form action={`/api/universes/${universe.id}`} method="post" className="mt-5 grid gap-4">
                    <Input name="title" defaultValue={universe.title} required />
                    <Textarea name="description" defaultValue={universe.description} required />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input name="bannerUrl" defaultValue={universe.bannerUrl || ''} placeholder="URL do banner" />
                      <Input name="coverUrl" defaultValue={universe.coverUrl || ''} placeholder="URL da capa" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <select name="visibility" defaultValue={universe.visibility} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm">
                        <option value="PRIVATE">Privado</option>
                        <option value="UNLISTED">Não listado</option>
                        <option value="PUBLIC">Público</option>
                      </select>
                      {canAdmin ? (
                        <select name="ownerId" defaultValue={universe.ownerId} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm">
                          {allUsers.map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                      ) : (
                        <input type="hidden" name="ownerId" value={universe.ownerId} />
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit">Salvar mundo</Button>
                      <button name="action" value="delete" className="rounded-2xl border border-red-400/20 px-4 py-2 text-sm font-semibold text-red-200">Apagar mundo</button>
                    </div>
                  </form>
                </div>

                <div className="panel rounded-[30px] p-6">
                  <h2 className="text-2xl font-bold text-amber-50">Adicionar conteúdo ao mundo</h2>
                  <div className="mt-5 grid gap-6">
                    <form action="/api/timeline" method="post" className="grid gap-4 rounded-3xl border border-white/8 bg-black/20 p-4">
                      <input type="hidden" name="universeId" value={universe.id} />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      <p className="text-sm font-semibold text-amber-100">Novo marco na linha do tempo</p>
                      <div className="grid gap-3 md:grid-cols-3">
                        <Input name="centuryLabel" placeholder="Século / Era" required />
                        <Input name="title" placeholder="Título" required />
                        <Input name="orderIndex" placeholder="Ordem" />
                      </div>
                      <Textarea name="content" placeholder="Descrição do evento" required />
                      <div><Button type="submit">Adicionar marco</Button></div>
                    </form>

                    <form action="/api/lore" method="post" className="grid gap-4 rounded-3xl border border-white/8 bg-black/20 p-4">
                      <input type="hidden" name="universeId" value={universe.id} />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      <p className="text-sm font-semibold text-amber-100">Nova curiosidade ou documento vivo</p>
                      <div className="grid gap-3 md:grid-cols-3">
                        <Input name="category" placeholder="Categoria" required />
                        <Input name="title" placeholder="Título" required />
                        <Input name="orderIndex" placeholder="Ordem" />
                      </div>
                      <Textarea name="content" placeholder="Texto da curiosidade" required />
                      <div><Button type="submit">Adicionar curiosidade</Button></div>
                    </form>

                    <form action="/api/characters" method="post" className="grid gap-4 rounded-3xl border border-white/8 bg-black/20 p-4">
                      <input type="hidden" name="universeId" value={universe.id} />
                      <p className="text-sm font-semibold text-amber-100">Novo personagem</p>
                      <Input name="name" placeholder="Nome do personagem" required />
                      <Textarea name="summary" placeholder="Resumo" required />
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input name="tags" placeholder="tags separadas por vírgula" required />
                        <Input name="imageUrl" placeholder="URL da imagem" />
                      </div>
                      <div><Button type="submit">Adicionar personagem</Button></div>
                    </form>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </Shell>
  );
}

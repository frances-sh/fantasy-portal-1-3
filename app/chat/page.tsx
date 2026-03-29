import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Hash, MessageSquare, Users, Compass, Sparkles } from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

export default async function ChatPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [messages, members] = await Promise.all([
    prisma.globalMessage.findMany({
      include: { author: { select: { id: true, name: true, avatarUrl: true, accentColor: true, bio: true } } },
      orderBy: { createdAt: 'asc' },
      take: 120,
    }),
    prisma.user.findMany({
      where: { id: { not: user.id } },
      select: { id: true, name: true, avatarUrl: true, accentColor: true, bio: true },
      orderBy: { updatedAt: 'desc' },
      take: 24,
    }),
  ]);

  return (
    <Shell>
      <div className="discord-shell">
        <aside className="discord-sidebar hidden lg:flex lg:flex-col">
          <div className="discord-sidebar-header">
            <div>
              <p className="discord-label">Espaços</p>
              <h2 className="discord-title">Comunidade</h2>
            </div>
          </div>

          <div className="mt-4 space-y-2 px-3">
            <div className="discord-nav-item discord-nav-item-active">
              <Hash size={16} />
              <span># geral</span>
            </div>
            <Link href="/dashboard" className="discord-nav-item">
              <Compass size={16} />
              <span>seu painel</span>
            </Link>
            <Link href="/" className="discord-nav-item">
              <Sparkles size={16} />
              <span>explorar mundos</span>
            </Link>
          </div>

          <div className="discord-divider" />

          <div className="px-3 pb-3">
            <p className="discord-label">Conversas privadas</p>
            <div className="mt-2 space-y-1">
              {members.slice(0, 8).map((person) => (
                <Link key={person.id} href={`/chat/private/${person.id}`} className="discord-nav-item">
                  <MessageSquare size={16} />
                  <span className="truncate">{person.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <section className="discord-main">
          <div className="discord-main-header">
            <div className="flex items-center gap-3">
              <div className="discord-hash-box"><Hash size={18} /></div>
              <div>
                <h1 className="text-lg font-semibold text-white">geral</h1>
                <p className="text-sm text-slate-400">Conversa aberta sobre personagens, mundos e ideias novas.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-sm text-slate-300">
              {messages.length} mensagens
            </div>
          </div>

          <div className="discord-thread">
            {messages.length === 0 ? (
              <div className="discord-empty-state">
                <div className="discord-empty-icon"><Hash size={24} /></div>
                <h2>Esse canal ainda está quieto.</h2>
                <p>Comece a conversa e puxe alguém do perfil ou do privado depois.</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const previous = messages[index - 1];
                const grouped = previous && previous.author.id === message.author.id;

                return (
                  <article key={message.id} className={`discord-message ${grouped ? 'discord-message-grouped' : ''}`}>
                    {!grouped ? (
                      <Link href={`/users/${message.author.id}`} className="discord-avatar-ring">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {message.author.avatarUrl ? (
                          <img src={message.author.avatarUrl} alt={message.author.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="discord-avatar-fallback">{message.author.name[0]}</div>
                        )}
                      </Link>
                    ) : (
                      <div className="w-12" />
                    )}

                    <div className="min-w-0 flex-1">
                      {!grouped && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <Link href={`/users/${message.author.id}`} className="font-semibold text-white transition hover:text-sky-300">
                            {message.author.name}
                          </Link>
                          <span className="text-xs text-slate-500">{new Date(message.createdAt).toLocaleString('pt-BR')}</span>
                          <Link href={`/chat/private/${message.author.id}`} className="discord-inline-action">
                            chamar no privado
                          </Link>
                        </div>
                      )}
                      <p className="mt-1 whitespace-pre-wrap pr-4 text-[15px] leading-7 text-slate-200/88">{message.content}</p>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div className="discord-composer-wrap">
            <form action="/api/chat" method="post" className="discord-composer">
              <input type="hidden" name="returnTo" value="/chat" />
              <Textarea name="content" placeholder="Enviar mensagem para #geral" required className="discord-textarea" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500">Perfis e mensagens privadas estão a um clique do nome de cada pessoa.</p>
                <div className="flex gap-3">
                  <Button href="/dashboard" className="bg-white/5 text-white/85">Painel</Button>
                  <Button type="submit" className="bg-sky-500 text-white border-sky-400/30">Enviar</Button>
                </div>
              </div>
            </form>
          </div>
        </section>

        <aside className="discord-members hidden xl:block">
          <div className="discord-members-header">
            <Users size={16} />
            <span>Membros</span>
          </div>
          <div className="space-y-2 p-3">
            {members.map((person) => (
              <div key={person.id} className="discord-member-card">
                <Link href={`/users/${person.id}`} className="discord-member-avatar">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {person.avatarUrl ? (
                    <img src={person.avatarUrl} alt={person.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="discord-avatar-fallback">{person.name[0]}</div>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/users/${person.id}`} className="block truncate font-medium text-slate-100 hover:text-sky-300">
                    {person.name}
                  </Link>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{person.bio || 'Sem descrição pública ainda.'}</p>
                </div>
                <Link href={`/chat/private/${person.id}`} className="discord-member-action">
                  DM
                </Link>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </Shell>
  );
}

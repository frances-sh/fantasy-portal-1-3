import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

export default async function ChatPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [messages, onlineUsers] = await Promise.all([
    prisma.globalMessage.findMany({
      include: { author: { select: { id: true, name: true, avatarUrl: true, accentColor: true } } },
      orderBy: { createdAt: 'asc' },
      take: 120,
    }),
    prisma.user.findMany({
      where: { id: { not: user.id } },
      select: { id: true, name: true, avatarUrl: true, accentColor: true, bio: true },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    }),
  ]);

  return (
    <Shell>
      <div className="grid gap-6 xl:grid-cols-[1.18fr_.82fr]">
        <section className="panel rounded-[32px] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/60">Interação geral</p>
              <h1 className="mt-2 text-3xl font-black text-white">Chat central da comunidade</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">Esse espaço é o ponto de encontro geral do site. Aqui dá para conversar sobre mundos, ideias, personagens, dúvidas e chamar alguém para um chat privado.</p>
            </div>
            <div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/5 px-4 py-3 text-sm text-cyan-100/80">
              {messages.length} mensagens carregadas
            </div>
          </div>

          <form action="/api/chat" method="post" className="mt-6 grid gap-4">
            <input type="hidden" name="returnTo" value="/chat" />
            <Textarea name="content" placeholder="Mande uma mensagem para todo mundo" required />
            <div className="flex gap-3">
              <Button type="submit">Enviar no chat geral</Button>
              <Button href="/dashboard" className="bg-white/5">Voltar ao painel</Button>
            </div>
          </form>

          <div className="mt-6 space-y-3">
            {messages.map((message) => (
              <article key={message.id} className="message-card rounded-[28px] border border-white/8 bg-black/20 p-4">
                <div className="flex items-start gap-4">
                  <Link href={`/users/${message.author.id}`} className="mt-1 block h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {message.author.avatarUrl ? <img src={message.author.avatarUrl} alt={message.author.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center font-bold text-white">{message.author.name[0]}</div>}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link href={`/users/${message.author.id}`} className="font-semibold text-white transition hover:text-cyan-200">{message.author.name}</Link>
                      <span className="text-xs uppercase tracking-[0.25em] text-white/35">{new Date(message.createdAt).toLocaleString('pt-BR')}</span>
                      <Link href={`/chat/private/${message.author.id}`} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70 transition hover:border-cyan-300/30 hover:text-cyan-100">Conversar no privado</Link>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap leading-7 text-white/70">{message.content}</p>
                  </div>
                </div>
              </article>
            ))}
            {messages.length === 0 && <p className="text-white/50">Ainda não existem mensagens no chat geral.</p>}
          </div>
        </section>

        <aside className="grid gap-6">
          <section className="panel rounded-[32px] p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/60">Perfis ativos</p>
            <h2 className="mt-2 text-2xl font-black text-white">Quem você pode chamar</h2>
            <div className="mt-5 space-y-3">
              {onlineUsers.map((person) => (
                <div key={person.id} className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                  <div className="flex items-center gap-3">
                    <Link href={`/users/${person.id}`} className="block h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {person.avatarUrl ? <img src={person.avatarUrl} alt={person.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center font-bold text-white">{person.name[0]}</div>}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/users/${person.id}`} className="font-semibold text-white transition hover:text-cyan-200">{person.name}</Link>
                      <p className="mt-1 line-clamp-2 text-sm text-white/50">{person.bio || 'Sem bio pública ainda.'}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-3">
                    <Button href={`/users/${person.id}`} className="bg-white/5">Ver perfil</Button>
                    <Button href={`/chat/private/${person.id}`} className="bg-cyan-400/10 text-cyan-50 border-cyan-200/15">Chat privado</Button>
                  </div>
                </div>
              ))}
              {onlineUsers.length === 0 && <p className="text-white/50">Ainda não há outros perfis disponíveis.</p>}
            </div>
          </section>
        </aside>
      </div>
    </Shell>
  );
}

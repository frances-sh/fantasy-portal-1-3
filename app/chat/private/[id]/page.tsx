import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, UserRound } from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

export default async function PrivateChatPage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');

  const { id } = await params;
  if (id === currentUser.id) redirect('/chat');

  const partner = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, bio: true, avatarUrl: true, bannerUrl: true, accentColor: true },
  });
  if (!partner) return notFound();

  const messages = await prisma.privateMessage.findMany({
    where: {
      OR: [
        { senderId: currentUser.id, recipientId: partner.id },
        { senderId: partner.id, recipientId: currentUser.id },
      ],
    },
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true } },
      recipient: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'asc' },
    take: 120,
  });

  return (
    <Shell>
      <div className="discord-shell discord-shell-private">
        <section className="discord-main">
          <div className="discord-main-header border-b-white/8">
            <div className="flex items-center gap-3">
              <Link href="/chat" className="discord-hash-box">
                <ArrowLeft size={18} />
              </Link>
              <div className="discord-avatar-ring h-11 w-11 rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {partner.avatarUrl ? (
                  <img src={partner.avatarUrl} alt={partner.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="discord-avatar-fallback">{partner.name[0]}</div>
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">{partner.name}</h1>
                <p className="text-sm text-slate-400">Conversa privada entre vocês dois.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button href={`/users/${partner.id}`} className="bg-white/5 text-white/85">Ver perfil</Button>
              <Button href="/chat" className="bg-sky-500/10 border-sky-400/20 text-sky-100">Chat geral</Button>
            </div>
          </div>

          <div className="discord-thread min-h-[480px]">
            {messages.length === 0 ? (
              <div className="discord-empty-state">
                <div className="discord-empty-icon"><MessageSquare size={24} /></div>
                <h2>Essa conversa ainda não começou.</h2>
                <p>Escreva a primeira mensagem para abrir o papo com {partner.name}.</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const mine = message.senderId === currentUser.id;
                const previous = messages[index - 1];
                const grouped = previous && previous.senderId === message.senderId;

                return (
                  <article key={message.id} className={`discord-message ${grouped ? 'discord-message-grouped' : ''}`}>
                    {!grouped ? (
                      <div className="discord-avatar-ring">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {message.sender.avatarUrl ? (
                          <img src={message.sender.avatarUrl} alt={message.sender.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="discord-avatar-fallback">{message.sender.name[0]}</div>
                        )}
                      </div>
                    ) : (
                      <div className="w-12" />
                    )}

                    <div className="min-w-0 flex-1">
                      {!grouped && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-semibold text-white">{mine ? 'Você' : message.sender.name}</span>
                          <span className="text-xs text-slate-500">{new Date(message.createdAt).toLocaleString('pt-BR')}</span>
                        </div>
                      )}
                      <div className={`mt-1 inline-block max-w-[820px] rounded-2xl px-4 py-3 text-[15px] leading-7 ${mine ? 'bg-sky-500/12 text-slate-100 ring-1 ring-sky-400/15' : 'bg-white/4 text-slate-200 ring-1 ring-white/6'}`}>
                        {message.content}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div className="discord-composer-wrap">
            <form action="/api/messages" method="post" className="discord-composer">
              <input type="hidden" name="recipientId" value={partner.id} />
              <input type="hidden" name="returnTo" value={`/chat/private/${partner.id}`} />
              <Textarea name="content" placeholder={`Mensagem direta para ${partner.name}`} required className="discord-textarea" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500">Você pode abrir o perfil dele para ver bio, estilo e mundos publicados.</p>
                <div className="flex gap-3">
                  <Button href={`/users/${partner.id}`} className="bg-white/5 text-white/85">Perfil</Button>
                  <Button type="submit" className="bg-sky-500 text-white border-sky-400/30">Enviar DM</Button>
                </div>
              </div>
            </form>
          </div>
        </section>

        <aside className="discord-members hidden xl:block">
          <div className="discord-members-header">
            <UserRound size={16} />
            <span>Sobre {partner.name}</span>
          </div>
          <div className="p-3">
            <div className="overflow-hidden rounded-[22px] border border-white/8 bg-[#111522]">
              <div
                className="h-32 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${partner.accentColor || '#3b82f6'}55, rgba(15,23,42,.55)), url('${partner.bannerUrl || '/uploads/demo-banner.svg'}')`,
                }}
              />
              <div className="-mt-8 px-4 pb-4">
                <div className="discord-avatar-ring h-16 w-16 rounded-[20px] border-4 border-[#111522] bg-[#111522]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {partner.avatarUrl ? (
                    <img src={partner.avatarUrl} alt={partner.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="discord-avatar-fallback text-xl">{partner.name[0]}</div>
                  )}
                </div>
                <h2 className="mt-3 text-xl font-semibold text-white">{partner.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{partner.bio || 'Esse perfil ainda não escreveu uma bio pública.'}</p>
                <div className="mt-4 grid gap-2">
                  <Button href={`/users/${partner.id}`} className="bg-white/5 text-white/85">Abrir perfil completo</Button>
                  <Button href="/" className="bg-white/5 text-white/85">Explorar mundos</Button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Shell>
  );
}

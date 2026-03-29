import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
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
      <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <section className="panel overflow-hidden rounded-[32px]">
          <div className="relative h-44 border-b border-white/8 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(135deg, ${partner.accentColor}55, rgba(0,0,0,.65)), url('${partner.bannerUrl || '/uploads/demo-banner.svg'}')` }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/70" />
            <div className="absolute bottom-5 left-5 flex items-end gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-[26px] border border-white/15 bg-black/35 p-1">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[20px] bg-black/45 text-2xl font-black text-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {partner.avatarUrl ? <img src={partner.avatarUrl} alt={partner.name} className="h-full w-full object-cover" /> : partner.name[0]}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/65">Conversa privada</p>
                <h1 className="mt-2 text-3xl font-black text-white">{partner.name}</h1>
              </div>
            </div>
          </div>

          <div className="p-6">
            <form action="/api/messages" method="post" className="grid gap-4">
              <input type="hidden" name="recipientId" value={partner.id} />
              <input type="hidden" name="returnTo" value={`/chat/private/${partner.id}`} />
              <Textarea name="content" placeholder={`Escreva algo apenas para ${partner.name}`} required />
              <div className="flex flex-wrap gap-3">
                <Button type="submit">Enviar mensagem privada</Button>
                <Button href="/chat" className="bg-white/5">Voltar ao chat geral</Button>
              </div>
            </form>

            <div className="mt-6 space-y-3">
              {messages.map((message) => {
                const mine = message.senderId === currentUser.id;
                return (
                  <div key={message.id} className={`rounded-[26px] border p-4 ${mine ? 'border-cyan-300/20 bg-cyan-400/10' : 'border-white/8 bg-black/20'}`}>
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-white">{mine ? 'Você' : message.sender.name}</p>
                      <span className="text-xs uppercase tracking-[0.25em] text-white/35">{new Date(message.createdAt).toLocaleString('pt-BR')}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap leading-7 text-white/70">{message.content}</p>
                  </div>
                );
              })}
              {messages.length === 0 && <p className="text-white/50">Nenhuma mensagem privada ainda.</p>}
            </div>
          </div>
        </section>

        <aside className="grid gap-6">
          <section className="panel rounded-[32px] p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/60">Perfil do contato</p>
            <h2 className="mt-2 text-2xl font-black text-white">Ver detalhes</h2>
            <p className="mt-3 leading-7 text-white/60">Antes de conversar sobre mundos, você pode abrir o perfil completo e ver bio, estilo visual e presença do autor.</p>
            <div className="mt-5 flex gap-3">
              <Button href={`/users/${partner.id}`}>Abrir perfil</Button>
              <Button href="/" className="bg-white/5">Explorar mundos</Button>
            </div>
          </section>
        </aside>
      </div>
    </Shell>
  );
}

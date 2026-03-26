import { redirect } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const universes = await prisma.universe.findMany({
    where: { ownerId: user.id },
    include: { characters: true, shares: true },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <Shell>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <section className="panel rounded-[32px] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200/60">Painel do autor</p>
              <h2 className="mt-2 text-2xl font-black text-amber-50">Meus universos</h2>
            </div>
            <Button href="/profile" className="bg-white/5">Editar perfil</Button>
          </div>

          <div className="mt-6 grid gap-4">
            {universes.map((universe) => (
              <div key={universe.id} className="rounded-[28px] border border-white/8 bg-black/20 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-amber-50">{universe.title}</h3>
                    <p className="mt-2 text-white/55">{universe.description}</p>
                  </div>
                  <span className="rounded-full border border-amber-300/20 px-3 py-1 text-xs text-amber-100">{universe.visibility}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button href={`/universes/${universe.slug}`}>Abrir</Button>
                  <form action="/api/share" method="post">
                    <input type="hidden" name="universeId" value={universe.id} />
                    <button className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/85">Gerar link</button>
                  </form>
                </div>
                {universe.shares[0] && (
                  <p className="mt-4 text-sm text-white/50">Último link: /share/{universe.shares[0].token}</p>
                )}
              </div>
            ))}
            {universes.length === 0 && <p className="text-white/50">Você ainda não criou nenhum universo.</p>}
          </div>
        </section>

        <section className="grid gap-6">
          <div className="panel rounded-[32px] p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/60">Criar universo</p>
            <form action="/api/universes" method="post" className="mt-5 grid gap-4">
              <Input name="title" placeholder="Título do universo" required />
              <Textarea name="description" placeholder="Descrição" required />
              <div className="grid gap-4 md:grid-cols-2">
                <Input name="bannerUrl" placeholder="URL do banner" />
                <Input name="coverUrl" placeholder="URL da capa" />
              </div>
              <select name="visibility" className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm">
                <option value="PRIVATE">Privado</option>
                <option value="UNLISTED">Não listado</option>
                <option value="PUBLIC">Público</option>
              </select>
              <Button type="submit">Criar universo</Button>
            </form>
          </div>

          <div className="panel rounded-[32px] p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/60">Adicionar personagem</p>
            <form action="/api/characters" method="post" className="mt-5 grid gap-4">
              <select name="universeId" className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm" required>
                <option value="">Selecione um universo</option>
                {universes.map((u) => (
                  <option key={u.id} value={u.id}>{u.title}</option>
                ))}
              </select>
              <Input name="name" placeholder="Nome do personagem" required />
              <Textarea name="summary" placeholder="Resumo" required />
              <Input name="tags" placeholder="tags separadas por vírgula" required />
              <Input name="imageUrl" placeholder="URL da imagem" />
              <Button type="submit">Criar personagem</Button>
            </form>
          </div>

          <div className="panel rounded-[32px] p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/60">Upload local</p>
            <p className="mt-2 text-sm text-white/50">Este upload funciona localmente. Para produção na Vercel, conecte um storage externo como Supabase Storage ou Vercel Blob.</p>
            <form action="/api/upload" method="post" encType="multipart/form-data" className="mt-5 grid gap-4">
              <input name="file" type="file" className="rounded-2xl border border-white/10 bg-black/25 p-3 text-sm" required />
              <Button type="submit">Enviar arquivo</Button>
            </form>
          </div>
        </section>
      </div>
    </Shell>
  );
}

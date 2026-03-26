import { notFound, redirect } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { universes: { orderBy: { updatedAt: 'desc' } } },
  });
  if (!user) return notFound();

  return (
    <Shell>
      <div className="grid gap-6 xl:grid-cols-[1fr_.9fr]">
        <section className="panel rounded-[32px] p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/60">Administração de perfil</p>
          <h1 className="mt-2 text-3xl font-black text-amber-50">{user.name}</h1>
          <form action={`/api/admin/users/${user.id}`} method="post" className="mt-6 grid gap-4">
            <Input name="name" defaultValue={user.name} placeholder="Nome" required />
            <Input name="email" defaultValue={user.email} placeholder="Email" required />
            <Textarea name="bio" defaultValue={user.bio} placeholder="Bio" />
            <Input name="avatarUrl" defaultValue={user.avatarUrl || ''} placeholder="URL do avatar" />
            <Input name="bannerUrl" defaultValue={user.bannerUrl || ''} placeholder="URL do banner" />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm text-white/60">Cor de destaque</span>
                <input name="accentColor" type="color" defaultValue={user.accentColor} className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-2 py-2" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-white/60">Função</span>
                <select name="role" defaultValue={user.role} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm">
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit">Salvar alterações</Button>
              <Button href="/admin" className="bg-white/5">Voltar</Button>
            </div>
          </form>
        </section>

        <section className="panel rounded-[32px] p-6">
          <h2 className="text-2xl font-black text-amber-50">Mundos desse usuário</h2>
          <div className="mt-5 space-y-3">
            {user.universes.map((universe) => (
              <div key={universe.id} className="rounded-3xl border border-white/8 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-amber-100">{universe.title}</p>
                    <p className="mt-2 text-sm text-white/55">{universe.description}</p>
                  </div>
                  <Button href={`/universes/${universe.slug}`} className="bg-white/5">Editar mundo</Button>
                </div>
              </div>
            ))}
            {user.universes.length === 0 && <p className="text-white/50">Esse usuário ainda não criou mundos.</p>}
          </div>
        </section>
      </div>
    </Shell>
  );
}

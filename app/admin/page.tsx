import { redirect } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect('/dashboard');

  const [users, universes, comments, shares] = await Promise.all([
    prisma.user.findMany({ include: { universes: true }, orderBy: { createdAt: 'desc' } }),
    prisma.universe.findMany({ include: { owner: true, loreEntries: true, characters: true }, orderBy: { updatedAt: 'desc' } }),
    prisma.comment.count(),
    prisma.shareLink.count(),
  ]);

  return (
    <Shell>
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-4">
          {[
            ['Usuários', String(users.length)],
            ['Universos', String(universes.length)],
            ['Mensagens no chat', String(comments)],
            ['Links públicos', String(shares)],
          ].map(([label, value]) => (
            <div key={label} className="panel rounded-[28px] p-5">
              <p className="text-sm text-white/55">{label}</p>
              <p className="mt-2 text-3xl font-black text-amber-50">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[.95fr_1.05fr]">
          <div className="panel rounded-[32px] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-amber-50">Usuários</h2>
                <p className="mt-2 text-sm text-white/50">O administrador pode abrir qualquer perfil e alterar aparência, função e dados públicos.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {users.map((u) => (
                <div key={u.id} className="rounded-3xl border border-white/8 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-amber-100">{u.name}</p>
                      <p className="text-sm text-white/50">{u.email}</p>
                      <p className="mt-1 text-xs text-white/40">{u.universes.length} universo(s)</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-amber-200/20 px-3 py-1 text-xs text-amber-100">{u.role}</span>
                      <Button href={`/admin/users/${u.id}`} className="bg-white/5">Gerenciar</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel rounded-[32px] p-6">
            <h2 className="text-2xl font-black text-amber-50">Conteúdos e mundos</h2>
            <div className="mt-5 space-y-3">
              {universes.map((universe) => (
                <div key={universe.id} className="rounded-3xl border border-white/8 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-amber-100">{universe.title}</p>
                      <p className="mt-1 text-sm text-white/50">Autor: {universe.owner.name}</p>
                      <p className="mt-2 text-sm text-white/60">{universe.description}</p>
                    </div>
                    <Button href={`/universes/${universe.slug}`} className="bg-white/5">Abrir e editar</Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/45">
                    <span>{universe.characters.length} personagens</span>
                    <span>•</span>
                    <span>{universe.loreEntries.length} curiosidades</span>
                    <span>•</span>
                    <span>{universe.visibility}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}

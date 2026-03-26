import { redirect } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect('/dashboard');

  const [users, universes, comments, shares] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.universe.findMany({ include: { owner: true }, orderBy: { updatedAt: 'desc' } }),
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
            ['Comentários', String(comments)],
            ['Links públicos', String(shares)],
          ].map(([label, value]) => (
            <div key={label} className="panel rounded-[28px] p-5">
              <p className="text-sm text-white/55">{label}</p>
              <p className="mt-2 text-3xl font-black text-amber-50">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="panel rounded-[32px] p-6">
            <h2 className="text-2xl font-black text-amber-50">Usuários</h2>
            <div className="mt-5 space-y-3">
              {users.map((u) => (
                <div key={u.id} className="rounded-3xl border border-white/8 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-amber-100">{u.name}</p>
                      <p className="text-sm text-white/50">{u.email}</p>
                    </div>
                    <span className="rounded-full border border-amber-200/20 px-3 py-1 text-xs text-amber-100">{u.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel rounded-[32px] p-6">
            <h2 className="text-2xl font-black text-amber-50">Conteúdos</h2>
            <div className="mt-5 space-y-3">
              {universes.map((universe) => (
                <div key={universe.id} className="rounded-3xl border border-white/8 bg-black/20 p-4">
                  <p className="font-semibold text-amber-100">{universe.title}</p>
                  <p className="mt-1 text-sm text-white/50">Autor: {universe.owner.name}</p>
                  <p className="mt-2 text-sm text-white/60">{universe.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}

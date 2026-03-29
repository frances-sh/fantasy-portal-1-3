import { redirect } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { getCurrentUser } from '@/lib/auth';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <Shell>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <section className="panel overflow-hidden rounded-[32px] p-0">
          <div
            className="relative h-64 border-b border-white/8 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(135deg, ${user.accentColor}55, rgba(0,0,0,.55)), url('${user.bannerUrl || '/uploads/demo-banner.svg'}')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/75" />
            <div className="absolute bottom-6 left-6 flex items-end gap-4">
              <div className="h-24 w-24 rounded-[28px] border border-white/15 bg-black/50 p-1 backdrop-blur">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[22px] bg-black/40 text-3xl font-black text-white">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    user.name[0]
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/65">Perfil autoral</p>
                <h2 className="mt-2 text-3xl font-black text-amber-50">{user.name}</h2>
                <p className="mt-2 max-w-2xl text-sm text-white/70">{user.bio || 'Sem bio ainda. Personalize seu perfil para deixar a área pública mais forte.'}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-white/45">Cor de destaque</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="h-8 w-8 rounded-full border border-white/15" style={{ backgroundColor: user.accentColor }} />
                <span className="font-semibold text-white/85">{user.accentColor}</span>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-white/45">Email</p>
              <p className="mt-3 font-semibold text-white/85">{user.email}</p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-white/45">Função</p>
              <p className="mt-3 font-semibold text-white/85">{user.role}</p>
            </div>
          </div>
        </section>

        <section className="panel rounded-[32px] p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/60">Personalização</p>
          <h1 className="mt-2 text-2xl font-black text-amber-50">Editar perfil</h1>
          <form action="/api/profile" method="post" className="mt-6 grid gap-4">
            <Input name="name" defaultValue={user.name} placeholder="Nome" required />
            <Textarea name="bio" defaultValue={user.bio} placeholder="Bio curta sobre você ou sobre seu universo" />
            <Input name="avatarUrl" defaultValue={user.avatarUrl || ''} placeholder="URL do avatar" />
            <Input name="bannerUrl" defaultValue={user.bannerUrl || ''} placeholder="URL do banner do perfil" />
            <label className="grid gap-2">
              <span className="text-sm text-white/60">Cor de destaque</span>
              <input name="accentColor" type="color" defaultValue={user.accentColor} aria-label="Cor de destaque" className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-2 py-2" />
            </label>
            <div className="flex flex-wrap gap-3">
              <Button type="submit">Salvar perfil</Button>
              <Button href={`/users/${user.id}`} className="bg-cyan-400/10 border-cyan-200/15 text-cyan-50">Ver perfil público</Button>
              <Button href="/dashboard" className="bg-white/5">Voltar ao painel</Button>
            </div>
          </form>
        </section>
      </div>
    </Shell>
  );
}

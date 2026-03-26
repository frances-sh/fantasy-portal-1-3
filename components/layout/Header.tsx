import { Button } from '@/components/ui/Button';
import { getCurrentUser } from '@/lib/auth';

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="flex flex-col gap-4 border-b border-white/6 px-6 py-5 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200/60">Arquivo narrativo</p>
        <h1 className="fantasy-title mt-2 text-2xl font-black text-amber-50 md:text-4xl">Portal de Universos</h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button href="/share/demo-public-link">Link demo</Button>
        {user ? (
          <>
            <Button href="/profile" className="bg-white/5">Meu perfil</Button>
            <Button href="/dashboard">Meu painel</Button>
          </>
        ) : (
          <Button href="/login">Fazer login</Button>
        )}
      </div>
    </header>
  );
}

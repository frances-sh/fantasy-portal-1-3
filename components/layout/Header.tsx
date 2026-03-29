import { Button } from '@/components/ui/Button';
import { getCurrentUser } from '@/lib/auth';

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="header-shell">
      <div>
        <p className="header-kicker">biblioteca social de universos</p>
        <h1 className="header-title">Portal de Universos</h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button href="/chat" className="bg-sky-500/10 border-sky-400/20 text-sky-100">Comunidade</Button>
        {user ? (
          <>
            <Button href="/profile" className="bg-white/5 text-white/85">Meu perfil</Button>
            <Button href="/dashboard">Painel</Button>
          </>
        ) : (
          <Button href="/login">Entrar</Button>
        )}
      </div>
    </header>
  );
}

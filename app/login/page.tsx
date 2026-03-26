import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect('/dashboard');

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="panel w-full max-w-md rounded-[32px] p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200/60">Acessar portal</p>
        <h1 className="mt-3 text-3xl font-black text-amber-50">Entrar</h1>
        <form action="/api/auth/login" method="post" className="mt-6 grid gap-4">
          <Input name="email" type="email" placeholder="Email" required />
          <Input name="password" type="password" placeholder="Senha" required />
          <Button type="submit">Entrar</Button>
        </form>
      </div>
    </main>
  );
}

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  href?: string;
  type?: 'button' | 'submit';
};

const base = 'glow-button inline-flex items-center justify-center rounded-2xl border px-4 py-2.5 text-sm font-medium';

export function Button({ children, className, href, type = 'button' }: Props) {
  const styles = cn(base, 'border-white/10 bg-[#151b2b] text-slate-100');

  if (href) {
    return (
      <Link href={href} className={cn(styles, className)}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cn(styles, className)}>
      {children}
    </button>
  );
}

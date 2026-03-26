import { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'min-h-28 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none transition focus:border-amber-300/40',
        props.className,
      )}
    />
  );
}

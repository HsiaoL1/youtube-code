import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return <span className={cn('rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground', className)}>{children}</span>;
}

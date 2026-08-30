import * as React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'cyan';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-100/80',
    secondary: 'bg-zinc-800 text-zinc-100 border border-zinc-700 hover:bg-zinc-800/80',
    destructive: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    outline: 'border border-zinc-700 text-zinc-300',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
  };

  return (
    <div
      data-slot="badge"
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-mono font-medium whitespace-nowrap transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };

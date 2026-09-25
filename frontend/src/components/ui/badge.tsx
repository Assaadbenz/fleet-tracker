import * as React from 'react';
import { cn } from '@/lib/utils';
import { ComputedStatus } from '@/types/fleet';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'active' | 'dueSoon' | 'maintenance' | 'inactive';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-zinc-800 text-zinc-100 border-zinc-700',
    secondary: 'bg-zinc-100 text-zinc-900 border-zinc-200',
    outline: 'text-zinc-300 border-zinc-700',
    // Statuts requis : Vert = ACTIF, Ambre = ENTRETIEN PROCHE, Rouge = EN MAINTENANCE
    active:
      'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-950/50',
    dueSoon:
      'bg-amber-950/80 text-amber-400 border-amber-500/40 shadow-sm shadow-amber-950/50 animate-pulse',
    maintenance:
      'bg-rose-950/80 text-rose-400 border-rose-500/40 shadow-sm shadow-rose-950/50',
    inactive:
      'bg-zinc-800/80 text-zinc-400 border-zinc-600/30',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

export function StatusBadge({ status }: { status: ComputedStatus }) {
  switch (status) {
    case 'ACTIVE':
      return (
        <Badge variant="active">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          ACTIF
        </Badge>
      );
    case 'DUE_SOON':
      return (
        <Badge variant="dueSoon">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          ENTRETIEN PROCHE
        </Badge>
      );
    case 'MAINTENANCE':
      return (
        <Badge variant="maintenance">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
          EN MAINTENANCE
        </Badge>
      );
    case 'INACTIVE':
    default:
      return (
        <Badge variant="inactive">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
          INACTIF
        </Badge>
      );
  }
}

'use client';

import * as React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Erreur interceptée par App Router:', error);
  }, [error]);

  return (
    <div className="flex min-h-[450px] w-full flex-col items-center justify-center rounded-2xl border border-rose-900/40 bg-zinc-900/60 p-8 text-center backdrop-blur-xl shadow-2xl">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-4">
        <AlertOctagon className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-bold tracking-tight text-zinc-100">
        Impossible de charger le tableau de bord de la flotte
      </h2>
      <p className="mt-2 max-w-md text-sm text-zinc-400">
        Une erreur inattendue est survenue lors de la synchronisation des véhicules ou du calcul des métriques de maintenance.
      </p>
      {error.message && (
        <div className="mt-4 max-w-lg rounded-lg border border-zinc-800 bg-zinc-950/80 p-3 text-left font-mono text-xs text-rose-400">
          {error.message}
        </div>
      )}
      <div className="mt-6 flex items-center gap-3">
        <Button onClick={() => reset()} variant="primary" className="gap-2">
          <RotateCcw className="h-4 w-4" /> Réessayer
        </Button>
      </div>
    </div>
  );
}

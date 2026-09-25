'use client';

import * as React from 'react';
import { Truck, Building2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UserSessionBar } from '@/components/auth/user-session-bar';

export function DashboardHeader() {
  const { tenant, isAuthenticated } = useAuth();

  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-zinc-800/80">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-500/25">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Tableau de Bord de Flotte & Maintenance
              <span className="text-[11px] font-normal uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Multi-Tenant SaaS
              </span>
            </h1>
            <p className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-zinc-300 font-medium">
                <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                {isAuthenticated ? (tenant?.name || 'Apex Global Logistics') : 'Portail Logistique'}
              </span>
              <span>•</span>
              <span className="font-mono text-[11px] text-zinc-500">
                {isAuthenticated ? `ID Locataire : ${tenant?.id || '00000000-0000-0000-0000-000000000001'}` : 'Session Verrouillée'}
              </span>
            </p>
          </div>
        </div>
      </div>

      <UserSessionBar />
    </header>
  );
}

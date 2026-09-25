'use client';

import * as React from 'react';
import { UserCheck, ShieldCheck, Lock, LogOut, ChevronDown, Crown, Truck, Key } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { AuthModal } from './auth-modal';

export function UserSessionBar() {
  const { user, tenant, isAuthenticated, switchDemoAccount, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        {/* User Session & Role Pill */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/80 border border-zinc-800 text-xs transition-colors shadow-sm"
          >
            {user?.role === 'ADMIN' ? (
              <Crown className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            ) : (
              <Truck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            )}
            <span className="text-zinc-200 font-medium">{user ? user.email : 'Non connecté'}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                user?.role === 'ADMIN'
                  ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {user ? user.role : 'INVITÉ'}
            </span>
            <ChevronDown className="h-3 w-3 text-zinc-500" />
          </button>

          {/* Quick Session Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-800 bg-zinc-900 p-2 shadow-2xl z-50 text-xs text-zinc-200 space-y-1 animate-in fade-in">
              <div className="px-2 py-1.5 text-[11px] text-zinc-400 border-b border-zinc-800">
                Organisation : <strong>{tenant?.name}</strong>
              </div>

              <button
                onClick={() => {
                  switchDemoAccount('ADMIN');
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Crown className="h-3.5 w-3.5 text-amber-400" />
                  <span>Basculer en ADMIN</span>
                </div>
                {user?.role === 'ADMIN' && <span className="text-[10px] text-indigo-400">Actif</span>}
              </button>

              <button
                onClick={() => {
                  switchDemoAccount('DRIVER');
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Basculer en CHAUFFEUR</span>
                </div>
                {user?.role === 'DRIVER' && <span className="text-[10px] text-indigo-400">Actif</span>}
              </button>

              <div className="pt-1 border-t border-zinc-800">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-800 text-indigo-300 transition-colors"
                >
                  <Key className="h-3.5 w-3.5" />
                  <span>Gérer l&apos;Authentification & JWT</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bouton d'accès au portail d'authentification */}
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 text-xs text-indigo-300 transition-colors"
        >
          <Lock className="h-3.5 w-3.5 text-indigo-400" />
          <span>Authentification JWT</span>
        </button>

        {/* Badge d'isolation multi-tenant */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Tenant Scoped</span>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}

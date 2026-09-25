'use client';

import * as React from 'react';
import {
  Lock,
  Mail,
  Building2,
  ShieldCheck,
  UserCheck,
  LogOut,
  Key,
  X,
  CheckCircle2,
  Truck,
  Crown,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { user, tenant, token, isAuthenticated, login, register, logout, switchDemoAccount } = useAuth();
  const [tab, setTab] = React.useState<'LOGIN' | 'REGISTER' | 'JWT_INFO'>('LOGIN');

  const [email, setEmail] = React.useState('admin@apexlogistics.com');
  const [password, setPassword] = React.useState('FleetAdmin2026!');
  const [companyName, setCompanyName] = React.useState('Apex Global Logistics');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    const res = await login(email, password);
    setIsLoading(false);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Erreur d’authentification');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    const res = await register(companyName, email, password);
    setIsLoading(false);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Erreur lors de la création');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 shadow-2xl text-zinc-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-600/30">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">
                Portail d&apos;Authentification & Rôles RBAC
              </h2>
              <p className="text-xs text-zinc-400">
                Isolation multi-locataire garantie par jeton JWT signé
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Active Session Overview */}
        {isAuthenticated && user && (
          <div className="my-4 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                <UserCheck className="h-4 w-4" />
                Session Actuelle Active
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-900 text-indigo-200 border border-indigo-400/30">
                RÔLE : {user.role}
              </span>
            </div>
            <div className="text-xs text-zinc-300">
              Utilisateur : <strong>{user.email}</strong>
            </div>
            <div className="text-xs text-zinc-400">
              Organisation Locataire : <strong>{tenant?.name}</strong>
            </div>
          </div>
        )}

        {/* Quick Demo Switcher */}
        <div className="my-3 space-y-1.5">
          <label className="text-[11px] text-zinc-400 font-medium">Bascule Rapide de Comptes Démo :</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                switchDemoAccount('ADMIN');
                setEmail('admin@apexlogistics.com');
                setPassword('FleetAdmin2026!');
              }}
              className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/80 text-left transition-all group"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-100 group-hover:text-indigo-300">
                <Crown className="h-4 w-4 text-amber-400" />
                <span>Compte ADMIN</span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono mt-0.5">admin@apexlogistics.com</div>
            </button>

            <button
              type="button"
              onClick={() => {
                switchDemoAccount('DRIVER');
                setEmail('driver@apexlogistics.com');
                setPassword('FleetAdmin2026!');
              }}
              className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/80 text-left transition-all group"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-100 group-hover:text-indigo-300">
                <Truck className="h-4 w-4 text-emerald-400" />
                <span>Compte CHAUFFEUR</span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono mt-0.5">driver@apexlogistics.com</div>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-950 border border-zinc-800 my-4 text-xs font-medium">
          <button
            onClick={() => setTab('LOGIN')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              tab === 'LOGIN' ? 'bg-zinc-800 text-white font-semibold shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => setTab('REGISTER')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              tab === 'REGISTER' ? 'bg-zinc-800 text-white font-semibold shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Nouvelle Entreprise
          </button>
          <button
            onClick={() => setTab('JWT_INFO')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              tab === 'JWT_INFO' ? 'bg-zinc-800 text-white font-semibold shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Jeton JWT
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs mb-4">
            {errorMsg}
          </div>
        )}

        {/* Formulaire Connexion */}
        {tab === 'LOGIN' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-zinc-400" />
                <span>Adresse Email</span>
              </label>
              <Input
                type="email"
                placeholder="admin@apexlogistics.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-zinc-400" />
                <span>Mot de Passe</span>
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {isAuthenticated && (
                <Button type="button" variant="danger" size="sm" onClick={logout} className="gap-1.5">
                  <LogOut className="h-3.5 w-3.5" />
                  Se Déconnecter
                </Button>
              )}
              <Button type="submit" variant="primary" isLoading={isLoading} className="ml-auto">
                Se Connecter
              </Button>
            </div>
          </form>
        )}

        {/* Formulaire Inscription Entreprise */}
        {tab === 'REGISTER' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                <span>Nom de l&apos;Entreprise (Nouveau Locataire SaaS)</span>
              </label>
              <Input
                placeholder="ex. Atlas Transports Maroc"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-zinc-400" />
                <span>Email de l&apos;Administrateur</span>
              </label>
              <Input
                type="email"
                placeholder="directeur@atlas-transports.ma"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-zinc-400" />
                <span>Mot de Passe (min. 8 caractères)</span>
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" isLoading={isLoading}>
                Créer l&apos;Organisation & Compte ADMIN
              </Button>
            </div>
          </form>
        )}

        {/* Inspecteur de Jeton JWT */}
        {tab === 'JWT_INFO' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-zinc-950 font-mono text-[11px] text-zinc-300 space-y-2 border border-zinc-800">
              <div className="text-indigo-400 font-semibold flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5" />
                Jeton JWT Actif dans l&apos;En-tête Authorization
              </div>
              <div className="p-2 rounded bg-zinc-900 break-all text-[10px] text-zinc-400 border border-zinc-800/80">
                Bearer {token || 'Aucun jeton actif'}
              </div>
              <div className="text-zinc-400 pt-1">
                <strong>Revendications (Claims) Décodées :</strong>
                <pre className="mt-1 text-emerald-400 text-[10px] bg-zinc-900/60 p-2 rounded">
{JSON.stringify(
  {
    sub: user?.id,
    email: user?.email,
    tenantId: user?.tenantId,
    role: user?.role,
  },
  null,
  2,
)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import {
  Lock,
  Mail,
  Building2,
  ShieldCheck,
  Crown,
  Truck,
  ArrowRight,
  Key,
  Database,
  Cpu,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginView() {
  const { login, register, switchDemoAccount } = useAuth();
  const [tab, setTab] = React.useState<'LOGIN' | 'REGISTER' | 'SPECS'>('LOGIN');

  const [email, setEmail] = React.useState('admin@apexlogistics.com');
  const [password, setPassword] = React.useState('FleetAdmin2026!');
  const [companyName, setCompanyName] = React.useState('Apex Global Logistics');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    const res = await login(email, password);
    setIsLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Identifiants invalides');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    const res = await register(companyName, email, password);
    setIsLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Erreur lors de la création');
    }
  };

  const handleQuickLogin = async (role: 'ADMIN' | 'DRIVER') => {
    setIsLoading(true);
    setErrorMsg(null);
    switchDemoAccount(role);
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 animate-in fade-in zoom-in-95 duration-200">
      {/* Carte d'authentification principale */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Glow décoratif */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Titre et présentation */}
        <div className="text-center space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span>Sécurité Multi-Tenant & Jeton JWT</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Accès au Tableau de Bord de Flotte
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            Connectez-vous pour gérer vos véhicules, suivre les compteurs kilométriques,
            anticiper les révisions et superviser vos équipes de chauffeurs.
          </p>
        </div>

        {/* Boutons d'accès rapide 1-Click (Comptes de Démonstration) */}
        <div className="relative z-10 space-y-2.5">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Accès Immédiat en 1 Clic (Comptes Démo Préconfigurés)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleQuickLogin('ADMIN')}
              className="p-4 rounded-2xl bg-zinc-950/80 hover:bg-zinc-800/90 border border-amber-500/30 hover:border-amber-400/60 text-left transition-all group shadow-lg flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                  <Crown className="h-4 w-4 text-amber-400" />
                  <span>Compte Administrateur (Directeur)</span>
                </div>
                <div className="text-xs text-zinc-400 font-mono">admin@apexlogistics.com</div>
                <div className="text-[11px] text-zinc-500">
                  Droits complets : Ajout de camions, révisions, rapports & chauffeurs
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-amber-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('DRIVER')}
              className="p-4 rounded-2xl bg-zinc-950/80 hover:bg-zinc-800/90 border border-emerald-500/30 hover:border-emerald-400/60 text-left transition-all group shadow-lg flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                  <Truck className="h-4 w-4 text-emerald-400" />
                  <span>Compte Chauffeur (Poids Lourd)</span>
                </div>
                <div className="text-xs text-zinc-400 font-mono">driver@apexlogistics.com</div>
                <div className="text-[11px] text-zinc-500">
                  Saisie des compteurs kilométriques, alertes d&apos;entretien et télémétrie
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-emerald-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </button>
          </div>
        </div>

        {/* Sélecteur d'onglets pour connexion personnalisée */}
        <div className="relative z-10 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-950 border border-zinc-800 max-w-md mx-auto text-xs font-medium">
            <button
              onClick={() => setTab('LOGIN')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                tab === 'LOGIN'
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Connexion Personnalisée
            </button>
            <button
              onClick={() => setTab('REGISTER')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                tab === 'REGISTER'
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Nouvelle Entreprise
            </button>
            <button
              onClick={() => setTab('SPECS')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                tab === 'SPECS'
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Architecture JWT
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="relative z-10 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Formulaire de Connexion */}
        {tab === 'LOGIN' && (
          <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto relative z-10">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
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
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
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

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 py-2.5 text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30"
            >
              Ouvrir la Session
            </Button>
          </form>
        )}

        {/* Formulaire Nouvelle Organisation Locataire */}
        {tab === 'REGISTER' && (
          <form onSubmit={handleRegister} className="space-y-4 max-w-md mx-auto relative z-10">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                <span>Nom de l&apos;Organisation / Entreprise</span>
              </label>
              <Input
                placeholder="ex. Atlas Transports Maroc"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-zinc-400" />
                <span>Email de l&apos;Administrateur Flotte</span>
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
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
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

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 py-2.5 text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30"
            >
              Créer l&apos;Organisation & Démarrer
            </Button>
          </form>
        )}

        {/* Onglet Architecture Sécurité */}
        {tab === 'SPECS' && (
          <div className="space-y-4 max-w-2xl mx-auto relative z-10 text-xs text-zinc-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                  <Key className="h-4 w-4" />
                  <span>Jeton JWT</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Signature cryptographique HMAC-SHA256 contenant <code className="text-indigo-300">tenantId</code>, <code className="text-indigo-300">sub</code> et <code className="text-indigo-300">role</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Database className="h-4 w-4" />
                  <span>Isolation BDD</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Chaque requête Prisma est filtrée strictement par <code className="text-emerald-300">tenantId</code> pour empêcher toute fuite entre entreprises.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Contrôle RBAC</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Rôles stricts : <code className="text-amber-300">ADMIN</code> (pilotage complet) et <code className="text-amber-300">DRIVER</code> (saisie kilométrique).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
